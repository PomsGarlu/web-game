import { inMenu } from "./game.js";

const content =  
`
<div id="lobby">
  <h1>TANKS</h1>
  <form id="nameForm">
      <input type="text" id="nameInput" placeholder="Enter your name" required />
      <button type="submit">Select Name</button>
  </form>
  <h3 id="waitingMessage"></h3>
  <h3 id="playersInLobby"></h3>
  <button type="submit" id="startGame" class="startGame">Start Game</button>
  <!-- SVG Arena -->
</div>`

export function displayMenu() {
  var menu = document.getElementById("menu");
  //   console.log("We are creating the menu");
  //   console.log("In Menu: " + inMenu);
  //   console.log (inMenu);
  menu.innerHTML = !inMenu
    ? "No lobby exists"
    : content;
}
