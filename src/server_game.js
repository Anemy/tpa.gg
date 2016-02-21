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
    // console.log('inputs recieved');
    if (client.inLobby && client.lobbyId && lobbies[client.lobbyId] && lobbies[client.lobbyId].inProgress && lobbies[client.lobbyId].clients[client.token]){ // check if it's a valid user
      // handle client input here
      // console.log("meow: " + body);
      if(body.keyType == 'u' || body.keyType == 'd') {
        if(isNaN(body.keyCode)) { // that's not a number!
          return;
        }
        var keyType = false;
        if(body.keyType == 'd') {
          keyType = true;
        }
        switch(body.keyCode) {
          case keyCodes.space:
            lobbies[client.lobbyId].game.players[client.inGameNumber].shoot = keyType;
            break;
          case keyCodes.up:
          case keyCodes.w:
            lobbies[client.lobbyId].game.players[client.inGameNumber].up = keyType;
            break;
          case keyCodes.down:
          case keyCodes.s:
            lobbies[client.lobbyId].game.players[client.inGameNumber].down = keyType;
            break;
          case keyCodes.right:
          case keyCodes.d:
            lobbies[client.lobbyId].game.players[client.inGameNumber].right = keyType;
            break;
          case keyCodes.left:
          case keyCodes.a:
            lobbies[client.lobbyId].game.players[client.inGameNumber].left = keyType;
            break;
        }
      }
      else if(body.keyType == 'm' && body.x !== undefined && body.y !== undefined &&
          !isNaN(body.x) && !isNaN(body.y)) { // ensure they aren't doing crazy stuff sending us crazy x y!
        lobbies[client.lobbyId].game.players[client.inGameNumber].mouseX = body.x;
        lobbies[client.lobbyId].game.players[client.inGameNumber].mouseY = body.y;
      }
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
}

var launchGame = function(lobby) {
  console.log("Start a game!");

  lobby.inProgress = true;

  for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
    var clientId = Object.keys(lobby.clients)[i];
    var client = lobby.clients[clientId];

    // attaching an ingame number to each client
    client.inGameNumber = i;

    var message = JSON.stringify({"event": "gameStart", "body": {"clientId": clientId, "inGameNumber": client.inGameNumber}});
    client.send(message);
  }

  // add the new players
  lobby.game.players.push(new Player(width/6, width/6)); // top left
  // lobby.game.players.push(new Player(gameWidth - width/6, width/6)); // top right
  // lobby.game.players.push(new Player(width/6, gameHeight - width/6); // bottom left
  lobby.game.players.push(new Player(gameWidth - width/6, gameHeight - width/6)); // bottom right

  // start the game running
  lobby.game.startGameLoop();
}

var lobbyEndGame = function() {

}

// sends all of the game data of the indicated lobby from the server
var serverSendGameData = function(lobby) {
  // gameLoop
  // lobby.game
  var dataToSend = {
    timestamp: (new Date()).getTime()
  };

  dataToSend.countdownTimer = lobby.game.countdownTimer;
  dataToSend.players = lobby.game.players;
  dataToSend.bullets = lobby.game.bullets;

  var message = JSON.stringify({"event": "gameData", "body": dataToSend});
  // console.log('Send this message to the clients: ' + message);
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
  // console.log('Lobby created: ' + lobbyId);

  message = JSON.stringify({'event': 'lobbyFound', 'body': 1});
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

        client.send(JSON.stringify({'event': 'lobbyFound', 'body': lobby.population}));

        // can the game start?
        if(lobby.population == minPlayers) {
          // start the game!
          launchGame(lobby);
        }
        else {
          for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
            var clientId = Object.keys(lobby.clients)[i];
            var client = lobby.clients[clientId];
            client.send(message);
          }
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
