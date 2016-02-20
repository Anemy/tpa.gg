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
  this.players.push(new Player(gameWidth/2,gameHeight/2));

  this.bullets = [];

  this.lastTime = Date.now();

  if(server) {
    // server exclusive things
  }
  else {
    // client exclusive things
  }
}

// called exclusively by client, creates a game object and starts it going
Game.prototype.initGame = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  window.addEventListener('keyup', handleKeyup , false);
  window.addEventListener('keydown', handleKeydown , false);

  window.addEventListener('mousemove', mouseMove, false);

  canvas.width = width;
  canvas.height = height;

  canvasRect = canvas.getBoundingClientRect();


  this.startGameLoop();
}

Game.prototype.startGameLoop = function() {
  var that = this;
  this.gameLoopInterval = setInterval(function() {
    that.gameLoop();
  }, fps);
}

Game.prototype.gameLoop = function() {
  var currentTime = Date.now();

  var deltaTime = (currentTime - this.lastTime)/1000;

  // inactive tab catch
  if(deltaTime > 0.25) {
    deltaTime = 0.25;
  }
  
  this.update(deltaTime);

  render(deltaTime);

  this.lastTime = currentTime;
}

// calls all of the updating functions and collision handling
Game.prototype.update = function(delta) {
  for(var i = 0; i < this.players.length; i++) {
    this.players[i].update(delta);
  }
}

// clientside running for now
$(document).ready(function() {
  game = new Game();
  game.initGame();
});

console.log('Game script loaded');
