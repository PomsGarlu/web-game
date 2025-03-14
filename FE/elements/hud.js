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
    console.log("HUD update", hudScore, hudHealth, hudTimer, hudName);

    const minutes = Math.floor(hudTimer / 60);
    const seconds = hudTimer % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    content = `
    <div id='score'>Score: ${hudScore ? hudScore : "0"}</div>
    <div id='health' >Health: ${hudHealth ? hudHealth : "0"}</div>
    <div id='time'>Timer: ${formattedTime ? formattedTime : "0"}</div>
    <div id='playerName' >Player: ${hudName ? hudName : "No name yet"}</div>
`;
    var hud = document.getElementById("hud");

    if (hud) {
        hud.innerHTML = content;
    } else {
        console.log("HUD element not found", hud);
    }
}

function getHUDUpdate() {
    return HUDcontent;
}

export function updateHUDTimer(hudTimer) {
    var timer = document.getElementById("time");
    if (timer) {
        const minutes = Math.floor(hudTimer / 60);
        const seconds = hudTimer % 60;
        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        timer.innerHTML = `Timer: ${formattedTime}`;
    }
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

export function displayHUD() {
    var hud = document.getElementById("hud");
    hud.style.display = "flex";
    resetHUD();
}
