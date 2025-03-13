export function displayPause(gamePaused, whoPaused, sendPauseAction) {
    const content = `
      <h2>Paused by player: ${whoPaused}</h2>
      <button type="submit" id="resumeGame" class="resumeGame">Continue</button>
      <button type="submit" id="restartGame" class="restartGame">Restart</button>
      <button type="submit" id="quitGame" class="quitGame">Quit</button>
      <!-- SVG Arena -->
    `;
    var pause = document.getElementById("pause");
    pause.innerHTML = gamePaused ? content : "Game is not paused";
    pause.style.display = "block";

    const resumeButton = document.getElementById("resumeGame");
    const restartButton = document.getElementById("restartGame");
    const quitButton = document.getElementById("quitGame");

    if (resumeButton) {
        resumeButton.addEventListener("click", () => sendPauseAction("resume"));
    }

    if (restartButton) {
        restartButton.addEventListener("click", () => sendPauseAction("restart"));
    }

    if (quitButton) {
        quitButton.addEventListener("click", () => sendPauseAction("quit"));
    }
}

export function removePause(gamePaused) {
    var pause = document.getElementById("pause");
    if (!gamePaused) {
        pause.style.display = "none";
    }
}
