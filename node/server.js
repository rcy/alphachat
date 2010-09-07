var http = require('http');
var io = require('./socket.io');

var h = require('./handlers.js');
var game = require('./game.js');

GLOBAL={};
GLOBAL.connections = 0;

routes = {
  '': h.index
};

var server = http.createServer();
server.listen(8124, "0.0.0.0");

server.on('request', function (req, res) {
  process.addListener('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.message);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err && err.message);
  });

  console.log(req.socket.remoteAddress + ' ' + req.method + ' ' + req.url);
  var urlparts = req.url.split('/');
  var handler = routes[urlparts[1]];

  if (handler) {
    handler(req, res);
  } else {
    h.staticFile(req.url, res);
  }
});

// socket.io
var socket = io.listen(server, 
                       {transports: ['websocket', 'flashsocket', 'htmlfile', 
                                     'xhr-multipart', 'xhr-polling', 'jsonp-polling']});

console.log(socket.options.transports);
socket.on('connection', function(client) {
  GLOBAL.connections += 1;
  game.room.lobby.players.push(client);

  client.on('message', function(data) {
    console.log('message: ' + data);
    b_msg(socket, client, data);
  });

  client.on('disconnect', function() {
    GLOBAL.connections -= 1;
    b_part(socket, client);
  });
});

// message send helpers b_==broadcast, s_==send
broadcast = function(socket, obj) {
  socket.broadcast(msg(obj));
}
b_join = function(socket, client) {
  broadcast(socket, {client:client.sessionId, cmd:'join'});
}
b_part = function(socket, client) {
  broadcast(socket, {client: client.sessionId, cmd:'part'});
}
b_msg = function(socket, client, message) {
  broadcast(socket, {client: client.sessionId, cmd:'privmsg', body:message});
}
// returns a jsonified obj with some extra properties added
function msg(obj) {
  obj.connections = GLOBAL.connections;
  return JSON.stringify(obj);
}
