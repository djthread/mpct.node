var mpd   = require('mpd'),
    async = require('async');

var client = mpd.connect({
  port: 6600,
  host: 'mobius.threadbox.net',
});

var getRandomFrom = function(array, count) {
  var ret = [];

  for (var i=0; i<=count; i++) {
    ret.push(array[
      Math.floor(Math.random() * array.length)
    ]);
  }

  return ret;
};

client.on('ready', function() {
  console.log('ready');
  var files = [];

  var genre = "Drum 'n Bass";

  async.parallel([
    function(cb) {
      var cmd = mpd.cmd('search', ['file', 'tmp/stage/' + genre]);
      client.sendCommand(cmd, cb);
    }, function(cb) {
      var cmd = mpd.cmd('search', ['file', 'tmp/stage2/' + genre]);
      client.sendCommand(cmd, cb);
    }, function(cb) {
      var cmd = mpd.cmd('search', ['file', 'tmp/stage3/' + genre]);
      client.sendCommand(cmd, cb);
    }, function(cb) {
      var cmd = mpd.cmd('search', ['file', 'tmp/stage4/' + genre]);
      client.sendCommand(cmd, cb);
    }], function(err, results) {
      if (err) throw err;
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

      var picks = getRandomFrom(files, 20);

      async.eachSeries(picks, function(cur, cb) {
        console.log('Adding:', cur);
        client.sendCommand(mpd.cmd('findadd', ['file', cur]), cb);
      }, function(err) {
        if (err) throw err;
        console.log('Done');
      });
    });
});
client.on('system', function(name) {
  console.log('update', name);
});
client.on('system-player', function() {
  client.sendCommand(mpd.cmd('status', []), function(err, msg) {
    if (err) throw err;
    console.log(msg);
  });
});
