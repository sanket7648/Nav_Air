import express from 'express';
// Import BOTH bucket getters from your MongoDB configuration
import { getAvatarBucket, getArtBucket } from '../config/mongo.js';
import { ObjectId } from 'mongodb'; // Import ObjectId to validate and convert IDs

const router = express.Router();

/**
 * Common logic to serve an image from a specified GridFS bucket.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {'avatar' | 'art'} bucketType - The type of bucket to retrieve from ('avatar' or 'art').
 */
const serveImage = async (req, res, bucketType) => {
    let fileId; // Declare fileId outside the try block for error reporting
    let bucket; // Declare bucket outside the try block

    try {
        const fileIdString = req.params.id;

        // Determine which bucket to use based on the route
        if (bucketType === 'avatar') {
            bucket = getAvatarBucket();
        } else if (bucketType === 'art') {
            bucket = getArtBucket();
        } else {
             // This case should ideally not be reached if routes are set up correctly
             console.error(`Invalid bucket type specified in route handler: ${bucketType}`);
             return res.status(500).send('Internal server configuration error.');
        }

        // Check if the bucket instance was successfully retrieved
        if (!bucket) {
            console.error(`GridFS bucket for type '${bucketType}' is not initialized! Check MongoDB connection and configuration.`);
            return res.status(500).send('Image storage service is currently unavailable.');
        }

        // Validate the incoming ID string format before attempting conversion
        if (!ObjectId.isValid(fileIdString)) {
            console.error(`Invalid image ID format received: ${fileIdString} for type ${bucketType}`);
            return res.status(400).send('Invalid image ID format.');
        }
        // Convert the validated string ID to a MongoDB ObjectId
        fileId = new ObjectId(fileIdString);

        // Find the file metadata in the specified bucket using findOne pattern
        const file = await bucket.find({ _id: fileId }).limit(1).next();

        // If no file metadata is found, send a 404 response
        if (!file) {
            console.warn(`Image metadata not found in bucket '${bucket.bucketName}' for ID: ${fileIdString}`);
            return res.status(404).send('Image not found.');
        }

        // Log metadata found for debugging
        console.log(`Found file metadata for ${fileIdString} in bucket '${bucket.bucketName}':`, {
             filename: file.filename,
             contentType: file.contentType,
             length: file.length
            });

        // Check if GridFS reports the file has zero length (might indicate upload issue)
        if (file.length === 0) {
             console.warn(`GridFS file ${fileIdString} in bucket '${bucket.bucketName}' has zero length.`);
             // Send 404 as the data is effectively missing
             return res.status(404).send('Image data is empty.');
        }

        // Set necessary HTTP headers BEFORE opening the stream
        // Use contentType from metadata, fallback to generic binary stream
        res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
        // Set the content length for browsers/clients
        res.setHeader('Content-Length', file.length);
        // Set disposition to 'inline' to display in browser, encode filename for safety
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.filename)}"`);
        // Set caching header (e.g., cache for 1 year)
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        // Open a download stream from the correct bucket using the ObjectId
        const downloadStream = bucket.openDownloadStream(fileId);

        // --- Event Handling for the Download Stream ---
        downloadStream.on('error', (error) => {
            console.error(`GridFS download stream error for file ${fileIdString} in bucket '${bucket.bucketName}':`, error);
            // Check if headers have already been sent before attempting to send an error response
            if (!res.headersSent) {
                res.status(500).send('Error retrieving image data.');
            } else if (!res.writableEnded) {
                // If headers sent but stream errored, try to end the response if possible
                console.error(`Headers already sent for ${fileIdString}, ending response abruptly due to stream error.`);
                res.end();
                 // Attempt to destroy the stream to clean up resources
                 downloadStream.destroy();
            }
        });

        // Pipe the download stream directly to the Express response object
        // Node.js handles the 'data' and 'end' events implicitly during pipe
        downloadStream.pipe(res);
        // --- End Event Handling ---

    } catch (error) {
        // Log general errors that occur outside the stream piping
        const errorId = fileId ? fileId.toString() : req.params.id; // Use ID if available
        console.error(`General error serving image ${errorId} (type: ${bucketType}):`, error);

        // Handle specific BSON/ObjectId errors if ID conversion failed
        if (error.name === 'BSONTypeError' || (error instanceof TypeError && error.message.includes('Argument passed in must be a string'))) {
             console.error(`BSONTypeError or Invalid ObjectId format for ID: ${req.params.id}`);
             // Check headersSent before sending response
             if (!res.headersSent) {
                return res.status(400).send('Invalid image ID format.');
             }
        }
        // Send a generic 500 error if headers haven't already been sent
        if (!res.headersSent) {
            res.status(500).send('Internal server error while retrieving image.');
        } else if (!res.writableEnded){
            // If headers sent but response not ended, try to end it
            res.end();
        }
    }
};

// --- Define Specific Routes ---

// GET /api/images/avatar/:id - Route to serve avatar images
// Calls the common serveImage function with bucketType 'avatar'
router.get('/avatar/:id', (req, res) => {
    serveImage(req, res, 'avatar');
});

// GET /api/images/art/:id - Route to serve art submission images
// Calls the common serveImage function with bucketType 'art'
router.get('/art/:id', (req, res) => {
    serveImage(req, res, 'art');
});

export default router;