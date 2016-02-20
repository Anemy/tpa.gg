require('dotenv').config({
  path: '../.env',
  silent: true
});
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


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
});
