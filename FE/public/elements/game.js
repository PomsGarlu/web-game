export let gameRunning = false;
export let gamePaused = false;
export let gameOver = false;

export function displayGame() {
    if (gameOver) {
        console.log("GAME HAS ENDED!");
        displayGameScore();
        return;
    }
    var game = document.getElementById("game");
    game.style.display = "flex";

    game.innerHTML = !gameRunning
        ? "empty game"
        : `
<svg id="arena" class="arena" width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
Background
<rect width="1344" height="768" fill="#444" />
<rect width="1344" height="768" x="32" y="32" fill="#333" />
<image id="background" href="./images/1344x768.png" width="1344" height="768" x="0" y="0" />
Players
Bullet Container (For dynamically created bullets)
<g id="bullet-container"></g>
</svg>
    `;
}

export function displayGameScore() {
    let scoreboard = document.getElementById("scoreboard");
    let game = document.getElementById("game");
    let hud = document.getElementById("hud");
    let content = `<h1>The game has ended! These are the final results:</h1>
    <h3>The player with the highest score is the winner</h3>`;
    content += scoreboard.innerHTML;
    content += `<h3>Returning to the lobby after 10 seconds.</h3>`;
    game.style.display = "flex";
    game.innerHTML = content;
    hud.style.display = "none";
}

export function setGameStatus(status) {
    console.log("Setting game status to: " + status);

    if (status === "game") {
        gameRunning = true;
        gamePaused = false;
        gameOver = false;
    }

    if (status === "pause") {
        gameRunning = false;
        gamePaused = true;
        gameOver = false;
    }

    if (status === "over") {
        gameRunning = false;
        gamePaused = false;
        gameOver = true;
    }
}
