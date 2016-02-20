/*

This is the bullet. It gets shot.

*/

var Bullet = function(xPos, yPos, xDir, yDir, angle, ownerID) {
  this.x = xPos;
  this.y = yPos;

  this.xDir = xDir;
  this.yDir = yDir;

  this.owner = ownerID;

  this.angle = angle;

  this.radius = 2;

  // return false if it should DIE!
  this.update = function(delta) {

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

    // update player position
    this.y += this.yDir * delta;
    this.x += this.xDir * delta;

    return true;
  }
}