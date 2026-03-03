import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Settings
let numberMode = 'roman'; // 'roman', 'arabic', 'none'
let theme = 'light'; // 'light', 'dark'
let isTransitioning = false;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1628);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 25);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(10, 15, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x6a9bd8, 1);
fillLight.position.set(-10, 5, 5);
scene.add(fillLight);

const rimLight = new THREE.SpotLight(0xffffff, 1.5);
rimLight.position.set(0, 10, -10);
rimLight.angle = Math.PI / 6;
scene.add(rimLight);

// Create stars
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.8
});

const starsVertices = [];
for (let i = 0; i < 2000; i++) {
    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Create Sun
const sunGroup = new THREE.Group();
scene.add(sunGroup);

const sunGeometry = new THREE.SphereGeometry(60, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffa500,
    emissive: 0xffa500,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sunGroup.add(sun);

// Sun corona layers
for (let i = 0; i < 3; i++) {
    const coronaGeometry = new THREE.SphereGeometry(60 + (i + 1) * 8, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.15 - i * 0.04,
        side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sunGroup.add(corona);
}

// Sun light
const sunLight = new THREE.PointLight(0xffa500, 3, 150);
sunLight.castShadow = true;
sunGroup.add(sunLight);

sunGroup.position.set(0, 5, -60);

// Create Moon
const moonGroup = new THREE.Group();
scene.add(moonGroup);

const moonGeometry = new THREE.SphereGeometry(18, 64, 64);

// Create moon texture with noise
const moonCanvas = document.createElement('canvas');
moonCanvas.width = 512;
moonCanvas.height = 512;
const moonCtx = moonCanvas.getContext('2d');

// Base color
moonCtx.fillStyle = '#d4d4d4';
moonCtx.fillRect(0, 0, 512, 512);

// Add noise and craters
for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = Math.random() * 30 + 5;
    const gradient = moonCtx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#a0a0a0');
    gradient.addColorStop(1, '#d4d4d4');
    moonCtx.fillStyle = gradient;
    moonCtx.beginPath();
    moonCtx.arc(x, y, radius, 0, Math.PI * 2);
    moonCtx.fill();
}

const moonTexture = new THREE.CanvasTexture(moonCanvas);
const moonMaterial = new THREE.MeshStandardMaterial({ 
    map: moonTexture,
    color: 0xffffff,
    metalness: 0,
    roughness: 1
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moonGroup.add(moon);

// Moon glow
const moonGlowGeometry = new THREE.SphereGeometry(20, 32, 32);
const moonGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaccff,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
});
const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
moonGroup.add(moonGlow);

// Moon light
const moonLight = new THREE.PointLight(0xaaccff, 1.5, 100);
moonGroup.add(moonLight);

moonGroup.position.set(0, 5, -60);

// Clock group
const clock = new THREE.Group();
scene.add(clock);

// Materials (will be updated by theme)
const clockBodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1
});

const clockFaceMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.3
});

// Clock body (outer rim)
const clockBody = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 1, 64),
    clockBodyMaterial
);
clockBody.rotation.x = Math.PI / 2;
clockBody.castShadow = true;
clockBody.receiveShadow = true;
clock.add(clockBody);

// Clock face
const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(5.25, 5.25, 0.25, 64),
    clockFaceMaterial
);
clockFace.rotation.x = Math.PI / 2;
clockFace.position.z = 0.4;
clockFace.receiveShadow = true;
clock.add(clockFace);

// Center cap
const centerCapMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    metalness: 0.9,
    roughness: 0.1
});

const centerCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32),
    centerCapMaterial
);
centerCap.rotation.x = Math.PI / 2;
centerCap.position.z = 1.25;
centerCap.castShadow = true;
clock.add(centerCap);

// Create canvas for text
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext('2d');

// Roman numerals
const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const arabicNumerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

// Number sprites
const numberSprites = [];

