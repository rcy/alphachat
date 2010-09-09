template = {
  motd: '<div class="motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
  privmsg: '<div class="privmsg-{{color}}">{{sender}}: {{body}}</div>',
  waiting: '<div class="waiting">{{body}}</div>',
  gameon: '<div class="gameon">Your color is {{color}}.  The game will last {{seconds}} seconds.</div>',
  ready: '<div class="ready">Ready?</div>',
  set: '<div class="set">Set.</div>',
  go: '<div class="go">GO!</div>',
  vote: '<div class="vote">VOTING TIME: Choose who you liked best {{opp1}} or {{opp2}}</div>',
  results: '<div class="results">RESULTS: {{red}}: {{red_votes}} {{green}}:{{green_votes}} {{blue}}:{{blue_votes}}</div>',
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
