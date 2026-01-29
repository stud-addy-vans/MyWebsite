/* ========================
   1. SYSTEM BOOT & AUDIO
   ======================== */
const startScreen = document.getElementById('start-screen');
const enterBtn = document.getElementById('enter-btn');
const bootText = document.getElementById('boot-text');
const main = document.querySelector('main');

// Typing Effect for Boot
const messages = [
    "INITIALIZING CORE...",
    "LOADING ASSETS...",
    "SYSTEM READY."
];
let msgIndex = 0;

function typeWriter() {
    if (msgIndex < messages.length) {
        bootText.innerText = messages[msgIndex];
        msgIndex++;
        setTimeout(typeWriter, 400); // Speed of typing
    } else {
        enterBtn.classList.add('visible');
        enterBtn.classList.remove('hidden');
    }
}
setTimeout(typeWriter, 500);

// Audio Engine (Web Audio API) - No files needed
let audioCtx;

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playHoverSound() {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine'; // Pure tone
    osc.frequency.setValueAtTime(400, audioCtx.currentTime); // Start pitch
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1); // Slide up
    
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime); // Volume low
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); // Fade out
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Enter Experience
enterBtn.addEventListener('click', () => {
    initAudio();
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        main.classList.add('active-main');
        document.body.style.overflow = 'auto'; // Unlock scroll
    }, 1000);
});

// Attach Sound to Hover Elements
document.querySelectorAll('.sound-hover').forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
});

/* ========================
   2. 3D WIREFRAME ENGINE (Canvas)
   ======================== */
const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
}
window.addEventListener('resize', resize);
resize();

// 3D Shape (Cube vertices for simplicity, creates cool effect)
let vertices = [
    {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1}, 
    {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
    {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1}, 
    {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
];

// Edges connecting vertices
const edges = [
    [0,1], [1,2], [2,3], [3,0], // Back face
    [4,5], [5,6], [6,7], [7,4], // Front face
    [0,4], [1,5], [2,6], [3,7]  // Connecting lines
];

let angleX = 0;
let angleY = 0;

function draw3D() {
    ctx.clearRect(0, 0, width, height);
    
    // Auto Rotation
    angleX += 0.005;
    angleY += 0.005;

    // Center of screen
    const cx = width / 2;
    const cy = height / 2;
    const scale = 300; // Size of shape

    // Draw lines
    ctx.beginPath();
    edges.forEach(edge => {
        const v1 = project(vertices[edge[0]], angleX, angleY);
        const v2 = project(vertices[edge[1]], angleX, angleY);
        
        // Only draw if within reasonable bounds
        ctx.moveTo(cx + v1.x * scale, cy + v1.y * scale);
        ctx.lineTo(cx + v2.x * scale, cy + v2.y * scale);
    });
    ctx.stroke();
    
    requestAnimationFrame(draw3D);
}

// 3D Projection Math
function project(v, ax, ay) {
    let x = v.x;
    let y = v.y;
    let z = v.z;
    
    // Rotation X
    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);
    const y1 = y * cosX - z * sinX;
    const z1 = z * cosX + y * sinX;
    y = y1;
    z = z1;

    // Rotation Y
    const cosY = Math.cos(ay);
    const sinY = Math.sin(ay);
    const x1 = x * cosY - z * sinY;
    z = z * cosY + x * sinY;
    x = x1;

    // Perspective projection
    const perspective = 3 / (3 + z); // Camera distance
    return { x: x * perspective, y: y * perspective };
}

draw3D();

/* ========================
   3. UI LOGIC (Cursor, Menu, Time)
   ======================== */
// Custom Cursor
const cursor = document.createElement('div');
cursor.id = 'cursor';
document.body.appendChild(cursor);

window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .sound-hover').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});

// Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-item');

menuToggle.addEventListener('click', () => {
    navOverlay.classList.toggle('active');
    menuToggle.innerText = navOverlay.classList.contains('active') ? '/// CLOSE' : '/// MENU';
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        menuToggle.innerText = '/// MENU';
    });
});

// Clock
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();