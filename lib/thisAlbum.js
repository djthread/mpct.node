var async = require('async'),
    cmd   = require('mpd').cmd,

    client;

module.exports.loadClient = function(_client) { client = _client; }

module.exports.run = function(append, cb) {
  client.sendCommand(cmd('currentsong', []), function(err, stat) {
    var idx, album, match,
      lines = stat.split("\n");

    for (idx in lines) {
      if (match = lines[idx].match(/^Album: (.*)$/)) {
        album = match[1];
        break;
      }
    }
    if (!album) throw "Wtf, no album? " + stat;
    console.log('Adding album:', album);

    if (append) {
      client.sendCommand(cmd('findadd', ['album', album]), cb);
    } else {
      client.sendCommand(cmd('clear', []), function(err) {
        if (err) throw err;
        var command = cmd('findadd', ['album', album]);
        client.sendCommand(command, function(err) {
          if (err) throw err;
          client.sendCommand(cmd('play', []), cb);
        });
      });
    }
  });
};

