var util       = require('./util'),
    websockets = require('./server.websockets'),
    app        = require('express')(),
    http       = require('http').Server(app),
    io         = require('socket.io')(http);

// Collect the raw body
app.use(function(req, res, next) {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });

  req.on('end', next);
});

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  next();
});

var run = function(core, client, args, cb) {
  var port = 6601;

  if (String(args['s']).match(/^\d+$/)) port = args['s'];

  // Don't care about the url, just parse raw posts just like CLI
  app.post('/', function(req, res, next) {
    var m, _args = util.parseCommand(req.rawBody);

    if (m = _args['_'][0].match(/^(?:a(?:ction)?=)(.+)$/)) {
      _args = util.parseCommand(m[1].replace(/\+/, ' '));
    }

    res.set('Content-Type', 'text/plain');

    core.run(_args, function(out) {
      res.end(String(out));
    });
  });

  websockets.init(core, client);

  io.on('connection', websockets.onConnect);

  http.listen(port, function() {
    console.log('Listening on port', port);
  });
};

module.exports.run = run;
