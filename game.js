var sys = require('sys');

GAME = exports;
GAME.numplayers = 3;
GAME.gametime = 1000 * 60;
GAME.votetime = 1000 * 10;

var emptyRoom = require('./room.js');
GAME.lobby = Object.create(emptyRoom);

function send(cs, o) {
  for (var i in cs) {
    cs[i].send(o);
    if (o.cmd !== 'privmsg') {
      console.log('send: --> [' + cs[i].sessionId + '] ' + sys.inspect(o));
    }
  }
}

// server message handlers
GAME.messageHandler = {
  // not a message handler, but a server event
  disconnect: function(c) {
    if (c.game && c.game.room) {
      c.game.room.delPlayer(c);
      send(c.game.room.players, {cmd:'disconnect', color:c.sessionId});
    }
  },

  command: function(c, o) {
    var args = o.body;
    if (args[0] === 'set') {
      if (args[1]) {
        // FIXME: gaping hole, allow setting game vars from any chat client
        GAME[args[1]] = args[2];
      } else {
        send([c], GAME);
      }
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
      GAME.lobby.addPlayer(c);
      c.game.room = GAME.lobby;
      if (GAME.lobby.players.length >= GAME.numplayers) {
        setupGame(GAME.lobby.players.splice(0, GAME.numplayers));
      }
    }
  },
  pick: function(c, o) {
    // client must pick a color in the room that they are in
    var valid = false;
    for (var i in c.game.opponents) {
      if (o.pick === c.game.opponents[i]) {
        valid = true;
        break;
      }
    }
    if (valid) {
      c.game.pick = o.pick;
      console.log(c.game.color + ' chose ' + o.pick);
      send([c], {cmd:'pick', pick:o.pick});
    }
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
                       time:GAME.gametime 
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

function gameOn(room) {
  var players = room.players;
  room.state = 'game';

  send(players, {cmd:'go'});
  send(players, {cmd:'canChat', enabled:true});
  setTimeout(function () {
    room.state = 'vote';
    send(players, {cmd:'canChat', enabled:false});
    send(players, {cmd:'vote', time:GAME.votetime});
    setTimeout(function () {
      room.state = 'postgame';
      send(players, {cmd:'results'});
      send(players, {cmd:'canChat', enabled:true});
    }, GAME.votetime);
  }, GAME.gametime);
}
