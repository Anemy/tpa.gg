/*

This contains all of the connection with the server handling 

*/

// client game object
var game;

var inGame = false;

// for client player controls
var localPlayerID = 0;

var usersOnline = -1;

var localToken = null;
var socket;
var ping;
var pingInterval;

var clientId = 0;

var showingAfkMessage = false;

var victoryStrings = [
  "Victory!!",
  "Victory!! Nice one.",
  "Victory!! Slick stuff",
  "Victory!! Good job",
  "Fantastic Victory.",
  "Excellent Victory.",
  "You are the greatest.",
  "That was incredible. VICTORY!"];

var defeatStrings = [
  "Defeat.",
  "Better luck next time.",
  "You may have lost the battle.",
  "You have been defeated"];

var serverEventHandlers = {
  lobbyFound: function(body) {
    // console.log("lobby found: " + body);
    $('.statusText').text('Lobby Found: ' + body + '/' + minPlayers + ' Players');
    document.title = body + '/' + minPlayers + ' Waiting...';
  },
  ping: function(body) {
    if(body.usersOnline != usersOnline) {
      usersOnline = body.usersOnline;
      $('.playerCount').text("Players Online: " + usersOnline);
    }

    // console.log("ping " + body);
    var t = new Date().getTime();
    ping = t - Number(body.ping);
  },
  gameStart: function(body) {
    clientId = body.clientId;
    
    inGame = true;

    $('.statusText').text('Game starting!');

    // console.log('Let\'s start this game');
    document.title = 'GAME FOUND!';
    $('.gameSearcher').fadeOut(500);
    setTimeout(function(){document.title = 'GAME STARTING!!!!';},2000);
    setTimeout(function(){document.title = 'GO GO GO!!!!';},4000);
    setTimeout(function(){document.title = 'tpa.gg';},6000);

    clearInterval(game.gameLoopInterval);
    game = new Game(false);
    localPlayerID = body.inGameNumber;
    game.startGameLoop();
  },
  token: function(body) {
    localToken = body;
  },
  gameData: function(body) {
    game.clientParseGameData(body);
  },
  gameEnd: function(body) {

    inGame = false;

    // start the game slowdown end game effect
    game.slowTime = true;

    var resultString = "Uh... Tie?";
    if(Number(body) == localPlayerID) { 
      localStorage.setItem("tpa_victory", Number(localStorage.getItem("tpa_victory")) + 1);

      $('.wins').text('Wins: ' + localStorage.getItem("tpa_victory"));
      
      resultString = victoryStrings[Math.floor(Math.random() * defeatStrings.length)];
    }
    else if(Number(body) >= 0) {
      localStorage.setItem("tpa_defeat", Number(localStorage.getItem("tpa_defeat")) + 1);

      $('.losses').text('Losses: ' + localStorage.getItem("tpa_defeat"));

      resultString = defeatStrings[Math.floor(Math.random() * defeatStrings.length)];
    }

    // console.log('try to join game');
    document.title = resultString;
    $('.statusText').text(resultString);

    setTimeout(function() {
      $('.gameSearcher').fadeIn(1000);

      document.title = 'tpa.gg';

      // give it that little wait before searching for the game
      setTimeout( function() {
        // Game has ended, set up the background game
        clearInterval(game.gameLoopInterval);

        delete game;
        game = new Game(false);

        localPlayerID = 0;

        game.players.push(new Player(gameWidth/2, gameHeight/2));
        game.countdownTimer = 0;
      }, 4000);
    }, 1500);

    setTimeout( function() {
      $('.statusText').text('Searching for a game...');

      // give it that little wait before searching for the game
      setTimeout( function() {
        // try to join a game
        var message = JSON.stringify({'event': 'joinGame'});
        socket.send(message);
      }, 3000);
    }, 9000);
  },
  afk: function(body) {
    $('.statusText').text("Kicked for inactivity");

    showingAfkMessage = true;
    // show the afk message
    $('.afkMessage').css('display', 'block');

    // give it that little wait before searching for the game
    setTimeout( function() {
      showMainMenu();
    }, 4000);
  }
}


var createConnection = function() {
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
}

var findAGame = function() {
  // send the new username to the server
  var message = JSON.stringify({'event': 'nameChange', 'body': $('.nameInput').val()});
  socket.send(message);

  // tab title changing
  document.title = 'Searching for game...';
  $('.statusText').text('Searching for a game...');

  $('.joinGame').fadeOut(500);
  $('.nameInput').fadeOut(500);
  if(showingAfkMessage) {
    $('.afkMessage').fadeOut(500);
    showingAfkMessage = false;
  }

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
}

var showMainMenu = function() {
  document.title = 'tpa.gg';

  $('.gameSearcher').fadeIn(1000);

  $('.joinGame').css('display', 'block');
  $('.nameInput').css('display', 'block');

  $('.statusText').css('display', 'none');
  $('.waitAnimation').css('display', 'none');

  // Game has ended, set up the background game
  if(inGame) {
    clearInterval(game.gameLoopInterval);

    delete game;

    inGame = false;
  }

  game = new Game(false);

  localPlayerID = 0;

  game.players.push(new Player(gameWidth/2, gameHeight/2));
  game.countdownTimer = 0;
}