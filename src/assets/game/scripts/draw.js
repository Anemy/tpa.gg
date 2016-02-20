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

  for(var i = 0; i < game.players.length; i++) {
    render_player(game.players[i]);
  }

  //un-translate for the side scrolling  XXXX
  ctx.translate(sideScrollX, 0);
  //un-translate for the side scrolling  YYYY
  ctx.translate(0, sideScrollY);
}

var render_map = function(delta) {

  // console.log('Grid glow: ' + gridGlow);

  // glowing grid updating
  if(gridGlowUp) {
    gridGlow += 75 * delta;
  }
  else {
    gridGlow -= 75 * delta;
  }
  if(gridGlowUp && gridGlow > 175) {
    gridGlowUp = false;
  }
  else if(!gridGlowUp && gridGlow < 25) {
    gridGlowUp = true;
  }

  ctx.fillStyle = 'rgb(' + Math.floor(gridGlow) + ',' + Math.floor(gridGlow) + ',' + Math.floor(gridGlow) + ')';

  // x 
  for(var i = 0; i < gridSize; i++) {
    ctx.fillRect(i*(gameWidth/gridSize), 0, 1, gameWidth);
  }
  // y
  for(var i = 0; i < gridSize; i ++) {
    ctx.fillRect(0, i*(gameWidth/gridSize), gameWidth, 1);
  }
}

// draws the player passed
var render_player = function(player) {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#DBDDDE';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#003300';
  ctx.closePath();
  ctx.stroke();
}