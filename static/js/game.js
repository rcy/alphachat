io.setPath('/js/');

var Game = function() {
  var self = this;
  this.socket = new io.Socket();
  this.player = new Player(this);

  this.socket.on('connect', function(){
    self.log('connected');
    self.player.connected = true;
    self.player.messageCount = 0;
    self.callbacks.connect(self.player);
  });
  this.socket.on('disconnect', function(){
    self.log('disconnected');
    self.player.connected = false;
    self.callbacks.disconnect(self.player);
  });
  this.socket.on('message', function(obj){
    self.log(["recv: <-- ", obj]);
    self.player.messageCount += 1;
    switch (obj.cmd) {
    case 'init':
      self.player.opponents = obj.opponents;
      self.player.color = obj.color;
      self.player.name = obj.name;
    case 'canChat':
      self.player.canChat = obj.enabled;
      break;
    case 'motd':
      break;
    default:
      self.log(["WARNING: unhandled case: ", obj]);
    }
    var cb = self.callbacks[obj.cmd];
    if (cb) {
      cb(self.player, obj);
    } else {
      self.log(["NO HANDLER:", obj])
    }
  });
};

Game.prototype.log = function(obj) { 
  typeof(console) != 'undefined' 
    && typeof(JSON) != 'undefined'
    && console.log(JSON.stringify(obj));
};
Game.prototype.callbacks = {};
Game.prototype.on = function(cmd, fn) {
  this.callbacks[cmd] = fn;
};
Game.prototype.connect = function() {
  return this.socket.connect();
};
Game.prototype.disconnect = function() {
  return this.socket.disconnect();
};
Game.prototype.send = function(cmd, obj) {
  var obj = obj || {};
  obj.cmd = cmd;
  this.log(["send: --> ", obj]);
  this.socket.send(obj);
};

var Player = function(game) {
  this.game = game;
};

// send after connecting
Player.prototype.announce = function(name) {
  this.game.send('announce', {name:name});
};
// send to request joining a game
Player.prototype.play = function() {
  this.game.send('play');
};
// send to request joining a game
Player.prototype.privmsg = function(text) {
  this.game.send('privmsg', {body: text});
};
// send to request joining a game
Player.prototype.pick = function(color) {
  this.game.send('pick', {pick: color});
};
