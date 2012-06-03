define([
  'models/message'
], function(Message) {
  var MessageCollection = Backbone.Collection.extend({
    model: Message,
    initialize: function() {
      console.log('initialize MessageCollection');
      this.bind("add", function(msg) {
        console.log('added msg: '+msg.get('body'));
      });
    }
  });

  return new MessageCollection;
});

