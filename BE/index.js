const { connection } = require("websocket");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let players = {};
let gameRunning = false;
let playerCounter = 0;




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
    if (Object.keys(players).length === 1) {
        ws.send(JSON.stringify({ type: "youAreLeader" }));
    }

    broadcastLobby();

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "selectName") {
            players[playerId].name = data.name;
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
                players,
            });
        }

        if (data.type === "shoot") {
            broadcast({ type: "shoot", playerId });
        }

        if (data.type === "startGame") {
            gameRunning = true;
            broadcast({ type: "gameStart", players });
        }
    });

    ws.on("close", () => {
        console.log("Player Disconnected");
        delete players[playerId];
        broadcastLobby();
    });
});

function broadcast(data) {
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastLobby() {
    broadcast({ type: "gameState", players });
}
