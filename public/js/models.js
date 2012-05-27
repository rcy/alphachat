var Player = Backbone.Model.extend({
  defaults: {
    name: 'nobody',
    color: 'black',
    socket_id: 0  // the server refers to players by the websocket id
  },
  initialize: function() {
    console.log('initialize Player', this.get('name'));
  },
  vote: function() {
    console.log('vote');
  }
});

var PlayerList = Backbone.Collection.extend({
  model: Player,
  initialize: function() {
    console.log('initialize PlayerList');
    this.bind("add", function(player) {
      console.log('added player: '+player.get('name'));
    });
  }
});

var Players = new PlayerList;

var PlayerView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#player-template').html()),
  events: {
    "click span": "vote"
  },
  initialize: function() {
      this.model.bind('change', this.render, this);
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  vote: function() {
    console.log('click vote', this.model.get('name'));
    this.model.vote();
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
    duration: 600,
    percent: 100
  },
  initialize: function() {
  },
  start: function(duration) {
    this.jsTimer && clearTimeout(this.jsTimer);
    this.set('duration', duration || this.defaults.duration);
    this.set('percent', 100);
    this.set('start_time', Date.now());
    this.update();
    this.trigger('start', duration);
  },
  update: function() {
    var that = this;
    var percent = (100 - ((Date.now() - this.get('start_time')) / (1000*this.get('duration')) * 100));
    if (percent < 0) percent = 0;
    this.set('percent', percent); // this triggers view update
    if (percent > 0) {
      this.jsTimer = setTimeout(function() { that.update(); }, 100);
    } else {
      // trigger some event that timer is done so App can respond
      this.trigger('finish');
    }
  }
});

var TimerView = Backbone.View.extend({
  el: $("#timer"),
  initialize: function() {
    this.model.bind('change', this.update, this);
    this.model.bind('start', this.render, this);
    this.model.bind('start', this.active, this);
    this.render();
  },
  template: _.template($('#timer-template').html()),
  render: function() {
    this.$el.html(this.template());
  },
  active: function() {
    this.$el.addClass('active');
  },
  update: function() {
    var $bar = this.$el.find('.bar');
    var percent = this.model.get('percent');
    $bar.css('width', percent + '%');

    this.$el.removeClass('progress-warning').removeClass('progress-danger');
    if (percent < 10)
      this.$el.addClass('progress-danger');
    else if (percent < 50)
      this.$el.addClass('progress-warning');
  }
});


var AppView = Backbone.View.extend({
  el: $("#app"),

  initialize: function() {
    this.$el.show();
    Messages.bind('add', this.addMessage, this);
    Players.bind('add', this.addPlayer, this);
    this.connectedEl = this.$('#connected');

    this.timer = new Timer();
    this.timer.bind('finish', this.timer_finish, this);
    this.timerView = new TimerView({model: this.timer});

    this.start_timer();
  },

  start_timer: function(seconds) {
    this.timer.start(seconds);
  },
  timer_finish: function() {
    console.log('timer finish');
    this.start_timer();
  },

  addMessage: function(msg) {
    var view = new MessageView({model: msg});
    this.$("#msg-list").append(view.render().el);
  },

  addPlayer: function(player) {
    var view = new PlayerView({model: player});
    this.$("#player-list").append(view.render().el);
  },

  socketPlayer: function(socket_id) {
    return Players.where({socket_id: socket_id})[0];
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
