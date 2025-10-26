import express from 'express';
import multer from 'multer';
import path from 'path'; // Still needed for extname, even if not saving locally
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import { getArtBucket } from '../config/mongo.js';
import { Readable } from 'stream'; // To stream buffer to GridFS
import { ObjectId } from 'mongodb'; // To handle GridFS IDs

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- Multer Configuration (Use memoryStorage) ---
const artStorage = multer.memoryStorage(); // Store file in memory buffer

const artUpload = multer({
  storage: artStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for art submissions!'), false);
    }
  }
});
// --- End Multer Configuration ---

// POST /api/art-submissions
router.post('/', authenticateToken, artUpload.single('artworkImage'), async (req, res) => {
    // <<< ADD THIS LOGGING >>>
  console.log('--- Art Submission Request ---');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  // <<< END LOGGING >>>
  try {
    const { title, description, location } = req.body;
    const userId = req.user.id;

    if (!req.file) { /* ... */ 
    console.error('req.file is undefined after multer for art submission.');
    return res.status(400).json({ success: false, message: 'No artwork image processed by multer.' });
    }
     // --- Check buffer existence early ---
    if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error('Multer processed the art file but the buffer is missing or empty.', req.file);
        return res.status(400).json({ success: false, message: 'Uploaded art file buffer is missing or empty.' });
    }
    // --- End buffer check ---
    if (!title) { /* ... */ }

    const bucket = getArtBucket();
     if (!bucket) {
        throw new Error("GridFS Art Bucket not initialized.");
    }

    const filename = req.file.originalname;
    const contentType = req.file.mimetype;

    // --- Create a Promise wrapper using write/end ---
    const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: contentType,
            metadata: { userId: userId, title: title }
        });
        const streamId = uploadStream.id; // Get ID immediately

        uploadStream.on('error', (error) => {
            console.error(`GridFS upload stream error for ID ${streamId}:`, error);
            reject(new Error('Failed to save artwork image to storage.'));
        });

        uploadStream.on('finish', () => {
            console.log(`GridFS upload finished event for file ID: ${streamId}`);
            resolve(streamId);
        });

        uploadStream.write(req.file.buffer, (error) => {
             if (error) {
                 console.error(`GridFS stream write error for ID ${streamId}:`, error);
                 return reject(new Error('Failed during artwork data write.'));
             }
             uploadStream.end(() => {
                console.log(`GridFS stream ended for ID ${streamId}. Waiting for finish event.`);
             });
        });
    });
    // --- End Promise wrapper ---

    let gridFsObjectId; // Define outside try block for potential cleanup

    // Wait for upload and get ID
    gridFsObjectId = await uploadPromise;
    const gridFsId = gridFsObjectId.toString();

     console.log(`Successfully uploaded art to GridFS, ID: ${gridFsId}. Inserting into PostgreSQL.`);


    // Now, insert into PostgreSQL
    const result = await query(
      `INSERT INTO user_art_submissions (user_id, title, description, location, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, title, description || null, location || null, gridFsId]
    );
    const newSubmissionId = result.rows[0].id;

    res.status(201).json({
      success: true,
      message: 'Artwork submitted successfully for review.',
      submissionId: newSubmissionId
    });

  } catch (error) {
    console.error('Art submission process error:', error);
    // Cleanup logic using gridFsObjectId (as before)
    if (gridFsObjectId && !(error instanceof multer.MulterError) && !error.message.includes('Failed during') && !error.message.includes('Failed to save')) {
       // ... attempt cleanup ...
        try {
            const bucket = getArtBucket(); // Need bucket instance here too
            if (bucket) {
                await bucket.delete(gridFsObjectId);
                console.log(`Cleaned up GridFS file ${gridFsObjectId} after DB error.`);
            }
        } catch (cleanupError) {
             console.error(`Failed to cleanup GridFS file ${gridFsObjectId}:`, cleanupError);
        }
    }
    // Handle specific errors
    if (error instanceof multer.MulterError || error.message.includes('Failed during') || error.message.includes('Failed to save')) {
       return res.status(500).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Internal server error during art submission setup.' });
  }
});

// GET /api/art-submissions/my-submissions - Get user's submissions
router.get('/my-submissions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Select necessary fields including image_url (which holds the GridFS ID)
        const result = await query(
            'SELECT id, title, description, location, image_url, status, created_at FROM user_art_submissions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        // Map results to include the correct image serving URL
        const submissions = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            location: row.location,
            status: row.status,
            created_at: row.created_at,
            // Construct the URL to the image endpoint using image_url (GridFS ID)
            // Make sure your image serving route is mounted at /api/images
            imageUrl: row.image_url ? `/api/images/art/${row.image_url}` : null
        }));

        res.json({ success: true, data: submissions });
    } catch (err) {
        console.error('Failed to fetch user art submissions:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch art submissions', error: err.message });
    }
});

// Note: The image serving route GET /api/images/:id should be in a separate file (e.g., routes/images.js)
// and mounted in server.js as shown in the previous instructions.

export default router;