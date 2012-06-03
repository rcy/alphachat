require.config({
  paths: {
    jquery: 'libs/jquery/jquery-1.7.1',
    underscore: 'libs/underscore/underscore.min',  // from https://github.com/amdjs
    backbone: 'libs/backbone/backbone.min' // from https://github.com/amdjs
  }
});

require([
  'jquery', 'underscore', 'backbone',
  'models/player', 'collections/player',
  'collections/message',
  'views/app'
], function($, _, Backbone, Player, Players, Messages, AppView) {
  var App = new AppView;

  var socket = io.connect();

  socket.on('error', function(d) { alert('error'); console.log('error', d); });

  socket.on('connect', function(client) {
    console.log('connect');
    App.connect();
  });

  socket.on('join', function(doc) {
    console.log('got: join: ', doc);
    var p = new Player(doc);
    Players.add(p);
  });

  App.on('vote', function(player) {
    console.log('toplevel got vote', player);
    socket.emit('vote', player.attributes);
  });

  socket.on('start_timer', function(data) {
    console.log('got: start_timer', data);
    App.start_timer(data);
  });

  socket.on('stop_timer', function(data) {
    console.log('got: stop_timer', data);
    App.stop_timer(data);
  });

  socket.on('chat', function(d) {
    console.log('chat: ', d);
    var p = App.socketPlayer(d.sender);
    if (p) {
      Messages.add({body: d.body, player: p});
      $("#msg-list").scrollTop($("#msg-list")[0].scrollHeight);
    } else {
      console.log('unknown player sent chat:', d);
    }
  });

  socket.on('names', function(docs) {
    console.log('names', docs);
    for (var i in docs) {
      var p = new Player(docs[i]);
      Players.add(p);
    }
  });

  socket.on('part', function(doc) {
    console.log('part', doc);
    Players.remove(Players.get(doc._id));
  });

  socket.on('disconnect', function() {
    App.disconnect();
  });

  $('form.chat input').focus();

  $('form.chat').on('submit', function(e) {
    e.preventDefault();
    var $input = $(e.currentTarget).find('input');
    if ($input.val() != '') {
      socket.emit('chat', {body: $input.val()});
      $input.val('');
      $input.attr('placeholder','');
    }
  });

  socket.emit('join');
});
