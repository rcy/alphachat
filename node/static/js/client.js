io.setPath('/js/');
socket = new io.Socket(null, {port:8124, transports:['websocket', 'htmlfile', 'xhr-multipart', 'flashsocket', 'xhr-polling', 'jsonp-polling']});
socket.connect();
socket.on('connect', function(){
  $("#status .conn").html("connected");
});
socket.on('disconnect', function(){
  $("#status .conn").html("disconnected");
});
socket.on('message', function(data){
  console && console.log(data);
  var obj = JSON.parse(data);

  // move this
  if (obj.users) {
    $("#status .users").html(obj.users);
  }

  var h = handler[obj.cmd];
  if (h) {
    h(obj);
  } else {
    console && (console.log("missing handler:"), console.log(obj));
  }
});

scrollDown = function() {
  window.scrollBy(0, 100000000000000000);
};

$("form.chat input").focus().select();

$(window).bind('resize', function() { scrollDown();});

$("form.chat").submit(function(e) { 
  var inp = $(this).find("input");
  socket.send(inp.val());
  inp.val('');
  return false;
});
// message handlers
handler = {};
handler.privmsg = function(obj) {
  $("#items").append('<div>'+obj.client+': '+obj.body+'</div>');
  scrollDown();
};
  //  else {
  //   $("#items").append('<div>'+obj.cmd+': '+obj.client+' '+obj.body+'</div>');
  //   scrollDown();
  // }
