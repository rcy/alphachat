var express = require('express');
var app = module.exports = express.createServer();

if (process.env.REDISTOGO_URL) {
  // heroku setup for redis
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  // local development redis
  var redis = require("redis").createClient();
}

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

var ROOM_ID = "42";
function create_game(id) {
  redis.flushdb();
  var names = ["Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", 
               "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];
  for (var i in names) {
    redis.sadd('room:'+id+':nicks:unused', names[i]);
  }
}
create_game(ROOM_ID);

io.sockets.on('connection', function(socket) {
  console.log('connection!', socket.id);

  socket.on('disconnect', function() {
    socket.get('nick', function(err, nick) {
      console.log('disconnect get nick: ', err, nick);
      checkerr(err);
      io.sockets.in(ROOM_ID).emit('part', {nick: nick, reason: 'disconnect'});
      redis.smove('room:'+ROOM_ID+':nicks:alive', 
                  'room:'+ROOM_ID+':nicks:unused', nick, 
                  function(err, data) {
                    checkerr(err);
                  });
    });
  });

  socket.on('join', function(data) {
    redis.spop('room:'+ROOM_ID+':nicks:unused', function(err, nick) {
      checkerr(err);
      socket.set('nick', nick);
      socket.set('state', 'alive');
      redis.sadd('room:'+ROOM_ID+':nicks:alive', nick, function(err, data) {
        checkerr(err);
        redis.smembers('room:'+ROOM_ID+':nicks:alive', function(err, nicks) {
          checkerr(err);
          io.sockets.in(ROOM_ID).emit('join', nick);
          socket.emit('names', {nicks: nicks, self: nick});
          socket.join(ROOM_ID);
        });
      });
    });
  });

  socket.on('chat', function(data) {
    socket.get('nick', function(err, nick) {
      checkerr(err);
      io.sockets.in(ROOM_ID).emit('chat', {sender: nick, body: data.body});
    });
  });

  socket.on('vote', function(id) {
    socket.get('nick', function(err, nick) {
      console.log(nick, 'voted for', id);
      redis.set('room:'+ROOM_ID+':vote:'+nick, id, checkerr);
      socket.emit('vote', id); // server confirms the vote
    })
  });
});
