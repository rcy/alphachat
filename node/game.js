// players -> client, state, color
// clients
// rooms -> players, state

exports.setglobs = function(g) { GLOBAL = g; };

// returns an obj with some extra properties added
function msg(obj) {
  obj.connections = GLOBAL.connections;
  return obj;
}

// server message handlers
exports.messageHandler = {
  privmsg: function(c, o) {
    c.broadcast(msg(o));
    c.send(msg(o));
    console.log(c.timer);
    clearTimeout(c.timer);
    console.log(c.timer);
  },
  announce: function(c, o) {
    c.send(msg({cmd:'motd', body:'Welcome to Alphachat'}));
  },
  play: function(c, o) {
    // see if there are 2 other players waiting
    c.send(msg({cmd:'play', body:'please wait for other players...'}));
    c.timer = setInterval(function () {
      c.send(msg({cmd:'play', body:'please keep waiting for other players...'}));
    }, 10000);
  }
};
