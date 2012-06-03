define([
], function() {
  var MessageView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#message-template').html()),

    initialize: function() {
      //    this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  return MessageView;
});
