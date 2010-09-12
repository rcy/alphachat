// players -> client, state, color
// clients
// rooms -> players, state

exports.setglobs = function(g) { GLOBAL = g; };

GAME = {};
GAME.numplayers = 3;
GAME.gametime = 10000; // milliseconds
GAME.votetime = 1000;

lobby = [];

// returns an obj with some extra properties added
function msg(obj) {
  obj.connections = GLOBAL.connections;
  return obj;
}

function send(c, o) {
  var o = msg(o);
  console.log('send: --> [' + c.sessionId + '] ' + JSON.stringify(o));
  c.send(o);
}
// FIXME: this is a hack, just make send take an array 
function asend(cs, o) {
  var i;
  for (i in cs) {
    send(cs[i], o);
  }
}
function broadcast(c,o) {
  var o = msg(o);
  console.log('bcast: --> [' + c.sessionId + '] ' + JSON.stringify(o));
  c.broadcast(o);
}

// server message handlers
exports.messageHandler = {
  command: function(c, o) {
    var args = o.body;
    if (args[0] === 'set') {
      if (args[1]) {
        // FIXME: gaping hole, allow setting game vars from any chat client
        GAME[args[1]] = args[2];
      } else {
        send(c, GAME);
      }
    }
  },
  privmsg: function(c, o) {
    //o.sender = c.sessionId;
    o.color = c.game.color;
    o.name = c.game.name;
    asend(c.game.room.players,o);
    //send(c,o);
  },
  announce: function(c, o) {
    if (!o.name) {
      send(c, {cmd:'error', msg:'name missing'});
      return;
    }

    c.game = {};
    c.game.name = o.name;
    send(c, {cmd:'canChat', enabled:false});
    send(c, {cmd:'motd', 
             head:'Welcome to Alphachat 0.1', 
             body:'Chat with other players for a few minutes.  Afterwards, choose who you liked better.'});
  },
  play: function(c, o) {
    send(c,{cmd:'wait', reason:'need_players'});
    lobby.push(c);
    if (lobby.length >= GAME.numplayers) {
      setupGame(lobby.splice(0, GAME.numplayers));
    }
  },
  vote: function(c, o) {
    // client must vote for a color in the room that they are in
  }
};

// see if theres enough for a game
function setupGame(players) {
  var colors = ['red','green','blue','purple','orange','yellow','pink','black'];

  // make a room
  var room = Object.create(lobby);
  room.name = Math.floor(Math.random()*1000)+'-'+Date.now();  // FIXME
  room.players = players;

  // send each announcement that the game has started
  for (var i in players) {
    var opps = colors.slice(0, players.length);
    players[i].game.color = opps.splice(i, 1)[0];
    players[i].game.opponents = opps;
    players[i].game.room = room;
    send(players[i], { cmd:'init',
                       roomName:room.name, 
                       color:players[i].game.color, 
                       opponents:players[i].game.opponents,
                       time:GAME.gametime 
                     });
  }

  // set up timers for game and voting stages
  setTimeout(function() {
    asend(players, {cmd:'wait', reason:'ready'});
    setTimeout(function() {
      asend(players, {cmd:'wait', reason:'set'});
      setTimeout(function() {
        asend(players, {cmd:'go'});
        asend(players, {cmd:'canChat', enabled:true});
        setTimeout(function () {
          asend(players, {cmd:'canChat', enabled:false});
          asend(players, {cmd:'vote', time:GAME.votetime});
          setTimeout(function () {
            asend(players, {cmd:'results'});
            asend(players, {cmd:'canChat', enabled:true});
          }, GAME.votetime);
        }, GAME.gametime);
      }, 500); // go
    }, 500); // set
  }, 500); // ready
}
