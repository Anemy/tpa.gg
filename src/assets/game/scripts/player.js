/*

This contains everything pertaining to the players

*/

var Player = function (x, y) {
  this.x = x;
  this.y = y;

  this.xDir = 0;
  this.yDir = 0;

  this.radius = playerRadius;

  // boolean says if they want to shoot or not
  this.shoot = false;

  // player movement
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;

  // handles the updating of the player
  this.update = function(delta) {

  }
}