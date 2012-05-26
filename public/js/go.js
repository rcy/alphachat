var App = new AppView;

// me = new Player({name: 'me'});
// wilma = new Player({name: 'wilma', color: 'red'});
// betty = new Player({name: 'betty', color: 'blue'});

// Players.add(me);
// Players.add(wilma);
// Players.add(betty);

// Messages.add({body:'hello world', player: me});
// Messages.add({body:'hello world', player: me});
// Messages.add({body:'hello world', player: me});
// Messages.add({body:'this is a test', player: wilma});
// Messages.add({body:'wow wow wow', player: betty});
// Messages.add({body:'yeah wow wow wow', player: wilma});

var socket = io.connect();

socket.on('error', function(d) { alert('error'); console.log('error', d); });

socket.emit('join', {game_id: 1})

socket.on('connect', function(client) {
  App.connect();
});

socket.on('disconnect', function() {
  App.disconnect();
});

socket.on('join', function(d) {
  var p = new Player({name: d.name});
  Players.add(p);
});

socket.on('chat', function(d) {
  var p = new Player({name: d.sender});
  Messages.add({body: d.body, player: p});
  $("#msg-list").scrollTop($("#msg-list")[0].scrollHeight);
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