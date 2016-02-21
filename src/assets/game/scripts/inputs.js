/*

This file controls all of the key inputs

*/

// limit how many downs are sent for one key

var lastKeyDown = -1;

var handleKeydown = function (e) {
  var keyCode = e.keyCode;

  if(inGame && lastKeyDown != keyCode) {
    var message = JSON.stringify({'event': 'input', 'body': {'keyCode': keyCode, 'keyType': 'd'}});
    socket.send(message);
  }
  lastKeyDown = keyCode;

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

  lastKeyDown = -1;
  if(inGame) {
    var message = JSON.stringify({'event': 'input', 'body': {'keyCode': keyCode, 'keyType': 'u'}});
    socket.send(message);
  }

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

var mouseDown = function(e) {
  if(lastKeyDown != 'm') {
    // shoot when clicked
    var message = JSON.stringify({'event': 'input', 'body': {'keyCode': keyCodes.space, 'keyType': 'd'}});
    socket.send(message);
    lastKeyDown = 'm';
  }
}
var mouseUp = function(e) {
  // stop shooting
  var message = JSON.stringify({'event': 'input', 'body': {'keyCode': keyCodes.space, 'keyType': 'u'}});
  socket.send(message);
  lastKeyDown = -1;
}

// alters local player's target
var mouseMove = function(e) {

  // SENDS TO SERVER AT THE BOTTOM OF FUNCTION

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
  else if(game.players[localPlayerID].x >= gameWidth - (width*(1/4))) {
    game.players[localPlayerID].mouseX -= (width*(3/4)) + (game.players[localPlayerID].x-gameWidth); // you will be closer to the left, aim has to adjust mouse
  }
  else {
    game.players[localPlayerID].mouseX -= width/2;
  }
  if(game.players[localPlayerID].y <= (height/4)) {
    game.players[localPlayerID].mouseY -= (height/4) + game.players[localPlayerID].y; // you will be closer to the left, aim has to adjust mouse
  }
  else if(game.players[localPlayerID].y >= gameHeight - (height*(1/4))) {
    game.players[localPlayerID].mouseY -= (height*(3/4)) + (game.players[localPlayerID].y-gameHeight); // you will be closer to the left, aim has to adjust mouse
  }
  else {
    game.players[localPlayerID].mouseY -= height/2;
  }

  if(inGame) {
    var message = JSON.stringify({'event': 'input', 'body': {'x': game.players[localPlayerID].mouseX, 'y': game.players[localPlayerID].mouseY, 'keyType': 'm'}});
    socket.send(message);
  }
}