var Core     = require('./core'),
    cmd      = require('mpd').cmd,
    async    = require('async'),
    minimist = require('minimist');

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
    // console.log('Adding:', first);
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
      // console.log('Adding:', p);
      client.sendCommand(cmd('findadd', ['file', p]), _cb);
    };
  }));

  async.series(tasks, function(err) {
    if (err) throw err;
    console.log('Done!');
    cb();
  });

};

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
  return minimist(args);
};

var getStatus = function(client, cb) {
  Core(client).run(client, parseCommand('-x status'), function(out) {
    cb(parseStatus(out)); 
  });
};

var parseStatus = function(lines) {
  var parseDetails = function(line) {
    var m = line.match(/volume: ?([\dna%\/]+)\s+repeat: (\w+)\s+random:\s+(\w+)\s+single:\s+(\w+)\s+consume: ?(\w+)/);
    if (m) {
      return { volume:  m[1], repeat:  m[2], random:  m[3],
               single:  m[4], consume: m[5] };
    } else {
      return false;
    }
  };

  var renderStatus = function(s) {
    return 'vol: ' + s.volume + ' repeat: ' + s.repeat + ' random: '
      + s.random + ' single: ' + s.single + ' consume: ' + s.consume;
  };

  var s, ret = {}, out = lines.trim().split("\n");

  if (s = parseDetails(out[0])) {
    ret.playing = false;
    ret.percent = 0;
    ret.status = 'idle';
    ret.moreinfos = [renderStatus(s)];
  } else {
    ret.status = out[0];
    ret.playing = Boolean(out[1].match(/\[playing\]/));
    var matches = out[1].match(/((\d+:\d\d)\/(\d+:\d\d)) \((\d+)%\)/);
    ret.percent = matches[4];

    ret.moreinfos = [
      matches[1] + ' ' + renderStatus(parseDetails(out[2]))
    ];
  }

  return ret;
};

var stringToArray = function(string) {
  var ret = {}, arr = string.split("\n");
  
  string.split("\n").forEach(function(l) {
    var m = l.match(/^(\S+): (.*)$/);

    if (!m) return;

    ret[m[1]] = m[2];
  });

  return ret;
};



module.exports.getRandomFrom           = getRandomFrom;
module.exports.filterLinesStartingWith = filterLinesStartingWith;
module.exports.addFilesMaybeAppend     = addFilesMaybeAppend;
module.exports.parseCommand            = parseCommand;
// module.exports.getStatus               = getStatus;
module.exports.parseStatus             = parseStatus;
module.exports.stringToArray           = stringToArray;
