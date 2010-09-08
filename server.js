var http = require('http');
var io = require('./socket.io');

var h = require('./handlers.js');
var game = require('./game.js');
var GLOBAL = require('./globals.js');

game.setglobs(GLOBAL);

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

function warn(obj) { console.log('WARNING:0: ', obj); }

console.log(socket.options.transports);
socket.on('connection', function(client) {
  GLOBAL.connections += 1;

  client.on('message', function(obj) {
    console.log('message: [' + client.sessionId + '] ' + obj);
    if (obj && game && game.messageHandler && game.messageHandler[obj.cmd]) {
      game.messageHandler[obj.cmd](client, obj);
    } else {
      warn("no handler for: " + obj);
    }
  });

  client.on('disconnect', function() {
    GLOBAL.connections -= 1;
    warn("clean up data structures containing this client");
  });
});
