const ws = new WebSocket("ws://localhost:8080");
import { C } from "./src/constants.js";
const bullets = []; // Array to store active bullets
let lastShotTime = 0;
const FIRE_RATE = 200; // 200ms delay between shots
let playerIdList = [];
let playerList = [];
let playerId = null;
let isLeader = false;
let playerName = null;

document.addEventListener("DOMContentLoaded", () => {
    const nameForm = document.getElementById("nameForm");
    const nameInput = document.getElementById("nameInput");
    const waitingMessage = document.getElementById("waitingMessage");
    const startButton = document.getElementById("startGame");

    nameForm.onsubmit = (e) => {
        e.preventDefault();
        playerName = nameInput.value.trim();
        for (let i = 6; i < playerId.length; i++) {
            playerName += playerId[i];
        }
        nameForm.style.display = "none";
        if (isLeader) {
            waitingMessage.textContent = `Your name is set as ${playerName} and you are the lobby leader.`;
        } else {
            waitingMessage.textContent = `Your name is set as ${playerName}. Waiting for the lobby leader to start the game.`;
        }

        ws.send(JSON.stringify({ type: "selectName", name: playerName }));

        if (playerIdList.length >= 2 && isLeader) {
            startButton.style.display = "block";
        }
    };

    startButton.addEventListener("click", () => {
        if (playerIdList.length >= 2 && playerIdList.length < 5) {
            ws.send(JSON.stringify({ type: "startGame" }));
        }
    });
});



const lobby = document.getElementById("lobby");
const arena = document.getElementById("arena");

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

    if (data.type === "youAreLeader") {
        isLeader = true;
    }

    if (data.type === "move") {
        console.log(data.playerId, "move", data.direction);
        movePlayer(data.playerId, data.direction, data.rotation, data.x, data.y);
    }

    if (data.type === "gameState" && data.players) {
        playerIdList = Object.keys(data.players);
        playersInLobby.textContent = `Connected players: ${playerIdList.length}`;
        if (playerIdList.length === 1) {
            isLeader = true;
        }
    }

    if (data.type === "gameStart") {
        console.log("GAME START!!!");
        let players = Object.values(data.players);
        lobby.style.display = "none";
        arena.style.display = "block";

        document.querySelectorAll("#arena image.player").forEach((player) => player.remove());

        const playerData = [
            { href: "player1tank.png", x: 1314, y: 30 },
            { href: "player2tank.png", x: 30, y: 30 },
            { href: "player3tank.png", x: 30, y: 708 },
            { href: "player4tank.png", x: 1314, y: 708 },
        ];

        players.forEach((player, index) => {
            if (index < playerData.length) {
                const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
                img.setAttribute("href", playerData[index].href);
                img.setAttribute("width", "26");
                img.setAttribute("height", "52");
                img.setAttribute("x", player.x);
                img.setAttribute("y", player.y);
                img.setAttribute("id", player.playerId);
                img.classList.add("player");
                arena.appendChild(img);
            }
        });

        gameLoop();
    }
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = () => {
    console.log("WebSocket connection closed");
};



function gameLoop() {
    updateLocalPlayer();
    //updateBullets();
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

    // if (e.key === " ") {
    //     const now = Date.now();
    //     if (now - lastShotTime > FIRE_RATE) {
    //         if (bulletDirection) {
    //             // Ensure a valid direction before shooting
    //             console.log("Shooting bullet...");
    //             lastShotTime = now; // Update before shooting
    //             shootBullet();
    //         } else {
    //             console.log("Cannot shoot: No bullet direction set!");
    //         }
    //     }
    // }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function sendPlayerMove(x, y, direction, rotation) {
    ws.send(JSON.stringify({ type: "move", playerId: playerId, x, y, direction: direction, rotation: rotation }));
}

