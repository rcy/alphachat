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

$(document).ready(function() {
  setTimeout(function() {
    $.couch.app(function(app) {
      $(window).evently("window", app);
      //$("#account").evently("account", app);
      //$("#profile").evently("profile", app);
      $("#input").evently("input", app);
      //$.evently.connect("#account","#profile", ["loggedIn","loggedOut"]);
      //$.evently.connect("#account","#input", ["loggedIn", "loggedOut"]);
      //$.evently.connect("#profile","#input", ["profileReady"]);
      $("#items").evently("items", app);
      clientStart();
    });
  }, 500 /* safari needs a big number here to not show loading spinner */ );
});
