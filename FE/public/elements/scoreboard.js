let content = "";

export function updateScoreboard(playerName, playerScore) {
    var playerDiv = document.getElementById(playerName);
    playerDiv.innerHTML = "";
    playerDiv.innerHTML = `Player: ${playerName} Score: ${playerScore}`;
}

export function setScoreboard(playerNames) {
    var scoreboard = document.getElementById("scoreboard");
    playerNames.forEach((playerName) => {
        content += `
        <div id="${playerName}">Player: ${playerName} Score: 0</div>
        `;
    });
    scoreboard.innerHTML = content;
}

export function displayScoreboard() {
    var scoreboard = document.getElementById("scoreboard");
    scoreboard.style.display = "block";
    // Hide scoreboard after 5 sec
    setTimeout(() => {
        scoreboard.style.display = "none";
    }, 5000);
}