function updateLocalPlayer() {
    // Handle diagonal movement first (since it's the higher-priority check)
    if ((keys.ArrowUp && keys.ArrowLeft) || (keys.w && keys.a)) {
        sendPlayerMove(-C.DIAGONAL_MOVE_SPEED, -C.DIAGONAL_MOVE_SPEED, "upleft", -45);
    } else if ((keys.ArrowUp && keys.ArrowRight) || (keys.w && keys.d)) {
        sendPlayerMove(C.DIAGONAL_MOVE_SPEED, -C.DIAGONAL_MOVE_SPEED, "upright", 45);
    } else if ((keys.ArrowDown && keys.ArrowLeft) || (keys.s && keys.a)) {
        sendPlayerMove(-C.DIAGONAL_MOVE_SPEED, C.DIAGONAL_MOVE_SPEED, "downleft", -135);
    } else if ((keys.ArrowDown && keys.ArrowRight) || (keys.s && keys.d)) {
        sendPlayerMove(C.DIAGONAL_MOVE_SPEED, C.DIAGONAL_MOVE_SPEED, "downright", 135);
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
    let currentX = parseFloat(player.getAttribute("x"));
    let currentY = parseFloat(player.getAttribute("y"));

    let newX = Math.max(0, Math.min(C.ARENA_SIZE_X - C.PLAYER_SIZE_X, currentX + addX)); // Clamp x within arena
    let newY = Math.max(0, Math.min(C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y, currentY + addY)); // Clamp y within arena

    console.log(
        "Direction: ",
        direction,
        "\n",
        "Rotation: ",
        rotation,
        "\n",
        "currentX: ",
        currentX,
        "\n",
        "currentY: ",
        currentY,
        "\n",
        "newX: ",
        newX,
        "\n",
        "newY: ",
        newY,
        "\n",
        "addX: ",
        addX,
        "\n",
        "addY: ",
        addY
    );

    player.setAttribute("x", newX); // the player. is an SVG element
    player.setAttribute("y", newY); // the player. is an SVG element
    player.setAttribute("transform", `rotate(${rotation} ${newX + C.PLAYER_SIZE_X / 2} ${newY + C.PLAYER_SIZE_Y / 2})`); // Rotate player around its center
}

// // Move the player
// function movePlayer(dx, dy, rotation) {
//     switch (rotation) {
//         case 0:
//             bulletDirection = "up";
//             break;
//         case 180:
//             bulletDirection = "down";
//             break;
//         case -90:
//             bulletDirection = "left";
//             break;
//         case 90:
//             bulletDirection = "right";
//             break;
//         case -45:
//             bulletDirection = "upleft";
//             break;
//         case 45:
//             bulletDirection = "upright";
//             break;
//         case -135:
//             bulletDirection = "downleft";
//             break;
//         case 135:
//             bulletDirection = "downright";
//             break;
//     }
//     x = Math.max(0, Math.min(C.ARENA_SIZE_X - C.PLAYER_SIZE_X, x + dx)); // Clamp x within arena
//     y = Math.max(0, Math.min(C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y, y + dy)); // Clamp y within arena
//     player.setAttribute("x", x); // the player. is an SVG element
//     player.setAttribute("y", y); // the player. is an SVG element
//     player.setAttribute("transform", `rotate(${rotation} ${x + C.PLAYER_SIZE_X / 2} ${y + C.PLAYER_SIZE_Y / 2})`); // Rotate player around its center
// }

// function shootBullet(playerId) {
//     if (!bulletDirection) {
//         console.log("Cannot shoot: No bullet direction set!");
//         return;
//     }

//     const bulletImages = {
//         1: "bullet1.png",
//         2: "bullet2.png",
//         3: "bullet3.png",
//         4: "bullet4.png",
//     };

//     const bulletImg = bulletImages[playerId] || "bullet1.png"; // Default to player 1's bullet

//     const bullet = document.createElementNS("http://www.w3.org/2000/svg", "image");
//     bullet.setAttribute("href", bulletImg);
//     bullet.setAttribute("width", "10");
//     bullet.setAttribute("height", "14");

//     // Get player position
//     let bulletX = parseFloat(player.getAttribute("x")) + 8;
//     let bulletY = parseFloat(player.getAttribute("y")) - 15;

//     let velocityX = 0;
//     let velocityY = 0;
//     let angle = 0; // Default is facing "up"

//     // Adjust bullet spawn position & angle based on direction
//     switch (bulletDirection) {
//         case "left":
//             bulletX -= 34;
//             bulletY += 34;
//             angle = -90;
//             velocityX = -C.BULLET_SPEED;
//             break;
//         case "right":
//             bulletX += 34;
//             bulletY += 34;
//             angle = 90;
//             velocityX = C.BULLET_SPEED;
//             break;
//         case "down":
//             bulletX += 0;
//             bulletY += 68;
//             angle = 180;
//             velocityY = C.BULLET_SPEED;
//             break;
//         case "upleft":
//             bulletX += -20;
//             bulletY += 15;
//             angle = -45;
//             velocityY = -C.BULLET_SPEED;
//             velocityX = -C.BULLET_SPEED;
//             break;
//         case "upright":
//             bulletX += 20;
//             bulletY += 15;
//             angle = 45;
//             velocityY = -C.BULLET_SPEED;
//             velocityX = C.BULLET_SPEED;
//             break;
//         case "downleft":
//             bulletX += -16;
//             bulletY += 50;
//             angle = -135;
//             velocityY = C.BULLET_SPEED;
//             velocityX = -C.BULLET_SPEED;
//             break;
//         case "downright":
//             bulletX += 16;
//             bulletY += 50;
//             angle = 135;
//             velocityY = C.BULLET_SPEED;
//             velocityX = C.BULLET_SPEED;
//             break;
//         case "up":
//         default:
//             velocityY = -C.BULLET_SPEED;
//             break;
//     }

//     bullet.setAttribute("x", bulletX);
//     bullet.setAttribute("y", bulletY);

//     // Center point for rotation
//     const centerX = bulletX + 5; // Center horizontally (width/2)
//     const centerY = bulletY + 7; // Center vertically (height/2)

//     // Rotate bullet
//     bullet.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);

//     // Add to bullet container
//     document.getElementById("bullet-container").appendChild(bullet);

//     bullets.push({ element: bullet, x: bulletX, y: bulletY, vx: velocityX, vy: velocityY });

//     function animateBullet() {
//         bulletX += velocityX;
//         bulletY += velocityY;

//         bullet.setAttribute("x", bulletX);
//         bullet.setAttribute("y", bulletY);

//         // Keep the rotation while moving
//         bullet.setAttribute("transform", `rotate(${angle} ${bulletX + 5} ${bulletY + 7})`);

//         if (bulletX > 0 && bulletX < 1344 && bulletY > 0 && bulletY < 768) {
//             requestAnimationFrame(animateBullet);
//         } else {
//             bullet.remove();
//         }
//     }

//     requestAnimationFrame(animateBullet);
// }

// function checkBulletCollision(bullet) {
//     for (const player of Object.values(players)) {
//         if (player) {
//             const bulletBox = bullet.element.getBBox();
//             const playerBox = player.getBBox();

//             if (
//                 bulletBox.x < playerBox.x + playerBox.width &&
//                 bulletBox.x + bulletBox.width > playerBox.x &&
//                 bulletBox.y < playerBox.y + playerBox.height &&
//                 bulletBox.y + bulletBox.height > playerBox.y
//             ) {
//                 console.log(`Bullet hit ${player.id}!`);
//                 handlePlayerHit(player, bullet); // Pass bullet position to explosion
//                 return true; // Collision detected
//             }
//         }
//     }
//     return false;
// }

// function handlePlayerHit(player, bullet) {
//     console.log(`${player.id} was hit!`);

//     // Decrease health
//     playerHealth[player.id] -= 20;
//     console.log(`${player.id} health: ${playerHealth[player.id]}`);

//     // Update the player's `data-health` attribute (optional for debugging)
//     player.setAttribute("data-health", playerHealth[player.id]);

//     // Apply glow effect
//     player.style.filter = "brightness(2)";
//     setTimeout(() => {
//         player.style.filter = "none";
//     }, 500);

//     // Determine explosion position based on bullet impact
//     const explosionX = bullet?.x ? bullet.x - 13 : player.x.baseVal.value;
//     const explosionY = bullet?.y ? bullet.y - 13 : player.y.baseVal.value;

//     // Create explosion image
//     const explosion = document.createElementNS("http://www.w3.org/2000/svg", "image");

//     if (playerHealth[player.id] <= 0) {
//         console.log(`${player.id} is eliminated!`);

//         // Use "Explosion53.gif" for destroyed tanks
//         const tankExplosion = document.createElementNS("http://www.w3.org/2000/svg", "image");
//         tankExplosion.setAttribute("href", "Explosion53.gif");
//         tankExplosion.setAttribute("width", "100"); // Adjust size as needed
//         tankExplosion.setAttribute("height", "100");

//         // Center explosion on tank
//         const tankX = player.x.baseVal.value - 25; // Offset to center
//         const tankY = player.y.baseVal.value - 25; // Offset to center

//         tankExplosion.setAttribute("x", tankX);
//         tankExplosion.setAttribute("y", tankY);

//         // Add explosion to the arena
//         document.getElementById("arena").appendChild(tankExplosion);

//         // Remove tank after a short delay for a smoother explosion effect
//         setTimeout(() => {
//             player.remove();
//             delete players[player.id]; // Remove from the players object
//         }, 100);

//         // Remove explosion after 800ms for a more dramatic effect
//         setTimeout(() => {
//             tankExplosion.remove();
//         }, 800);
//     } else {
//         // Use normal explosion for non-lethal hits (Bullet impact)
//         explosion.setAttribute("href", "Explosion52.gif");
//         explosion.setAttribute("width", "52");
//         explosion.setAttribute("height", "52");
//         explosion.setAttribute("x", explosionX);
//         explosion.setAttribute("y", explosionY);

//         // Add explosion to the arena
//         document.getElementById("arena").appendChild(explosion);

//         // Remove explosion after 500ms
//         setTimeout(() => {
//             explosion.remove();
//         }, 500);
//     }
// }

// function updateBullets() {
//     for (let i = bullets.length - 1; i >= 0; i--) {
//         let bullet = bullets[i];
//         bullet.x += bullet.vx;
//         bullet.y += bullet.vy;

//         bullet.element.setAttribute("x", bullet.x);
//         bullet.element.setAttribute("y", bullet.y);

//         // Keep bullet rotated while moving
//         const angle = parseFloat(bullet.element.getAttribute("transform").match(/rotate\((-?\d+)/)[1]);
//         bullet.element.setAttribute("transform", `rotate(${angle} ${bullet.x + 5} ${bullet.y + 7})`);

//         // Check if bullet hits a player
//         if (checkBulletCollision(bullet)) {
//             bullet.element.remove();
//             bullets.splice(i, 1); // Remove bullet
//             continue;
//         }

//         // Remove bullet if out of bounds
//         if (bullet.x < 0 || bullet.x > 1344 || bullet.y < 0 || bullet.y > 768) {
//             bullet.element.remove();
//             bullets.splice(i, 1);
//         }
//     }
// }
