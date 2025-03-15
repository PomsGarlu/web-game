const content = `
<div id="lobby">
  <h1>TANKS</h1>
  <form id="nameForm">
      <input type="text" id="nameInput" placeholder="Enter your name" required />
      <button type="submit">Select Name</button>
  </form>
  <h3 id="playerNameContainer"></h3>
  <h3 id="waitingMessage"></h3>
  <h3 id="playersInLobby"></h3>
  <button type="submit" id="startGame" class="startGame">Start Game</button>
</div>`;

export function displayMenu() {
    var menu = document.getElementById("menu");
    menu.innerHTML = content;
}

export function hideMenu() {
    var menu = document.getElementById("menu");
    menu.innerHTML = "";
}
