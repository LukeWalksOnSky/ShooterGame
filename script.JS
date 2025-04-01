const arena = document.getElementById("arena");
const turret = document.getElementById("turret");
const turretHpDisplay = document.getElementById("turret-hp");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restart-button");

let zombies = [];
let bullets = [];

const zombieTypes = [
  { color: "green", hp: 5, damage: 3, speed: 4, points: 1 }, // Green Zombie: 1 point, speed 4
  { color: "red", hp: 10, damage: 5, speed: 3, points: 5 },  // Red Zombie: 5 points, speed 3
  { color: "blue", hp: 3, damage: 1, speed: 6, points: 3 },  // Blue Zombie: 3 points, speed 6
];

const bulletDamage = 3;
let turretHp = 10;
let score = 0;
let gameOver = false;
let spawnInterval;
let shootInterval;

// Update turret HP display
function updateTurretHp() {
  turretHpDisplay.textContent = `Turret HP: ${turretHp}`;
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// Turret rotation
let mouseX = arena.clientWidth / 2;
let mouseY = arena.clientHeight / 2;

document.addEventListener("mousemove", (e) => {
  if (gameOver) return;
  const rect = arena.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const angle = Math.atan2(mouseY - rect.height / 2, mouseX - rect.width / 2) * (180 / Math.PI);
  turret.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
});

// Shoot bullets automatically
function shootBullet() {
  if (gameOver) return;

  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  arena.appendChild(bullet);

  const rect = arena.getBoundingClientRect();
  const angle = Math.atan2(mouseY - rect.height / 2, mouseX - rect.width / 2);

  bullets.push({
    element: bullet,
    x: rect.width / 2,
    y: rect.height / 2,
    angle: angle,
    speed: 10,
  });
}

// Spawn zombies randomly
function spawnZombie() {
  if (gameOver) return;
  const type = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
  const zombie = document.createElement("div");
  zombie.classList.add("zombie");
  zombie.style.backgroundColor = type.color;
  zombie.textContent = type.hp;
  arena.appendChild(zombie);

  // Random position around the edges of the arena
  const spawnSide = Math.floor(Math.random() * 4);
  let x, y;

  switch (spawnSide) {
    case 0: // Top
      x = Math.random() * arena.clientWidth;
      y = -30;
      break;
    case 1: // Right
      x = arena.clientWidth + 30;
      y = Math.random() * arena.clientHeight;
      break;
    case 2: // Bottom
      x = Math.random() * arena.clientWidth;
      y = arena.clientHeight + 30;
      break;
    case 3: // Left
      x = -30;
      y = Math.random() * arena.clientHeight;
      break;
  }

  zombies.push({
    element: zombie,
    x: x,
    y: y,
    hp: type.hp,
    damage: type.damage,
    speed: type.speed,
    points: type.points,
  });
}

// Game over logic
function endGame() {
  gameOver = true;
  restartButton.style.display = "block"; // Show restart button
  clearInterval(spawnInterval); // Stop spawning zombies
  clearInterval(shootInterval); // Stop shooting bullets
}

// Restart game
function restartGame() {
  // Reset variables
  turretHp = 10;
  score = 0;
  gameOver = false;
  zombies = [];
  bullets = [];

  // Clear all zombies and bullets from the arena
  document.querySelectorAll(".zombie, .bullet").forEach((element) => element.remove());

  // Update displays
  updateTurretHp();
  updateScore();

  // Hide restart button
  restartButton.style.display = "none";

  // Restart zombie spawning
  spawnInterval = setInterval(spawnZombie, 2000);

  // Restart shooting bullets
  shootInterval = setInterval(shootBullet, 1200); // Shoot every 1.2 seconds

  // Restart game loop
  gameLoop();
}

// Game loop
function gameLoop() {
  if (gameOver) return;

  // Move zombies
  zombies.forEach((zombie, index) => {
    const dx = arena.clientWidth / 2 - zombie.x;
    const dy = arena.clientHeight / 2 - zombie.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = zombie.speed;

    zombie.x += (dx / distance) * speed;
    zombie.y += (dy / distance) * speed;

    zombie.element.style.left = `${zombie.x}px`;
    zombie.element.style.top = `${zombie.y}px`;

    // Check for collision with turret
    if (distance < 20) {
      // Turret takes damage
      turretHp -= zombie.damage;
      updateTurretHp();

      // Remove zombie
      zombie.element.remove();
      zombies.splice(index, 1);

      // Check if turret is destroyed
      if (turretHp <= 0) {
        turretHp = 0;
        updateTurretHp();
        endGame();
      }
    }
  });

  // Move bullets
  bullets.forEach((bullet, index) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;

    bullet.element.style.left = `${bullet.x}px`;
    bullet.element.style.top = `${bullet.y}px`;

    // Check for collision with zombies
    zombies.forEach((zombie, zIndex) => {
      const dx = bullet.x - zombie.x;
      const dy = bullet.y - zombie.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        zombie.hp -= bulletDamage;
        zombie.element.textContent = zombie.hp;

        if (zombie.hp <= 0) {
          // Add points for killing the zombie
          score += zombie.points;
          updateScore();

          // Remove zombie
          zombie.element.remove();
          zombies.splice(zIndex, 1);
        }

        // Remove bullet
        bullet.element.remove();
        bullets.splice(index, 1);
      }
    });

    // Remove bullets that go off-screen
    if (
      bullet.x < 0 ||
      bullet.x > arena.clientWidth ||
      bullet.y < 0 ||
      bullet.y > arena.clientHeight
    ) {
      bullet.element.remove();
      bullets.splice(index, 1);
    }
  });

  requestAnimationFrame(gameLoop);
}

// Start the game
updateTurretHp();
updateScore();
spawnInterval = setInterval(spawnZombie, 2000); // Spawn zombies every 2 seconds
shootInterval = setInterval(shootBullet, 1200); // Shoot bullets every 1.2 seconds
gameLoop();

// Restart button event listener
restartButton.addEventListener("click", restartGame);



