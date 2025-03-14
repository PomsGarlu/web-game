const timer = require("./src/utils/timer.js");
const WebSocket = require("ws");
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let players = {};
let gameRunning = false;
let playerCounter = 0;
let time = 0;
let gameOver = false;
let tick = 0;

let runningTimer=false
let stoppedTimer=false
let pausedTimer=false
let resumedTimer=false


//  console.log("Server started on port",timer.getTimeNow());

// Sets a tick to send data to the front end.
setInterval(() => {
  // console.log("Ellapse time",timer.getElapseTime());
  tick++;
  // console.log("Time is running ",timer.getElapseTime());
  if (!timer.checkDuration()) {
    // if the time is up
    gameOver = true;
    broadcast({ type: "gameOver", gameOver }); // send the game over message to the front end
  }
  if (gameRunning) {
    // time = timer.getElapseTime(); // get the current time
    broadcast({ type: "time", time }); // send the time to the front end
  }
  if (!gameRunning) {
    // does not get a new time if paused
    broadcast({ type: "tick", tick }); // send the time to the front end
  } else {
    timeZero = 0;
    broadcast({ type: "time", timeZero }); // if for some reason the game is not running nor paused, send 0
  }

  if (gameOver) {
  }
  console.log("Timer count ", timer.getElapseTime(pausedTimer));
  // console.log("Timer is running", runningTimer);
  // console.log("Timer is Paused", pausedTimer);

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
    direction: "up", // need to change the direction for the player on the bottom or top.
    ws,
  };





  function timerOperations(timerSwitch) {
    console.log("Timer Switch", timerSwitch);
    if (timerSwitch === "start" && !runningTimer && !pausedTimer) {
      runningTimer=true;
      pausedTimer=false;
      timer.startTimer();
    }
    if (timerSwitch === "pause" && runningTimer && !pausedTimer) {
      runningTimer=true;
      pausedTimer=true;
      timer.pauseTimer();
    }
    if (timerSwitch === "resume" && runningTimer && pausedTimer) {
      runningTimer=true;
      pausedTimer=false;
      timer.resumeTimer();
    }
    if (timerSwitch === "reset" ) { // regardless of the state of the timer it will reset
      runningTimer=true;
      pausedTimer=false;
      timer.resetTimer();
    }
    if (timerSwitch === "stop" && runningTimer) {
      runningTimer=false;
      pausedTimer=false;
      timer.stopTimer();
    }
  }

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

    if (data.type === "startNextRound") {
      console.log("Next Round");
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
      // timer.pauseTimer();
      console.log("Game Paused");
    }

    if (data.type === "sendResumeGame") {
      broadcast({ type: "resumeGame" });
      // timer.resumeTimer();
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
      // timer.stopTimer();
      gameOver = true;
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
      // timer.startTimer();
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
});

function broadcast(data) {
  // console.log("data sent to the front", data);
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
