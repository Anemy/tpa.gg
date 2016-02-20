/*

This runs an instance of the game on the server, making clients stay legit and having fun

*/
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var uuid = require('uuid');

// loads in all the js in the most jank way possible
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

// The server uses the same game code as the client! spooky
includeInThisContext(__dirname+"/assets/game/scripts/game.js");
includeInThisContext(__dirname+"/assets/game/scripts/player.js");
includeInThisContext(__dirname+"/assets/game/scripts/bullet.js");
includeInThisContext(__dirname+"/assets/game/scripts/constants/index.js");


var lobbies = [];

// contains all of the client connections and things pertaining to the lobby
var Lobby = function(lobbyID) {
  this.pop = 0; // players in game
  this.clients = [];

  // boolean says if game is going or not - don't let people join when it's going
  this.inProgress = false;

  this.game = new Game(true, this, serverSendGameData);

  this.handleInput = function() {
    console.log("Handle input. TODO");
  }
}

var launchGame = function(lobby) {
  console.log("Start a game!");

  lobby.inProgress = true;

  for(var i = 0; i < lobby.clients.length; i++) { 
    lobby.clients[i].emit('game start', i);
  }

  lobby.game.startGameLoop();
  // add players here?

  // move this into somewhere else at some point
  lobby.game.players.push(new Player(playerRadius, playerRadius)); // top left
  // lobby.game.players.push(new Player(gameWidth - playerRadius, playerRadius)); // top right
  // lobby.game.players.push(new Player(playerRadius, gameHeight - playerRadius)); // bottom left
  lobby.game.players.push(new Player(gameWidth - playerRadius, gameHeight - playerRadius)); // bottom right
}

// sends all of the game data of the indicated lobby from the server
var serverSendGameData = function(lobby) {
  // gameLoop
  // lobby.game
  var dataToSend = {
    timestamp: new Date().getTime()
  };

  dataToSend.countdownTimer = lobby.game.countdownTimer;
  dataToSend.players = lobby.game.players;
  dataToSend.bullets = lobby.game.bullets;

  var dataString = JSON.stringify(dataToSend);
  // shoot the data to the clients
  for(var i = 0; i < lobby.clients.length; i++) {
    lobby.clients[i].emit('gameData', dataString);
  }
}

var createNewLobby = function (client) {
  // create a new lobby
  var lobbyID = uuid.v4()
  lobbies[lobbyID] = new Lobby(lobbyID);
  console.log('Lobby created: ' + lobbyID);

  client.send('m.lobbyFound');
  client.inLobby = true;
  client.lobbyID = lobbyID;

  lobbies[lobbyID].pop++;
  lobbies[lobbyID].clients.push(client);
}

// searches for a game for the client, or makes one depending
var joinLobby = function(client) {

  // need to find how to reference lobbies
  if(Object.keys(lobbies).length == 0) {
    // create new lobby
    createNewLobby(client);
  }
  else {
    // try to join a preexisting lobby

    for (var lobbyID in lobbies) {
      // skip loop if the property is from prototype
      if (!lobbies.hasOwnProperty(lobbyID)) { 
        // console.log('In proto: ' + lobbyID);
        continue;
      }

      var lobby = lobbies[lobbyID];

      if(lobby.pop < maxPlayers && !lobby.inProgress) { // max players from constants/index.js
        // add player to lobby
        client.inLobby = true;
        client.lobbyID = lobbyID;

        // add the client to the game
        lobby.pop++;
        lobby.clients.push(client);

        // send the client the lobby ID and the 
        client.send('m.lobbyFound');

        // can the game start?
        if(lobby.pop == minPlayers) {
          // start the game!
          launchGame(lobby);
        }
        return;
      }
    }

    // no lobby found, just create a new one
    createNewLobby(client);
  }
}

var server_start = function(server, port) {
  // socket io creation and listening
  var io = require('socket.io')(server);
  io.sockets.on('connection', function(client) {
    client.lobbyID = null;
    client.inLobby = false;

    // send the client a unique id (idk what to do with it yet LOL)
    client.emit('token', uuid.v4());

    // handle message from client
    client.on('message', function(message) {
      // console.log("mesg: " + message);

      if(message == null || message == undefined) {
        return;
      }

      var messageParts = message.split('.');
      var messageType = messageParts[0] || null;

      if (messageType == "input") {
        // handle input
        if(client.inLobby && client.lobbyID) {
          if(lobbies[client.lobbyID]) {
            lobbies[client.lobbyID].handleInput(messageParts[1]);
          }
        }
      } 
      else if (messageType == 'p') { // ping request
        client.send('p.' + messageParts[1]);
      } 
      else if (messageType == 'm') {
        var messageQuery = messageParts[1] || null;

        // try to join a game if player is applicable
        if(messageQuery == 'joinGame' && !client.inLobby) {
          console.log('Client wants to join a game');
          joinLobby(client);
        }
      }
    });

    client.on('disconnect', function() {
      // tell the game to remove a player?
      if(client.inLobby) {
        // disconnect client from game
        // lobby.pop--;
        // lobby.clients.splice
      }
    });
  });
}




module.exports = {
  gameLobbies: lobbies,
  startListening: server_start,
}