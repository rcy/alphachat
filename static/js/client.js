io.setPath('/js/');
socket = new io.Socket(null, {port:8124, transports:['websocket', 'htmlfile', 'xhr-multipart', 'flashsocket', 'xhr-polling', 'jsonp-polling']});

function reconnect() {
  util.log("connecting...");
  $("#status .conn").html("connecting...");  
  socket.connect();
}

reconnect();

socket.on('connect', function(){
  util.log("connected.");
  $("#status .conn").html("connected");
  send(socket, 'announce', 'NAME?');
});
socket.on('disconnect', function(){
  util.log("disconnected.");
  $("#status .conn").html("disconnected");
  setTimeout(reconnect, 5000);
});
socket.on('message', function(obj){
  util.log(["recv: <-- ", obj]);
  $("#status .users").html(obj.connections || -1);

  var h = handler[obj.cmd];
  if (h) {
    h(obj);
  } else {
    util.log(["missing handler:", obj]);
  }
  display($("#items"), obj);

  util.scrollDown();
});

function display(sel, obj) {
  if (sel && obj && template[obj.cmd]) {
    var html = Mustache.to_html(template[obj.cmd], obj);
    //util.log(html);
    sel && sel.append(html);
  } else {
    util.log(["no template for", obj]);
  }
}

$("form.chat input").focus();

$(window).bind('resize', function() { util.scrollDown();});

$("form.chat").submit(function(e) { 
  var inp = $(this).find("input");
  send(socket, 'privmsg', inp.val());
  inp.val('');
  return false;
});

send = function(socket, cmd, body) {
  util.log(["send: --> ", cmd, body]);
  socket.send({cmd:cmd, body:body});
};

play = function() {
  send(socket, 'play');
  $("#items").html("");
};
