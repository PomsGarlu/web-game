const timer = require("./src/utils/timer.js");

const WebSocket = require("ws");
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let players = {};
let gameRunning = false;
let playerCounter = 0;
let time = 0;
let gameOver = false;


// Sets a tick to send data to the front end.
setInterval(() => {
  if (!timer.checkDuration()) { // if the time is up
    gameOver = true;
    broadcast({ type: "gameOver", gameOver }); // send the game over message to the front end
  }
  if (gameRunning) {
    time = timer.getTimeNow(); // get the current time
    broadcast({ type: "time", time }); // send the time to the front end
  }
  if (!gameRunning) {
    // does not get a new time if paused
    broadcast({ type: "time", time }); // send the time to the front end
  } else {
    timeDefault = 0;
    broadcast({ type: "time", timeZero }); // if for some reason the game is not running nor paused, send 0
  }
}, 1000);



server.on("connection", (ws) => {
  if (Object.keys(players).length >= 4) {
    ws.close();
    return;
  }

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
    direction: "up",
    ws,
  };

  ws.send(JSON.stringify({ type: "assignPlayerId", playerId }));
  broadcastLobby();


  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "selectName") {
      console.log("data");
      players[playerId].name = data.name;
      broadcastLobby();
    }

    if (data.type === "startNextRound") {
      // restart Timer
      timer.resetTimer();
      broadcast({
        type: "nextRound",
        players: getPlayersWithoutWs(),
        fullReset: data.fullReset,
        resetBy: data.resetBy,
      });
    }

    if (data.type === "sendPauseGame") {
      broadcast({ type: "pauseGame", whoPaused: data.whoPaused });
      timer.pauseTimer();
    }

    if (data.type === "sendResumeGame") {
      broadcast({ type: "resumeGame" });
      timer.resumeTimer();
    }

    if (data.type === "sendQuitNotifier") {
      broadcast({
        type: "quitNotifier",
        quittingPlayer: data.quittingPlayer,
        quittingPlayerId: data.quittingPlayerId,
      });
    }

    if (data.type === "sendWinNotifier") {
      broadcast({
        type: "winNotifier",
        winner: data.winner,
        winnerScore: data.winnerScore,
      });
      timer.stopTimer();
    }

    if (data.type === "updateScoreboard") {
      broadcast({
        type: "globalUpdateScoreboard",
        playerName: data.playerName,
        playerScore: data.score,
      });
    }

    if (data.type === "move") {
      if (!players[data.playerId]) return; // Ensure player exists

      players[data.playerId].x += data.x;
      players[data.playerId].y += data.y;
      players[data.playerId].direction = data.direction;

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
      timer.startTimer();
      broadcast({ type: "gameStart", players: getPlayersWithoutWs() });
    }
  });

  // ws.on("login", (data) => {});

  ws.on("close", () => {
    console.log("Player Disconnected");
    delete players[playerId];
    broadcastLobby();
  });

  //TODO: broadcastStatus
  //TODO: broadcastTimer or Add to already existing broadcast stuff.
});

function broadcast(data) {
  console.log("data sent to the front", data);
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastLobby() {
  broadcast({ type: "gameState", players: getPlayersWithoutWs() });
}

// function broadcastGame() {
//     broadcast({ type: "gameState", players: getPlayersWithoutWs() });
// }

function getPlayersWithoutWs() {
  const playersWithoutWs = {};
  for (const playerId in players) {
    const { ws, ...playerData } = players[playerId];
    playersWithoutWs[playerId] = playerData;
  }

  return playersWithoutWs;
}
