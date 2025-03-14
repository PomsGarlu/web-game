let runDiv = document.getElementById("run");
let count = 0;

if (!runDiv) {
    console.error("runDiv element not found");
}
// Initiates the  players for the run
export function initiateRunContainer(activePlayers) {

    let content = "";
    activePlayers.forEach(player => {
        content += `<div class="runStat" id="${player.playerId}+${player.name}"> Player: ${player.name}  Health :${player.health}  Score: ${player.score} </div>`;
    });
    if (runDiv) {
        runDiv.innerHTML = content;
    } ;
}

export function testRunContainer() {
    count++;
    let content = `<div class="runStat">"Testing count" ${count}</div>`;
    if (runDiv) {
        runDiv.innerHTML = content;
    } 
};

export function updateRunContainer(players) {
    players.forEach(player => {
        let playerDiv = document.getElementById(player.playerId);
        if (playerDiv) {
            playerDiv.innerHTML = `Player: ${player.name}  Health :${player.health}  Score: ${player.score}`;
        }
    });
}

export function resetRunContainer() {
    runDiv.innerHTML = "";
}