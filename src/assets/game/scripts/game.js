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

const astroidMode = false;

// param: server - true/false - true means it's the server
var Game = function(server, lobby, serverSendGameData, a) {
  this.server = server;

  // used by server so game can call to update clients
  if(lobby) {
    this.lobby = lobby;

    this.serverSendGameData = serverSendGameData;
  }

  // array of Player objects (player.js)
  this.players = [];

  // test player
  // this.players.push(new Player(gameWidth/2,gameHeight/2));

  this.bullets = [];

  this.particles = [];

  this.lastTime = Date.now();

  // time until the game starts
  this.countdownTimer = countdownTimerStart;

  if(server) {
    // server exclusive things
  }
  else {
    this.firstUpdate = true;
    // client exclusive things
  }
}

// called exclusively by client, creates a game object and starts it going
Game.prototype.initGame = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // add window key + mouse controls
  window.addEventListener('keyup', handleKeyup , false);
  window.addEventListener('keydown', handleKeydown , false);

  window.addEventListener('mousemove', mouseMove, false);
  window.addEventListener("mousedown", mouseDown, false);
  window.addEventListener("mouseup", mouseUp, false);

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

  // if game hasn't started yet don't do any updates
  if(this.countdownTimer > 0) {
    this.countdownTimer -= deltaTime;
  }
  else {
    this.update(deltaTime);

    this.checkCollisions(deltaTime);
  }

  if(!this.server) {
    // clientside render the game
    render(deltaTime);
  }
  else {
    // serverside send the clients the files
    this.serverSendGameData(this.lobby);
  }

  this.lastTime = currentTime;
}

// lerp function
// take in 2 return %p on how close to 1st one is requested
Game.prototype.lerp = function(p, first, second) {
    var difference = second - first;
    return first + ((p / 100) * difference);
}

// called when the packet from the server is a game packet to parse
// populate local fields with data from the server
Game.prototype.clientParseGameData = function(data) {
  var timeSinceMessageSent = (new Date()).getTime() - data.timestamp; // in ms
  if(timeSinceMessageSent < 0) {
    timeSinceMessageSent = 0;
  }

  if(data.countdownTimer > 0) {
    this.countdownTimer = data.countdownTimer - (timeSinceMessageSent/1000); // countdown timer in s
  }

  // first time through hard update
  if(this.firstUpdate) {
    this.players = data.players;
    this.firstUpdate = false;
  }
  else {
  // load player data from server
    for(var i = 0; i < data.players.length; i++) {
      if(i == localPlayerID) {
        var x = this.players[i].x;
        var y = this.players[i].y;

        this.players[i] = data.players[i];

        // for self, give closer to local calculations because lags
        this.players[i].x = this.lerp(100 * (ping / 120), x, data.players[i].x);
        this.players[i].y = this.lerp(100 * (ping / 120), y, data.players[i].y);
      }
      else {
        this.players[i] = data.players[i];
      }
    }
  }
  this.bullets = data.bullets;
  // for(var i = 0; i < this.bullets; i++) {
  //   this.bullets[i].x += (this.countdownTimer/1000) * bullets[i].xDir;
  //   this.bullets[i].y += (this.countdownTimer/1000) * bullets[i].yDir;
  // }

  // console.log('We got data baby! ' + data);
}

Game.prototype.checkCollisions = function(delta) {
  // player - bullet collisions
  for(var k = this.bullets.length-1; k >= 0; k--) {
    for(var i = 0; i < this.players.length; i++) {
      if(this.players[i].health > 0 && this.bullets[k].owner != i && // make sure you aren't shooting yourself
          Math.abs(this.bullets[k].x - this.players[i].x) < this.players[i].radius + this.bullets[k].radius &&// x proximity
          Math.abs(this.bullets[k].y - this.players[i].y) < this.players[i].radius + this.bullets[k].radius) {
        // hurt the playa
        this.players[i].health -= this.bullets[k].damage;

        // time to die!?
        if(this.players[i].health <= 0) {
          if(!this.server) {
            for(var j = 0; j < 40; j++) {
              var colorToBe = 'rgba(' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*50) + ',' + Math.floor(Math.random()*50); // THE END ) NOT ADDED BECause ALPHA ADDED
              this.particles.push(new Particle(this.players[i].x + returnNeg(Math.random()*this.players[i].radius), this.players[i].y + returnNeg(Math.random()*this.players[i].radius), returnNeg(Math.random()*600), returnNeg(Math.random()*600), colorToBe));
            }
          }
          else { // server
            // see how many players alive (end game if ya can!)
            var stillAlive = -1;
            for(var j = 0; j < this.players.length; j++) {
              if(this.players[i].health > 0) {
                if(stillAlive >= 0) {
                  stillAlive = -2;
                  break;
                }
                stillAlive = j;
              }
            }

            // end game if ya can
            if(stillAlive >= 0) {
              endGame();
            }
          }
        }

        if(this.server) {
          // send something special to clients ?
          // maybe send blood spawning if it doesn't work out
        }
        else {
          // only spawn particles on the client // blood
          for(var j = 0; j < 30; j++) { // brainzzzzz
            var colorToBe = 'rgba(' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*50) + ',' + Math.floor(Math.random()*50); // THE END ) NOT ADDED BECause ALPHA ADDED
            this.particles.push(new Particle(this.bullets[k].x, this.bullets[k].y, returnNeg(Math.random()*200), returnNeg(Math.random()*200), colorToBe));
          }
        }

        // kill the bullet
        this.bullets.splice(k, 1);

        break;
      }
    }
  }
}

// calls all of the updating functions and collision handling
Game.prototype.update = function(delta) {
  // bullet updating
  for(var i = this.bullets.length - 1; i >= 0; i--) {
    // console.log('Try to update bullet: ' + i);
    // updatePlayer(this.players[i], delta);
    if(!updateBullet(this.bullets[i], delta)) { // dead bullet?
      if(!this.server) { // only spawn particles on the client
        // spawn particles
        for(var k = 0; k < 32; k++) { // 20 particles to make
          var colorToBe = 'rgba(' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255); // THE END ) NOT ADDED BECause ALPHA ADDED
          this.particles.push(new Particle(this.bullets[i].x, this.bullets[i].y, returnNeg(Math.random()*200), returnNeg(Math.random()*200), colorToBe));
        }
      }

      // kill dead bullet
      this.bullets.splice(i,1);
    }
  }

  // player updating
  for(var i = 0; i < this.players.length; i++) {
    if(this.players[i].health <= 0) {
      // do nothing
      continue;
    }

    // player update
    // this.players[i].update(delta);
    updatePlayer(this.players[i], delta);

    // bullet shooting/creation
    if(this.players[i].shoot && this.players[i].shootCounter <= 0) {
      this.players[i].shootCounter = shootRate;

      var shootAngle = Math.atan2(this.players[i].mouseY, this.players[i].mouseX);
      this.bullets.push(new Bullet(this.players[i].x + (this.players[i].radius+this.players[i].gunSize)*Math.cos(shootAngle), this.players[i].y + (this.players[i].radius+this.players[i].gunSize)*Math.sin(shootAngle), bulletSpeed*Math.cos(shootAngle), bulletSpeed*Math.sin(shootAngle), shootAngle, i));
    }
  }

  //particle updating
  if(!this.server) {
    for(var i = this.particles.length - 1; i >= 0; i--) {
      if(!this.particles[i].update(delta)) {
        // kill dead particle
        this.particles.splice(i,1);
      }
    }
  }
}
