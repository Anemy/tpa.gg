/*

This runs an instance of the game on the server, making clients stay legit and having fun

*/


var fs = require('fs');
var vm = require('vm');
var path = require('path');
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

// Receive message from parent server (JSON format?)
process.on('message', function(m) {
  var messageParts = m.split('.');
  switch (messageParts[0]){
    case 'hello':
      // do something?
      break;
  }
});

// contains all of the client connections and things pertaining to the lobby
var lobby = function() {
  this.pop = 0; // players in game
  this.clients = [];
}

// game = new Game();
// game.startGameLoop();

// socket io creation and listening
var io = require('socket.io').listen(port);
io.sockets.on('connection', function(client) {
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