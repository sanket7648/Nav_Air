import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findPath } from '../services/navigationService.js';

const router = express.Router();

// Helper to get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the JSON file
const airportLayoutPath = path.join(__dirname, '..', 'data', 'airportLayout.json');
const airportLayout = JSON.parse(fs.readFileSync(airportLayoutPath, 'utf-8'));

router.get('/route', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: 'Missing "from" or "to" query parameters.' });
    }

    const path = findPath(from, to);

    if (path) {
        res.json({ route: path });
    } else {
        res.status(404).json({ error: 'Route not found.' });
    }
});

router.get('/locations', (req, res) => {
    res.json(Object.keys(airportLayout.nodes).map(id => ({ id, ...airportLayout.nodes[id] })));
});


export default router;