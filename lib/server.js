var core       = require('./core.js'),
    app        = require('express')(),
    minimist   = require('minimist');

// Collect the raw body
app.use(function(req, res, next) {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });

  req.on('end', next);
});


var run = function(client, args, cb) {
  var port = 6601;

  if (String(args['s']).match(/^\d+$/)) port = args['s'];

  // Don't care about the url, just parse raw posts just like CLI
  app.use(function(req, res) {
    var _args = minimist(req.rawBody.split(' '));

    res.set('Content-Type', 'text/plain');

    core.run(client, _args, res.end);
  });

  app.listen(port, function() {
    console.log('Listening on port', port);
  });
};

module.exports.run = run;
