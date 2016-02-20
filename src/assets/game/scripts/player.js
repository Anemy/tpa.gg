/*

This contains everything pertaining to the players

*/

var Player = function (x, y) {
  this.x = x;
  this.y = y;

  this.xDir = 0;
  this.yDir = 0;

  this.radius = playerRadius;
  this.gunSize = playerGunSize;

  // boolean says if they want to shoot or not
  this.shoot = false;
  this.shootCounter = 0;

  this.mouseX = 0;
  this.mouseY = 0;

  this.health = 100;

  // player movement
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;

  // handles the updating of the player
  this.update = function(delta) {
    // console.log('Player speed: ' + this.xDir);

    // when this hits 0 the player can shoot again
    if(this.shootCounter > 0) {
      this.shootCounter -= delta*1000;
    }

    if(this.left) {
      this.xDir -= playerAcceleration * delta;
      if(this.xDir < -maxPlayerSpeed) {
        this.xDir = -maxPlayerSpeed;
      }
    }
    if(this.right) {
      this.xDir += playerAcceleration * delta;
      if(this.xDir > maxPlayerSpeed) {
        this.xDir = maxPlayerSpeed;
      }
    }

    if(this.up) {
      this.yDir -= playerAcceleration * delta;
      if(this.yDir < -maxPlayerSpeed) {
        this.yDir = -maxPlayerSpeed;
      }
    }
    if(this.down) {
      this.yDir += playerAcceleration * delta;
      if(this.yDir > maxPlayerSpeed) {
        this.yDir = maxPlayerSpeed;
      }
    }

    // add friction to their movement (TODO: make a quick helper function to half this code) - I could have written it in the time it took to write this TODO - FUCK
    if(this.xDir > 0) { // x
      this.xDir -= friction * delta;
      if(this.xDir < 0) {
        this.xDir = 0;
      }
    }
    else if(this.xDir < 0) {
      this.xDir += friction * delta;
      if(this.xDir > 0) {
        this.xDir = 0;
      }
    }
    if(this.yDir > 0) { // y
      this.yDir -= friction * delta;
      if(this.yDir < 0) {
        this.yDir = 0;
      }
    }
    else if(this.yDir < 0) {
      this.yDir += friction * delta;
      if(this.yDir > 0) {
        this.yDir = 0;
      }
    }

    // Check borders of map
    if(this.xDir < 0 && this.x - this.radius + this.xDir*delta < 0) {
      this.xDir = -this.xDir/2; // half velocity bounce for now
      this.x = this.radius;
    }
    if(this.xDir > 0 && this.x + this.radius + this.xDir*delta > gameWidth) {
      this.xDir = -this.xDir/2;
      this.x = gameWidth - this.radius;
    }
    if(this.yDir < 0 && this.y - this.radius + this.yDir*delta < 0) {
      this.yDir = -this.yDir/2; // half velocity bounce for now
      this.y = this.radius;
    }
    if(this.yDir > 0 && this.y + this.radius + this.yDir*delta > gameHeight) {
      this.yDir = -this.yDir/2;
      this.y = gameHeight - this.radius;
    }

    // update player position
    this.y += this.yDir * delta;
    this.x += this.xDir * delta;
  }

  // drawing the player is handled in draw.js
}