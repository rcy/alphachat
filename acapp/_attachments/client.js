var GLOBAL = {};
// TODO: better default name
GLOBAL.me = "ac"+Math.floor(Math.random()*100000);
function updateTitle() {
  if (GLOBAL.unread) {
    document.title = "(" + GLOBAL.unread.toString() + ") alphachat";
  } else {
    document.title = "alphachat";
  }
}

function clientStart() {
  // announce that we are here
  var fdoc = { type: 'message',
               cmd: 'join',
               sender: GLOBAL.me };
  $$(this).app.db.saveDoc(fdoc, {});
}
