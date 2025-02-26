const ws = new WebSocket('ws://localhost:8080');
import {C} from './src/constants.js';

let x = (C.ARENA_SIZE - C.PLAYER_SIZE) / 2;
let y = (C.ARENA_SIZE - C.PLAYER_SIZE) / 2;
let fps = {};

ws.onopen = () => {
  console.log('WebSocket connection established');
};

ws.onmessage = (event) => {
  console.log("Message from server:", event.data);
  if (event.data === 'pong') {
    moveBuggy( 10,10)
  }

}

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};

function gameLoop () {
  console.log('gameLoop');
  updateLocalPlayer();
}

function updateLocalPlayer() {
  console.log('updateLocalPlayer');
}

gameLoop();


// Decouple the  X and Y coordinates of the player from the global scope. 

// Move the player
function movePlayer(dx, dy) {
  x = Math.max(0, Math.min(C.ARENA_SIZE - C.PLAYER_SIZE, x + dx)); // Clamp x within arena
  y = Math.max(0, Math.min(C.ARENA_SIZE - C.PLAYER_SIZE, y + dy)); // Clamp y within arena
  player.setAttribute('x', x); // the player. is an SVG element
  player.setAttribute('y', y); // the player. is an SVG element
  return {x, y};
}

function moveBuggy(dx, dy) {
  x = Math.max(0, Math.min(C.ARENA_SIZE - C.PLAYER_SIZE, x + dx)); // Clamp x within arena
  y = Math.max(0, Math.min(C.ARENA_SIZE - C.PLAYER_SIZE, y + dy)); //
  player2.setAttribute('x', x); // the player. is an SVG element
  player2.setAttribute('y', y); // the player. is an SVG element
  console.log('moveBuggy');
} 

function regularShot(dx, dy) {
    
  ws.send('ping');
}

function sendTestPing() { 
  ws.send('ping');
}

document.addEventListener('keydown', (e) => {
  console.log('keydown');
  if (e.key=== 'w') {
    console.log('w');
    ws.send('up');
  }
  switch (e.key) {
    case 'ArrowUp':
      movePlayer(0, -C.MOVE_SPEED);
      console.log('up');
      break;
    case 'ArrowDown':
      movePlayer(0, C.MOVE_SPEED);
      console.log('down');
      break;
    case 'ArrowLeft':
      movePlayer(-C.MOVE_SPEED, 0);
      console.log('left');
      break;
    case 'ArrowRight':
      movePlayer(C.MOVE_SPEED, 0);
      console.log('right');
      break;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('test');
  button.addEventListener('click',sendTestPing);
});

