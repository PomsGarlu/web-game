const WebSocket = require("ws");
const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let players = {};
let gameRunning = false;
let playerCounter = 0;

// on connection login
// join game
// create game
// update game

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

        // should add player to the game
        if (data.type === "selectName") {
            console.log("data");
            players[playerId].name = data.name;
            broadcastLobby();
        }

        if (data.type === "startNextRound") {
            broadcast({ type: "nextRound", players: getPlayersWithoutWs() });
        }

        if (data.type === "sendPauseGame") {
            broadcast({ type: "pauseGame", whoPaused: data.whoPaused });
        }

        if (data.type === "sendResumeGame") {
            broadcast({ type: "resumeGame" });
        }

        if (data.type === "updateScoreboard") {
            broadcast({ type: "globalUpdateScoreboard", playerName: data.playerName, playerScore: data.score });
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
            broadcast({ type: "shoot", playerId: data.playerId, direction: data.direction });
        }

        if (data.type === "startGame") {
            gameRunning = true;
            broadcast({ type: "gameStart", players: getPlayersWithoutWs() });
        }
    });

    ws.on("login", (data) => {});

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
