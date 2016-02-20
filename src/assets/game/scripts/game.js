/*

This file contains the starting functions of the game and the base game loop logic

*/

// client elements for drawing / document manipulation
var canvas;
var ctx;

// for client player controls
var localPlayerID = 0;

// param: server - true/false - true means it's the server
var Game = function(server) {
  this.server = server;

  // array of Player objects (player.js)
  this.players = [];

  this.bullets = [];

  lastTime = Date.now();

  if(server) {
    // server exclusive things
  }
  else {
    // client exclusive things
  }
}

// called exclusively by client, creates a game object and starts it going
var initGame = function() {
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  window.addEventListener('keyup', handleKeyUp , false);
  window.addEventListener('keydown', handleKeyDown , false);

  canvas.width = width;
  canvas.height = height;
}

var startGameLoop = function() {
  gameLoopInterval = startInterval(function() {
    gameLoop();
  }, fps);
}

var gameLoop = function() {
  var currentTime = Date.now();

  var deltaTime = (currentTime - lastTime)/1000;
  
  update(deltaTime);

  render();

  lastTime = currentTime;
}

// calls all of the updating functions and collision handling
var update = function(delta) {
  for(var i = 0; i < players.length; i++) {
    players[i].update(delta);
  }

  
}


console.log('Game script loaded');