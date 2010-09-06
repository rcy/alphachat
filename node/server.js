var http = require('http');
var h = require('./handlers.js')
var io = require('./socket.io')

routes = {
  '': h.index
};

var server = http.createServer();

server.listen(8124, "127.0.0.1");

server.on('request', function (req, res) {
  process.addListener('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.message);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err && err.message);
  });

  console.log(req.socket.remoteAddress + ' ' + req.method + ' ' + req.url);
  var urlparts = req.url.split('/');
  //console.log(urlparts);
  var handler = routes[urlparts[1]];

  if (handler) {
    handler(req, res);
  } else {
    h.staticFile(req.url, res);
    //res.writeHead(404, {'Content-Type': 'text/plain'});
    //res.end('404');
  }
});

// socket.io
var socket = io.listen(server);
socket.on('connection', function(client) {
  console.log('connection');
  client.on('message', function() {
    console.log('message');
  });
  client.on('disconnect', function() {
    console.log('disconnect');
  });
});
