/*

This contains all of the drawing functionality

*/

const gridSize = 50;

// gridGlow goes up to 150 and down to 50 <- I hard code these in later in render_map
var gridGlow = 100;
var gridGlowUp = true; // says whether to increase or decrease grid glow
const gridGlowDiff = 50;

var render = function(delta) {
  ctx.clearRect(0, 0, width, height); 

  ctx.save();

  var sideScrollX = 0;
  var sideScrollY = 0;

  // translate the screen based on the local player's position (gives the cool following the player feel)
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

  // MAP
  render_map(delta);

  // PARTICLES
  for(var i = 0; i < game.particles.length; i++) {
    render_particle(game.particles[i]);
  }

  // PLAYERS
  for(var i = 0; i < game.players.length; i++) {
    if(game.players[i].health > 0) {
      render_player(game.players[i]);
    }
  }

  // BULLETS
  for(var i = 0; i < game.bullets.length; i++) {
    render_bullet(game.bullets[i]);
  }

  if(game.countdownTimer > 0) {
    drawCountDownTimer();
  }

  //un-translate for the side scrolling  XXXX
  // ctx.translate(sideScrollX, 0);
  // //un-translate for the side scrolling  YYYY
  // ctx.translate(0, sideScrollY);

  ctx.restore();
}

// what could this function possibly do?!
var drawCountDownTimer = function() {
  // this ugly but it does the countdown decreasing font size
  var fontSize = Math.floor(120 * (1 + (1 - (game.countdownTimer%1))));
  if(game.countdownTimer%1 <= .8) {
    fontSize = Math.floor(120 * (game.countdownTimer%1)*(1.4));
  }

  ctx.font = fontSize + "px Arial";
  ctx.fillStyle = "#0BD318";

  // console.log('Fontsize: ' + fontSize + " count: " + game.countdownTimer);

  if(game.countdownTimer < 1) {
    ctx.fillText("GO!", game.players[localPlayerID].x - fontSize*(5/6), game.players[localPlayerID].y - fontSize/4);
  }
  else {
    ctx.fillText(Math.floor(game.countdownTimer) + " ", game.players[localPlayerID].x - fontSize/4, game.players[localPlayerID].y + fontSize/12);
  }
}

// draws the map
var render_map = function(delta) {

  // around the border
  ctx.fillStyle = 'rgb(' + (120 - Math.floor(gridGlow/4)) + ',' + (120 - Math.floor(gridGlow/4)) + ',' + (180- Math.floor(gridGlow/4)) + ')';
  ctx.fillRect(-width/2, -height/2, gameWidth + width, height/2); // top
  ctx.fillRect(-width/2, -height/2, width/2, gameHeight + height); // left
  ctx.fillRect(gameWidth, -height/2, width/2, gameHeight + height); // right
  ctx.fillRect(-width/2, gameHeight, gameWidth + width, height/2); // bottom

  // borders
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, gameWidth, 2);
  ctx.fillRect(0, 0, 2, gameHeight);
  ctx.fillRect(0, gameHeight, gameWidth, 2);
  ctx.fillRect(gameWidth, 0, 2, gameHeight);

  // glowing grid updating
  if(gridGlowUp) {
    gridGlow += 50 * delta;
  }
  else {
    gridGlow -= 50 * delta;
  }
  if(gridGlowUp && gridGlow > 200) {
    gridGlowUp = false;
  }
  else if(!gridGlowUp && gridGlow < 50) {
    gridGlowUp = true;
  }

  ctx.fillStyle = 'rgb(' + Math.floor(gridGlow/2) + ',' + Math.floor(gridGlow/2) + ',' + Math.floor(gridGlow) + ')';

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
  ctx.fillStyle = '#EE1111';
  ctx.fill();
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = '#4A4A4A';
  // ctx.stroke();
  ctx.closePath();
  

  ctx.save();
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
  ctx.clip(); // Make a clipping region out of this path
  // instead of filling the arc, we fill a variable-sized rectangle
  // that is clipped to the arc
  ctx.fillStyle = '#5DAE8B'; //52EDB7 // 4CD964
  // We want the rectangle to get progressively taller starting from the bottom
  // There are two ways to do this:
  // 1. Change the Y value and height every time
  // 2. Using a negative height
  // I'm lazy, so we're going with 2
  ctx.fillRect(player.x - player.radius, player.y + player.radius, player.radius * 2, (player.health/playerHealth) * (-player.radius*2)); // last is amount to clip
  ctx.restore(); // reset clipping region

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#4A4A4A';
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = '#111111';

  // drawing gun VV
  ctx.save();

  ctx.translate(player.x, player.y);
  
  if(!astroidMode) {
    ctx.rotate(Math.atan2(player.mouseY, player.mouseX) -Math.PI/90);
  }
  else {
    ctx.rotate(player.rotation * (Math.PI/180));
  }

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