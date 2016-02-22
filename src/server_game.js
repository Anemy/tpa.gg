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

/*
var lastPos = 0;
var blarg = setInterval(
function() {
  if(Math.abs(game.players[localPlayerID].x - lastPos) > 10) {
    console.log('Difference: ' + game.players[localPlayerID].x + " vs " + lastPos);
  }
  lastPos = game.players[localPlayerID].x;
},10);

*/

var usersOnline = 0;

var clientEventHandlers = {
  input: function(body, client){
    // console.log('inputs recieved');
    if (client.inLobby && client.lobbyId && lobbies[client.lobbyId] && lobbies[client.lobbyId].inProgress && lobbies[client.lobbyId].clients[client.token]){ // check if it's a valid user
      // handle client input here
      // console.log("meow: " + body);
      client.lastMessage = Date.now(); // keep them from getting kicked for afk

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
    var message = {"event": "ping", "body": {"ping": body, "usersOnline": usersOnline}};
    client.send(JSON.stringify(message));
  },
  joinGame: function(body, client){
    if (client.inLobby === false){
      // console.log("Client wants to join a game");
      joinLobby(client);
    }
  },
  nameChange: function(body, client) {
    if(body && client.inLobby == false && body.length < 25) {
      var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };

      client.username = String(body).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
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

  this.game = new Game(true, this, serverSendGameData, lobbyEndGame);
}

var launchGame = function(lobby) {
  // console.log("Start a game!");

  lobby.inProgress = true;

  for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
    var clientId = Object.keys(lobby.clients)[i];
    var client = lobby.clients[clientId];

    // attaching an ingame number to each client
    client.inGameNumber = i;

    var message = JSON.stringify({"event": "gameStart", "body": {"clientId": clientId, "inGameNumber": client.inGameNumber}});
    client.send(message);

    // add the new players (yes this makes no sense)
    if(i == 0) {
      lobby.game.players.push(new Player(width/6, width/6, client.username)); // top left
    }
    if(i == 1) {
      lobby.game.players.push(new Player(gameWidth - width/6, gameHeight - width/6, client.username)); // bottom right
    }
    if(i == 2) {
      lobby.game.players.push(new Player(width/6, gameHeight - width/6, client.username)); // bottom left
    }
    if(i == 3) {
      lobby.game.players.push(new Player(gameWidth - width/6, width/6, client.username)); // top right
    }
  }
  // start the game running
  lobby.game.startGameLoop();
}

var lobbyEndGame = function(lobby) {
  if(lobby && lobby.game) {
    var message = JSON.stringify({"event": "gameEnd", "body": lobby.game.winner});
    for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
      var clientId = Object.keys(lobby.clients)[i];
      var client = lobby.clients[clientId];

      client.lobbyId = null;
      client.inLobby = false;

      client.send(message);
    }
  }

  if(lobbies[lobby.lobbyId] && lobbies[lobby.lobbyId].game) {
    delete lobbies[lobby.lobbyId].game;
  }

  if(lobbies[lobby.lobbyId]) {
    // destroy the lobby
    delete lobbies[lobby.lobbyId];
  }
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
  // console.log('New lobby created: ' + lobbyId);

  message = JSON.stringify({'event': 'lobbyFound', 'body': 1});
  client.send(message);

  client.inLobby = true;
  client.lobbyId = lobbyId;

  lobbies[lobbyId].population++;
  lobbies[lobbyId].clients[client.token] = client;
}

// removes the client from the lobby client.lobbyId
// It will also delete the lobby if the client is the last one in it
var removeClientFromLobby = function(client) {
  // tell the game to remove a player?
  // console.log('Remove client from lobby: ' + JSON.stringify(client));
  // console.log('Remove client:');
  // for(var i = 0; i < Object.keys(client).length; i++) {
  //   console.log('   ' + Object.keys(client)[i] + " : " + client[Object.keys(client)[i]]);
  // }
  if(client.inLobby) {
    if(client.lobbyId != undefined && lobbies[client.lobbyId] != undefined) {
      // client is in a lobby, remove them from the clients, and update the lobby if it's not in game yet
      if(lobbies[client.lobbyId].inProgress) {

        // a game is in process
        delete lobbies[client.lobbyId].clients[client.clientId];
        
        // delete the empty lobby
        lobbies[client.lobbyId].population--;
        if(lobbies[client.lobbyId].population <= 0) {

          clearInterval(lobbies[client.lobbyId].game.gameLoopInterval);
          delete lobbies[client.lobbyId].game.lobby;
          delete lobbies[client.lobbyId].game;

          delete lobbies[client.lobbyId];
        }
      }
      else {
        lobbies[client.lobbyId].population--;
        
        // delete the lobby if all the homies leave
        if(lobbies[client.lobbyId].population <= 0) {
          delete lobbies[client.lobbyId];
        }
        else {
          // console.log('Lobby b4: ' + Object.keys(lobbies[client.lobbyId].clients));
          delete lobbies[client.lobbyId].clients[client.token];
          // console.log('Lobby after: ' + Object.keys(lobbies[client.lobbyId].clients));
        }
      }

      client.inLobby = false;
      client.lobbyId = null;
    }
  }
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

      if(lobby.population < maxPlayers && !lobby.inProgress) { // max players from constants/index.js

        // console.log('Open lobby found: ' + lobbyId);

        // add player to lobby
        client.inLobby = true;
        client.lobbyId = lobbyId;

        // add the client to the game
        lobby.population++;
        lobby.clients[client.token] = client;

        var message = JSON.stringify({'event': 'lobbyFound', 'body': lobby.population});

        for(var i = 0; i < Object.keys(lobby.clients).length; i++) { 
          var clientId = Object.keys(lobby.clients)[i];
          var client = lobby.clients[clientId];
          client.send(message);
        }

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
    usersOnline++;

    client.lobbyId = null;
    client.inLobby = false;
    client.username = "";
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

    // afk kick timer
    client.afkKicker = setInterval(function() {
      // console.log('Test the afk kick! ' + (Date.now() - gameClient.lastMessage) + ' > ' + afkMaxTime + ' next game timer: ' + gameProcess.gameInstance.nextGameTimer);
      if(Date.now() - client.lastMessage > afkKickTime && 
        client.inLobby && lobbies[client.lobbyId] !== undefined &&
        lobbies[client.lobbyId].inProgress) {
          // client is in an active game
          if(lobbies[client.lobbyId].game.countdownTimer <= 0) {
            // console.log('Kick that afk boi!');
            var message = JSON.stringify({'event': 'afk', 'body': ''});
            client.send(message);

            // kick the  client from the lobby
            removeClientFromLobby(client);
          }
          else if (lobbies[client.lobbyId].game.countdownTimer >= 0) {
            // make the first possible kick time equal to the starting time of the game (add 5 seconds)
            client.lastMessage = Date.now() + lobbies[client.lobbyId].game.countdownTimer * 1000 + 5000;
          }
      }
    }, afkKickTime);

    client.on('disconnect', function() {
      usersOnline--;
      clearInterval(client.afkKicker);

      removeClientFromLobby(client);

      delete client;
    });
  });
}




module.exports = {
  gameLobbies: lobbies,
  startListening: server_start,
}
