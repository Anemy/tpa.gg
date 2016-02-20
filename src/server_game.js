/*

This runs an instance of the game on the server, making clients stay legit and having fun

*/
var fs = require('fs');
var vm = require('vm');
var path = require('path');
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

var childStartAgruments = process.argv[2].split('.');
var port = childStartAgruments[0];

console.log('Child: Process started, going to use port: ' + port);

// contains all of the client connections and things pertaining to the lobby
var Lobby = function() {
  this.pop = 0; // players in game
  this.clients = [];

  // boolean says if game is going or not - don't let people join when it's going
  this.inProgress = false;
}

lobby = new Lobby();
game = new Game(true); // sends true because it IS THE SERVER

// Receive message from parent server (JSON format?)
process.on('message', function(m) {
  var messageParts = m.split('.');
  switch (messageParts[0]){
    case 'hello':
      // do something?
      break;
  }
});

// socket io creation and listening
var io = require('socket.io').listen(port);
io.sockets.on('connection', function(client) {

  if(lobby.clients >= maxPlayers) {
    // don't allow them to join! too many people!
    client.send('m.serverFull');
  }
  else if(lobby.inProgress) {
    client.send('m.gameInProgress');
  }
  else {
    // add the client to the game
    lobby.pop++;
    lobby.clients.push(client);

    // handle message from client
    client.on('message', function(message) {
      if(message == null || message == undefined) {
        return;
      }

      var messageParts = message.split('.');
      var messageType = messageParts[0] || null;

      if (messageType == "input") {
        // handle input
      }
      else if (messageType == 'p') { // ping request
        client.send('p.' + messageParts[1]);
      }
    });
  }

  client.on('disconnect', function() {
    // tell the game to remove a player?
  });
});


//the game process kills itself
var suicide = function () {
    console.log("Child: I will now kill myself.    :'(  port: " + port);

    var messageToSend = port.toString()+'.suicide';
    process.send(messageToSend);

    // closing might be async (hense the timeout)
    if(io) {
      io.close();
      setTimeout(function() { io = undefined; }, 60);
    }

    setTimeout(function() {
      process.exit(1);
      console.log("Child: I should now be dead... Ghosts be haunting ooooOOOoooo");
    }, 140);
};

setTimeout(suicide, 3000);