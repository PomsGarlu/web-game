// Move all player related actions here.

// const player = document.getElementById('player');

// const PLAYER_SIZE = 64; // Player dimensions
// const ARENA_SIZE = 1024; // Arena dimensions
// const MOVE_SPEED = 10; // Movement speed in pixels

// // Initial position
// let x = (ARENA_SIZE - PLAYER_SIZE) / 2;
// let y = (ARENA_SIZE - PLAYER_SIZE) / 2;

// // Move the player
// function movePlayer(dx, dy) {
//   x = Math.max(0, Math.min(ARENA_SIZE - PLAYER_SIZE, x + dx)); // Clamp x within arena
//   y = Math.max(0, Math.min(ARENA_SIZE - PLAYER_SIZE, y + dy)); // Clamp y within arena

//   // Update the player's position in the SVG
//   player.setAttribute('x', x);
//   player.setAttribute('y', y);
// }


// document.addEventListener('keydown', (e) => {
//   switch (e.key) {
//     case 'ArrowUp':
//       movePlayer(0, -MOVE_SPEED);
//       console.log('up');
//       break;
//     case 'ArrowDown':
//       movePlayer(0, MOVE_SPEED);
//       console.log('down');
//       break;
//     case 'ArrowLeft':
//       movePlayer(-MOVE_SPEED, 0);
//       console.log('left');
//       break;
//     case 'ArrowRight':
//       movePlayer(MOVE_SPEED, 0);
//       console.log('right');
//       break;
//   }
// });