for (let i = 0; i < 12; i++) {
    // Start at 12 (top) and go clockwise
    // Subtract PI/2 to start at top, and negate to go clockwise
    const angle = -(i / 12) * Math.PI * 2 + Math.PI / 2;
    const radius = 3.75;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, 0.65);
    sprite.scale.set(1, 1, 1);
    sprite.userData = { index: i };
    clock.add(sprite);
    numberSprites.push(sprite);
}

// Hour markers (small dots)
const hourMarkers = [];
for (let i = 0; i < 12; i++) {
    // Start at 12 (top) and go clockwise
    const angle = -(i / 12) * Math.PI * 2 + Math.PI / 2;
    const radius = 4.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const mark = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.15, 16),
        new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.6,
            roughness: 0.3
        })
    );
    mark.rotation.x = Math.PI / 2;
    mark.position.set(x, y, 0.6);
    mark.castShadow = true;
    clock.add(mark);
    hourMarkers.push(mark);
}

// Hand materials
const hourHandMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    metalness: 0.7,
    roughness: 0.2
});

const minuteHandMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    metalness: 0.7,
    roughness: 0.2
});

const secondHandMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe74c3c,
    metalness: 0.8,
    roughness: 0.1
});

// Hour hand
const hourHandGeometry = new THREE.Group();
const hourHandMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 2.5, 0.15).translate(0, 1.25, 0),
    hourHandMaterial
);
const hourHandTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.4, 8).translate(0, 2.7, 0),
    hourHandMaterial
);
hourHandGeometry.add(hourHandMain);
hourHandGeometry.add(hourHandTip);
hourHandGeometry.position.z = 0.9;
hourHandGeometry.castShadow = true;
clock.add(hourHandGeometry);

// Minute hand
const minuteHandGeometry = new THREE.Group();
const minuteHandMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 3.5, 0.125).translate(0, 1.75, 0),
    minuteHandMaterial
);
const minuteHandTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.125, 0.4, 8).translate(0, 3.7, 0),
    minuteHandMaterial
);
minuteHandGeometry.add(minuteHandMain);
minuteHandGeometry.add(minuteHandTip);
minuteHandGeometry.position.z = 1;
minuteHandGeometry.castShadow = true;
clock.add(minuteHandGeometry);

// Second hand
const secondHandGeometry = new THREE.Group();
const secondHandMain = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 4.25, 0.075).translate(0, 1.75, 0),
    secondHandMaterial
);
const secondHandTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.4, 8).translate(0, 4.15, 0),
    secondHandMaterial
);
const secondHandTail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1, 8).translate(0, -0.5, 0),
    secondHandMaterial
);
secondHandGeometry.add(secondHandMain);
secondHandGeometry.add(secondHandTip);
secondHandGeometry.add(secondHandTail);
secondHandGeometry.position.z = 1.1;
secondHandGeometry.castShadow = true;
clock.add(secondHandGeometry);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 15;
controls.maxDistance = 50;

// Update numbers on clock face
function updateNumbers() {
    numberSprites.forEach((sprite, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        if (numberMode !== 'none') {
            ctx.fillStyle = theme === 'light' ? '#1a1a1a' : '#ffffff';
            ctx.font = 'bold 120px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const text = numberMode === 'roman' ? romanNumerals[i] : arabicNumerals[i];
            ctx.fillText(text, 128, 128);
        }
        
        sprite.material.map = new THREE.CanvasTexture(canvas);
        sprite.material.needsUpdate = true;
        sprite.visible = numberMode !== 'none';
    });
}

