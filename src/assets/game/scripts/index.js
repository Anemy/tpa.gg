/*

This js handles the webpage interactions

*/

// just a basic rate lmiiter for join game
var joinGameLastClick = 0;

// clientside running for now
$(document).ready(function() {

  // call connection.js to set up socket io
  createConnection();

  // if they have a small window, give them the resize
  if(window.innerHeight > 600 && window.innerHeight < 900) {
    width = 800;
    height = 600;

    $('.gameSearcher').css('top', '100px');
    $('.gameSearcher').css('left', '100px');
  }

  // load local scores
  if(!localStorage.getItem("tpa_defeat")) {
    localStorage.setItem("tpa_defeat", 0);
    localStorage.setItem("tpa_victory", 0);
  }

  $('.wins').text('Wins: ' + localStorage.getItem("tpa_victory"));
  $('.losses').text('Losses: ' + localStorage.getItem("tpa_defeat"));

  // find a game clicked
  $('.joinGame').on('click', function() {
    if(Date.now() - joinGameLastClick > 1000) { // just a base rate limiter
      joinGameLastClick = Date.now();

      findAGame();
    }
  });

  // someone hit enter in name input - join a game
  $('.nameInput').keypress(function(event) {
    if (event.which == 13) { // enter key
      if(Date.now() - joinGameLastClick > 1000) { // just a base rate limiter
        joinGameLastClick = Date.now();

        findAGame();
      }
    }
  });

  // click back when searching
  $('.backButton').click(function() {

  });

  // creates a game to run in the background of the webpage while the user is on the menu
  game = new Game(false);
  game.players.push(new Player(gameWidth/2, gameHeight/2));
  game.countdownTimer = 0;
  game.initGame();
});



console.log('Game script loaded.');
