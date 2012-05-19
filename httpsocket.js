var sys = require('util');
var static = require('node-static');
var io = require('socket.io');

exports.start = function(port, docdir, handlers) {
  //
  // Create a node-static server to serve docdir on port
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

  sys.puts("> node-static is listening on http://127.0.0.1:"+port);

  //
  // setup socket.io layer
  //
  var socket = io.listen(server);
  socket.on('connection', function(client) {
    client.on('cmd', function(obj) {
      if (handlers && obj && handlers[obj.cmd]) {
        handlers[obj.cmd](client, obj);
      } else {
        sys.puts("no handler for: " + sys.inspect(obj));
        sys.puts(typeof obj);
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
