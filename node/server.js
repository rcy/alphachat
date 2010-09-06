var http = require('http');
var h = require('./handlers.js')
var io = require('./socket.io')

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
var socket = io.listen(server, 
                       {transports: ['websocket', /*'flashsocket',*/ 'htmlfile', 
                                     'xhr-multipart', 'xhr-polling', 'jsonp-polling']});

console.log(socket.options.transports);
socket.on('connection', function(client) {
  b_join(socket, client);
  client.send('{"dummy":"hello"}');
  client.on('message', function(data) {
    console.log('message: ' + data);
    b_msg(socket, client, data);
  });
  client.on('disconnect', function() {
    b_part(socket, client);
  });
});

// message send helpers b_==broadcast, s_==send
broadcast = function(socket, obj) {
  socket.broadcast(JSON.stringify(obj));
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
