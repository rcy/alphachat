define([
  'models/player', 'collections/player', 'views/player',
  'models/message', 'collections/message','views/message',
  'models/timer', 'views/timer',
  'dispatcher'
], function(Player, Players, PlayerView, 
            Message, Messages, MessageView,
            Timer, TimerView, 
            dispatcher) {
  var AppView = Backbone.View.extend({
    el: $("#app"),

    initialize: function() {
      this.$el.show();
      Messages.bind('add', this.addMessage, this);
      Players.bind('add', this.addPlayer, this);
      this.connectedEl = $('#connected');

      this.timer = new Timer();
      this.timer.reset();
      this.timerView = new TimerView({model: this.timer});

      dispatcher.bind('vote', this.vote, this);
    },

    vote: function(player) {
      _.each(Players.models, function(p) {
        p.set('selected', (p == player));
      });
      this.trigger('vote', player);
    },

    start_timer: function(obj) {
      this.timer.start(obj.seconds);
    },

    stop_timer: function(obj) {
      this.timer.stop();
      //alert('times up');
    },

    addMessage: function(msg) {
      var view = new MessageView({model: msg});
      this.$("#msg-list").append(view.render().el);
    },

    addPlayer: function(player) {
      var view = new PlayerView({model: player});
      var $container;
      if (player.get('self') === true)
        this.$("#self").html(player.get('nick'));
      else
        this.$("#opponents").append(view.render().el);
    },

    socketPlayer: function(socketid) {
      return Players.where({socketid: socketid})[0];
    },

    connect: function() {
      this.connectedEl.html('connected');
      this.connectedEl.removeClass('label-important');
      this.connectedEl.addClass('label-success');
    },

    disconnect: function() {
      this.connectedEl.html('disconnected');
      this.connectedEl.removeClass('label-success');
      this.connectedEl.addClass('label-important');
    }

  });
  return AppView;
});
