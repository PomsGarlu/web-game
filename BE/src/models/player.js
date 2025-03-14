// player data that needs to be set. 

class Player  {
 /**
   * Create a player.
   * @param {string} playerId - The player's ID.
   * @param {string} name - The player's name.
   * @param {number} x - The player's x-coordinate.
   * @param {number} y - The player's y-coordinate.
   * @param {number} hp - The player's health points.
   * @param {string} direction - The player's direction.
   * @param {number} score - The player's score.
   * @param {number} health - The player's health.
   */
    constructor(playerId=null,
        name="",
        x=0, 
        y=0,
        hp=100,
        direction ="",
        score=0,
        health=100)
    {
        this.playerId = playerId;
        this.name = name;
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.direction = direction;
        this.score = score;
        this.health = health;
    }
}

module.exports = Player;
