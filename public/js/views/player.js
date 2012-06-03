define([
  'dispatcher'
], function(dispatcher) {
  var PlayerView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#player-template').html()),
    events: {
      "click a": "vote"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('remove', this.remove, this);
    },
    remove: function() {
      this.$el.fadeOut();
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      if (this.model.get('selected'))
        this.$el.addClass('active');
      else
        this.$el.removeClass('active');
      return this;
    },
    vote: function() {
      if (!this.model.get('selected'))
        dispatcher.trigger('vote', this.model);
    }
  });
  return PlayerView;
});