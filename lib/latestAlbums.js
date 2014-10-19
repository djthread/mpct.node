require('array.prototype.findindex');

var cmd    = require('mpd').cmd,
    util   = require('./util'),
    cacher = require('./cacher'),
    
    client;

var buildLatest = function(cb) {
  // var command = cmd('stat', ['modified-since', '2014']);
  var command = cmd('listallinfo', ['tmp/stage5']);
  client.sendCommand(command, function(err, ret) {
    if (err) return cb(err);
    var i,
      curIdx = null,
      albums = [],
      lines  = ret.split("\n");

    // collect array of {file, dir, and last modified}
    for (i=0; i<lines.length; i++) {
      if (lines[i].substr(0, 6) === 'file: ') {
        var file = lines[i].substr(6);
        var dir  = file.substr(0, file.lastIndexOf('/'));

        curIdx = albums.findIndex(function(el) {
          return el.dir === dir;
        });

        if (curIdx === -1) {
          albums.push({dir: dir});
          curIdx = albums.length - 1;
        } else {
          albums[curIdx].dir = dir;
        }
        
      } else if (lines[i].substr(0, 15) === 'Last-Modified: ') {
        if (curIdx === null) continue;
        var lastDate = albums[curIdx.lm];
        var newDate  = new Date(lines[i].substr(15));
        if (!lastDate || lastDate < newDate) {
          albums[curIdx].lm = newDate;
        }
        curIdx = null;
      }
    }

    // Now, sort them by last modified
    albums = albums.sort(function(a, b) {
      return a.lm.getTime() > b.lm.getTime();
    }).reverse();

    cb(null, albums);
  });
};

var latestGo = function(albums, append, count, cb) {
  count = parseInt(count);

  if (count < 0) count = 0;  // goof
  if (count > albums.length) count = albums.length

  // count is actually "end", but same.
  cb(albums.slice(0, count));
};

module.exports.loadClient = function(_client) { client = _client; }

module.exports.run = function(append, count, cb) {

  var go = function(albums) {
    latestGo(albums, append, count, cb);
  };

  cacher.exists('latest', function(exists) {
    exists = false;
    if (exists) {
      cacher.getJson('latest', function(err, albums) {
        if (err) throw err;
        go(albums);
      });
    } else {
      buildLatest(function(err, albums) {
        if (err) throw err;
        cacher.setJson('latest', albums, function(err) {
          if (err) throw err;
          go(albums);
        });
      });
    }
  });
};
