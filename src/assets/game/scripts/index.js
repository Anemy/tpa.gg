/*

This starts up game.js for the local client

*/

// clientside running for now
$(document).ready(function() {
  game = new Game(false);
  game.initGame();
});

console.log('Game script loaded');