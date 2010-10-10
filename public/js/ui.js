var ui = {
  log: function(l) {console && console.log(l)},

  template: {
    motd: '<div class="server motd"><h1>{{head}}</h1><p>{{body}}</p>{{{button}}}',
    privmsg: '<div class="privmsg"><span class="{{color}}">{{nick}}:</span> {{body}}</div>',
    waiting: '<div class="server waiting">{{body}}</div>',
    init: '<div class="server"><p>Your color is <span class="{{color}}">{{color}}</span></p><br/><br/>The game will last {{seconds}} seconds.</p><br /></div>',
    wait: '<p class="server">{{reason}}</p>',
    go: '<p class="server">GO!</p>',

    vote: '<div class="server vote"><h2>GAME OVER</h2><p>You have {{seconds}} seconds finalize your pick.</p></div>',

    // results
    colorpick: '<div class="server colorpick"><span class="{{color}}">{{color}}</span> picked <span class="{{pick}}">{{pick}}</span></div>',
    winner: '<div class="server winner">the alphachatter is <span class="{{winner}}">{{winner}}</span>!</div>',
    tie: '<div class="server tie">tie game</div>',

    canChat: '<hr />',
    part: '<p class="server part {{color}}">{{color}} has left</p>',
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
        chat.player.part();
      });
  },

  scroll: function() { 
    window.scrollBy(0, 1000000);
  },

  clear: function() {
    $("#items").html('<div style="height:100%"></div>');
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
    $("form.chat input").addClass(obj.color);
    //$("#status .self").html(Mustache.to_html('<span class="self {{color}}">{{name}} is {{color}}</span>', obj));
  }
};

$(window).bind('resize', function() { ui.scroll();});