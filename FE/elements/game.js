// move the front end game elements to display here.

export let gameRunning = false; // game loop
export let gamePaused = false; // pause Menu
export let gameOver = false; // score screen

export function displayGame() {
    if(gameOver){
        displayGameScore();
        return 
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
<image id="background" href="../public/images/1344x768.png" width="1344" height="768" x="0" y="0" />
Players
Bullet Container (For dynamically created bullets)
<g id="bullet-container"></g>
</svg>
    `;
}
/**
 *  what do we put in here?
 * @param {} finalScores 
 * 
 * player.rank
 * player.name
 * player.score
 * 
 */
export function displayGameScore() {
    //TODO: create a  getScores() function that returns the scores
    let finalScores = [
        { name: "Player 1", score: 1000 },
        { name: "Player 2", score: 500 },
        { name: "Player 3", score: 250 },
        { name: "Player 4", score:0},
    ];

    let content="";
    var game = document.getElementById("game");
    finalScores.forEach((score) => {
        content += `
        <div class="score">
            <div class="score-name
            ">${score.name}</div>
            <div class="score-value">${score.score}</div>
        </div>
        `
    });
    // add a time out for quit
    game.style.display = "flex";
    game.innerHTML = content
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
