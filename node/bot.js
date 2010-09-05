couch = require('./couch.js');
couch.db = 'cac';
//couch.host = 'rcy.couchone.com'
couch.getDoc("",                // get the db info for the update_seq
             function(doc) {
               couch.feed(doc.update_seq, handler);
             });

cmd = {};
cmd.join = function(doc){
  console.log("JOIN: " + doc.sender);
  couch.saveDoc({ type:'message',
                  cmd:'chat',
                  sender:'bot',
                  body:doc.sender+' has joined'
                });
  setTimeout(function() { couch.saveDoc({ type:'message',cmd:'chat',sender:'bot',body:'hello '+doc.sender});}, 10000);
};

function handler(doc) {
  if (doc.type === 'message' && doc.sender !== 'bot') {
    console.log("MESSAGE: " + doc._id + " cmd == " + doc.cmd);
    cmd[doc.cmd] && cmd[doc.cmd](doc);
  } else {
    console.log("UNKNOWN: " + doc._id);
  }
}
