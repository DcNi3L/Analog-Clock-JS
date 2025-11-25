import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Constants
const CLOCK_RADIUS = 10;
const CLOCK_THICKNESS = 1;
const CLOCK_FACE_COLOR = 0xffffff;
const HOUR_MARK_COLOR = 0x000000;
const HOUR_HAND_COLOR = 0xff0000;
const MINUTE_HAND_COLOR = 0x00ff00;
const SECOND_HAND_COLOR = 0x0000ff;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const clock = new THREE.Group();
scene.add(clock);

const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(CLOCK_RADIUS, CLOCK_RADIUS, CLOCK_THICKNESS, 64),
    new THREE.MeshStandardMaterial({ color: CLOCK_FACE_COLOR })
);
clockFace.rotation.x = Math.PI / 2;
clock.add(clockFace);

for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = Math.cos(angle) * (CLOCK_RADIUS - 1.5);
    const y = Math.sin(angle) * (CLOCK_RADIUS - 1.5);
    const mark = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1, 0.5),
        new THREE.MeshStandardMaterial({ color: HOUR_MARK_COLOR })
    );
    mark.position.set(x, y, 0.6);
    mark.lookAt(0,0,5);
    clock.add(mark);
}

const hourHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 5, 0.5).translate(0, 2.5, 0),
    new THREE.MeshStandardMaterial({ color: HOUR_HAND_COLOR })
);
hourHand.position.z = 1;
clock.add(hourHand);

const minuteHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 7, 0.3).translate(0, 3.5, 0),
    new THREE.MeshStandardMaterial({ color: MINUTE_HAND_COLOR })
);
minuteHand.position.z = 1.2;
clock.add(minuteHand);

const secondHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 8, 0.1).translate(0, 4, 0),
    new THREE.MeshStandardMaterial({ color: SECOND_HAND_COLOR })
);
secondHand.position.z = 1.4;
clock.add(secondHand);

const controls = new OrbitControls(camera, renderer.domElement);

function clockEngine() {
    const date = new Date();
    const hh = date.getHours() % 12;
    const mm = date.getMinutes();
    const ss = date.getSeconds();

    hourHand.rotation.z = -((hh + mm / 60) * 30 * Math.PI / 180);
    minuteHand.rotation.z = -((mm + ss / 60) * 6 * Math.PI / 180);
    secondHand.rotation.z = -(ss * 6 * Math.PI / 180);
}

function animate() {
    requestAnimationFrame(animate);
    clockEngine();
    controls.update();
    renderer.render(scene, camera);
}

animate();