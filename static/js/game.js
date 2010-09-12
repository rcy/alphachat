io.setPath('/js/');

var Game = function(player) {
  var self = this;
  this.socket = new io.Socket();
  this.player = new Player(this, player);

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
    case 'canChat':
      self.player.canChat = obj.enabled;
      break;
    default:
      self.log(["WARNING: unhandled command: ", obj]);
    }
    self.callbacks[obj.cmd](self.player, obj);
  });
};

var Player = function(game, player) {
  this.name = player.name;
  this.game = game;
};

Game.prototype.log = function(obj) { console && console.log('Game: ' + JSON.stringify(obj)); }
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
Game.prototype.send = function(cmd, body) {
  var o = {cmd:cmd, body:body};
  this.log(["send: --> ", o]);
  this.socket.send(o);
};

// send after connecting
Player.prototype.announce = function() {
  this.game.send('announce');
};
// send to request joining a game
Player.prototype.play = function() {
  this.game.send('play');
};
// send to request joining a game
Player.prototype.vote = function(color) {
  this.game.send('vote', color);
};
