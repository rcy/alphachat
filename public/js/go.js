var App = new AppView;

var socket = io.connect();

socket.on('error', function(d) { alert('error'); console.log('error', d); });

socket.on('connect', function(client) {
  App.connect();
});

socket.on('disconnect', function() {
  App.disconnect();
});

socket.on('join', function(d) {
  var p = new Player({name: d.name, color: d.color, socket_id: d.socket_id});
  Players.add(p);
});

socket.on('chat', function(d) {
  var p = App.socketPlayer(d.sender);
  if (p) {
    Messages.add({body: d.body, player: p});
    $("#msg-list").scrollTop($("#msg-list")[0].scrollHeight);
  } else {
    console.log('unknown player sent chat:', d);
  }
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
