var room = exports;

room.players = [];
room.addPlayer = function(player) { 
  if (!this.findPlayer(player)) {
    this.players.push(player);
  }
};
room.findPlayer = function(player) {
  for (var i in this.players) {
    if (this.players[i] === player) {
      return i;
    }
  }
};
room.delPlayer = function(player) {
  var i = this.findPlayer(player);
  if (i) {
    this.players.splice(i,1);
  }
};
