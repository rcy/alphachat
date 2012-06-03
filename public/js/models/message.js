define([
  'models/player'
], function(Player) {
  var Message = Backbone.Model.extend({
    defaults: {
      player: null,
      body: ""
    },
    initialize: function() {
      console.log('initialize Message');
      this.set('time', (new Date).toString().split(/ /)[4]);
    }
  });
  return Message;
});
