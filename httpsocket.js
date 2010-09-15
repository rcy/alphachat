var sys = require('sys');
var static = require('node-static');
var io = require('./socket.io');

exports.start = function(addr, port, docdir, handlers) {
  //
  // Create a node-static server to serve docdir on addr:port
  //
  var file = new(static.Server)(docdir, { cache: 7200, headers: {} });

  var server = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      //
      // Serve files!
      //
      file.serve(request, response, function (err, res) {
        if (err) { // An error as occured
          sys.error("> Error serving " + request.url + " - " + err.message);
          response.writeHead(err.status, err.headers);
          response.end();
        } else { // The file was served successfully
          sys.puts("> " + request.url + " - " + res.message);
        }
      });
    });
  });
  server.listen(port);

  sys.puts("> node-static is listening on http://"+addr+":"+port);

  //
  // setup socket.io layer
  //
  var socket = io.listen(server);
  socket.on('connection', function(client) {
    client.on('message', function(obj) {
      if (handlers && obj && handlers[obj.cmd]) {
        handlers[obj.cmd](client, obj);
      } else {
        sys.puts("no handler for: " + sys.inspect(obj));
      }
    });
    client.on('disconnect', function() {
      handlers 
        && handlers['disconnect'] 
        && handlers['disconnect'](client);
    });
  });
  sys.puts('registered handlers: ' + sys.inspect(handlers));
  
  return server;
}
