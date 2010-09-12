var chat = new Game({name:'ryan'});

chat.connect();

chat.on('connect', function(player) {
  player.announce();
});
chat.on('disconnect', function(player) {
  //setInterval(chat.connect, 1000);
});
chat.on('motd', function(player, obj) {
  // obj.html - welcome message
  // server accepts messages now
  player.play();
});
chat.on('init', function(player, obj) {
  // obj.color;
  // obj.room
  // obj.color
  // obj.opponents
  // obj.time (chat time)
});
chat.on('go', function(player, obj) {
  // game starts here
});
chat.on('vote', function(player, obj) {
  // obj.opponents[]
  // obj.time (time to vote)
  player.vote(player.opponents[0]);
});
chat.on('results', function(player, obj) {
  // obj.players[]
  // obj.votes[]
});
chat.on('privmsg', function(player, obj) {
  // obj.room
  // obj.color (of sender)
  // obj.text
});
chat.on('wait', function(player, obj) {
  // obj.reason
  // obj.body
});
chat.on('canChat', function(player, obj) {
  // obj.enabled
});
