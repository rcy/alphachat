define([
], function() {
  // use a event dispatcher to keep views decoupled
  var dispatcher = _.clone(Backbone.Events)
  return dispatcher;
});

