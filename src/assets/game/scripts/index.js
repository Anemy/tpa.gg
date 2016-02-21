/*

This starts up game.js for the local client

*/

var localToken = null;
var socket;
var ping;
var pingInterval;
var game;

var serverEventHandlers = {
  lobbyFound: function(body){
    console.log("lobby found: " + body);
  },
  ping: function(body){
    console.log("ping " + body);
    var t = new Date().getTime();
    ping = t - Number(body);
  },
  gameStart: function(body){
    localPlayerID = body;
    console.log('Let\'s start this game');

    game = new Game(false);
    game.initGame();
  },
  token: function(body){
    localToken = body;
  }
}

// clientside running for now
$(document).ready(function() {
  socket = io();

  // start ping interval
  pingInterval = setInterval(function() {
    var t = new Date().getTime();
    var message = JSON.stringify({'event': 'ping', 'body': t});
    socket.send(message);
  }, 1000);

  // handle mesages from the server
  socket.on('message', function (m) {

    var message = JSON.parse(m);
    if (message['event'] !== undefined
        && serverEventHandlers[message['event']] !== undefined) {
      var eventName = message['event'];
      var eventBody = message['body'];
      serverEventHandlers[eventName](eventBody);
    }
  });

  // bind the game thing
  socket.on('gameData', function(data) {
    game.clientParseGameData(data);
  });

  // find a game
  $('#joinGame').on('click', function() {
    console.log('try to join game');

    // try to join a game
    var message = JSON.stringify({'event': 'joinGame'});
    socket.send(message);
  })
});



console.log('Game script loaded');
