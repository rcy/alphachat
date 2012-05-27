
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
  //console.log('connection!', socket);

  socket.on('disconnect', function() {
    console.log('disconnect');
  });

  socket.on('join', function(data) {
    console.log('join', data);
    var nick = data.nick;
    io.sockets.emit('join', { socket_id: socket.id, name: nick, color: random_color() });
    socket.emit('chat', { sender: 'server', body: 'hello '+nick });
  });

  socket.on('chat', function(data) {
    io.sockets.emit('chat', {sender: socket.id, body: data.body});
  });
});

// todo: remove this, just return a unique index an let the client figure out the color
function random_color() {
  var c = ['red', 'green', 'blue', 'orange', 'purple'];
  return c[Math.floor(Math.random()*c.length)];
}