// client message handlers
handler = {
  privmsg: function(obj) {
    $("#items").append('<div>'+obj.client+': '+obj.body+'</div>');
    util.scrollDown();
  },
  motd: function(obj) {
    $("#items").append('<h1>'+obj.body+'</h1>');
    send(socket, 'ready');
  }
};
