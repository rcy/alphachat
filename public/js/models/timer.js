define(
  [
  ],
  function() {
    var Timer = Backbone.Model.extend({
      defaults: {
        seconds: 60,
        percent: 100
      },
      initialize: function() {
      },
      start: function(seconds) {
        clearTimeout(this.tickTimer);
        this.set('seconds', seconds || this.defaults.seconds);
        this.set('percent', 101);
        this.set('start_time', Date.now());
        this.update();
        this.trigger('start', seconds);
      },
      stop: function() {
        clearTimeout(this.tickTimer);
      },
      reset: function() {
        this.set('percent', 100);
      },
      update: function() {
        var that = this;
        var percent = (100 - ((Date.now() - this.get('start_time')) / (1000*this.get('seconds')) * 100));
        if (percent < 0) percent = 0;
        this.set('percent', percent); // this triggers view update
        if (percent > 0) {
          this.tickTimer = setTimeout(function() { that.update(); }, 100);
        } else {
          this.trigger('expire');
        }
      }
    });
    return Timer;
  });
