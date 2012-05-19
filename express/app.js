
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

Game = require('./game').Game;
games = new Game();

// Routes
app.get('/', function(req,res) {
  games.all(function(error, docs) {
    console.log(docs[0]);
    console.log(docs[0] && docs[0]._id);
    res.render('gamelist', { title:'Game List', games:docs })
  })
});

app.post('/', function(req,res,data) {
  games.create({ name: req.param('name'),
                 num_players: req.param('num_players') },
               function(error, docs) {
                 res.redirect('/');
               });
});


// /game/id
app.get('/gamewait', function(req,res) {
  var game = s.games[0];
  res.render('gamewait', { game:game });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
