var express = require('express');
var app = module.exports = express.createServer();
var coffeescript = require('coffee-script')

var Match = require('./lib/match');
var MatchList = require('./lib/match_list');

function checkerr(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

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

var io = require('socket.io').listen(app);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  io.configure(function () {
    // websockets are not supported on heroku's cedar stack
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });
  app.use(express.errorHandler());
});

// Routes
app.get('/', function(req,res) {
  res.render('index');
});

app.get('/play', function(req,res) {
  res.render('play');
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var DEFAULT_MATCH_OPTIONS = {seconds_per_round: 5, num_players_needed: 3};
var matches = new MatchList;

io.sockets.on('connection', function(socket) {
  console.log('connection!', socket.id);

  socket.on('disconnect', function() {
    socket.get('player', function(err, player) {
      checkerr(err);
      if (player) {
        var match = player.match;
        var nick = player.nick;
        console.log('disconnect get nick: ', err, nick);
        match.remove_player(nick);
        io.sockets.in(match.id).emit('part', {nick: nick, reason: 'disconnect'});
        socket.leave(match.id);
      }
    });
  });

  socket.on('join', function(data) {
    matches.get_or_create(DEFAULT_MATCH_OPTIONS, function(match) {
      match.add_player(function(nick) {
        socket.set('player', {match: match, nick: nick}, function(err) {
          checkerr();
          socket.emit('names', {nicks: match.nicks, self: nick});
          io.sockets.in(match.id).emit('join', nick);
          socket.join(match.id);
        });
      });
    });
  });

  matches.on('create_match', function(match) {
    console.log('creating new match', match);

    match.on('start_round', function(options) {
      io.sockets.in(match.id).emit('start_timer', {seconds: options.seconds});
    });

    match.on('end_round', function() {
      io.sockets.in(match.id).emit('stop_timer');
    });
  });

  socket.on('chat', function(data) {
    socket.get('player', function(err, player) {
      checkerr(err);
      io.sockets.in(player.match.id).emit('chat', {sender: player.nick, body: data.body});
    });
  });

});
