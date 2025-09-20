import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the JSON file
const airportLayoutPath = path.join(__dirname, '..', 'data', 'airportLayout.json');
const airportLayout = JSON.parse(fs.readFileSync(airportLayoutPath, 'utf-8'));


class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function findPath(startNodeId, endNodeId) {
    const { nodes, edges } = airportLayout;
    const startNode = nodes[startNodeId];
    const endNode = nodes[endNodeId];

    if (!startNode || !endNode) {
        return null; // or throw an error
    }

    const frontier = new PriorityQueue();
    frontier.enqueue(startNodeId, 0);

    const cameFrom = {};
    const costSoFar = {};
    cameFrom[startNodeId] = null;
    costSoFar[startNodeId] = 0;

    while (!frontier.isEmpty()) {
        const currentId = frontier.dequeue();

        if (currentId === endNodeId) {
            break;
        }

        const currentEdges = edges.filter(edge => edge.from === currentId || edge.to === currentId);
        for (const edge of currentEdges) {
            const nextId = edge.from === currentId ? edge.to : edge.from;
            const newCost = costSoFar[currentId] + edge.weight;

            if (costSoFar[nextId] === undefined || newCost < costSoFar[nextId]) {
                costSoFar[nextId] = newCost;
                const priority = newCost + heuristic(nodes[nextId], endNode);
                frontier.enqueue(nextId, priority);
                cameFrom[nextId] = currentId;
            }
        }
    }

    // Reconstruct path
    let current = endNodeId;
    const path = [];
    if (!cameFrom[current]) {
        // This means no path was found
        return null;
    }
    while (current !== startNodeId) {
        path.unshift(nodes[current]);
        current = cameFrom[current];
    }
    path.unshift(startNode);

    return path;
}