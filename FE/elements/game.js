// move the front end game elements to display here.

export let gameRunning = false; // game loop
export let gamePaused = false; // pause Menu
export let gameOver = false; // score screen
export let inMenu = true; // lobby editor

export function displayGame() {
    var game = document.getElementById("game");
    game.style.display = "flex";

    game.innerHTML = !gameRunning
        ? "empty game"
        : `
<svg id="arena" class="arena" width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
Background
<rect width="1344" height="768" fill="#444" />
<rect width="1344" height="768" x="32" y="32" fill="#333" />
<image id="background" href="../1344x768.png" width="1344" height="768" x="0" y="0" />
Players
Bullet Container (For dynamically created bullets)
<g id="bullet-container"></g>
</svg>
    `;
}

export function setGameStatus(status) {
    console.log("Setting game status to: " + status);

    if (status === "game") {
        inMenu = false;
        gameRunning = true;
        gamePaused = false;
        gameOver = false;
    }

    if (status === "pause") {
        inMenu = false;
        gameRunning = false;
        gamePaused = true;
        gameOver = false;
    }

    if (status === "over") {
        inMenu = false;
        gameRunning = false;
        gamePaused = false;
        gameOver = true;
    }
}
