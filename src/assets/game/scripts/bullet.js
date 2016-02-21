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

  this.radius = 3;

  this.damage = bulletDamage; // 10 to start (10 shot kill in constants/index.js)
}

// return false if it should DIE!
updateBullet = function(bullet, delta) {
  // Check borders of map
  if(bullet.xDir < 0 && bullet.x - bullet.radius + bullet.xDir * delta < 0) {
    return false;
  }
  if(bullet.xDir > 0 && bullet.x + bullet.radius + bullet.xDir * delta > gameWidth) {
    return false;
  }
  if(bullet.yDir < 0 && bullet.y - bullet.radius + bullet.yDir * delta < 0) {
    return false;
  }
  if(bullet.yDir > 0 && bullet.y + bullet.radius + bullet.yDir * delta > gameHeight) {
    return false;
  }

  // update player position
  bullet.y += bullet.yDir * delta;
  bullet.x += bullet.xDir * delta;

  return true;
}