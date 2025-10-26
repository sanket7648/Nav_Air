import { MongoClient, GridFSBucket } from 'mongodb';
// Remove gridfs-stream import if you are not using it elsewhere
// import gridfsStream from 'gridfs-stream';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;
// Remove gfs if not used
// let gfs;
let avatarBucket; // Bucket for avatars
let artBucket; // Bucket for art submissions

const connectDB = async () => {
    if (db) return db;
    try {
        await client.connect();
        db = client.db(process.env.MONGO_DB_NAME);

        // Initialize separate GridFSBuckets
        avatarBucket = new GridFSBucket(db, { bucketName: 'avatars' }); // <<< Use 'avatars' bucket
        artBucket = new GridFSBucket(db, { bucketName: 'art_submissions' }); // <<< Use 'art_submissions' bucket

        console.log('✅ MongoDB Connected');
        return db;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const getDB = () => db;
// const getGFS = () => gfs; // Remove if not used
const getAvatarBucket = () => avatarBucket; // <<< Export avatar bucket getter
const getArtBucket = () => artBucket; // <<< Export art bucket getter

// Update exports
export { connectDB, getDB, getAvatarBucket, getArtBucket };