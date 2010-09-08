io.setPath('/js/');
socket = new io.Socket(null, {port:8124, transports:['websocket', 'htmlfile', 'xhr-multipart', 'flashsocket', 'xhr-polling', 'jsonp-polling']});
socket.connect();
socket.on('connect', function(){
  $("#status .conn").html("connected");
  send(socket, 'announce', 'NAME?');
});
socket.on('disconnect', function(){
  $("#status .conn").html("disconnected");
});
socket.on('message', function(obj){
  util.log(obj);
  $("#status .users").html(obj.connections || -1);

  var h = handler[obj.cmd];
  if (h) {
    h(obj);
  } else {
    util.log("missing handler:"); util.log(obj);
  }
  util.scrollDown();
});

$("form.chat input").focus().select();

$(window).bind('resize', function() { util.scrollDown();});

$("form.chat").submit(function(e) { 
  var inp = $(this).find("input");
  send(socket, 'privmsg', inp.val());
  inp.val('');
  return false;
});

send = function(socket, cmd, body) {
  socket.send({cmd:cmd, body:body});
};
