var ui = {
  log: function(l) {console && console.log(l)},

  template: {
    motd: '<div class="motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
    privmsg: '<div class="privmsg {{color}}">{{nick}}: {{body}}</div>',
    waiting: '<div class="waiting">{{body}}</div>',
    init: '<div class="gameon">Your color is <span class="{{color}}">{{color}}</span>.  You are playing against {{#opponents}}<span class="{{.}}">{{.}}</span> {{/opponents}} The game will last {{seconds}} seconds.</div>',
    wait: '<div class="wait">{{reason}}</div>',
    go: '<div class="go">GO!</div>',
    vote: '<div class="vote">GAME OVER<br />Choose who you liked best {{{opp1button}}} or {{{opp2button}}}.<br />You have {{seconds}} seconds to vote.</div>',
    results: '<div class="results">RESULTS: {{red}}: {{red_votes}} {{green}}:{{green_votes}} {{blue}}:{{blue_votes}}</div>{{{replaybutton}}}',
    canChat: '<hr />'
  },

  render: function(player, obj) {
    var sel = $("#items");
    if (sel && obj && this.template[obj.cmd]) {
      var html = Mustache.to_html(this.template[obj.cmd], obj);
      //this.log(html);
      sel && sel.append(html);
    } else {
      this.log(["WARN: no template for", obj]);
    }
    this.scroll();    
  },

  canChat: function(enabled) {
    var i = $("form.chat input");
    if (enabled) {
      i.removeAttr('disabled');
      //i.show();
      i.focus();
    } else {
      //i.hide();
      i.attr('disabled', true);
    }
  },

  playAgain: function() {
    $("#status .action").html('play again');
  },

  scroll: function() { 
    window.scrollBy(0, 1000000);
  },

  clear: function() {
    $("#items").html('');
  }
};

$(window).bind('resize', function() { ui.scroll();});
