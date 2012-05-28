var App = new AppView;

var socket = io.connect();

socket.on('error', function(d) { alert('error'); console.log('error', d); });

socket.on('connect', function(client) {
  App.connect();
});

socket.on('disconnect', function() {
  App.disconnect();
});

socket.on('join', function(doc) {
  console.log('got: join: ',doc);
  var p = new Player(doc);
  Players.add(p);
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
  for (var i in docs) {
    var p = new Player(docs[i]);
    Players.add(p);
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
