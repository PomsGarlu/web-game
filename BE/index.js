const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let players = {};

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
        ws.send('pong');
    });
    // Test with send the x y coordinated of the player1
    ws.on('ping', (message) => {
        console.log('received: %s', message);
            // Test with sending back with updated the x y coordinated of the player2
        ws.send('pong');
    });


    ws.on('close', () => {
        console.log('disconnected');
    });
});



setInterval(() => { 
    const state = JSON.stringify(players);
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(state);
        }
    });
}, 1000); 

// Game is running in the backend
// On updates, update the changed game state to the client

