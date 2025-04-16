import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('scene-container').appendChild(renderer.domElement);

// Materials
const createMaterial = () => {
    return new THREE.MeshPhysicalMaterial({
        color: 0x00ff88,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 0.5,
        envMapIntensity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    });
};

// Create objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    createMaterial()
);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(2, 0.5, 32, 100),
    createMaterial()
);

const helixPoints = [];
for(let i = 0; i < 100; i++) {
    const t = i * 0.2;
    helixPoints.push(
        new THREE.Vector3(
            Math.cos(t) * 1.5,
            t * 0.1 - 2,
            Math.sin(t) * 1.5
        )
    );
}
const helix = new THREE.Mesh(
    new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(helixPoints),
        100,
        0.2,
        16,
        false
    ),
    createMaterial()
);

const octahedron = new THREE.Mesh(
    new THREE.OctahedronGeometry(2),
    createMaterial()
);

const dodecahedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2),
    createMaterial()
);

const icosahedron = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2, 1),
    createMaterial()
);

const objects = [sphere, torus, helix, octahedron, dodecahedron, icosahedron];
objects.forEach(obj => {
    obj.visible = false;
    scene.add(obj);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(2, 2, 2);
scene.add(mainLight);

const accentLight = new THREE.PointLight(0x00ff88, 2, 10);
accentLight.position.set(-2, 2, -2);
scene.add(accentLight);

// Camera positioning
camera.position.z = 6;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Scroll handling
const sections = document.querySelectorAll('.section-content');
const updateProgress = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector('.progress').style.width = `${(scrolled / total) * 100}%`;
};

window.addEventListener('scroll', updateProgress);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Show corresponding 3D object
            const sectionId = entry.target.parentElement.id;
            objects.forEach(obj => obj.visible = false);
            
            switch(sectionId) {
                case 'sphere':
                    sphere.visible = true;
                    break;
                case 'torus':
                    torus.visible = true;
                    break;
                case 'helix':
                    helix.visible = true;
                    break;
                case 'octahedron':
                    octahedron.visible = true;
                    break;
                case 'dodecahedron':
                    dodecahedron.visible = true;
                    break;
                case 'about':
                    icosahedron.visible = true;
                    break;
            }
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => observer.observe(section));

// Animation
function animate(time) {
    requestAnimationFrame(animate);
    controls.update();

    // Object-specific animations
    if (sphere.visible) {
        sphere.rotation.y = time * 0.0003;
    }
    if (torus.visible) {
        torus.rotation.x = time * 0.0003;
        torus.rotation.y = time * 0.0002;
    }
    if (helix.visible) {
        helix.rotation.y = time * 0.0002;
    }
    if (octahedron.visible) {
        octahedron.rotation.x = time * 0.0002;
        octahedron.rotation.y = time * 0.0003;
    }
    if (dodecahedron.visible) {
        dodecahedron.rotation.x = time * 0.0001;
        dodecahedron.rotation.y = time * 0.0002;
        dodecahedron.rotation.z = time * 0.0001;
    }
    if (icosahedron.visible) {
        icosahedron.rotation.x = time * 0.0002;
        icosahedron.rotation.y = time * 0.0003;
        icosahedron.rotation.z = time * 0.0001;
    }

    // Accent light animation
    accentLight.position.x = Math.sin(time * 0.001) * 3;
    accentLight.position.z = Math.cos(time * 0.001) * 3;

    renderer.render(scene, camera);
}

// Responsive design
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Hide scroll indicator after first scroll
window.addEventListener('scroll', () => {
    document.querySelector('.scroll-indicator').style.opacity = '0';
}, { once: true });

// Function to log visitor IP and info
async function logVisitorInfo() {
    try {
        // Get IP from ipify
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Get additional info about the visitor
        const visitorData = {
            ip: ipData.ip,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            page: window.location.href,
            referrer: document.referrer || 'direct'
        };

        // Send to webhook.site
        const webhookUrl = 'https://webhook.site/b84ebc6c-f9e7-4439-ac30-efc0ee0e94ea';
        
        // Send to webhook.site
        await fetch(webhookUrl, {
            method: 'POST',
            body: JSON.stringify(visitorData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error logging visitor:', error);
    }
}

// Log visitor info when page loads
document.addEventListener('DOMContentLoaded', logVisitorInfo); 