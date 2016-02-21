/*

This is the bullet. It gets shot.

*/

var Particle = function(xPos, yPos, xDir, yDir, color) {
  this.x = xPos;
  this.y = yPos;

  this.xDir = xDir;
  this.yDir = yDir;

  this.color = color;

  this.life = 100;

  this.radius = 1 + Math.floor(Math.random()*4); // its actually width and height

  // return false if it should DIE!
  this.update = function(delta) {

    this.life -= delta*40;

    // Check borders of map
    if(this.xDir < 0 && this.x - this.radius + this.xDir*delta < 0) {
      return false;
    }
    if(this.xDir > 0 && this.x + this.radius + this.xDir*delta > gameWidth) {
      return false;
    }
    if(this.yDir < 0 && this.y - this.radius + this.yDir*delta < 0) {
      return false;
    }
    if(this.yDir > 0 && this.y + this.radius + this.yDir*delta > gameHeight) {
      return false;
    }
    if(this.life < 0) {
      return false;
    }

    // update player position
    this.y += this.yDir * delta;
    this.x += this.xDir * delta;

    return true;
  }
}