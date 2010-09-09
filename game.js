// players -> client, state, color
// clients
// rooms -> players, state

exports.setglobs = function(g) { GLOBAL = g; };

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

    broadcast(c,o);
    send(c,o);
  },
  announce: function(c, o) {
    send(c,{cmd:'motd', body:'Welcome to Alphachat'});
    lobby.push(c);
  },
  play: function(c, o) {
    // see if there are 2 other players waiting
    send(c,{cmd:'play', body:'please wait for other players...'});
    c.timer = setInterval(function () {
      c.send(msg({cmd:'play', body:'please keep waiting for other players...'}));
    }, 10000);
  }
};
