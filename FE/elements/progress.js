
class RunStatistics{
    constructor(){
        this.players = [];
        
    }
}

/**
 * @param {number} playerId
 */ 

export function startRun(players) {
    const runStatistics = new RunStatistics(playerId,0,100);
    players.forEach(player => {


    });
    return runStatistics;
}


export function updateRunScore(playerId,score) {
    const runScoreElement = document.getElementById("runScore");
    runScoreElement.innerHTML = `Run Score: ${runScore}`;
}

export function updateRunHealth(playerId,health) {
    const runHealthElement = document.getElementById("runHealth");
    runHealthElement.innerHTML = `Health: ${runHealth}`;  
}

export function getRunStatistics() {
    return {
        playerId: 0,
        runScore: 0,
        runHealth: 100
    };
}   