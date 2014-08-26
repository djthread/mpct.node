var cmd   = require('mpd').cmd,
    async = require('async');

var getRandomFrom = function(array, count) {
  var ret = [];

  for (var i=0; i<count; i++) {
    ret.push(array[
      Math.floor(Math.random() * array.length)
    ]);
  }

  return ret;
};
var filterLinesStartingWith = function(data, prefix) {
  var lines = [], i = 0;

  while (i < data.length) {
    var line, j = data.indexOf("\n", i);
    if (j == -1) j = data.length;
    line = data.substr(i, j - i);
    // console.log('line:', line);
    i = j + 1;
    if (line.substr(0, prefix.length) !== prefix) continue;
    lines.push(line.substr(prefix.length));
  }

  return lines;
};

var addFilesMaybeAppend = function(client, files, append, cb) {

  var first = files.shift(),
      tasks = [];

  if (!append) {
    tasks.push(function(_cb) {
      console.log('Clearing playlist');
      client.sendCommand(cmd('clear', []), _cb);
    });
  }

  tasks.push(function(_cb) {
    console.log('Adding:', first);
    client.sendCommand(cmd('findadd', ['file', first]), _cb);
  });

  if (!append) {
    tasks.push(function(_cb) {
      console.log('Playing');
      client.sendCommand(cmd('play', []), _cb);
    });
  }

  tasks = tasks.concat(files.map(function(p) {
    return function(_cb) {
      console.log('Adding:', p);
      client.sendCommand(cmd('findadd', ['file', p]), _cb);
    };
  }));

  async.series(tasks, function(err) {
    if (err) throw err;
    console.log('Done!');
    cb();
  });

};

module.exports.getRandomFrom           = getRandomFrom;
module.exports.filterLinesStartingWith = filterLinesStartingWith;
module.exports.addFilesMaybeAppend     = addFilesMaybeAppend;
