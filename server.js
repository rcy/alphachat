server = require('./httpsocket.js');
ac = require('./alphachat.js');
server.start(process.argv[2] || 80, 'public', ac.handlers);

// add a repl
require("net").createServer(function (socket) {
  require("repl").start("alphachat.node> ", socket);
}).listen(5001);