// Update theme
function updateTheme() {
    isTransitioning = true;
    
    if (theme === 'light') {
        // Light theme - sun visible
        clockBodyMaterial.color.setHex(0xffffff);
        clockFaceMaterial.color.setHex(0xffffff);
        hourHandMaterial.color.setHex(0x1a1a1a);
        minuteHandMaterial.color.setHex(0x1a1a1a);
        hourMarkers.forEach(mark => mark.material.color.setHex(0x1a1a1a));
        
        // Move sun to center, moon far away
        animateCelestialBodies(0, 5, -60, 200, 5, -60, () => {
            isTransitioning = false;
        });
    } else {
        // Dark theme - moon visible
        clockBodyMaterial.color.setHex(0xffffff);
        clockFaceMaterial.color.setHex(0x1a1a2e);
        hourHandMaterial.color.setHex(0xecf0f1);
        minuteHandMaterial.color.setHex(0xecf0f1);
        hourMarkers.forEach(mark => mark.material.color.setHex(0xecf0f1));
        
        // Move moon to center, sun far away
        animateCelestialBodies(-200, 5, -60, 0, 5, -60, () => {
            isTransitioning = false;
        });
    }
    updateNumbers();
}

// Animate celestial bodies (sun and moon)
function animateCelestialBodies(sunTargetX, sunTargetY, sunTargetZ, moonTargetX, moonTargetY, moonTargetZ, onComplete) {
    const sunStartX = sunGroup.position.x;
    const sunStartY = sunGroup.position.y;
    const sunStartZ = sunGroup.position.z;
    
    const moonStartX = moonGroup.position.x;
    const moonStartY = moonGroup.position.y;
    const moonStartZ = moonGroup.position.z;
    
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        sunGroup.position.x = sunStartX + (sunTargetX - sunStartX) * eased;
        sunGroup.position.y = sunStartY + (sunTargetY - sunStartY) * eased;
        sunGroup.position.z = sunStartZ + (sunTargetZ - sunStartZ) * eased;
        
        moonGroup.position.x = moonStartX + (moonTargetX - moonStartX) * eased;
        moonGroup.position.y = moonStartY + (moonTargetY - moonStartY) * eased;
        moonGroup.position.z = moonStartZ + (moonTargetZ - moonStartZ) * eased;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    animate();
}

// Clock animation
function clockEngine() {
    const date = new Date();
    const hh = date.getHours() % 12;
    const mm = date.getMinutes();
    const ss = date.getSeconds();
    const ms = date.getMilliseconds();

    // Smooth second hand movement
    const smoothSeconds = ss + ms / 1000;
    
    hourHandGeometry.rotation.z = -((hh + mm / 60) * 30 * Math.PI / 180);
    minuteHandGeometry.rotation.z = -((mm + smoothSeconds / 60) * 6 * Math.PI / 180);
    secondHandGeometry.rotation.z = -(smoothSeconds * 6 * Math.PI / 180);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    clockEngine();
    controls.update();
    
    // Rotate stars slowly
    stars.rotation.y += 0.0002;
    
    // Subtle clock rotation for visual interest (only when not transitioning)
    if (!isTransitioning) {
        clock.rotation.x = Math.sin(Date.now() * 0.0001) * 0.05;
    }
    
    // Rotate sun slowly
    sunGroup.rotation.y += 0.001;
    
    // Rotate moon slowly
    moonGroup.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
}

// Initialize
clock.position.set(0, 5, 0); // Keep clock centered
sunGroup.position.set(0, 5, -60); // Start with sun in view
moonGroup.position.set(200, 5, -60); // Moon far off to the side
updateTheme();
animate();

// Button controls
const numberBtn = document.getElementById('numberBtn');
const themeBtn = document.getElementById('themeBtn');

numberBtn.addEventListener('click', () => {
    if (numberMode === 'roman') {
        numberMode = 'arabic';
        numberBtn.textContent = 'Arabic';
    } else if (numberMode === 'arabic') {
        numberMode = 'none';
        numberBtn.textContent = 'None';
    } else {
        numberMode = 'roman';
        numberBtn.textContent = 'Roman';
    }
    updateNumbers();
});

themeBtn.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    themeBtn.textContent = theme === 'light' ? 'Light' : 'Dark';
    updateTheme();
});

// UI Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'n' || e.key === 'N') {
        numberBtn.click();
    } else if (e.key === 't' || e.key === 'T') {
        themeBtn.click();
    }
});