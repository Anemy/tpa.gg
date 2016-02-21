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


var clientEventHandlers = {
  input: function(body, client){
    console.log("input");
    if (client.inLobby && client.lobbyId){
      console.log(body);
    }
  },
  ping: function(body, client){
    var message = {"event": "ping", "body": body};
    client.send(JSON.stringify(message));
  },
  joinGame: function(body, client){
    if (client.inLobby === false){
      console.log("Client wants to join a game");
      // console.log("client isn't in lobby, joining now, lobbyId is " + client.lobbyId);
      joinLobby(client);
    }
  }
};

var lobbies = {};

// contains all of the client connections and things pertaining to the lobby
var Lobby = function(lobbyId) {
  this.population = 0; // players in game
  this.clients = {};

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

  for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
    var clientId = Object.keys(lobby.clients)[i];
    var client = lobby.clients[clientId];

    var message = JSON.stringify({"event": "gameStart", "body": clientId});
    client.send(message);
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

  var message = JSON.stringify({"event": "gameData", "body": dataToSend});
  // shoot the data to the clients
  for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
    var clientId = Object.keys(lobby.clients)[i];
    var client = lobby.clients[clientId];
    client.send(message);
  }
}

var createNewLobby = function (client) {
  // create a new lobby
  var lobbyId = uuid.v4()
  lobbies[lobbyId] = new Lobby(lobbyId);
  console.log('Lobby created: ' + lobbyId);

  var message = JSON.stringify({'event': 'lobbyFound', 'body': lobbyId});
  client.send(message);

  client.inLobby = true;
  client.lobbyId = lobbyId;

  lobbies[lobbyId].population++;
  lobbies[lobbyId].clients[client.token] = client;
}

// searches for a game for the client, or makes one depending
var joinLobby = function(client) {

  // console.log(Object.keys(lobbies));
  // need to find how to reference lobbies
  if(Object.keys(lobbies).length == 0) {
    // create new lobby
    createNewLobby(client);
  }
  else {
    // try to join a preexisting lobby

    for (var i = 0; i < Object.keys(lobbies).length; i++){
      var lobbyId = Object.keys(lobbies)[i];
      var lobby = lobbies[lobbyId];
      // console.log(lobby);

      if(lobby.population < maxPlayers && !lobby.inProgress) { // max players from constants/index.js
        // add player to lobby
        client.inLobby = true;
        client.lobbyId = lobbyId;

        // add the client to the game
        lobby.population++;
        lobby.clients[client.token] = client;

        client.send(JSON.stringify({'event': 'lobbyFound'}));

        // can the game start?
        if(lobby.population == minPlayers) {
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
    client.lobbyId = null;
    client.inLobby = false;
    client.token = uuid.v4();

    // send the client a unique id (idk what to do with it yet LOL)
    var message = {"event": "token", "body": client.token};
    client.send(JSON.stringify(message));

    // handle message from client
    client.on('message', function(m) {
      if (m == null || m == undefined) {
        return;
      }
      var message = JSON.parse(m);

      if (message['event'] !== undefined
          && clientEventHandlers[message['event']] !== undefined) {
        var eventName = message['event'];
        var eventBody = message['body'];
        clientEventHandlers[eventName](eventBody, client);
      }

    });

    client.on('disconnect', function() {
      // tell the game to remove a player?
      if(client.inLobby) {
        // disconnect client from game
        // TODO
      }
    });
  });
}




module.exports = {
  gameLobbies: lobbies,
  startListening: server_start,
}
