// players -> client, state, color
// clients
// rooms -> players, state

exports.setglobs = function(g) { GLOBAL = g; };

// returns an obj with some extra properties added
function msg(obj) {
  console.log(GLOBAL);
  obj.connections = GLOBAL.connections;
  return obj;
}

// server message handlers
exports.messageHandler = {
  privmsg: function(c, o) {
    c.broadcast(msg(o));
    c.send(msg(o));
  },
  announce: function(c, o) {
    c.send(msg({cmd:'motd', body:'Welcome to Alphachat'}));
  }
};
