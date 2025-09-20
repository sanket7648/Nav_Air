// Debug information
console.log('Script started');

// Basic Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFF0000); // Red background for debugging

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // Update controls
    controls.update();
    
    renderer.render(scene, camera);
}

// Start the animation
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, starting animation');
    try {
        animate();
        
        // Hide fallback message if it exists
        const fallback = document.getElementById('fallback');
        if (fallback) {
            fallback.style.display = 'none';
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        document.body.innerHTML = '<div style="color: black; padding: 20px;">Error loading 3D visualization. Please check console for details.</div>';
    }
});