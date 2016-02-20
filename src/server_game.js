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

  this.game = new Game(true);

  this.handleInput = function() {
    console.log("Handle input. TODO");
  }
}

var launchGame = function(lobby) {
  // console.log("Start a game!");

  for(var i = 0; i < lobby.clients; i++) { 
    lobby.clients[i].emit('game start', {});
  }

  lobby.game.startGameLoop();
  // add players here?

  // move this into somewhere else at some point
  lobby.game.players.push(new Player(playerRadius, playerRadius));
  lobby.game.players.push(new Player(gameWidth - playerRadius, playerRadius));
  lobby.game.players.push(new Player(playerRadius, gameHeight - playerRadius));
  lobby.game.players.push(new Player(gameWidth - playerRadius, gameHeight - playerRadius));
}

var createNewLobby = function (client) {
  // create a new lobby
  var lobbyID = uuid.v4()
  lobbies[lobbyID] = new Lobby(lobbyID);

  client.send('m.lobbyFound');
  client.lobbyID = lobbyID;
}

// searches for a game for the client, or makes one depending
var joinLobby = function(client) {

  // need to find how to reference lobbies
  if(lobbies.length == 0) {
    // create new lobby
    createNewLobby(client);
  }
  else {
    // try to join a preexisting lobby

    for (var lobbyID in lobbies) {
      // skip loop if the property is from prototype
      if (!lobbies.hasOwnProperty(lobbyID)) continue;

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

        if(lobby.pop == minPlayers) {
          // start the game here!
          launchGame(lobby);
        }
        else if(lobby.pop > maxPlayers) {
          // It should never be in here
          // console.log("FUCKKKKKKKK");
        }
        else {

          // console.log('Added another player to lobby: ' + lobbyID);
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
        if(messageQuery == 'joinGame') {
          // console.log('Client wants to join a game');
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
  another: 'yo'
}