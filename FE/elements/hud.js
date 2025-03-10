// Will contain the score, health, timer and other such elements.
let content = "";

class HUDcontent {
    constructor(score = 0, health = 100, timer = 0, playerName = "No Name Yet") {
        /** @type number */
        this.score = score;
        /**@type number */
        this.health = health;
        /** @type number */
        this.timer = timer;
        /** @type string */
        this.playerName = playerName;
    }
}

/**
 * @param {HUDcontent} hudContent
 */

export function updateHUD(hudScore, hudHealth, hudTimer, hudName) {
    content = `
    <div>Score: ${hudScore ? hudScore : "0"}</div>
    <div>Health: ${hudHealth ? hudHealth : "0"}</div>
    <div>Timer: ${hudTimer ? hudTimer : "0"}</div>
    <div>Player: ${hudName ? hudName : "No name yet"}</div>
`;
    var hud = document.getElementById("hud");

    if (hud) {
        hud.innerHTML = content;
    } else {
        (hud.innerHTML = "HUD element not found"), hud;
        console.log("HUD element not found", hud);
    }
}

function getHUDUpdate() {
    // Listen to the WS for updates to the HUD.
    // Check and pass the update to the updateHUD function.

    return HUDcontent;
}

function resetHUD() {
    content = `
    <div>Score: 0</div>
    <div>Health: 100</div>
    <div>Timer: 0</div>
    <div>Player: No name yet</div>
`;
    var hud = document.getElementById("hud");
    hud.innerHTML = content;
}

//TODO fix this to the backend
export function displayHUD() {
    var hud = document.getElementById("hud");
    resetHUD();
}
