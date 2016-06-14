var http = require('http'),
    monk = require('monk');
var db  = require('monk')('localhost/record_ip'),
    visits = db.get('visits');

function handleRequest(req, res) {
  if (req.url === '/favicon.ico') {
    res.end();
    return;
  }

  var remoteAddress = {address: req.connection.remoteAddress, url: req.url, method: req.method, time: new Date()}
  visits.insert(remoteAddress, function (err, doc) {
    if (err) throw err;
    res.end('Added to database')
  })

}

http.createServer(handleRequest).listen(1337);
