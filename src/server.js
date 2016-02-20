require('dotenv').config({
  path: '../.env',
  silent: true
});
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var child_process = require('child_process');

var children = [];
// the port where games run off of to start
const portStart = 4456;

mongoose.connect(process.env.MONGODB);


var app = express();
app.set('port', (process.env.PORT || 8080));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('views', 'views')
app.engine('.hbs', exphbs({
  layoutsDir: 'views/layouts/',
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', '.hbs');


app.use('/assets',  express.static('./assets'));


var homeController = require('./controllers/home');


app.get('/', homeController.getRoot);

app.get('*', function(req, res) {
  res.sendStatus(404);
});


var server = app.listen(app.get('port'), function () {
  console.log('the server is listening on port %s', app.get('port'));

  var args = [portStart];

  // starting a process for users to play games on 
  children.push(child_process.fork(__dirname + "/server_game.js", args));
});


// register external process exits
var cleanExit = function() { process.exit() };
process.once("SIGINT", cleanExit); // catch ctrl-c
process.once("SIGTERM", cleanExit); // catch kill

// handle exit by killing children
process.once("exit", function() {
    console.log("Killing children");
    children.forEach(function(child) {
        child.kill();
        console.log("Child eliminated.");
    });
});
