
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

  socket.on('disconnect', function() {
    console.log('disconnect');
  });

  socket.on('join', function(data) {
    console.log('join', data);
    console.log('join socket', socket.id);
    var player = new Player({nick: data.nick, socketid: socket.id});

    // send the new player everyone who's in the game
    socket.emit('names', game.players);

    // add this player to the game
    game.players.push(player);

    // send everyone the new players info
    io.sockets.emit('join', player);
  });

  socket.on('chat', function(data) {
    console.log('chat from',socket.id)
    io.sockets.emit('chat', {sender: socket.id, body: data.body});
  });
});

// todo: remove this, just return a unique index an let the client figure out the color
function random_color() {
  var c = ['red', 'green', 'blue', 'orange', 'purple'];
  return c[Math.floor(Math.random()*c.length)];
}

// mongoose
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/alphachat');
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
});

var Player = mongoose.model('Player', playerSchema);

var gameSchema = new Schema({
  players: [playerSchema]
});

var Game = mongoose.model('Game', gameSchema);

game = new Game();
// p = new Player({nick: 'realplayer', color: 'pink'});
// console.log(p);

// game.players.push({nick: 'rcy', color: 'green'})
// game.players.push({nick: 'bob', color: 'yellow'})
// game.players.push(p)
// game.save(function(err,doc) {
//   console.log('callback on game save:', err, doc);
// });
// p.nick = 'unrealplayer';
// p.save();
