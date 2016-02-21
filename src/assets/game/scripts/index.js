/*

This starts up game.js for the local client

*/

var localToken = null;
var socket;
var ping;
var pingInterval;
var game;

var inGame = false;

var clientId = 0;

var serverEventHandlers = {
  lobbyFound: function(body){
    // console.log("lobby found: " + body);
    $('.statusText').text('Lobby Found: ' + body + '/' + minPlayers + ' Players');
    document.title = 'Lobby found!';
  },
  ping: function(body){
    // console.log("ping " + body);
    var t = new Date().getTime();
    ping = t - Number(body);
  },
  gameStart: function(body){
    clientId = body.clientId;
    
    inGame = true;

    $('.statusText').text('Game starting!');

    // console.log('Let\'s start this game');
    document.title = 'GAME FOUND!';
    $('.gameSearcher').fadeOut(500);
    $('.statusText').fadeOut(500);
    $('.waitAnimation').fadeOut(500);
    setTimeout(function(){document.title = 'GAME STARTING!!!!'},2000);
    setTimeout(function(){document.title = 'GO GO GO!!!!'},4000);
    setTimeout(function(){document.title = 'tpa'},6000);

    game = new Game(false);
    localPlayerID = body.inGameNumber;
    game.startGameLoop();
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

  game = new Game(false);
  game.players.push(new Player(gameWidth/2, gameHeight/2));
  game.countdownTimer = 0;
  game.initGame();

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
    // console.log('try to join game');
    document.title = 'Searching for game...';
    $('.statusText').text('Searching for a game...');

    $('.joinGame').fadeOut(500);

    setTimeout(function() {
      $('.statusText').fadeIn(500);
      $('.waitAnimation').fadeIn(500);
    }, 1000);

    // give it that little wait before searching for the game
    setTimeout( function() {
      // try to join a game
      var message = JSON.stringify({'event': 'joinGame'});
      socket.send(message);
    }, 2000);
  })
});



console.log('Game script loaded.');
