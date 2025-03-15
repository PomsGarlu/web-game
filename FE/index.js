const ws = new WebSocket("ws://localhost:8080");
import { C } from "./src/constants.js";
import { displayMenu, hideMenu } from "./elements/menu.js";
import { displayGame, gameOver, gamePaused, gameRunning, setGameStatus } from "./elements/game.js";
import { displayHUD, updateHUD, updateHUDTimer } from "./elements/hud.js";
import { setScoreboard, displayScoreboard, updateScoreboard } from "./elements/scoreboard.js";
import { displayPause, removePause } from "./elements/pause.js";

const bulletShot = new Audio("./audio/shell_shot.wav");
bulletShot.volume = 0.1;
const bulletExplosion = new Audio("./audio/shell_exp.wav");
bulletExplosion.volume = 1;
const tankExplosion = new Audio("./audio/tank_exp.wav");
tankExplosion.volume = 0.1;

// make the collision boxes smaller
const obstacles = [
    { x: 700, y: 230, width: 71.2, height: 100, image: "./images/rock_1.png" },
    { x: 220, y: 70, width: 96.6, height: 121.65, image: "./images/rock_2.png" },
    { x: 320, y: 480, width: 223.5, height: 235.5, image: "./images/rock_3.png" },
    { x: 1000, y: 40, width: 150, height: 150, image: "./images/rock_4.png" },
    { x: 1095, y: 250, width: 65, height: 85, image: "" },
    { x: 854, y: 477, width: 50, height: 70, image: "" },
    { x: 695, y: 633, width: 100, height: 35, image: "" },
    { x: 940, y: 712, width: 135, height: 40, image: "" },
    { x: 1048, y: 585, width: 115, height: 30, image: "" },
    { x: 370, y: 306, width: 40, height: 35, image: "" },
];
function displayObstacles() {
    const arena = document.getElementById("arena");

    obstacles.forEach((obstacle) => {
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

const ambientSound = new Audio("./audio/menu_beat_2_27.mp3");
ambientSound.loop = true;
ambientSound.volume = 0.03; // Adjust volume (0.0 to 1.0)

// Disabled background music for now
window.addEventListener("load", () => {
    // ambientSound.play().catch((error) => console.log("Audio playback error:", error));
});
// Play background music on user interaction
document.addEventListener("click", () => {
    // if (ambientSound.paused) {
    //     ambientSound.play().catch((error) => console.log("Audio playback error:", error));
    // }
});
// Menu controls

const bullets = []; // Array to store active bullets
let lastShotTime = 0;
let bulletDirection = "up";
let bulletImg = "";
const FIRE_RATE = 500; // 500ms delay between shots
let playerIdList = [];
let playerNameList = [];
let playerId = null;
let isLeader = false;
let playerName = null;
let players = [];
let playerElements = [];
let startButton = document.getElementById("startGame");
let arena = document.getElementById("arena");
let score = 0;
let health = 100;
let time = 0;
let playersAlive = null;
let isRoundOver = false;
let activePlayers = [];

document.addEventListener("DOMContentLoaded", () => {
    displayMenu();
    const nameForm = document.getElementById("nameForm");
    const nameInput = document.getElementById("nameInput");
    const waitingMessage = document.getElementById("waitingMessage");
    const playerNameContainer = document.getElementById("playerNameContainer");
    arena = document.getElementById("arena");
    startButton = document.getElementById("startGame");

    // TODO Check what we can do with the name to make it easier to read
    nameForm.onclick = (e) => {
        e.preventDefault();
        playerName = nameInput.value.trim();
        for (let i = 6; i < playerId.length; i++) {
            playerName += playerId[i];
        }
        ws.send(JSON.stringify({ type: "selectName", name: playerName }));
    };

    startButton.addEventListener("click", () => {
        //console.log("startButton clicked");
        setGameStatus("game");
        if (playerIdList.length >= 2 && playerIdList.length < 5 && playerNameList.length === playerIdList.length) {
            ws.send(JSON.stringify({ type: "startGame" }));
            console.log("start multiplayer timer");
            ws.send(JSON.stringify({ type: "timer", status: "start" }));
        } else {
            alert("Not all players are ready!");
            //console.log("playerIdList:", playerIdList, "playerNameList:", playerNameList);
        }
    });

    /* timer Controls for testing NOT USED
    const pauseTimerButton = document.getElementById("pauseT");
    const startTimerButton = document.getElementById("startT");
    const stopTimerButton = document.getElementById("stopT");
    const resumeTimerButton = document.getElementById("resumeT");

    pauseTimerButton.addEventListener("click", () => {
        console.log("pause timer");
        ws.send(JSON.stringify({ type: "timer", status:"pause"}));
    });
    startTimerButton.addEventListener("click", () => {
        console.log("start timer"); 
        ws.send(JSON.stringify({ type: "timer", status:"start"}));
    });
    stopTimerButton.addEventListener("click", () => {
        console.log("stop timer");
        ws.send(JSON.stringify({ type: "timer", status:"stop"}));
    });
    resumeTimerButton.addEventListener("click", () => {
        console.log("resume timer");
        ws.send(JSON.stringify({ type: "timer", status:"resume"}));
    });
    */
});

ws.onopen = () => {
    console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
    const playersInLobby = document.getElementById("playersInLobby");
    const data = JSON.parse(event.data);

    // Handle time input from the backend.
    if (data.type === "time") {
        time = data.remainingTime;
        if (time === 0) {
            console.log("Game Over");
            setGameStatus("over");
            displayGame();
            ws.send(JSON.stringify({ type: "timer", status: "stop" }));
            setTimeout(() => {
                window.location.reload();
            }, 10000); // 10,000 milliseconds = 10 seconds
        }
    }

    if (data.type === "assignPlayerId") {
        playerId = data.playerId;
    }

    // if (data.type === "updateHp") {
    //     playerId = data.playerId;
    //     let newHp = data.health;
    //     // Update Player health;
    // }

    // if (data.type === "updateScoreboard") {
    //     updateScoreboard(data.playerName, data.playerScore);
    // }

    if (data.type === "move") {
        movePlayer(data.playerId, data.direction, data.rotation, data.x, data.y);
    }

    if (data.type === "globalUpdateScoreboard") {
        updateScoreboard(data.playerName, data.playerScore);
    }

    if (data.type === "pauseGame") {
        for (let bullet of bullets) {
            bullet.element.remove();
        }
        bullets.length = 0;
        setGameStatus("pause");
        console.log("pause timer");
        ws.send(JSON.stringify({ type: "timer", status: "pause" }));
        Object.keys(keys).forEach((key) => {
            keys[key] = false;
        });
        displayPause(gamePaused, data.whoPaused, handlePauseAction);
    }

    if (data.type === "resumeGame") {
        setGameStatus("game");
        console.log("resume timer");
        ws.send(JSON.stringify({ type: "timer", status: "resume" })); 
        removePause(gamePaused);
    }

    if (data.type === "quitNotifier") {
        setGameStatus("game");
        removePause(gamePaused);
        if (data.quittingPlayerId === playerId) {
            alert("You will be redirected to the lobby");
            window.location.reload();
        } else {
            alert(`Player ${data.quittingPlayer} has quit the game!`);
            let quitPlayer = document.getElementById(data.quittingPlayerId);
            console.log(quitPlayer);
            quitPlayer.remove();
            delete players[playerId]; 
            playersAlive--;
            if (playersAlive === 1) {
                setGameStatus("over");
                displayGame();
                ws.send(JSON.stringify({ type: "timer", status: "stop" }));
                setTimeout(() => {
                    window.location.reload();
                }, 10000); // 10,000 milliseconds = 10 seconds
            }
        }
    }

    if (data.type === "winNotifier") {
        alert(`Player ${data.winner} has won the game with a score of ${data.winnerScore}!`);
        console.log("stop timer");
        ws.send(JSON.stringify({ type: "timer", status: "stop" }));
        window.location.reload();
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
                playerNameContainer.textContent = `Your name is ${playerName} .`;
                waitingMessage.textContent = `You are the lobby leader.`;
                updateHUD(null, 100, null, playerName);
            } else {
                waitingMessage.textContent = `You are the lobby leader. Please set your name!`;
            }
        } else {
            if (playerName) {
                playerNameContainer.textContent = `Your name is ${playerName} .`;
                waitingMessage.textContent = `Waiting for the lobby leader to start the game.`;
                updateHUD(null, 100, null, playerName);
            } else {
                waitingMessage.textContent = `Please set your name!`;
            }
        }
        playersInLobby.textContent = `Connected players: ${playerIdList.length}`;
    }

    if (data.type === "gameStart") {
        setGameStatus("game");
        if (gameRunning) {
            setScoreboard(playerNameList);
            hideMenu();
            displayGame();
            displayHUD();
            updateHUD(score, 100, time, playerName);
        }

        displayObstacles();

        let players = Object.values(data.players);

        console.log("Players on the front end:", players);

        const playerData = [
            { href: "./images/player1tank.png", x: 1314, y: 30, rotation: 0 },
            { href: "./images/player2tank.png", x: 30, y: 30, rotation: 0 },
            { href: "./images/player3tank.png", x: 30, y: 708, rotation: 180 },
            { href: "./images/player4tank.png", x: 1314, y: 708, rotation: 180 },
        ];

        playersAlive = 0;
        players.forEach((player, index) => {
            console.log("creating player", player, "index", index);
            playersAlive++;
            if (index < playerData.length) {
                const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
                img.setAttribute("href", playerData[index].href);
                img.setAttribute("width", "26");
                img.setAttribute("height", "52");
                img.setAttribute("x", player.x);
                img.setAttribute("y", player.y);
                img.setAttribute("id", player.playerId);
                img.setAttribute(
                    "transform",
                    `rotate(${playerData[index].rotation} ${playerData[index].x + 13} ${playerData[index].y + 26})`
                );
                img.classList.add("player");
                //console.log("Player", img);

                if (playerId === player.playerId) {
                    if (playerData[index].href === "./images/player1tank.png") {
                        bulletImg = "./images/bullet1.png";
                    }
                    if (playerData[index].href === "./images/player2tank.png") {
                        bulletImg = "./images/bullet2.png";
                    }
                    if (playerData[index].href === "./images/player3tank.png") {
                        bulletImg = "./images/bullet3.png";
                    }
                    if (playerData[index].href === "./images/player4tank.png") {
                        bulletImg = "./images/bullet4.png";
                    }
                }

                arena = document.getElementById("arena");
                if (arena) {
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

        gameLoop();
    }

    if (data.type === "nextRound") {
        for (let bullet of bullets) {
            bullet.element.remove();
        }
        bullets.length = 0;
        players = Object.values(data.players);
        if (data.fullReset) {
            setGameStatus("game");
            removePause(gamePaused);
            score = 0;
            ws.send(JSON.stringify({ type: "updateScoreboard", playerName, score }));
            alert(`Game was restarted by player: ${data.resetBy}`);
        }
        isRoundOver = true;
    }
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    console.log("stop timer");
    ws.send(JSON.stringify({ type: "timer", status: "stop" }));
};

ws.onclose = () => {
    console.log("WebSocket connection closed");
    console.log("stop timer");
    ws.send(JSON.stringify({ type: "timer", status: "stop" }));
};

function gameLoop() {
    if (isRoundOver) {
        startNextRound();
    } else {
        updateHUDTimer(time);
        updateLocalPlayer();
        updateBullets();
        requestAnimationFrame(gameLoop);
    }
}

function startNextRound() {
    document.querySelectorAll("#arena image.player").forEach((player) => player.remove());
    health = 100;
    updateHUD(score, health, time, playerName);

    const playerData = [
        { href: "./images/player1tank.png", x: 1314, y: 30, rotation: 0 },
        { href: "./images/player2tank.png", x: 30, y: 30, rotation: 0 },
        { href: "./images/player3tank.png", x: 30, y: 708, rotation: 180 },
        { href: "./images/player4tank.png", x: 1314, y: 708, rotation: 180 },
    ];

    playersAlive = 0;
    players.forEach((player, index) => {
        console.log("creating player", player, "index", index);
        playersAlive++;
        if (index < playerData.length) {
            console.log("creating player", playerData[index]);
            const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.setAttribute("href", playerData[index].href);
            img.setAttribute("width", "26");
            img.setAttribute("height", "52");
            img.setAttribute("x", playerData[index].x);
            img.setAttribute("y", playerData[index].y);
            img.setAttribute("id", player.playerId);
            img.classList.add("player");
            console.log("Player", playerData[index].href);

            if (playerId === player.playerId) {
                if (playerData[index].href === "./images/player1tank.png") {
                    bulletImg = "./images/bullet1.png";
                }
                if (playerData[index].href === "./images/player2tank.png") {
                    bulletImg = "./images/bullet2.png";
                }
                if (playerData[index].href === "./images/player3tank.png") {
                    bulletImg = "./images/bullet3.png";
                }
                if (playerData[index].href === "./images/player4tank.png") {
                    bulletImg = "./images/bullet4.png";
                }
            }

            arena = document.getElementById("arena");
            if (arena) {

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

    isRoundOver = false;
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
    if (gameRunning && !gamePaused) {
        keys[e.key] = true;
    }
    // Esc to pause game
    if (e.key === "Escape") {
        if (gameRunning && !gamePaused) {
            ws.send(JSON.stringify({ type: "sendPauseGame", whoPaused: playerName }));
        }
    }
    if (e.key === "Tab") {
        e.preventDefault(); // Prevents default tab behavior (switching focus)
        displayScoreboard();
    }
    if (e.key === " ") {
        if (gameRunning && !gamePaused) {
            const now = Date.now();
            if (now - lastShotTime > FIRE_RATE) {
                if (bulletDirection) {
                    // Ensure a valid direction before shooting
                    //console.log("Shooting bullet...");
                    lastShotTime = now; // Update before shooting
                    shootBullet(playerId, bulletDirection);
                } else {
                    //console.log("Cannot shoot: No bullet direction set!");
                }
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

    const obstacleX = parseFloat(obstacle.getAttribute("x"));
    const obstacleY = parseFloat(obstacle.getAttribute("y"));
    const obstacleWidth = parseFloat(obstacle.getAttribute("width"));
    const obstacleHeight = parseFloat(obstacle.getAttribute("height"));

    const obstacleLeft = obstacleX;
    const obstacleRight = obstacleX + obstacleWidth;
    const obstacleTop = obstacleY;
    const obstacleBottom = obstacleY + obstacleHeight;

    /*console.log(
        "obstacle left:",
        obstacleLeft,
        "obstacle right:",
        obstacleRight,
        "obstacle top:",
        obstacleTop,
        "obstacle bottom:",
        obstacleBottom
    );*/

    const objectLeft = x1;
    const objectRight = x1 + width1;
    const objectTop = y1;
    const objectBottom = y1 + height1;
    /*console.log(
        "obstacle left",
        obstacleLeft,
        "obstacle right:",
        obstacleRight,
        "obstacle top:",
        obstacleTop,
        "obstacle bottom:",
        obstacleBottom
    );*/

    // Check for intersection between the bullet and the obstacle
    const isColliding = !(
        objectRight < obstacleLeft ||
        objectLeft > obstacleRight ||
        objectBottom < obstacleTop ||
        objectTop > obstacleBottom
    );
    return isColliding;
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
        sendPlayerMove(-C.DIAGONAL_MOVE_SPEED, -C.DIAGONAL_MOVE_SPEED, "upleft", -45);
    } else if ((keys.ArrowUp && keys.ArrowRight) || (keys.w && keys.d)) {
        sendPlayerMove(C.DIAGONAL_MOVE_SPEED, -C.DIAGONAL_MOVE_SPEED, "upright", 45);
    } else if ((keys.ArrowDown && keys.ArrowLeft) || (keys.s && keys.a)) {
        sendPlayerMove(-C.DIAGONAL_MOVE_SPEED, C.DIAGONAL_MOVE_SPEED, "downleft", -135);
    } else if ((keys.ArrowDown && keys.ArrowRight) || (keys.s && keys.d)) {
        sendPlayerMove(C.DIAGONAL_MOVE_SPEED, C.DIAGONAL_MOVE_SPEED, "downright", 135);
    }
    // Now handle the regular movement (up, down, left, right, angle)
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
// Moves the player locally
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
    } else {
        //console.log("Collision detected! Movement blocked.");
    }
    player.setAttribute("transform", `rotate(${rotation} ${newX + C.PLAYER_SIZE_X / 2} ${newY + C.PLAYER_SIZE_Y / 2})`);
}
// Send bullet data to the BE
function shootBullet(pId, direction) {
    if (!direction) {
        //console.log("Cannot shoot: No bullet direction set!");
        return;
    }

    if (pId === playerId) {
        ws.send(JSON.stringify({ type: "shoot", playerId, direction }));
    }

    // Play the bullet shot sound
    bulletShot.currentTime = 0; // Reset sound to allow rapid firing
    bulletShot.play().catch((error) => console.log("Audio playback error:", error));

    const player = document.getElementById(pId);

    // Create bullet to the SVG arena
    const bullet = document.createElementNS("http://www.w3.org/2000/svg", "image");
    const explosion = document.createElementNS("http://www.w3.org/2000/svg", "image");

    let bulletImage = bulletImg;

    if (playerId === pId) {
        bulletImage = bulletImg;
    } else {
        let tankImage = player.getAttribute("href");
        //console.log(tankImage);
        switch (tankImage) {
            case "./images/player1tank.png":
                bulletImage = "./images/bullet1.png";
                break;
            case "./images/player2tank.png":
                bulletImage = "./images/bullet2.png";
                break;
            case "./images/player3tank.png":
                bulletImage = "./images/bullet3.png";
                break;
            case "./images/player4tank.png":
                bulletImage = "./images/bullet4.png";
                break;
        }
    }

    bullet.setAttribute("href", bulletImage);
    bullet.setAttribute("width", "10");
    bullet.setAttribute("height", "14");

    // Get player position
    let bulletX = parseFloat(player.getAttribute("x")) + 8;
    let bulletY = parseFloat(player.getAttribute("y")) - 15;
    let shooter = player.id; // TODO make sure this is saved in the backend
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
        shooter: shooter, 
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
            //console.log("Bullet hit an obstacle!");

            // Explosion position
            const explosionX = bulletX - 26;
            const explosionY = bulletY - 26;

            // Use normal explosion for non-lethal hits (Bullet impact)
            explosion.setAttribute("href", "./images/Explosion52.gif");
            explosion.setAttribute("width", "52");
            explosion.setAttribute("height", "52");
            explosion.setAttribute("x", explosionX);
            explosion.setAttribute("y", explosionY);

            // Play explosion sound
            bulletExplosion.currentTime = 0;
            bulletExplosion.play().catch((error) => console.log("Audio playback error:", error));

            // Add explosion to the arena
            document.getElementById("arena").appendChild(explosion);

            // Remove explosion after 500ms
            setTimeout(() => {
                explosion.remove();
            }, 500);

            bullet.element.remove();
            // Remove from bullets array
            bullets = bullets.filter((b) => b.element !== bullet); // Clean up bullets array
            return;
        }

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
    for (const player of Object.values(playerElements)) {
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
                ws.send;
                handlePlayerHit(player, bullet); // Pass bullet position to explosion
                return true; // Collision detected
            }
        }
    }
    return false;
}

function handlePlayerHit(player, bullet) {
    console.log("Player hit:", player.id, "bullet:", bullet.shooter);
    // Decrease health
    if (player.id === playerId) {
        health -= 20;
        updateHUD(score, health, time, playerName);
    }

    if (bullet.shooter === playerId) {
        score += 10;
        updateHUD(score, health, time, playerName);
        ws.send(JSON.stringify({ type: "updateScoreboard", playerName, score }));
    }

    player.dataset.health -= 20;

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
    const explosion = document.createElementNS("http://www.w3.org/2000/svg", "image");

    if (player.dataset.health <= 0) {
        console.log("From death. Player hit:", player.id, "bullet:", bullet.shooter);

        const tankExplosion = document.createElementNS("http://www.w3.org/2000/svg", "image");
        tankExplosion.setAttribute("href", "./images/Explosion53.gif");
        tankExplosion.setAttribute("width", "100"); // Adjust size as needed
        tankExplosion.setAttribute("height", "100");
    // Center explosion on tank
        const tankX = player.x.baseVal.value - 25; // Offset to center
        const tankY = player.y.baseVal.value - 25; // Offset to center

        tankExplosion.setAttribute("x", tankX);
        tankExplosion.setAttribute("y", tankY);
        // Add explosion to the arena
        document.getElementById("arena").appendChild(tankExplosion);
        setTimeout(() => {
            player.remove(); 
            delete players[player.id]; // Remove from the players object
            playersAlive--;
            if (playersAlive === 1) {
                if (playerId != player.id) {
                    score += 50;
                    ws.send(JSON.stringify({ type: "updateScoreboard", playerName, score }));
                    ws.send(JSON.stringify({ type: "startNextRound" }));
                }
            }
        }, 100);
        // Remove explosion after 800ms for a more dramatic effect
        setTimeout(() => {
            tankExplosion.remove();
        }, 800);
    } else {
        // Use normal explosion for non-lethal hits (Bullet impact)
        explosion.setAttribute("href", "./images/Explosion52.gif");
        explosion.setAttribute("width", "52");
        explosion.setAttribute("height", "52");
        explosion.setAttribute("x", explosionX);
        explosion.setAttribute("y", explosionY);
        bulletExplosion.play();
        // should send the player id of the shooter to the and give them 10 points.
        ws.send(
            JSON.stringify({
                type: "updateScore",
                playerId: bullet.shooter,
                score: 10,
            })
        );

        ws.send(JSON.stringify({ type: "updateHp", playerId: player.id, hp: 20 })); // reduce health by 20
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
        if (isColliding(newX, newY, 10, 14)) {
            // Bullet size is 10x14
            //console.log("Bullet hit an obstacle!");
            // **Remove the bullet**
            bullet.element.remove();
            bullets.splice(i, 1); // Remove bullet
            // **Play explosion sound**
            bulletExplosion.currentTime = 0;
            bulletExplosion.play().catch((error) => console.log("Audio playback error:", error));
            return;
        }
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

function handlePauseAction(action) {
    if (action === "resume") {
        ws.send(JSON.stringify({ type: "sendResumeGame" }));
        ws.send(JSON.stringify({ type: "timer", status: "resume" }));
    }

    if (action === "restart") {
        ws.send(
            JSON.stringify({
                type: "startNextRound",
                fullReset: true,
                resetBy: playerName,
            })
        );
        ws.send(JSON.stringify({ type: "timer", status: "stop" }));
    }

    if (action === "quit") {
        ws.send(
            JSON.stringify({
                type: "sendQuitNotifier",
                quittingPlayer: playerName,
                quittingPlayerId: playerId,
            })
        );
        ws.send(JSON.stringify({ type: "timer", status: "stop" }));
    }
}