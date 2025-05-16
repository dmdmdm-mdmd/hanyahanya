const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImg = new Image();
playerImg.src = "hanya.jpg";

const enemyImg = new Image();
enemyImg.src = "ossan.png";

const bgImg = new Image();
bgImg.src = "haikei.jpg";

const player = {
  x: canvas.width / 2 - 24,
  y: canvas.height - 60,
  width: 48,
  height: 48,
  speed: 15
};

let bullets = [];
let enemies = [];
let enemyBullets = [];

const enemyRows = 3;
const enemyCols = 5;
const enemySpacing = 60;

let wave = 1;  // 敵の強さを表す波（レベル）

// 敵の基本移動速度と発射確率のベース値
const baseEnemySpeedX = 1;
const baseEnemyFireChance = 0.005;

let enemySpeedX = baseEnemySpeedX;   // 敵の横移動速度
const enemySpeedY = 20;  // 敵が端に当たったら下に降りる量

let enemyFireChance = baseEnemyFireChance;  // 敵の弾を撃つ確率

function createEnemies() {
  enemies = [];
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      enemies.push({
        x: col * enemySpacing + 40,
        y: row * enemySpacing + 40,
        width: 40,
        height: 40,
        alive: true,
        hp: 1 + Math.floor(wave / 3),  // waveに応じて耐久力を増やす例
      });
    }
  }
  // waveに応じて敵の移動速度と弾発射確率を増加
  enemySpeedX = baseEnemySpeedX + 0.3 * (wave - 1);
  enemyFireChance = baseEnemyFireChance + 0.002 * (wave - 1);
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  enemies.forEach(enemy => {
    if (enemy.alive) {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}

function drawBullets() {
  ctx.fillStyle = "red";
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
  ctx.fillStyle = "blue";
  enemyBullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function updateBullets() {
  // プレイヤーの弾の移動＆敵との当たり判定
  bullets = bullets.filter(bullet => bullet.y > 0);
  bullets.forEach(bullet => {
    bullet.y -= bullet.speed;
    enemies.forEach(enemy => {
      if (
        enemy.alive &&
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemy.hp--;
        bullet.y = -10; // 弾を消す
        if (enemy.hp <= 0) {
          enemy.alive = false;
        }
      }
    });
  });

  // 敵の弾の移動＆プレイヤーとの当たり判定
  enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);
  enemyBullets.forEach(bullet => {
    bullet.y += bullet.speed;
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      alert("ゲームオーバー！");
      resetGame();
    }
  });
}

function updateEnemies() {
  // 生存している敵がいない場合は何もしない（createEnemiesで対応）
  if (enemies.every(e => !e.alive)) return;

  // 敵が端に到達したか確認
  let aliveEnemies = enemies.filter(e => e.alive);
  let rightMost = Math.max(...aliveEnemies.map(e => e.x + e.width));
  let leftMost = Math.min(...aliveEnemies.map(e => e.x));
  
  if (rightMost + enemySpeedX > canvas.width || leftMost + enemySpeedX < 0) {
    enemySpeedX = -enemySpeedX;
    enemies.forEach(enemy => {
      enemy.y += enemySpeedY;
    });
  }

  enemies.forEach(enemy => {
    if (enemy.alive) enemy.x += enemySpeedX;
  });

  enemies.forEach(enemy => {
    if (enemy.alive && Math.random() < enemyFireChance) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 10,
        speed: 2
      });
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);  // 背景描画
  drawPlayer();
  drawEnemies();
  drawBullets();
}

function update() {
  updateBullets();
  updateEnemies();

  // 敵が全滅したらwaveを増やして強くして再生成
  if (enemies.every(e => !e.alive)) {
    wave++;
    createEnemies();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    player.x -= player.speed;
    if(player.x < 0) player.x = 0;
  }
  if (e.key === "ArrowRight") {
    player.x += player.speed;
    if(player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  }
  if (e.key === " ") {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      speed: 7
    });
  }
});

let imagesLoaded = 0;
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) startGame();
}

playerImg.onload = checkImagesLoaded;
enemyImg.onload = checkImagesLoaded;
bgImg.onload = checkImagesLoaded;

function startGame() {
  createEnemies();
  gameLoop();
}

function resetGame() {
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 60;
  bullets = [];
  enemyBullets = [];
  wave = 1;  // ゲームリセット時にwaveもリセット
  createEnemies();
}
