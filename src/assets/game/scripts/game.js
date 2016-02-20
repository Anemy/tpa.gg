/*

This file contains the starting functions of the game and the base game loop logic

*/

// client elements for drawing / document manipulation
var canvas;
var ctx;

// used when computing time between game loop intervals
var lastTime;

// for client player controls
var localPlayerID = 0;

var game; // game is a Game object

// param: server - true/false - true means it's the server
var Game = function(server) {
  this.server = server;

  // array of Player objects (player.js)
  this.players = [];
  this.players.push(new Player(20,20));

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
Game.prototype.initGame = function() {
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  window.addEventListener('keyup', handleKeyUp , false);
  window.addEventListener('keydown', handleKeyDown , false);

  canvas.width = width;
  canvas.height = height;
}

Game.prototype.startGameLoop = function() {
  this.gameLoopInterval = startInterval(function() {
    this.gameLoop();
  }, fps);
}

Game.prototype.gameLoop = function() {
  var currentTime = Date.now();

  var deltaTime = (currentTime - lastTime)/1000;
  
  this.update(deltaTime);

  render();

  lastTime = currentTime;
}

// calls all of the updating functions and collision handling
Game.prototype.update = function(delta) {
  for(var i = 0; i < this.players.length; i++) {
    this.players[i].update(delta);
  }
}


console.log('Game script loaded');

// clientside running for now
$(document).ready(function() {
  game = new Game();
  game.initGame();
});