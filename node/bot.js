couch = require('./couch.js');
couch.db = 'cac';
couch.getDoc("",                // get the db info for the update_seq
             function(doc) {
               couch.feed(doc.update_seq, handler);
             });

cmd = {};
cmd.join = function(doc){
  console.log("JOIN: " + doc.sender);
  //couch.saveDoc({});
};

function handler(doc) {
  if (doc.type === 'message') {
    console.log("MESSAGE: " + doc._id + " cmd == " + doc.cmd);
    cmd[doc.cmd] && cmd[doc.cmd](doc);
  } else {
    console.log("UNKNOWN: " + doc._id);
  }
}
