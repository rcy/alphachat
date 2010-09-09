template = {
  motd: '<div class="motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
  privmsg: '<div>{{sender}}: {{body}}</div>',
  waiting: '<div>{{body}}</div>',
  gameon: '<div class="gameon">Your color is {{color}}.  The game will last {{seconds}} seconds.</div>'
};  

// client message handlers
handler = {
  privmsg: function(obj) {
    util.scrollDown();
  },
  motd: function(obj) {
    obj.button='<button onclick="play()">PLAY ALPHACHAT</button>';
  },
  waiting: function(obj) {
  },
  gameon: function(obj) {
    $("#items").html("");
    obj.seconds = obj.time / 1000;
  }  
};
