const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const toggleSoundButton = document.getElementById("toggleSound");
let isSoundEnabled = true;

// Load audio files
const explosionSound = new Audio("assets/explosion.mp3");
let missileSound = new Audio("assets/missile.mp3");
missileSound.loop = true; // Configura o som do disparo para loop

// Load images with adjusted sizes
const airplaneImage = new Image();
airplaneImage.src = "assets/airplane.png";
const airplaneWidth = 150;
const airplaneHeight = airplaneWidth * (1131/1697);

let isMissileLaunched = false;
const missileImage = new Image();
missileImage.src = "assets/missile.png";
const missileWidth = 80;
const missileHeight = missileWidth * (525/1511);

// Resize canvas to fill the entire window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Define airplane and missile positions
let airplane = { x: canvas.width / 2, y: canvas.height / 2 };
let missile = { x: 100, y: canvas.height - 100, isFired: false };

let isExplosionVisible = false;
let explosionStartTime = 0;

function showExplosion() {
    isExplosionVisible = true;
    explosionStartTime = Date.now();
}

function hideExplosion() {
    isExplosionVisible = false;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw airplane (cursor)
    ctx.drawImage(airplaneImage, airplane.x - airplaneWidth / 2, airplane.y - airplaneHeight / 2, airplaneWidth, airplaneHeight);

    // Draw missile
    if (missile.isFired) {
        // Calculate angle between missile and airplane
        const dx = airplane.x - missile.x;
        const dy = airplane.y - missile.y;
        const angle = Math.atan2(dy, dx) + Math.PI;

        // Rotate missile image to point towards the airplane
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(angle);
        ctx.drawImage(missileImage, -missileWidth / 2, -missileHeight / 2, missileWidth, missileHeight);
        ctx.restore();

        // Move missile towards airplane
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 3;
        missile.x += (dx / distance) * speed;
        missile.y += (dy / distance) * speed;

        // Check for collision with airplane
        if (distance < 10) {
            if (isSoundEnabled) {
                explosionSound.play();
                missileSound.pause(); // Pausa o som do disparo
                missileSound.currentTime = 0; // Reinicia o som do disparo para o início
            }
            resetMissilePosition();
            missile.isFired = false;
            showExplosion();
        }
    }
    else {
        // Calculate angle between missile and airplane
        const dx = airplane.x - missile.x;
        const dy = airplane.y - missile.y;
        const angle = Math.atan2(dy, dx) + Math.PI;

        // Rotate missile image to point towards the airplane
        ctx.save();
        ctx.translate(100, canvas.height - 100);
        ctx.rotate(angle);
        ctx.drawImage(missileImage, -missileWidth / 2, -missileHeight / 2, missileWidth, missileHeight);
        ctx.restore();
    }

    // Draw explosion if visible
    if (isExplosionVisible) {
        const currentTime = Date.now();
        if (currentTime - explosionStartTime < 2000) { // Exibe a explosão por 2 segundos
            const explosionImage = new Image();
            explosionImage.src = "assets/explosion.gif";
            ctx.drawImage(explosionImage, airplane.x - 50, airplane.y - 50, 100, 100); // Ajuste o tamanho conforme necessário
        } else {
            hideExplosion();
        }
    }
    requestAnimationFrame(gameLoop);
}

// Track mouse position
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    airplane.x = e.clientX - rect.left;
    airplane.y = e.clientY - rect.top;
});

// Handle right-click to fire missile
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (!missile.isFired) {
        missile.x = 0;
        missile.isFired = true;
        if (isSoundEnabled) {
            missileSound.play();
        }
    }
});

// Toggle sound
toggleSoundButton.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
        toggleSoundButton.textContent = "Disable Sound";
        if (missile.isFired) {
            missileSound.play(); // Retoma o som do disparo se o som estiver ativado
        }
    } else {
        toggleSoundButton.textContent = "Enable Sound";
        missileSound.pause(); // Pausa o som do disparo se o som estiver desativado
        missileSound.currentTime = 0;
    }
});

function resetMissilePosition() {
    missile.x = 0;
    missile.y = canvas.height;
    missile.isFired = false;
}

// Start the game loop
resetMissilePosition(); 
gameLoop();
