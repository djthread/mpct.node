var fs    = require('fs'),
    async = require('async'),
    cmd   = require('mpd').cmd,

    config = require('../config'),
    cacher = require('./cacher'),

    genre,
    client;

var getRandomFrom = function(array, count) {
  var ret = [];

  for (var i=0; i<count; i++) {
    ret.push(array[
      Math.floor(Math.random() * array.length)
    ]);
  }

  return ret;
};

var getToplevel = function(tlShortcode) {
  /*
  var readline = require('readline');
  var rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout
  });

  for (short, tl in config.toplevels) {
    console.log('  ' + short + '  ' + tl "\n");
  }

  rl.question('  > ', function(answer) {
    console.log('chea', answer);
  });
  */

  if (config.toplevels[tlShortcode]) {
    return config.toplevels[tlShortcode];
  }

  throw "Invalid shortcode: " + tlShortcode;
};

var getFiles = function(_cb) {
  async.parallel(config.locations.map(function(p) {
    return function(__cb) {
      var c = cmd('search', ['file', p + genre]);
      client.sendCommand(c, __cb);
    };
  }), function(err, results) {
    if (err) return _cb(err);
    var files = [];
    for (var x=0; x<results.length; x++) {
      var i = 0, msg = results[x];
      while (i < msg.length) {
        var line, j = msg.indexOf("\n", i);
        if (j == -1) j = msg.length;
        line = msg.substr(i, j - i);
        // console.log('line: [' + line + ']');
        i = j + 1;
        if (line.substr(0, 6) !== 'file: ') continue;
        files.push(line.substr(6));
      }
    }

    _cb(null, files);
  });
};

var randomTracksGo = function(files, count, append, _cb) {
  var picks = getRandomFrom(files, count),
      pick1 = picks.shift(),
      tasks = [];

  if (!append) {
    tasks.push(function(__cb) {
      console.log('Clearing playlist');
      client.sendCommand(cmd('clear', []), __cb);
    });
  }

  tasks.push(function(__cb) {
    console.log('Adding:', pick1);
    client.sendCommand(cmd('findadd', ['file', pick1]), __cb);
  });

  if (!append) {
    tasks.push(function(__cb) {
      console.log('Playing');
      client.sendCommand(cmd('play', []), __cb);
    });
  }

  tasks = tasks.concat(picks.map(function(p) {
    return function(__cb) {
      console.log('Adding:', p);
      client.sendCommand(cmd('findadd', ['file', p]), __cb);
    };
  }));

  async.series(tasks, function(err) {
    if (err) throw err;
    console.log('Done!');
    _cb();
  });
};

module.exports.loadClient = function(_client) { client = _client; }

module.exports.run = function(tlShortcode, count, append, cb) {
  genre = getToplevel(tlShortcode);

  cacher.exists(tlShortcode, function(exists) {
    if (exists) {
      cacher.get(tlShortcode, function(err, files) {
        if (err) throw err;
        randomTracksGo(files, count, append, cb);
      });
    } else {
      getFiles(function(err, files) {
        if (err) throw err;
        cacher.set(tlShortcode, files, function(err) {
          if (err) throw err;
          randomTracksGo(files, count, append, cb);
        });
      });
    }
  });
};

