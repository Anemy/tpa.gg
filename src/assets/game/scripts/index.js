/*

This starts up game.js for the local client

*/

var localToken = null;
var socket;
var ping;
var pingInterval;
var game;

var clientId = 0;

var serverEventHandlers = {
  lobbyFound: function(body){
    // console.log("lobby found: " + body);
  },
  ping: function(body){
    // console.log("ping " + body);
    var t = new Date().getTime();
    ping = t - Number(body);
  },
  gameStart: function(body){
    clientId = body.clientId;
    localPlayerID = body.inGameNumber;
    // console.log('Let\'s start this game');

    game = new Game(false);
    game.initGame();
  },
  token: function(body){
    localToken = body;
  },
  gameData: function(body) {
    game.clientParseGameData(body);
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
  // find a game
  $('.joinGame').on('click', function() {
    console.log('try to join game');

    // try to join a game
    var message = JSON.stringify({'event': 'joinGame'});
    socket.send(message);
  })
});



console.log('Game script loaded.');
