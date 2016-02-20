/*

This contains all of the drawing functionality

*/

const gridSize = 50;

// gridGlow goes up to 150 and down to 50
var gridGlow = 100;
var gridGlowUp = true; // says whether to increase or decrease grid glow
const gridGlowDiff = 50;

var render = function(delta) {
  ctx.clearRect(0, 0, width, height);

  var sideScrollX = 0;
  var sideScrollY = 0;

  // translate the screen based on the local player's position
  if(localPlayerID != undefined && game.players[localPlayerID] != undefined) {
    // x scrolling amount
    if(game.players[localPlayerID].x <= width*(1/4)) {
        sideScrollX = -width*(1/4);
    }
    else if(game.players[localPlayerID].x >= gameWidth - width*(1/4)) {
        sideScrollX = gameWidth - width*(3/4);
    }
    else {
        sideScrollX = game.players[localPlayerID].x - width/2;
    }

    ctx.translate(-sideScrollX,0);

    //translate for the side scrolling YYYYY
    //check if player is near either side
    if(game.players[localPlayerID].y <= height*(1/4)) {
      sideScrollY = -height*(1/4);
    }
    else if(game.players[localPlayerID].y >= gameHeight - height*(1/4)) {
      sideScrollY = gameHeight - height*(3/4);
    }
    else {
      sideScrollY = game.players[localPlayerID].y - height/2;
    }
    ctx.translate(0,-sideScrollY);
  }

  render_map(delta);

  for(var i = 0; i < game.particles.length; i++) {
    render_particle(game.particles[i]);
  }

  for(var i = 0; i < game.players.length; i++) {
    render_player(game.players[i]);
  }

  for(var i = 0; i < game.bullets.length; i++) {
    render_bullet(game.bullets[i]);
  }

  //un-translate for the side scrolling  XXXX
  ctx.translate(sideScrollX, 0);
  //un-translate for the side scrolling  YYYY
  ctx.translate(0, sideScrollY);
}

var render_map = function(delta) {
  // borders
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, gameWidth, 2);
  ctx.fillRect(0, 0, 2, gameHeight);
  ctx.fillRect(0, gameHeight, gameWidth, 2);
  ctx.fillRect(gameWidth, 0, 2, gameHeight);

  // glowing grid updating
  if(gridGlowUp) {
    gridGlow += 80 * delta;
  }
  else {
    gridGlow -= 80 * delta;
  }
  if(gridGlowUp && gridGlow > 200) {
    gridGlowUp = false;
  }
  else if(!gridGlowUp && gridGlow < 50) {
    gridGlowUp = true;
  }

  ctx.fillStyle = 'rgb(' + Math.floor(gridGlow) + ',' + Math.floor(gridGlow) + ',' + Math.floor(gridGlow) + ')';

  // x 
  for(var i = 0; i < gridSize; i++) {
    ctx.fillRect(i*(gameWidth/gridSize), 0, 1, gameHeight);
  }
  // y
  for(var i = 0; i < gridSize; i ++) {
    if(i*(gameWidth/gridSize) > gameHeight) { // keeping it square yo
      break;
    }
    ctx.fillRect(0, i*(gameWidth/gridSize), gameWidth, 1);
  }
}

// draws the player passed
var render_player = function(player) {

  // drawing circle player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#52EDC7';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#4A4A4A';
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = '#111111';

  // drawing gun VV
  ctx.save();

  ctx.translate( player.x, player.y );
  ctx.rotate(Math.atan2(player.mouseY, player.mouseX));

  ctx.fillRect(player.radius, 0, player.gunSize, 4);

  //rotating a little for buffer small part of turret
  ctx.rotate(-Math.PI/90); 
  ctx.fillRect(player.radius, 0, Math.floor(player.gunSize/2), 6);

  ctx.translate( -player.x, -player.y );
  ctx.restore();
}

var render_particle = function(particle) {
  // ctx.beginPath();
  // ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI, false);
  // ctx.fillStyle = '#220000';
  // ctx.fill();
  // ctx.closePath();
  ctx.strokeStyle = particle.color + ", " + particle.life/100 + ")";
  ctx.strokeRect(particle.x, particle.y, particle.radius, particle.radius);
}

var render_bullet = function(bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#220000';
  ctx.fill();
  ctx.closePath();
}