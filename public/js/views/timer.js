define([
], function() {
  var TimerView = Backbone.View.extend({
    el: $("#timer"),
    initialize: function() {
      this.model.bind('start', this.start, this);
      this.model.bind('change', this.render, this);
      this.model.bind('expire', this.expire, this);
      this.render();
    },
    start: function() {
      this.$el.addClass('active');
      this.render();
    },
    template: _.template($('#timer-template').html()),
    render: function() {
      this.$el.html(this.template());
      var $bar = this.$el.find('.bar');
      var percent = this.model.get('percent');
      $bar.css('width', percent + '%');

      if (percent < 10)
        this.$el.removeClass('progress-warning').addClass('progress-danger');
      else if (percent < 50)
        this.$el.removeClass('progress-success').addClass('progress-warning');
      else if (percent == 100) {
        this.$el.addClass('progress-info');
      } else
        this.$el.removeClass('progress-info').addClass('progress-success');
    },
    expire: function() {
      console.log('client timer expired: ' + Date.now());
    }
  });
  return TimerView;
});