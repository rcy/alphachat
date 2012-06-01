// use a event dispatcher to keep views decoupled
var dispatcher = _.clone(Backbone.Events)

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

var PlayerList = Backbone.Collection.extend({
  model: Player,
  initialize: function() {
    console.log('initialize PlayerList');
    this.bind("add", function(player) {
      console.log('added player: '+player.get('nick'));
    });
  }
});

var Players = new PlayerList;

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

var MessageList = Backbone.Collection.extend({
  model: Message,
  initialize: function() {
    console.log('initialize MessageList');
    this.bind("add", function(msg) {
      console.log('added msg: '+msg.get('body'));
    });
  }
});

var Messages = new MessageList;

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
