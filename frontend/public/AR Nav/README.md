# 3D Airport Floor Plan Visualization

## Overview
This project is a 3D visualization of an airport floor plan using Three.js. It provides an interactive 3D interface that clearly visualizes the internal structure of an airport for use in an indoor navigation app.

## Features
- Complete 3D airport layout with two distinct terminals
- Multiple gates with proper labeling (A1-A5 in Terminal 1, B1-B5 in Terminal 2)
- Main entrance area connected to check-in counters
- Security checkpoints between check-in and gate areas
- Waiting lounges near gates with chairs
- Baggage claim areas near arrivals
- Restrooms in both terminals
- Signboards above gates and checkpoints
- Taxi stand / drop-off zone in front of the main entrance
- Navigation path from the entrance to Gate A3
- Text labels for each major area

## Technical Details
- Built with Three.js for 3D rendering
- Uses OrbitControls for camera manipulation
- CSS2DRenderer for text labels
- Realistic proportions and spacing
- Proper lighting with ambient and directional lights
- Interactive with zoom and rotation capabilities

## How to Run
1. Clone this repository
2. Navigate to the project directory
3. Run a local server (e.g., `npx http-server`)
4. Open the provided URL in your browser

## Controls
- Left-click and drag to rotate the view
- Scroll to zoom in/out
- Right-click and drag to pan

## Structure
- `index.html`: Main HTML file with Three.js imports
- `js/main.js`: JavaScript code for creating the 3D airport visualization

## License
This project uses only open-source assets and does not depend on external proprietary models.