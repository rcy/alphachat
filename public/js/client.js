var chat = new Game();
g_nick = "nick";

chat.on('connect', function(player){
  $("#status .conn").html("connected");
  chat.player.announce(g_nick)
});
chat.on('disconnect', function(){
  alert("disconnected");
  $("#status .conn").html("disconnected");
});

function doPlay() { chat.player.play(); }
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
  render(player, obj);
});
chat.on('wait', render);
chat.on('go', function(player, obj) {
  render(player, obj);
  time = {total: obj.time, start: Date.now()};
  clearInterval(time.timer);
  time.timer = setInterval(function() {
    $("#status .time").html(Math.round((time.total - (Date.now() - time.start)) / 1000));
  }, 1000);
});
chat.on('vote', function(player, obj) {
  obj.seconds = obj.time / 1000;
  render(player, obj);
});
chat.on('results', function(player, obj) {
  render(player, {cmd:'colorpick', color:'red', pick:obj.picks['red']});
  render(player, {cmd:'colorpick', color:'green', pick:obj.picks['green']});
  render(player, {cmd:'colorpick', color:'blue', pick:obj.picks['blue']});
  if (obj.winner)
    render(player, {cmd:'winner', winner:obj.winner});
  else
    render(player, {cmd:'tie'});

  ui.playAgain();
});
chat.on('pick', function(player, obj) {
  ui.updatePick(obj);
});
chat.on('part', function(player, obj) {
  render(player, obj);
  player.play();
});

chat.connect();

// $("form.signin input").focus();
// $("form.signin").submit(function(e) {
//   try {
//     var inp = $(this).find('input');
//     $("#login").hide();
//     $('.wrapper').fadeIn(1000);
//     g_nick = inp.val();
//     chat.connect();
//   } catch (e) {
//     console && console.error(e);
//   }
//   return false;
// });

$("#chat form").submit(function(e) {
  try {
    if (chat.player.canChat) {
      var inp = $(this).find('input');
      if (inp.val().length > 0) {
        chat.player.privmsg(inp.val());
      }
      inp.val('');
    }
  } catch (e) {
    console && console.error(e);
  }
  return false;
});
