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

  this.level = 1;

  // boolean says if they want to shoot or not
  this.shoot = false;
  this.shootCounter = 0;

  this.mouseX = 0;
  this.mouseY = 0;

  this.rotation = 0; // used in asteroid version

  this.health = playerHealth;

  // player movement
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
}
// handles the updating of the player
updatePlayer = function(player, delta) {
  // console.log('Player speed: ' + this.xDir);

  // when this hits 0 the player can shoot again
  if(player.shootCounter > 0) {
    player.shootCounter -= delta*1000;
  }

  if(!astroidMode) {
    // update player movement
    if(player.left) {
      player.xDir -= playerAcceleration * delta;
      if(player.xDir < -maxPlayerSpeed) {
        player.xDir = -maxPlayerSpeed;
      }
    }
    if(player.right) {
      player.xDir += playerAcceleration * delta;
      if(player.xDir > maxPlayerSpeed) {
        player.xDir = maxPlayerSpeed;
      }
    }

    if(player.up) {
      player.yDir -= playerAcceleration * delta;
      if(player.yDir < -maxPlayerSpeed) {
        player.yDir = -maxPlayerSpeed;
      }
    }
    if(player.down) {
      player.yDir += playerAcceleration * delta;
      if(player.yDir > maxPlayerSpeed) {
        player.yDir = maxPlayerSpeed;
      }
    }
  }
  else {
    // update player movement astroid mode // rotation is in degrees for some reason
    if(player.left) {
      this.rotation += astroidModeRotationSpeed * delta;
    }
    if(player.right) {
      this.rotation -= astroidModeRotationSpeed * delta;
    }

    if(Math.abs(this.rotation) > 360) {
      this.rotation %= 360;
    }

    // boosting movement
    if(player.up) {
      player.xDir += playerAcceleration*Math.cos(this.rotation * (Math.PI/180));
      player.yDir += playerAcceleration*Math.sin(this.rotation * (Math.PI/180));

      // speed limit
      if(player.xDir < -maxPlayerSpeed) {
        player.xDir = -maxPlayerSpeed;
      }
      if(player.xDir > maxPlayerSpeed) {
        player.xDir = maxPlayerSpeed;
      }
      if(player.yDir < -maxPlayerSpeed) {
        player.yDir = -maxPlayerSpeed;
      }
      if(player.yDir > maxPlayerSpeed) {
        player.yDir = maxPlayerSpeed;
      }
    }
  }

  // add friction to their movement (TODO: make a quick helper function to half player code) - I could have written it in the time it took to write player TODO - FUCK
  if(player.xDir > 0) { // x
    player.xDir -= friction * delta;
    if(player.xDir < 0) {
      player.xDir = 0;
    }
  }
  else if(player.xDir < 0) {
    player.xDir += friction * delta;
    if(player.xDir > 0) {
      player.xDir = 0;
    }
  }
  if(player.yDir > 0) { // y
    player.yDir -= friction * delta;
    if(player.yDir < 0) {
      player.yDir = 0;
    }
  }
  else if(player.yDir < 0) {
    player.yDir += friction * delta;
    if(player.yDir > 0) {
      player.yDir = 0;
    }
  }

  // Check borders of map
  if(player.xDir < 0 && player.x - player.radius + player.xDir*delta < 0) {
    player.xDir = -player.xDir/2; // half velocity bounce for now
    player.x = player.radius;
  }
  if(player.xDir > 0 && player.x + player.radius + player.xDir*delta > gameWidth) {
    player.xDir = -player.xDir/2;
    player.x = gameWidth - player.radius;
  }
  if(player.yDir < 0 && player.y - player.radius + player.yDir*delta < 0) {
    player.yDir = -player.yDir/2; // half velocity bounce for now
    player.y = player.radius;
  }
  if(player.yDir > 0 && player.y + player.radius + player.yDir*delta > gameHeight) {
    player.yDir = -player.yDir/2;
    player.y = gameHeight - player.radius;
  }

  // update player position
  player.y += player.yDir * delta;
  player.x += player.xDir * delta;
}

  // drawing the player is handled in draw.js

// first server update clients
// player inputs
// lerp data 
//