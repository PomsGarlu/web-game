import { gamePaused } from "./game.js";

const content = `
<div id="pause">
  <h1>Game Paused</h1>
  <button type="submit" id="resumeGame" class="resumeGame">Resume Game</button>
  <button type="submit" id="quitGame" class="quitGame">Quit Game</button>
  <button type="submit" id="quitGame" class="quitGame">Quit Game</button>
  <!-- SVG Arena -->
</div>
`;

export function displayPause() {
  var pause = document.getElementById("pause");
  pause.innerHTML = gamePaused ? "not paused" : content;
}
