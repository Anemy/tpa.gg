/*

This file controls all of the key inputs

*/


var handleKeydown = function (e) {
  var keyCode = e.keyCode;

  switch(keyCode) {
    case keyCodes.space:
      game.players[localPlayerID].shoot = true;
      break;
    case keyCodes.up:
    case keyCodes.w:
      game.players[localPlayerID].up = true;
      break;
    case keyCodes.down:
    case keyCodes.s:
      game.players[localPlayerID].down = true;
      break;
    case keyCodes.right:
    case keyCodes.d:
      game.players[localPlayerID].right = true;
      break;
    case keyCodes.left:
    case keyCodes.a:
      game.players[localPlayerID].left = true;
      break;
  }
}

var handleKeyup = function (e) {
  var keyCode = e.keyCode;

  switch(keyCode) {
    case keyCodes.space:
      game.players[localPlayerID].shoot = false;
      break;
    case keyCodes.up:
    case keyCodes.w:
      game.players[localPlayerID].up = false;
      break;
    case keyCodes.down:
    case keyCodes.s:
      game.players[localPlayerID].down = false;
      break;
    case keyCodes.right:
    case keyCodes.d:
      game.players[localPlayerID].right = false;
      break;
    case keyCodes.left:
    case keyCodes.a:
      game.players[localPlayerID].left = false;
      break;
  }
}


// alters local player's target
var mouseMove = function(e) {

  if(e.offsetX) {
    game.players[localPlayerID].mouseX = e.offsetX;
    game.players[localPlayerID].mouseY = e.offsetY;
  }
  else if(e.layerX) {
    game.players[localPlayerID].mouseX = e.layerX;
    game.players[localPlayerID].mouseY = e.layerY;
  }

  // altering mouse position based on player position (relative)
  if(game.players[localPlayerID].x <= (width/4)) {
    game.players[localPlayerID].mouseX -= (width/4) + game.players[localPlayerID].x; // you will be closer to the left, aim has to adjust mouse
  }
  else if(game.players[localPlayerID].x >= gameWidth - (width*(3/4))) {
    game.players[localPlayerID].mouseX -= (width*(3/4)) + (game.players[localPlayerID].x-gameWidth); // you will be closer to the left, aim has to adjust mouse
  }
  else {
    game.players[localPlayerID].mouseX -= width/2;
  }
  if(game.players[localPlayerID].y <= (height/4)) {
    game.players[localPlayerID].mouseY -= (height/4) + game.players[localPlayerID].y; // you will be closer to the left, aim has to adjust mouse
  }
  else if(game.players[localPlayerID].y >= gameHeight - (height*(3/4))) {
    game.players[localPlayerID].mouseY -= (height*(3/4)) + (game.players[localPlayerID].y-gameHeight); // you will be closer to the left, aim has to adjust mouse
  }
  else {
    game.players[localPlayerID].mouseY -= height/2;
  }

   // = (e.clientX - canvasRect.left)/(canvasRect.right - canvasRect.left) * width,
   // = (e.clientY - canvasRect.top)/(canvasRect.bottom - canvasRect.top) * height;

  // console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
}