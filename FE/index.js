const ws = new WebSocket("ws://localhost:8080");
import { C } from "./src/constants.js";
import { displayMenu } from "./elements/menu.js";
import {
  displayGame,
  gameOver,
  gamePaused,
  gameRunning,
  inMenu,
  setGameStatus,
} from "./elements/game.js";
import { displayHUD } from "./elements/hud.js";

const bulletShot = new Audio("shell_shot.wav");
bulletShot.volume = 0.1;
const bulletExplosion = new Audio("shell_exp.wav");
bulletExplosion.volume = 1;
const tankExplosion = new Audio("tank_exp.wav");
tankExplosion.volume = 0.1;

const obstacles = [
  { x: 700, y: 250, width: 75, height: 75, image: 'rock_1.png' }, 
  { x: 220, y: 70, width: 100, height: 100, image: 'rock_2.png' },
  { x: 330, y: 500, width: 200, height: 210, image: 'rock_3.png' },
  { x: 1000, y: 60, width: 225, height: 150, image: 'rock_4.png' }
];

// Create an audio element for ambient sound
const ambientSound = new Audio("ambient.wav"); // Replace with your actual file path
ambientSound.loop = true; // Ensure the sound loops continuously
ambientSound.volume = 0.00; // Adjust volume (0.0 to 1.0)

// Start playing ambient sound when the game loads
window.addEventListener("load", () => {
  ambientSound.play().catch(error => console.log("Audio playback error:", error));
});

document.addEventListener("click", () => {
  if (ambientSound.paused) {
    ambientSound.play().catch(error => console.log("Audio playback error:", error));
  }
});

function displayObstacles() {
  const arena = document.getElementById("arena");
  
  obstacles.forEach(obstacle => {
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("x", obstacle.x);
    image.setAttribute("y", obstacle.y);
    image.setAttribute("width", obstacle.width);
    image.setAttribute("height", obstacle.height);
    image.setAttribute("href", obstacle.image);
    image.setAttribute("fill", "gray"); // Change color as needed
    image.classList.add("obstacle"); // Assign class for easy access later

    arena.appendChild(image);
  });
}

// Menu controlls



const bullets = []; // Array to store active bullets
let lastShotTime = 0;
let bulletDirection = "up";
let bulletImg = "";
const FIRE_RATE = 200; // 200ms delay between shots
let playerIdList = [];
let playerNameList = [];
let playerId = null;
let isLeader = false;
let playerName = null;
let players = [];
let playerElements = [];
let startButton = document.getElementById("startGame");
let arena = document.getElementById("arena");


document.addEventListener("DOMContentLoaded", () => {
  displayMenu();
  displayHUD();
  const nameForm = document.getElementById("nameForm");
  const nameInput = document.getElementById("nameInput");
  const waitingMessage = document.getElementById("waitingMessage");
  arena = document.getElementById("arena");
  startButton = document.getElementById("startGame");
  nameForm.onclick = (e) => {
    console.log("nameForm submitted");
    e.preventDefault();
    playerName = nameInput.value.trim();
    for (let i = 6; i < playerId.length; i++) {
      playerName += playerId[i];
    }
    // nameForm.style.display = "none";
    ws.send(JSON.stringify({ type: "selectName", name: playerName }));
  };

  startButton.addEventListener("click", () => {
    console.log("startButton clicked");
    setGameStatus("game");
    if (
      playerIdList.length >= 2 &&
      playerIdList.length < 5 &&
      playerNameList.length === playerIdList.length
    ) {
      ws.send(JSON.stringify({ type: "startGame" }));
    } else {
      alert("Not all players are ready!");
      console.log(
        "playerIdList:",
        playerIdList,
        "playerNameList:",
        playerNameList
      );
    }
  });
});




const lobby = document.getElementById("lobby"); // TODO: moved to menu.js


