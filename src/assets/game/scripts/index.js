/*

This starts up game.js for the local client

*/

var localToken = null;
var socket;
var ping;
var pingInterval;

// clientside running for now
$(document).ready(function() {
  // keep polling servers until we find an available one
  // console.log('Connect to: ' + window.location.hostname + ":" + basePort);

  socket = io();

  // recieveing unique local token (currently unused...)
  socket.on('token', function(token) {
    localToken = token;
  });

  // start ping interval
  pingInterval = setInterval(function() {
    socket.send('p.' + (new Date().getTime()));
  }, 1000);

  // handle mesages from the server
  socket.on('message', function (message) {
    // console.log(message);
    var messageParts = message.split('.');
    var messageType = messageParts[0] || null;

    if (messageType == "m") {
      if(messageParts[1] == 'lobbyFound') {
        // lobby has been found to play in
        // console.log('Lobby found.');
      }
    }
    else if (messageType == 'p') { // ping request
      ping = (new Date().getTime()) - messageParts[1];
      // console.log('My ping: ' + ping);
    }
  });

  socket.on('game start', function(message) {
    game = new Game(false);
    game.initGame();
  });

  // find a game
  $('#joinGame').on('click', function() {
    console.log('try to join game');

    // try to join a game
    socket.send("m.joinGame");
  })
});



console.log('Game script loaded');