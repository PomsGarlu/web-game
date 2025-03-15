// NOT USED IN THIS VERSION

export let isModeSelected = false; //
export let isMultiplayer = true; //
let content = "";
var gameModeMenu = document.getElementById("gameModeMenu");

if (!gameModeMenu) {
    console.log("gameModeMenu is undefined");
}

export function displayGameModeMenu() {
    if (!isModeSelected){
        content = `
        <div id="gameModeMenu">
            <h1>Choose Game Mode</h1>
            <button id="singlePlayer">Single Player</button>
            <button id="multiPlayer">Multi Player</button>
        </div>`   
    gameModeMenu.innerHTML = content;} 
    else {
        console.log("Game mode already selected")
        content = ""
        gameModeMenu.innerHTML = content;
    }
}