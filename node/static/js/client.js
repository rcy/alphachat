io.setPath('/js/');
socket = new io.Socket('localhost');
socket.connect();
socket.on('connect', function(){
  $("#status").html("connected");
});
socket.on('disconnect', function(){
  $("#status").html("disconnected");
});
socket.on('message', function(data){
  console.log(data);
  var obj = JSON.parse(data);
  $("#items").append('<div>'+obj.cmd+': '+obj.client+' '+obj.body+'</div>');
  scrollDown();
});

scrollDown = function() {
  window.scrollBy(0, 100000000000000000);
};

$("form.chat input").focus();
$(window).bind('resize', function() { scrollDown();});

$("form.chat").submit(function(e) { 
  var inp = $(this).find("input");
  socket.send(inp.val());
  inp.val('');
  return false;
});
