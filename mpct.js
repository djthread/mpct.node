#!/usr/local/bin/node

var mpd   = require('mpd'),
    args  = require('minimist')(process.argv.slice(2)),
    core  = require('./lib/core');

// console.log('args:', args);

var getMPDHostPort = function(cb) {
  var host, port;
  if (host = process.env['MPD_HOST']) {
    cb(host, process.env['MPD_PORT'] || 6600);
  } else if (process.env['SHELL'].match(/\/fish$/)) {
    var spawn = require('child_process').spawn,
        ech   = spawn(process.env['SHELL'], ['-c', 'echo $MPD_HOST, $MPD_PORT']);
        defHost = 'localhost', defPort = 6600;

    ech.stderr.on('data', function(d) { console.log('ERR:', d); process.exit(); });
    ech.stdout.on('data', function(d) {
      var bits = String(d).trim().split(',');
      cb(bits[0] || defHost, bits[1] || defPort);
    });
  }
}

getMPDHostPort(function(host, port) {

  var client = mpd.connect({host: host, port: port});

  client.on('ready', function() {
    // console.log('ready, yo');
    core.run(client, args, function(err) {
      if (err) throw err;
      // console.log('ending');
      client.socket.end();
      process.exit();
    });
  });

});
