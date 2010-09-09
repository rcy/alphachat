template = {
  motd: '<div class="motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
  privmsg: '<div class="privmsg-{{color}}">{{color}}: {{body}}</div>',
  waiting: '<div class="waiting">{{body}}</div>',
  gameon: '<div class="gameon">Your color is {{color}}.  The game will last {{seconds}} seconds.</div>',
  ready: '<div class="ready">Ready?</div>',
  set: '<div class="set">Set.</div>',
  go: '<div class="go">GO!</div>',
  vote: '<div class="vote">VOTING TIME: Choose who you liked best {{{opp1button}}} or {{{opp2button}}}.  You have {{seconds}} seconds.</div>',
  results: '<div class="results">RESULTS: {{red}}: {{red_votes}} {{green}}:{{green_votes}} {{blue}}:{{blue_votes}}</div>{{{replaybutton}}}',
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
  },
  vote: function(obj) {
    obj.seconds = obj.time / 1000;
    obj.opp1button = '<button>pink</button>';
    obj.opp2button = '<button>black</button>';
  },
  results: function(obj) {
    // fixme need data from server here
    obj.replaybutton = '<button onclick="play()">PLAY ALPHACHAT AGAIN</button>';
  }
};
