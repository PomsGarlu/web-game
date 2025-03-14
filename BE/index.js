const timer = require("./src/utils/timer.js");
const Player = require("./src/models/player.js");
const WebSocket = require("ws");
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let players = {};
let gameRunning = false; // not used at the moment
let playerCounter = 0;
let time = 0;
let singlePlayer = false;

/**
 * @type {Player[]}
 */
let activePlayers = [];

let runningTimer = false;
let pausedTimer = false;

// Sets a tick sending the time to the front end every 500ms
setInterval(() => {
  time = timer.getElapseTime(pausedTimer);
  if (time > -1) {
    broadcast({ type: "time", time, activePlayers }); // ; // send the time to the front end if -1 meaning the timer is not running, this sends also the active player data we are interested in the health and score
  }
}, 500);

server.on("connection", (ws) => {
  if (!singlePlayer) {
    if (Object.keys(players).length >= 4) {
      ws.close();
      return;
    }
  } else {
    if (Object.keys(players).length > 1) {
      // if single player mode then only allow 1 player should be redundant however, it might be needed.
      ws.close();
      return;
    }
  } // creates a player for each connection

  playerCounter++;
  const playerId = `player${playerCounter}`;

  let spawnPoints = [
    { x: 1314, y: 30 },
    { x: 30, y: 30 },
    { x: 30, y: 708 },
    { x: 1314, y: 708 },
  ];

  players[playerId] = {
    playerId: playerId,
    name: null,
    x: spawnPoints[(playerCounter - 1) % spawnPoints.length].x,
    y: spawnPoints[(playerCounter - 1) % spawnPoints.length].y,
    hp: 100,
    direction:
      spawnPoints[(playerCounter - 1) % spawnPoints.length].y < 100
        ? "down"
        : "up", // need to change the direction for the player on the bottom or top.
    ws,
  };

  /**
   * activePlayers holds a list of players that are currently connected to the game.
   *
   * @type {Player}
   *
   *@param {string} playerId - The player's ID.
   *@param {string} name - The player's name.
   *@param {number} x - The player's x-coordinate.
   *@param {number} y - The player's y-coordinate.
   *@param {number} hp - The player's health points.
   *@param {string} direction - The player's direction.
   *@param {number} score - The player's score.
   */

  activePlayers.push(
    new Player(
      `player${playerCounter}`,
      "",
      spawnPoints[(playerCounter - 1) % spawnPoints.length].x,
      spawnPoints[(playerCounter - 1) % spawnPoints.length].y,
      100,
      spawnPoints[(playerCounter - 1) % spawnPoints.length].y < 100
        ? "down"
        : "up",
      0
    )
  );
  console.log("Active Player added", activePlayers[playerCounter - 1]); // shows the added player

  ws.send(JSON.stringify({ type: "assignPlayerId", playerId }));
  broadcastLobby();

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "timer") {
      timerOperations(data.status);
    }

    if (data.type === "selectName") {
      console.log("data");
      players[playerId].name = data.name;
      broadcastLobby();
    }

    if (data.type === "updateHp") {
      activePlayers.forEach((player) => {
        if (player.playerId === data.playerId) {
          player.hp = data.hp;
          broadcast({ type: "updateHp", playerId: data.playerId, hp: data.hp });
        }
      });
    }

    if (data.type === "startNextRound") {
      console.log("Next Round");
      let playersWithoutWs = getPlayersWithoutWs();
      console.log("Players Without WS", playersWithoutWs);
      broadcast({
        type: "nextRound",
        players: playersWithoutWs,
        fullReset: data.fullReset,
        resetBy: data.resetBy,
      });
    }

    if (data.type === "sendPauseGame") {
      broadcast({ type: "pauseGame", whoPaused: data.whoPaused });
      console.log("Game Paused");
    }

    if (data.type === "sendResumeGame") {
      broadcast({ type: "resumeGame" });
      console.log("Game Resumed");
    }

    if (data.type === "sendQuitNotifier") {
      broadcast({
        type: "quitNotifier",
        quittingPlayer: data.quittingPlayer,
        quittingPlayerId: data.quittingPlayerId,
      });
      console.log("Player Quit");
    }

    if (data.type === "sendWinNotifier") {
      broadcast({
        type: "winNotifier",
        winner: data.winner,
        winnerScore: data.winnerScore,
      });
      console.log("Game Over");
    }

    if (data.type === "updateScoreboard") {
      broadcast({
        type: "globalUpdateScoreboard",
        playerName: data.playerName,
        playerScore: data.score,
      });
      //  Add updated player score to the player object
      console.log("Scoreboard Updated", data.playerName, "Score", data.score);
    }

    if (data.type === "move") {
      if (!players[data.playerId]) return; // Ensure player exists
      players[data.playerId].x += data.x;
      players[data.playerId].y += data.y;
      players[data.playerId].direction = data.direction;
      //  Add updated player position to the player object
      broadcast({
        type: "move",
        playerId: data.playerId,
        direction: data.direction,
        rotation: data.rotation,
        x: data.x,
        y: data.y,
        players: getPlayersWithoutWs(),
      });
    }

    if (data.type === "shoot") {
      broadcast({
        type: "shoot",
        playerId: data.playerId,
        direction: data.direction,
      });
    }

    if (data.type === "startGame") {
      gameRunning = true;
      console.log("Game Started");
      let playersWithoutWs = getPlayersWithoutWs();
      console.log("Players Without WS", playersWithoutWs);
      console.log("Game Started");
      broadcast({ type: "gameStart", players: getPlayersWithoutWs() });
    }
  });

  // ws.on("login", (data) => {});

  ws.on("close", () => {
    console.log("Player Disconnected");
    delete players[playerId];
    broadcastLobby();
  });
});

// FUNCTIONS

function broadcast(data) {
  if (!data.type === "time") {
    console.log("data sent to the front", data);
  }
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastPlayers() {
  broadcast({ type: "gameState", players });
}

function broadcastLobby() {
  broadcast({ type: "gameState", players: getPlayersWithoutWs() });
}

function getPlayersWithoutWs() {
  const playersWithoutWs = {};
  for (const playerId in players) {
    const { ws, ...playerData } = players[playerId];
    playersWithoutWs[playerId] = playerData;
  }
  return playersWithoutWs;
}

function timerOperations(timerSwitch) {
  // console.log("Timer Switch", timerSwitch);
  if (timerSwitch === "start" && !runningTimer && !pausedTimer) {
    runningTimer = true;
    pausedTimer = false;
    timer.startTimer();
  }
  if (timerSwitch === "pause" && runningTimer && !pausedTimer) {
    runningTimer = true;
    pausedTimer = true;
    timer.pauseTimer();
  }
  if (timerSwitch === "resume" && runningTimer && pausedTimer) {
    runningTimer = true;
    pausedTimer = false;
    timer.resumeTimer();
  }
  if (timerSwitch === "reset") {
    // regardless of the state of the timer it will reset
    runningTimer = true;
    pausedTimer = false;
    timer.resetTimer();
  }
  if (timerSwitch === "stop" && runningTimer) {
    runningTimer = false;
    pausedTimer = false;
    timer.stopTimer();
  }
}
