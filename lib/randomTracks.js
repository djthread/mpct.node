var fs    = require('fs'),
    async = require('async'),
    cmd   = require('mpd').cmd,

    config = require('../config'),
    cacher = require('./cacher'),
		util   = require('./util'),

    genre,
    client;

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

var getAlbums = function(cb) {
	client.sendCommand(cmd('list', ['album']), function(err, albums) {
		if (err) return cb(err);
		cb(null, albums.trim().split("\n").map(function(a) {
			return a.substr(7);
		}));
	});
};

var go = function(albums, count, append, cb) {

	var mapper = function(album, _cb) {
		client.sendCommand(cmd('find', ['album', album]), function(err, data) {
			if (err) return _cb(err);
			var files = util.filterLinesStartingWith(data, 'file: ');
			_cb(null, util.getRandomFrom(files, 1)[0]);
		});
	}

	var tracks = async.map(util.getRandomFrom(albums, count), mapper, function(err, files) {
    if (err) return cb(err);
    util.addFilesMaybeAppend(client, files, append, cb);
	});
};

module.exports.loadClient = function(_client) { client = _client; }

module.exports.run = function(count, append, cb) {

  cacher.exists('albums', function(exists) {
    if (exists) {
      cacher.get('albums', function(err, albums) {
        if (err) throw err;
        go(albums, count, append, cb);
      });
    } else {
      getAlbums(function(err, albums) {
        if (err) throw err;
        cacher.set('albums', albums, function(err) {
          if (err) throw err;
          go(albums, count, append, cb);
        });
      });
    }
  });
};
