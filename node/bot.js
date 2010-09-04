couch = require('./couch.js');

function handler(doc) {
  if (doc.type === 'message') {
    console.log("MESSAGE: " + doc);
  } else {
    console.log("UNKNOWN: " + doc._id);
  }
}

couch.db = 'cac';

couch.getDoc("",                // get the db info for the update_seq
             function(doc) {
               couch.feed(doc.update_seq, handler);
             });
