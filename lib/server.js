var core       = require('./core.js'),
    app        = require('express')(),
    minimist   = require('minimist');

// Thankyou, http://krasimirtsonev.com/blog/article/Simple-command-line-parser-in-JavaScript
var parseCommand = function(str) {
  var args        = [];
  var readingPart = false;
  var part        = '';
  for (var i=0; i<str.length; i++) {
    if (str.charAt(i) === ' ' && !readingPart) {
      args.push(part);
      part = '';
    } else {
      if (str.charAt(i) === '\"') {
        readingPart = !readingPart;
      } else {
        part += str.charAt(i);
      }
    }
  }
  args.push(part);
  return args;
};

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

var run = function(client, args, cb) {
  var port = 6601;

  if (String(args['s']).match(/^\d+$/)) port = args['s'];

  // Don't care about the url, just parse raw posts just like CLI
  app.use(function(req, res) {
    var _args = minimist(parseCommand(req.rawBody));

    res.set('Content-Type', 'text/plain');

    core.run(client, _args, res.end.bind(res));
  });

  app.listen(port, function() {
    console.log('Listening on port', port);
  });
};

module.exports.run = run;
