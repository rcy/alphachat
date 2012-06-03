define([
  'models/player'
], function(Player) {
  var PlayerCollection = Backbone.Collection.extend({
    model: Player,
    initialize: function() {
      console.log('initialize PlayerCollection');
      this.bind("add", function(player) {
        console.log('added player: '+player.get('nick'));
      });
    }
  });
  return new PlayerCollection;
});
