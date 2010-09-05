fs = require('fs');

var h = exports;

contentType = function(filename) {
  return 'text/html'; // FIXME
};

h.staticFile = function(filename, res) {
  filename = './static/' + filename;
  fs.stat(filename, function(err, stats) {
    if (err || !stats.isFile()) {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('no such file: ' + filename, 'utf8');
    } else {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log(err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end(err.message, 'utf8');
        } else {
          res.writeHead(200, {'Content-Type': contentType(filename)});
          res.end(data, 'utf8');
        }
      });
    }
  });
};

h.index = function(req, res) {
  h.staticFile('index.html', res);
};
