const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let players = {};

server.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log("received: %s", message);
    });

    ws.on("close", () => {
        console.log("disconnected");
    });
});

setInterval(() => {
    const state = JSON.stringify(players);
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(state);
        }
    });
}, 1000);

// Game is running in the backend
// On updates, update the changed game state to the client
