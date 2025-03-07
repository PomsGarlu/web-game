

function updatePlayers() {
  for (let i = 0; i < players.length; i++) {
    players[i].update();
  }
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
  }
}

function updateMap() {
  for (let i = 0; i < healthPacks.length; i++) {
    healthPacks[i].update();
  }
}

function updateGame() {
  updatePlayers();
  updateBullets();
  updateMap();
  updateGameStatus();
// create tick
}