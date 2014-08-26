var fs    = require('fs'),
    async = require('async'),
    cmd   = require('mpd').cmd,

    config = require('../config'),
    cacher = require('./cacher'),
    util   = require('./util'),

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
      files = files.concat(util.filterLinesStartingWith(results[x], 'file: '));
    }

    _cb(null, files);
  });
};

var randomTracksGo = function(allFiles, count, append, cb) {
  var files = getRandomFrom(allFiles, count);
  util.addFilesMaybeAppend(client, files, append, cb);
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

