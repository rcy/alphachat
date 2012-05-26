var Player = Backbone.Model.extend({
  defaults: {
    name: 'nobody',
    color: 'green'
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


var AppView = Backbone.View.extend({
  el: $("#app"),

  initialize: function() {
    this.$el.show();
    Messages.bind('add', this.addMessage, this);
    Players.bind('add', this.addPlayer, this);
    this.connectedEl = this.$('#connected');
  },

  addMessage: function(msg) {
    var view = new MessageView({model: msg});
    this.$("#msg-list").append(view.render().el);
  },

  addPlayer: function(player) {
    var view = new PlayerView({model: player});
    this.$("#player-list").append(view.render().el);
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
