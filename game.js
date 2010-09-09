// players -> client, state, color
// clients
// rooms -> players, state

exports.setglobs = function(g) { GLOBAL = g; };

var NUMPLAYERS = 2;
var GAMETIME = 6000; // milliseconds
var VOTETIME = 10000;

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
  privmsg: function(c, o) {
    if (o.body === 'debug') {
      console.log(lobby);
      return;
    }
    o.sender = c.sessionId;
    o.color = c.game.color;
    broadcast(c,o);
    send(c,o);
  },
  announce: function(c, o) {
    send(c,{cmd:'motd', head:'Welcome to Alphachat 0.1', body:'Chat with other 2 other players for a few minutes.  Afterwards, choose who you liked better.'});
    c.game = {};
  },
  play: function(c, o) {
    send(c,{cmd:'waiting', body:'waiting for other players...'});

    lobby.push(c);

    if (lobby.length >= NUMPLAYERS) {
      // send first players off into a game
      setupGame(lobby.splice(0,NUMPLAYERS));
    }
  }
};

// see if theres enough for a game
function setupGame(players) {
  // make a room

  //var room = new Room(players);

  var colors = ['red','green','blue'];

  // send each announcement that the game has started
  for (var i in players) {
    color = colors[i];
    players[i].game.color = color;
    send(players[i],
         { cmd:'gameon', 
           room:'foo', 
           clear:true, 
           color:color,
           time:GAMETIME });
  }

  // set up timers for game and voting stages
  setTimeout(function() {
    asend(players, {cmd:'ready'});
    setTimeout(function() {
      asend(players, {cmd:'set'});
      setTimeout(function() {
        asend(players, {cmd:'go'});
        setTimeout(function () {
          asend(players, {cmd:'vote', time:VOTETIME});
          setTimeout(function () {
            asend(players, {cmd:'results'});
          }, VOTETIME);
        }, GAMETIME);
      }, 3000); // go
    }, 3000); // set
  }, 1000); // ready
}
