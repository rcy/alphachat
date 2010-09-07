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
  util.log(data);
  var obj = JSON.parse(data);
  $("#status .users").html(obj.connections || -1);

  var h = handler[obj.cmd];
  if (h) {
    h(obj);
  } else {
    util.log("missing handler:"); util.log(obj);
  }
});

$("form.chat input").focus().select();

$(window).bind('resize', function() { util.scrollDown();});

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
  util.scrollDown();
};
