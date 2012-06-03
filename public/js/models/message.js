define([
  'models/player'
], function(Player) {
  var Message = Backbone.Model.extend({
    defaults: {
      player: new Player(),
      body: "Hi I'm me, I'm using this to sell you this"
    },
    initialize: function() {
      console.log('initialize Message');
      this.set('time', (new Date).toString().split(/ /)[4]);
    }
  });
  return Message;
});
