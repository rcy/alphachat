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

// Routes
app.get('/', function(req,res) {
  res.render('index');
});

app.get('/play', function(req,res) {
  res.render('play', {nick: req.param('nick')});
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var io = require('socket.io').listen(app);

io.configure(function () {
  // websockets are not supported on heroku's cedar stack
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

io.sockets.on('connection', function(socket) {
  console.log('connection!', socket.id);

  var remove = function() {
    console.log('remove');
    Player.findOne({'socketid': socket.id}).run(function(err, doc) {
      console.log('removing:', doc);
      if (err) return console.log(err);
      if (doc) {
        io.sockets.emit('part', doc);
        doc.remove();
      }
    });
  }

  socket.on('disconnect', function() {
    console.log('disconnect');
    remove();
  });

  socket.on('part', function() {
    console.log('part');
    remove();
  });

  socket.on('join', function(data) {
    console.log('join', data);
    console.log('join socket', socket.id);

    // send the new player everyone who's in the game
    Player.find().where('game', game).run(function(err, opponents) {
      socket.emit('names', opponents);

      // add this player to the game
      var player = new Player({nick: random_nick(), socketid: socket.id, game: game});
      player.save(function(err, doc) {
        // send everyone the new player's info
        socket.broadcast.emit('join', doc);

        // mark the player object returned to this player as self
        socket.emit('join', {_id: doc._id, game: doc.game, nick: doc.nick, self: true, socketid: socket.id});

        // if there are enough opponents, start game
        var num_players = 2;
        if ((opponents.length + 1) >= num_players) {
          var seconds = 10;
          io.sockets.emit('start_timer', {seconds: seconds});
          setTimeout(function() {
            io.sockets.emit('stop_timer');
          }, seconds * 1000);
        }
      });
    });
  });

  socket.on('chat', function(data) {
    console.log('chat from',socket.id)
    io.sockets.emit('chat', {sender: socket.id, body: data.body});
  });

  socket.on('vote', function(data) {
    Player.findOne({'socketid': socket.id}).run(function(err, player) {
      if (err) return console.log(err);
      Player.findOne({'_id': data._id}).run(function(err, vote) {
        if (err) return console.log(err);
        player.vote = vote;
        player.save(function(err,data) {
          console.log('saved player', player);
        });
      });
    });
  });
});

function random_nick() {
  var names = ["Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", 
               "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];

  return names[Math.floor(Math.random()*names.length)]
}


// mongoose
var mongoose = require('mongoose')
var mongo_url = process.env.MONGOHQ_URL || 'mongodb://localhost/alphachat';
mongoose.connect(mongo_url);
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.connection.on('open', function() {
  console.log('mongo.connection open');
});
mongoose.connection.on('error', function(msg) {
  console.log('mongo.connection error',msg);
  process.exit(1);
});

var playerSchema = new Schema({
  nick:     { type: String, required: true },
  socketid: { type: String, required: true },
  vote:     ObjectId, // vote is a player
  game:     ObjectId
});

var Player = mongoose.model('Player', playerSchema);

var gameSchema = new Schema({
});

var Game = mongoose.model('Game', gameSchema);

game = new Game();
game.save(function() {
  console.log("game saved");
});