ws.onopen = () => {
  console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
  const playersInLobby = document.getElementById("playersInLobby");
  const data = JSON.parse(event.data);
  if (data.type === "assignPlayerId") {
    playerId = data.playerId;
    console.log("Assigned id:", playerId);
  }

  if (data.type === "move") {
    console.log(data.playerId, "move", data.direction);
    movePlayer(data.playerId, data.direction, data.rotation, data.x, data.y);
  }

  if (data.type === "shoot" && data.playerId !== playerId) {
    shootBullet(data.playerId, data.direction);
  }

  if (data.type === "gameState" && data.players) {
    playerNameList = Object.keys(data.players)
      .map((playerId) => data.players[playerId]?.name)
      .filter((name) => name !== null && name !== undefined);

    playerIdList = Object.keys(data.players);
    if (playerIdList[0] === playerId) {
      isLeader = true;
    }

    if (isLeader) {
      startButton.style.display = "block";
    } else {
      startButton.style.display = "none";
    }

    if (isLeader) {
      if (playerName) {
        waitingMessage.textContent = `Your name is set as ${playerName} and you are the lobby leader.`;
      } else {
        waitingMessage.textContent = `You are the lobby leader. Please set your name!`;
      }
    } else {
      if (playerName) {
        waitingMessage.textContent = `Your name is set as ${playerName}. Waiting for the lobby leader to start the game.`;
      } else {
        waitingMessage.textContent = `Please set your name!`;
      }
    }

    console.log("playerIdList:", playerIdList);
    playersInLobby.textContent = `Connected players: ${playerIdList.length}`;
  }

  if (data.type === "gameStart") {
    console.log("GAME START!!!");
    setGameStatus("game");
    if (gameRunning) {
      displayGame(); 
    }

    displayObstacles();

    let players = Object.values(data.players);
    console.log("Players:", players);

    // lobby.style.display = "none";
    // arena.style.display = "block";
    const playersTest = document.querySelectorAll("#arena image.player"); // this is empty
    console.log("Testing the goods", playersTest);
 
    document
      .querySelectorAll("#arena image.player")
      .forEach((player) => player.remove()); // this is empty so nothing happens 

    const playerData = [
      { href: "player1tank.png", x: 1314, y: 30 },
      { href: "player2tank.png", x: 30, y: 30 },
      { href: "player3tank.png", x: 30, y: 708 },
      { href: "player4tank.png", x: 1314, y: 708 },
    ];

    players.forEach((player, index) => {
      if (index < playerData.length) {
        const img = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );
        img.setAttribute("href", playerData[index].href);
        img.setAttribute("width", "26");
        img.setAttribute("height", "52");
        img.setAttribute("x", player.x);
        img.setAttribute("y", player.y);
        img.setAttribute("id", player.playerId);
        img.classList.add("player");
        console.log("Player", img);

        if (playerId === player.playerId) {
          if (playerData[index].href === "player1tank.png") {
            bulletImg = "bullet1.png";
          }
          if (playerData[index].href === "player2tank.png") {
            bulletImg = "bullet2.png";
          }
          if (playerData[index].href === "player3tank.png") {
            bulletImg = "bullet3.png";
          }
          if (playerData[index].href === "player4tank.png") {
            bulletImg = "bullet4.png";
          }
        }

        arena = document.getElementById("arena");
        if(arena) { 
          console.log("Arena exists");
          arena.appendChild(img);
        } else {
          console.log("Arena does not exist");
        }
       
        arena.appendChild(img);
      }
    });

    playerIdList.forEach((player) => {
      playerElements.push(document.getElementById(player));
    });

    playerElements.forEach((player) => {
      player.dataset.health = 100;
    });
    // how frequently is this called?
    console.log("update from gameStart");
    gameLoop();
  }

  // The booleans for this need to be triggered
  console.log("is triggered");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};

// Game loop needs to get a tick?
function gameLoop() {
  updateLocalPlayer();
  updateBullets();
  // Update other players
  requestAnimationFrame(gameLoop);
}

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

