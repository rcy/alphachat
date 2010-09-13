var ui = {
  log: function(l) {console && console.log(l)},

  template: {
    motd: '<div class="server motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
    privmsg: '<div class="privmsg {{color}}">{{nick}}: {{body}}</div>',
    waiting: '<div class="server waiting">{{body}}</div>',
    init: '<div class="server"><p>Your color is <span class="{{color}}">{{color}}</span></p><p>You are playing against {{#opponents}}<span class="{{.}}">{{.}}</span> {{/opponents}}</p>The game will last {{seconds}} seconds.</p><br /></div>',
    wait: '<p class="server">{{reason}}</p>',
    go: '<p class="server">GO!</p>',
    vote: '<div class="server vote"><h2>GAME OVER</h2><p>You have {{seconds}} seconds finalize your pick.</p></div>',
    results: '<div class="server results">RESULTS: {{red}}: {{red_votes}} {{green}}:{{green_votes}} {{blue}}:{{blue_votes}}</div>{{{replaybutton}}}',
    canChat: '<hr />',
    // these aren't actually message commands
    choices: '{{#choices}}<span class="{{.}}">{{.}}</span>{{/choices}}"'
  },

  render: function(player, obj, sel) {
    var sel = sel || $("#items");
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
    var v = $("#status .vote");
    v.html(v.text());

    $("#status .action")
      .html('play again')
      .click(function() { 
        $(this).html('');
        chat.player.announce(chat.player.name);
      });
  },

  scroll: function() { 
    window.scrollBy(0, 1000000);
  },

  clear: function() {
    $("#items").html('');
  },

  showChoices: function(pick, options) {
    var hs = $.map(options, function(o) {
      return Mustache.to_html('<span class="option {{color}} {{pick}}" onclick=chat.player.pick("{{color}}")>{{color}}</span>',
                              {pick: function() { return pick === o ? "pick" : ""; },
                               color: o});
    });
    var html = 'pick: '+hs.join(' ');
    $("#status .vote").html(html);
  },
  showSelf: function(obj) {
    $("#status .self").html(Mustache.to_html('<span class="self {{color}}">{{name}} is {{color}}</span>', obj));
  }
};

$(window).bind('resize', function() { ui.scroll();});
