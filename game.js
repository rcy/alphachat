var server = require('./httpsocket.js');
var alphachat = require('./alphachat.js');
server.start('127.0.0.1', 8124, 'public', alphachat.handlers);
