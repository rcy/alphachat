var http = require('http');
var querystring = require('querystring');

var couch = exports;

couch.host = 'localhost';
couch.port = 5984;
couch.db = 'mydb';
  
// callback is called with the document associated with docid
couch.getDoc = function(docid, callback) {
  var client = http.createClient(this.port, this.host);
  var request = client.request('GET', '/'+this.db+'/'+docid);
  request.end();
  request.on('response', function(response) {
    response.setEncoding('utf8');
    //console.log('STATUS:' + response.statusCode);
    var data = "";
    response.on('data', function(chunk) {
      data += chunk;
    });
    response.on('end', function() {
      var doc = JSON.parse(data);
      callback && callback(doc);
    });
  });
};

// listen for changes on the db.
// callback is called with the fetched document (+ args)
couch.feed = function(since, callback, args) {
  var client = http.createClient(this.port, this.host);
  var query = querystring.stringify({'feed':'continuous',
                                     'since':since,
                                     'heartbeat':10000,
                                     'include_docs':'true'});
  var request = client.request('GET', '/'+this.db+'/_changes?'+query,
                               {'host': this.host});
  request.end();

  request.on('response', function(response) {
    response.setEncoding('utf8');
    var data = "";
    response.on('data', function(chunk) {
      var lines;
      data += chunk;
      if (data[data.length-1] === '\n') { 
        lines = data.split('\n');
        data = "";
        for (i in lines) {
          var line = lines[i];
          if (line !== "") {
            //console.log('line:'+line+'*');
            callback && callback(JSON.parse(line).doc, args);
          }
        }
      }
    });
  });
  request.on('end', function(response) {
    console.log('feed: end');
  });
};
