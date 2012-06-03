define([
], function() {
  var Player = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      nick: 'nobody',
      color: 'black',
      selected: false,
      socketid: 0 // not really used client side, server should hide?
    },
    initialize: function() {
      console.log('initialize Player', this.attributes);
    },
  });
  return Player;
});
