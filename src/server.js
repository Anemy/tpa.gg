require('dotenv').config({
  path: '../.env',
  silent: true
});

const portNum = (process.env.PORT || 8080);

var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var app = express();
app.set('port', portNum);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server_game = require('./server_game');
// console.log('servergame: ' + server_game);
// console.log('servergame: ' + JSON.stringify(server_game));


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
});

// starts the socket listening on portNum
server_game.startListening(server, portNum);