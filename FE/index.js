const ws = new WebSocket("ws://localhost:8080");
import { C } from "./src/constants.js";

let x = (C.ARENA_SIZE_X - C.PLAYER_SIZE_X) / 2;
let y = (C.ARENA_SIZE_Y - C.PLAYER_SIZE_Y) / 2;
let fps = {};
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
const player = document.getElementById("player"); // Replace with your player element's ID
const bullet = document.getElementById("bullet1");

function gameLoop() {
    updateLocalPlayer();
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

function shootBullet() {
    const direction = bulletDirection;
    console.log(direction);

    let bulletX = parseFloat(player.getAttribute("x")) + 8;
    let bulletY = parseFloat(player.getAttribute("y")) - 15;

    switch (direction) {
        case "left":
            bulletX += -34;
            bulletY += 34;
            break;
        case "right":
            bulletX += 34;
            bulletY += 34;
            break;
        case "down":
            bulletX += 0;
            bulletY += 68;
            break;
    }

    bullet.setAttribute("x", bulletX);
    bullet.setAttribute("y", bulletY);
    bullet.style.display = "block";

    const bulletWidth = parseFloat(bullet.getAttribute("width")) / 2;
    const bulletHeight = parseFloat(bullet.getAttribute("height")) / 2;
    const centerX = bulletX + bulletWidth;
    const centerY = bulletY + bulletHeight;

    let velocityX = 0;
    let velocityY = 0;
    let angle = 0;

    switch (direction) {
        case "up":
            angle = 0;
            velocityY = -C.BULLET_SPEED;
            break;
        case "down":
            angle = 180;
            velocityY = C.BULLET_SPEED;
            break;
        case "left":
            angle = -90;
            velocityX = -C.BULLET_SPEED;
            break;
        case "right":
            angle = 90;
            velocityX = C.BULLET_SPEED;
            break;
    }

    bullet.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);

    function animateBullet() {
        bulletX += velocityX;
        bulletY += velocityY;

        bullet.setAttribute("x", bulletX);
        bullet.setAttribute("y", bulletY);

        const newCenterX = bulletX + bulletWidth;
        const newCenterY = bulletY + bulletHeight;

        bullet.setAttribute("transform", `rotate(${angle} ${newCenterX} ${newCenterY})`);

        if (bulletX > 0 && bulletX < 1344 && bulletY > 0 && bulletY < 768) {
            requestAnimationFrame(animateBullet);
        } else {
            bullet.style.display = "none";
        }
    }

    requestAnimationFrame(animateBullet);
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
    if (keys[e.key]) return;
    keys[e.key] = true;
    if (e.key === " ") {
        if (bullet.style.display === "none" && Object.values(keys).filter((value) => value === true).length === 1) {
            shootBullet();
        }
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

document.addEventListener("DOMContentLoaded", () => {
    gameLoop();
});