document.addEventListener("keydown", (e) => {
  if (keys[e.key]) return; // Prevent repeated keydown events
  keys[e.key] = true;

  // Esc to pause game
  if (e.key === "p") {
    // setGameStatus("pause");
  }
  if (e.key === "r") {
    // setGameStatus("game");
  }
  // M to go to the menu ( should be removed for prod.)
  if (e.key === "m") {
    // setGameStatus("menu");
  }
  if (e.key === "g") {
    // setGameStatus("game");
  }

  if (e.key === " ") {
    const now = Date.now();
    if (now - lastShotTime > FIRE_RATE) {
      if (bulletDirection) {
        // Ensure a valid direction before shooting
        console.log("Shooting bullet...");
        lastShotTime = now; // Update before shooting
        shootBullet(playerId, bulletDirection);
      } else {
        console.log("Cannot shoot: No bullet direction set!");
      }
    }
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function isColliding(x, y, width, height) {
  let obstacles = document.querySelectorAll(".obstacle"); // Select only obstacles
  for (let obstacle of obstacles) {
    if (checkRectCollision(x, y, width, height, obstacle)) {
      
      return true;
    }
  }
  return false;
}

function checkRectCollision(x1, y1, width1, height1, obstacle) {
  // Get the bounding box of the obstacle (assuming it's an element with position)
  const obstacleRect = obstacle.getBoundingClientRect();

  // Define the bullet's bounds
  const bulletLeft = x1;
  const bulletTop = y1;
  const bulletRight = x1 + width1;
  const bulletBottom = y1 + height1;

  // Obstacle bounds
  const obstacleLeft = obstacleRect.left;
  const obstacleTop = obstacleRect.top;
  const obstacleRight = obstacleRect.right;
  const obstacleBottom = obstacleRect.bottom;

  // Check for intersection between the bullet and the obstacle
  return !(bulletRight < obstacleLeft || 
           bulletLeft > obstacleRight || 
           bulletBottom < obstacleTop || 
           bulletTop > obstacleBottom);
}

// Send player movement to the BE
function sendPlayerMove(x, y, direction, rotation) {
  ws.send(
    JSON.stringify({
      type: "move",
      playerId: playerId,
      x,
      y,
      direction: direction,
      rotation: rotation,
    })
  );
}

// Get player movement type to be sent to the BE.
function updateLocalPlayer() {
  // Handle diagonal movement first (since it's the higher-priority check)
  if ((keys.ArrowUp && keys.ArrowLeft) || (keys.w && keys.a)) {
    sendPlayerMove(
      -C.DIAGONAL_MOVE_SPEED,
      -C.DIAGONAL_MOVE_SPEED,
      "upleft",
      -45
    );
  } else if ((keys.ArrowUp && keys.ArrowRight) || (keys.w && keys.d)) {
    sendPlayerMove(
      C.DIAGONAL_MOVE_SPEED,
      -C.DIAGONAL_MOVE_SPEED,
      "upright",
      45
    );
  } else if ((keys.ArrowDown && keys.ArrowLeft) || (keys.s && keys.a)) {
    sendPlayerMove(
      -C.DIAGONAL_MOVE_SPEED,
      C.DIAGONAL_MOVE_SPEED,
      "downleft",
      -135
    );
  } else if ((keys.ArrowDown && keys.ArrowRight) || (keys.s && keys.d)) {
    sendPlayerMove(
      C.DIAGONAL_MOVE_SPEED,
      C.DIAGONAL_MOVE_SPEED,
      "downright",
      135
    );
  }
  // Now handle the regular movement (up, down, left, right)
  else if (keys.ArrowUp || keys.w) {
    sendPlayerMove(0, -C.MOVE_SPEED, "up", 0);
  } else if (keys.ArrowDown || keys.s) {
    sendPlayerMove(0, C.MOVE_SPEED, "down", 180);
  } else if (keys.ArrowLeft || keys.a) {
    sendPlayerMove(-C.MOVE_SPEED, 0, "left", -90);
  } else if (keys.ArrowRight || keys.d) {
    sendPlayerMove(C.MOVE_SPEED, 0, "right", 90);
  }
}

function movePlayer(id, direction, rotation, addX, addY) {
  let player = document.getElementById(id);
  if (id === playerId) {
    bulletDirection = direction;
  }
  let currentX = parseFloat(player.getAttribute("x"));
  let currentY = parseFloat(player.getAttribute("y"));

  let newX = Math.max(0, Math.min(C.ARENA_SIZE_X - C.PLAYER_SIZE_X, currentX + addX));
  let newY = Math.max(0, Math.min(C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y, currentY + addY));

  // **Check if the new position collides with an obstacle**
  if (!isColliding(newX, newY, C.PLAYER_SIZE_X, C.PLAYER_SIZE_Y)) {
    player.setAttribute("x", newX);
    player.setAttribute("y", newY);
    player.setAttribute(
      "transform",
      `rotate(${rotation} ${newX + C.PLAYER_SIZE_X / 2} ${newY + C.PLAYER_SIZE_Y / 2})`
    );
  } else {
    console.log("Collision detected! Movement blocked.");
  }
}

// Send bullet data to the BE
function shootBullet(pId, direction) {
  if (!direction) {
    console.log("Cannot shoot: No bullet direction set!");
    return;
  }

  if (pId === playerId) {
    ws.send(JSON.stringify({ type: "shoot", playerId, direction }));
  }

  // Play the bullet shot sound
  bulletShot.currentTime = 0; // Reset sound to allow rapid firing
  bulletShot.play().catch(error => console.log("Audio playback error:", error));

  const player = document.getElementById(pId);

  // Create bullet to the SVG arena
  const bullet = document.createElementNS("http://www.w3.org/2000/svg", "image");

  let bulletImage = bulletImg;

  if (playerId === pId) {
    bulletImage = bulletImg;
  } else {
    let tankImage = player.getAttribute("href");
    console.log(tankImage);
    switch (tankImage) {
      case "player1tank.png":
        bulletImage = "bullet1.png";
        break;
      case "player2tank.png":
        bulletImage = "bullet2.png";
        break;
      case "player3tank.png":
        bulletImage = "bullet3.png";
        break;
      case "player4tank.png":
        bulletImage = "bullet4.png";
        break;
    }
  }

  bullet.setAttribute("href", bulletImage);
  bullet.setAttribute("width", "10");
  bullet.setAttribute("height", "14");

  // Get player position
  let bulletX = parseFloat(player.getAttribute("x")) + 8;
  let bulletY = parseFloat(player.getAttribute("y")) - 15;

  let velocityX = 0;
  let velocityY = 0;
  let angle = 0; // Default is facing "up"

  // Adjust bullet spawn position & angle based on direction
  switch (direction) {
    case "left":
      bulletX -= 34;
      bulletY += 34;
      angle = -90;
      velocityX = -C.BULLET_SPEED;
      break;
    case "right":
      bulletX += 34;
      bulletY += 34;
      angle = 90;
      velocityX = C.BULLET_SPEED;
      break;
    case "down":
      bulletX += 0;
      bulletY += 68;
      angle = 180;
      velocityY = C.BULLET_SPEED;
      break;
    case "upleft":
      bulletX += -20;
      bulletY += 15;
      angle = -45;
      velocityY = -C.BULLET_SPEED;
      velocityX = -C.BULLET_SPEED;
      break;
    case "upright":
      bulletX += 20;
      bulletY += 15;
      angle = 45;
      velocityY = -C.BULLET_SPEED;
      velocityX = C.BULLET_SPEED;
      break;
    case "downleft":
      bulletX += -16;
      bulletY += 50;
      angle = -135;
      velocityY = C.BULLET_SPEED;
      velocityX = -C.BULLET_SPEED;
      break;
    case "downright":
      bulletX += 16;
      bulletY += 50;
      angle = 135;
      velocityY = C.BULLET_SPEED;
      velocityX = C.BULLET_SPEED;
      break;
    case "up":
    default:
      velocityY = -C.BULLET_SPEED;
      break;
  }

  bullet.setAttribute("x", bulletX);
  bullet.setAttribute("y", bulletY);

  // Center point for rotation
  const centerX = bulletX + 5; // Center horizontally (width/2)
  const centerY = bulletY + 7; // Center vertically (height/2)

  // Rotate bullet
  bullet.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);

  // Add to bullet container
  document.getElementById("bullet-container").appendChild(bullet);

  bullets.push({
    element: bullet,
    x: bulletX,
    y: bulletY,
    vx: velocityX,
    vy: velocityY,
  });

  function animateBullet() {
    bulletX += velocityX;
    bulletY += velocityY;

    bullet.setAttribute("x", bulletX);
    bullet.setAttribute("y", bulletY);

    // Check for obstacle collision
    if (isColliding(bulletX, bulletY, 10, 14)) {
      console.log("Bullet hit an obstacle!");

      // Explosion position
      const explosionX = bulletX - 26;
      const explosionY = bulletY - 26;

      // Use normal explosion for non-lethal hits (Bullet impact)
      explosion.setAttribute("href", "Explosion52.gif");
      explosion.setAttribute("width", "52");
      explosion.setAttribute("height", "52");
      explosion.setAttribute("x", explosionX);
      explosion.setAttribute("y", explosionY);

      // Play explosion sound
      bulletExplosion.currentTime = 0;
      bulletExplosion.play().catch(error => console.log("Audio playback error:", error));

      // Add explosion to the arena
      document.getElementById("arena").appendChild(explosion);

      // Remove explosion after 500ms
      setTimeout(() => {
        explosion.remove();
      }, 500);

      bullet.element.remove();
      // Remove from bullets array
      bullets = bullets.filter(b => b.element !== bullet);  // Clean up bullets array
      return;
    }

    // Keep the rotation while moving
    bullet.setAttribute(
      "transform",
      `rotate(${angle} ${bulletX + 5} ${bulletY + 7})`
    );

    if (bulletX > 0 && bulletX < 1344 && bulletY > 0 && bulletY < 768) {
      requestAnimationFrame(animateBullet);
    } else {
      bullet.remove();
    }
  }

  requestAnimationFrame(animateBullet);
}

function checkBulletCollision(bullet) {
  for (const player of Object.values(playerElements)) {
    if (player) {
      const bulletBox = bullet.element.getBBox();
      const playerBox = player.getBBox();
      console.log(bulletBox, "\n", playerBox);
      if (
        bulletBox.x < playerBox.x + playerBox.width &&
        bulletBox.x + bulletBox.width > playerBox.x &&
        bulletBox.y < playerBox.y + playerBox.height &&
        bulletBox.y + bulletBox.height > playerBox.y
      ) {
        console.log(`Bullet hit ${player.id}!`);
        handlePlayerHit(player, bullet); // Pass bullet position to explosion
        return true; // Collision detected
      }
    }
  }
  return false;
}

function handlePlayerHit(player, bullet) {
  console.log(`${player.id} was hit!`);

  // Decrease health
  player.dataset.health -= 20;
  console.log(`${player.id} health: ${player.dataset.health}`);

  // Update the player's `data-health` attribute (optional for debugging)
  player.setAttribute("data-health", player.dataset.health);

  // Apply glow effect
  player.style.filter = "brightness(2)";
  setTimeout(() => {
    player.style.filter = "none";
  }, 500);

  // Determine explosion position based on bullet impact
  const explosionX = bullet?.x ? bullet.x - 13 : player.x.baseVal.value;
  const explosionY = bullet?.y ? bullet.y - 13 : player.y.baseVal.value;

  // Create explosion image
  const explosion = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );

  if (player.dataset.health <= 0) {
    console.log(`${player.id} is eliminated!`);

    // Use "Explosion53.gif" for destroyed tanks
    const tankExplosion = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    tankExplosion.setAttribute("href", "Explosion53.gif");
    tankExplosion.setAttribute("width", "100"); // Adjust size as needed
    tankExplosion.setAttribute("height", "100");
    tankExplosion.play();

    // Center explosion on tank
    const tankX = player.x.baseVal.value - 25; // Offset to center
    const tankY = player.y.baseVal.value - 25; // Offset to center

    tankExplosion.setAttribute("x", tankX);
    tankExplosion.setAttribute("y", tankY);

    // Add explosion to the arena
    document.getElementById("arena").appendChild(tankExplosion);

    // Remove tank after a short delay for a smoother explosion effect
    setTimeout(() => {
      player.remove();
      delete players[player.id]; // Remove from the players object
    }, 100);

    // Remove explosion after 800ms for a more dramatic effect
    setTimeout(() => {
      tankExplosion.remove();
    }, 800);
  } else {
    // Use normal explosion for non-lethal hits (Bullet impact)
    explosion.setAttribute("href", "Explosion52.gif");
    explosion.setAttribute("width", "52");
    explosion.setAttribute("height", "52");
    explosion.setAttribute("x", explosionX);
    explosion.setAttribute("y", explosionY);
    bulletExplosion.play()

    // Add explosion to the arena
    document.getElementById("arena").appendChild(explosion);

    // Remove explosion after 500ms
    setTimeout(() => {
      explosion.remove();
    }, 500);
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.vx;
    let newX = bullet.x;
    bullet.y += bullet.vy;
    let newY = bullet.y;

    // **Check if the bullet collides with an obstacle**
    if (isColliding(newX, newY, 10, 14)) {  // Bullet size is 10x14
      console.log("Bullet hit an obstacle!");
      
      // **Remove the bullet**
      bullet.element.remove();
      bullets.splice(i, 1); // Remove bullet

      // **Play explosion sound**
      bulletExplosion.currentTime = 0;
      bulletExplosion.play().catch(error => console.log("Audio playback error:", error));
      
      return;
    }

    bullet.element.setAttribute("x", bullet.x);
    bullet.element.setAttribute("y", bullet.y);

    // Keep bullet rotated while moving
    const angle = parseFloat(
      bullet.element.getAttribute("transform").match(/rotate\((-?\d+)/)[1]
    );
    bullet.element.setAttribute(
      "transform",
      `rotate(${angle} ${bullet.x + 5} ${bullet.y + 7})`
    );

    // Check if bullet hits a player
    if (checkBulletCollision(bullet)) {
      bullet.element.remove();
      bullets.splice(i, 1); // Remove bullet
      continue;
    }

    // Remove bullet if out of bounds
    if (bullet.x < 0 || bullet.x > 1344 || bullet.y < 0 || bullet.y > 768) {
      bullet.element.remove();
      bullets.splice(i, 1);
    }
  }
}
