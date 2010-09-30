server = require('./httpsocket.js');
ac = require('./alphachat.js');
server.start(8124, 'public', ac.handlers);

// add a repl
require("net").createServer(function (socket) {
  require("repl").start("alphachat.node> ", socket);
}).listen(5001);
