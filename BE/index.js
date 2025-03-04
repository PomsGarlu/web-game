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
        { x: 1294, y: 50 },
        { x: 50, y: 50 },
        { x: 50, y: 718 },
        { x: 1294, y: 718 },
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

            players[data.playerId].direction = data.direction;

            broadcast({
                type: "move",
                playerId: data.playerId,
                direction: data.direction,
                rotation: data.rotation,
                x: players[data.playerId].x,
                y: players[data.playerId].y,
                addX: data.addX,
                addY: data.addY,
                players,
            });
        }

        if (data.type === "getLocation") {
            let direction = data.direction;
            let rotation = data.rotation;
            let x = players[data.playerId].x;
            let y = players[data.playerId].y;
            let addX = data.addX;
            let addY = data.addY;

            ws.send(JSON.stringify({ type: "moveSelf", direction, rotation, x, y, addX, addY }));
        }

        if (data.type === "saveMove") {
            players[playerId].x = data.x;
            players[playerId].y = data.y;
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
