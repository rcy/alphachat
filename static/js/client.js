var chat = new Game();

chat.connect();
ui.canChat(false);

chat.on('connect', function(player){
  $("#status .conn").html("connected");
});
chat.on('disconnect', function(){
  $("#status .conn").html("disconnected");
});

function doPlay() { ui.clear(); chat.player.play(); }
function render(player, obj) {ui.render(player,obj)};

chat.on('motd', function(player, obj) {
  //obj.button='<button onclick="doPlay()">PLAY ALPHACHAT</button>';
  //render(player, obj);
  doPlay();
});
chat.on('privmsg', function(player, obj) {
  // the names are revealed in the post game chat, show them if available
  if (obj.name) {
    obj.nick = obj.name;
  } else {
    obj.nick = obj.color;
  }
  render(player, obj);
});
chat.on('canChat', function(player, obj) {
  ui.canChat(obj.enabled);
  render(player, obj);
});
chat.on('init', function(player, obj) {
  ui.clear();
  obj.seconds = obj.time / 1000;
  ui.showSelf({color:obj.color, name:player.name});
  ui.showChoices('green', player.opponents);
  render(player, obj);
});
chat.on('wait', render);
chat.on('go', render);
chat.on('vote', function(player, obj) {
  obj.seconds = obj.time / 1000;
  render(player, obj);
});
chat.on('results', function(player, obj) {
  render(player, obj);
  ui.playAgain();
});

$("form.signin input").focus();
$("form.signin").submit(function(e) {
  try {
    var inp = $(this).find('input');
    chat.player.announce(inp.val());
    $(this).hide();
    //inp.val('');
  } catch (e) {
    console && console.error(e);
  }
  return false;
});

$("form.chat").submit(function(e) {
  try {
    if (chat.player.canChat) {
      var inp = $(this).find('input');
      chat.player.privmsg(inp.val());
      inp.val('');
    }
  } catch (e) {
    console && console.error(e);
  }
  return false;
});
