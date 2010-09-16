var sys = require('sys');

ac = exports;
ac.numplayers = 3;
ac.gametime = 1000 * 60;
ac.votetime = 1000 * 10;

var emptyRoom = require('./room.js');
ac.lobby = Object.create(emptyRoom);
ac.rooms = [ac.lobby]

function send(cs, o) {
  for (var i in cs) {
    cs[i].send(o);
    if (o.cmd !== 'privmsg') {
      console.log('send: --> [' + cs[i].sessionId + '] ' + sys.inspect(o));
    }
  }
}

// server message handlers
ac.handlers = {
  // not a message handler, but a server event
  disconnect: function(c) {
    if (c.game && c.game.room) {
      c.game.room.delPlayer(c);
      send(c.game.room.players, {cmd:'disconnect', color:c.sessionId});
    }
  },

  privmsg: function(c, o) {
    if (c.game.room) {
      o.color = c.game.color;
      if (c.game.room.state == 'postgame') {
        o.name = c.game.name;
      }
      send(c.game.room.players,o);
    }
  },
  announce: function(c, o) {
    if (!o.name) {
      send([c], {cmd:'error', msg:'name missing'});
      return;
    }
    c.game = {};
    c.game.name = o.name;
    send([c], {cmd:'canChat', enabled:false});
    send([c], {cmd:'motd', 
               head:'Welcome to Alphachat 0.1', 
               body:'Chat with other players for a few minutes.  Afterwards, choose who you liked better.'});
  },
  play: function(c, o) {
    if (c.game.room) {
      send([c],{cmd:'error', reason:'already in room'});
    } else {
      send([c],{cmd:'wait', reason:'need_players'});
      ac.lobby.addPlayer(c);
      c.game.room = ac.lobby;
      if (ac.lobby.players.length >= ac.numplayers) {
        setupGame(ac.lobby.players.splice(0, ac.numplayers));
      }
    }
  },
  pick: function(c, o) {
    registerPick(c, o.pick);
  },
  part: function(c, o) {
    if (!c.game.room) {
      send([c],{cmd:'error', reason:'not in room'});
    } else {
      // announce the part
      send(c.game.room.players, {cmd:'part', color:c.game.color});

      // remove the player
      c.game.room.delPlayer(c);
      delete c.game.room;

      // that player can no longer send privmsgs
      send([c], {cmd:'canChat', enabled:false});
    }
  }
};

// see if theres enough for a game
function setupGame(players) {
  var colors = ['red','green','blue','purple','orange','yellow','pink','black'];

  // make a room
  var room = Object.create(emptyRoom);
  ac.rooms.push(room);
  room.name = Math.floor(Math.random()*1000)+'-'+Date.now();  // FIXME
  room.players = players;

  // send each announcement that the game has started
  for (var i in players) {
    var opps = colors.slice(0, players.length);
    players[i].game.color = opps.splice(i, 1)[0];
    players[i].game.opponents = opps;
    players[i].game.room = room;
    send([players[i]], { cmd:'init',
                       roomName:room.name,
                       name:players[i].game.name,
                       color:players[i].game.color, 
                       opponents:players[i].game.opponents,
                       time:ac.gametime 
                     });
  }

  // set up timers for game and voting stages
  setTimeout(function() {
    send(players, {cmd:'wait', reason:'ready'});
    setTimeout(function() {
      send(players, {cmd:'wait', reason:'set'});
      setTimeout(function() { gameOn(room);}, 500); // go
    }, 500); // set
  }, 500); // ready
}

var registerPick = function(player, color) {
  // client must pick a color in the room that they are in
  var valid = false;
  for (var i in player.game.opponents) {
    if (color === player.game.opponents[i]) {
      valid = true;
      break;
    }
  }
  if (valid) {
    player.game.pick = color;
    console.log(player.game.color + ' chose ' + color);
    send([player], {cmd:'pick', pick:color});
  } else {
    console.log('invalid pick');
  }
};

var rnd = function(i) { return Math.floor(Math.random()*i); };
var rndelt = function(a) { return a[rnd(a.length)]; };

var gameOn = function(room) {
  var players = room.players;
  room.state = 'game';

  send(players, {cmd:'go'});

  // each player makes a default vote
  for (var i in players) {
    registerPick(players[i], rndelt(players[i].game.opponents));
  }

  send(players, {cmd:'canChat', enabled:true});
  setTimeout(function () {
    room.state = 'vote';
    send(players, {cmd:'canChat', enabled:false});
    send(players, {cmd:'vote', time:ac.votetime});
    setTimeout(function () {
      var results = collectResults(room);
      room.state = 'postgame';
      results['cmd'] = 'results';
      send(players, results);
      send(players, {cmd:'canChat', enabled:true});
    }, ac.votetime);
  }, ac.gametime);
};

var collectResults = function(room) {
  var players = room.players;
  var results = {colors:['red','green','blue'],
                 picks:{},
                 points:{'red':0,'green':0,'blue':0},
                 winner:false
                };

  for (var i in players) {
    results.picks[players[i].game.color] = players[i].game.pick;
    results.points[players[i].game.pick] += 1;
  }

  // if someone didnt get 2 votes, everyone got 3 and its a tie
  for (var i in results.colors) {
    if (results.points[results.colors[i]] === 2) {
      results.winner = results.colors[i];
    }
  }

  return results;
};
