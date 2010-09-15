server = require('./httpsocket.js');
ac = require('./alphachat.js');
server.start('127.0.0.1', 8124, 'public', ac.handlers);

var net = require("net");
var repl = require("repl");
net.createServer(function (socket) {
  repl.start("alphachat.node> ", socket);
}).listen(5001);

