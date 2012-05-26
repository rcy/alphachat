function join(game_id) {
  var socket = io.connect();
  socket.emit('join', {game_id: game_id})
  socket.on('gamedata', function(data) {
    console.log(data);
    $('body').append('<h1>'+data.name+'</h1>');
    $('body').append('<p>we have ' + data.players + ' players</p>');
    $('body').append('<p>we need ' + data.players_needed + ' players</p>');
  });
}
