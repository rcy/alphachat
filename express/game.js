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

Game.prototype.find_by_id = function(id, callback) {
  // TODO
}

exports.Game = Game;
