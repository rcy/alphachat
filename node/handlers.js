fs = require('fs');

var h = exports;

encoding = function(filename) {
  var types = {'.jpg': 'binary',
               '.swf': 'binary',
               '.ico': 'binary'};
  var match = filename.match(/(\.[^.]+)$/);
  if (match) {
    var encoding = types[match[1]];
    if (encoding) {
      return encoding;
    } else {
      console.log('WARNING: no encoding match for: ' + filename);
      return 'utf8';
    }
  }
};

contentType = function(filename) {
  var types = {'.html': 'text/html',
               '.js': 'application/javascript',
               '.css': 'text/css',
               '.jpg': 'image/jpeg',
               '.swf': 'application/x-shockwave-flash',
               '.ico': 'image/vnd.microsoft.icon'};
  var match = filename.match(/(\.[^.]+)$/);
  if (match) {
    var type = types[match[1]];
    if (type) {
      return type;
    } else {
      console.log('WARNING: no contenttype match for: ' + filename);
      return 'text/plain';
    }
  }
};

h.staticFile = function(filename, res) {
  filename = './static/' + filename;
  fs.stat(filename, function(err, stats) {
    if (err || !stats.isFile()) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('no such file: ' + filename, 'utf8');
    } else {
      var enc = encoding(filename);
      fs.readFile(filename, enc, function(err, data) {
        if (err) {
          console.log(err);
          res.writeHead(500, {'Content-Type': 'text/html'});
          res.end(err.message, 'utf8');
        } else {
          res.writeHead(200, {'Content-Type': contentType(filename)});
          res.end(data, enc);
        }
      });
    }
  });
};

h.index = function(req, res) {
  h.staticFile('index.html', res);
};
