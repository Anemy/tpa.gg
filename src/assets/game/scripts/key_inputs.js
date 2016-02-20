/*

This file controls all of the key inputs

*/


var handleKeydown = function (e) {
  var keyCode = e.keyCode;
  var keyCodes = Constants.keyCodes;

  switch(keyCode) {
    case keyCodes.space:
      game.players[localPlayerID].shoot = true;
      break;
    case keyCodes.up:
      game.players[localPlayerID].up = true;
      break;
    case keyCodes.down:
      game.players[localPlayerID].down = true;
      break;
    case keyCodes.right:
      game.players[localPlayerID].right = true;
      break;
    case keyCodes.left:
      game.players[localPlayerID].left = true;
      break;
  }
}

var handleKeyup = function (e) {
  var keyCode = e.keyCode;
  var keyCodes = Constants.keyCodes;

  switch(keyCode) {
    case keyCodes.space:
      game.players[localPlayerID].shoot = false;
      break;
    case keyCodes.up:
      game.players[localPlayerID].up = false;
      break;
    case keyCodes.down:
      game.players[localPlayerID].down = false;
      break;
    case keyCodes.right:
      game.players[localPlayerID].right = false;
      break;
    case keyCodes.left:
      game.players[localPlayerID].left = false;
      break;
  }
}