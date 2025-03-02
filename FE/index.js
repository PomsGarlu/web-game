const ws = new WebSocket("ws://localhost:8080");
import { C } from "./src/constants.js";
const bullets = []; // Array to store active bullets
let lastShotTime = 0;
const FIRE_RATE = 200; // 200ms delay between shots
const players = [ document.getElementById("player1"),
    document.getElementById("player2"),
    document.getElementById("player3"),
    document.getElementById("player4")

]
const player = players[0] // Replace with your player element's ID

const playerHealth = {
    player1: 100,
    player2: 100,
    player3: 100,
    player4: 100,
};

players.forEach(player => {
    player.dataset.health = playerHealth[player.id]; // Assign health based on player ID
});



let x = (C.ARENA_SIZE_X - C.PLAYER_SIZE_X) / 2;
let y = (C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y) / 2;
let bulletDirection = null;

ws.onopen = () => {
    console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = () => {
    console.log("WebSocket connection closed");
};


function gameLoop() {
    updateLocalPlayer();
    updateBullets();
    requestAnimationFrame(gameLoop);
}

function updateLocalPlayer() {
    if (keys.ArrowUp || keys.w) movePlayer(0, -C.MOVE_SPEED, 0);
    if (keys.ArrowDown || keys.s) movePlayer(0, C.MOVE_SPEED, 180);
    if (keys.ArrowLeft || keys.a) movePlayer(-C.MOVE_SPEED, 0, -90);
    if (keys.ArrowRight || keys.d) movePlayer(C.MOVE_SPEED, 0, 90);
    if ((keys.ArrowUp && keys.ArrowLeft) || (keys.w && keys.a)) movePlayer(0, 0, -45);
    if ((keys.ArrowUp && keys.ArrowRight) || (keys.w && keys.d)) movePlayer(0, 0, 45);
    if ((keys.ArrowDown && keys.ArrowLeft) || (keys.s && keys.a)) movePlayer(0, 0, -135);
    if ((keys.ArrowDown && keys.ArrowRight) || (keys.s && keys.d)) movePlayer(0, 0, 135);
}

// Move the player
function movePlayer(dx, dy, rotation) {
    switch (rotation) {
        case 0:
            bulletDirection = "up";
            break;
        case 180:
            bulletDirection = "down";
            break;
        case -90:
            bulletDirection = "left";
            break;
        case 90:
            bulletDirection = "right";
            break;
    }
    x = Math.max(0, Math.min(C.ARENA_SIZE_X - C.PLAYER_SIZE_X, x + dx)); // Clamp x within arena
    y = Math.max(0, Math.min(C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y, y + dy)); // Clamp y within arena
    player.setAttribute("x", x); // the player. is an SVG element
    player.setAttribute("y", y); // the player. is an SVG element
    player.setAttribute("transform", `rotate(${rotation} ${x + C.PLAYER_SIZE_X / 2} ${y + C.PLAYER_SIZE_Y / 2})`); // Rotate player around its center
}

function shootBullet(playerId) {
    if (!bulletDirection) {
        console.log("Cannot shoot: No bullet direction set!");
        return;
    }

    const bulletImages = {
        1: "bullet1.png",
        2: "bullet2.png",
        3: "bullet3.png",
        4: "bullet4.png"
    };

    const bulletImg = bulletImages[playerId] || "bullet1.png"; // Default to player 1's bullet

    const bullet = document.createElementNS("http://www.w3.org/2000/svg", "image");
    bullet.setAttribute("href", bulletImg);
    bullet.setAttribute("width", "10");
    bullet.setAttribute("height", "14");

    // Get player position
    let bulletX = parseFloat(player.getAttribute("x")) + 8;
    let bulletY = parseFloat(player.getAttribute("y")) - 15;

    let velocityX = 0;
    let velocityY = 0;
    let angle = 0; // Default is facing "up"

    // Adjust bullet spawn position & angle based on direction
    switch (bulletDirection) {
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

    bullets.push({ element: bullet, x: bulletX, y: bulletY, vx: velocityX, vy: velocityY });

    function animateBullet() {
        bulletX += velocityX;
        bulletY += velocityY;

        bullet.setAttribute("x", bulletX);
        bullet.setAttribute("y", bulletY);

        // Keep the rotation while moving
        bullet.setAttribute("transform", `rotate(${angle} ${bulletX + 5} ${bulletY + 7})`);

        if (bulletX > 0 && bulletX < 1344 && bulletY > 0 && bulletY < 768) {
            requestAnimationFrame(animateBullet);
        } else {
            bullet.remove();
        }
    }

    requestAnimationFrame(animateBullet);
}

function checkBulletCollision(bullet) {

    for (const player of Object.values(players)) {
        if (player) {
            const bulletBox = bullet.element.getBBox();
            const playerBox = player.getBBox();

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
    playerHealth[player.id] -= 20;
    console.log(`${player.id} health: ${playerHealth[player.id]}`);

    // Update the player's `data-health` attribute (optional for debugging)
    player.setAttribute("data-health", playerHealth[player.id]);

    // Apply glow effect
    player.style.filter = "brightness(2)";
    setTimeout(() => {
        player.style.filter = "none";
    }, 500);

    // Determine explosion position based on bullet impact
    const explosionX = bullet?.x ? bullet.x - 13 : player.x.baseVal.value;
    const explosionY = bullet?.y ? bullet.y - 13 : player.y.baseVal.value;

    // Create explosion image
    const explosion = document.createElementNS("http://www.w3.org/2000/svg", "image");

    if (playerHealth[player.id] <= 0) {
        console.log(`${player.id} is eliminated!`);

        // Use "Explosion53.gif" for destroyed tanks
        const tankExplosion = document.createElementNS("http://www.w3.org/2000/svg", "image");
        tankExplosion.setAttribute("href", "Explosion53.gif");
        tankExplosion.setAttribute("width", "100"); // Adjust size as needed
        tankExplosion.setAttribute("height", "100");
        
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
        bullet.y += bullet.vy;

        bullet.element.setAttribute("x", bullet.x);
        bullet.element.setAttribute("y", bullet.y);

        // Keep bullet rotated while moving
        const angle = parseFloat(bullet.element.getAttribute("transform").match(/rotate\((-?\d+)/)[1]);
        bullet.element.setAttribute("transform", `rotate(${angle} ${bullet.x + 5} ${bullet.y + 7})`);

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

    if (e.key === " ") {
        const now = Date.now();
        if (now - lastShotTime > FIRE_RATE) {
            if (bulletDirection) { // Ensure a valid direction before shooting
                console.log("Shooting bullet...");
                lastShotTime = now;  // Update before shooting
                shootBullet();
            } else {
                console.log("Cannot shoot: No bullet direction set!");
            }
        }
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

document.addEventListener("DOMContentLoaded", () => {
    gameLoop();
});
