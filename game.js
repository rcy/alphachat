// Model
Game = function(){};

Game.prototype.data = [];

Game.prototype.id_counter = 1;

Game.prototype.all = function(callback) {
  callback(null, this.data);
}

Game.prototype.create = function(game, callback) {
  game.players = [];
  game._id = this.id_counter++;
  this.data.push(game);
  callback(null, this.data);
}

Game.prototype.save = function(game, callback) {
  this.find_by_id(game._id, function(error, doc) {
    doc.players = game.players;
    doc.players_needed = game.players_needed;
    callback(null, doc);
  });
}

Game.prototype.find_by_id = function(id, callback) {
  for (var i = 0; i < this.data.length; i++) {
    if (this.data[i]._id == id) {
      callback(null, this.data[i]);
      return;
    }
  }
  callback();
}

exports.Game = Game;
