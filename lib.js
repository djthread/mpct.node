var configDir = process.env['HOME'] + '/.mpct.node';

var fs = require('fs'),
    async = require('async'),
    cmd   = require('mpd').cmd,
    client;

var toplevels = {
  am: 'Ambient',
  ab: 'Ambient Beats',
  bb: 'Breakbeat',
  bc: 'Breakcore, Gabber, and Noise',
  ch: 'Chill Out and Dub',
  cl: 'Classical',
  co: 'Compilations',
  dj: 'DJ Beats',
  db: "Drum 'n Bass",
  dt: 'Dub Techno',
  du: 'Dubstep',
  el: 'Electronic and Electro',
  fo: 'Folk',
  go: 'Goa',
  ho: 'House',
  id: 'IDM',
  ja: 'Jazz',
  me: 'Metal',
  mi: 'Minimalistic',
  po: 'Pop',
  pr: 'Post-rock',
  ra: 'Rap and Hip Hop',
  re: 'Reggae and Dub',
  ro: 'Rock',
  sl: 'Soul',
  so: 'Soundtracks',
  te: 'Techno',
  tr: 'Trance',
  th: 'Trip-Hop',
  we: 'Weird',
  wo: 'World and New Age',
};

var getRandomFrom = function(array, count) {
  var ret = [];

  for (var i=0; i<count; i++) {
    ret.push(array[
      Math.floor(Math.random() * array.length)
    ]);
  }

  return ret;
};

var run = function(_client, args, cb) {

  client = _client;

  if (args['r']) return randomTracks(args['t'], args['c'], args['a'], cb);
  if (args['w']) return wipeCache(cb);

  console.log('Usage: ' + process.argv[1] + " <arguments>\n"
    + "\n"
    + "  Required Arguments (one of the following is required)\n"
    + "    -r random tracks\n"
    + "    -w wipe caches\n"
    + "\n"
    + "  Optional Arguments (these modify behavior)\n"
    + "    -t <2-letter shortcode> by toplevel\n"
    + "    -c <count> (default 20)\n"
    + "\n"
  );
};

var randomTracks = function(tlShortcode, count, append, cb) {
  var genre     = getToplevel(tlShortcode);
  var cacheFile = configDir + '/' + tlShortcode + '.cache';

  fs.stat(cacheFile, function(err, stats) {
    if (err || !stats.isFile()) {
      // No cache, proceed with listing query of the whole genre
      getFiles(function(err, files) {
        if (err) throw err;
        fs.writeFile(cacheFile, files.join("\n"), function(err) {
          if (err) throw err;
          randomTracksGo(files, count, append, cb);
        });
      });
    } else {
      // We has cache!
      fs.readFile(cacheFile, function(err, data) {
        if (err) throw err;
        randomTracksGo(String(data).split("\n"), count, append, cb);
      });
    }
  });

  var getFiles = function(_cb) {
    var locations = [  // These will prefix the genre name
      ''
      // 'tmp/stage/',
      // 'tmp/stage2/',
      // 'tmp/stage3/',
      // 'tmp/stage4/',
    ];

    async.parallel(locations.map(function(p) {
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
};

var getToplevel = function(tlShortcode) {
  /*
  var readline = require('readline');
  var rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout
  });

  for (short, tl in toplevels) {
    console.log('  ' + short + '  ' + tl "\n");
  }

  rl.question('  > ', function(answer) {
    console.log('chea', answer);
  });
  */

  if (toplevels[tlShortcode]) {
    return toplevels[tlShortcode];
  }

  throw "Invalid shortcode: " + tlShortcode;
};

var wipeCache = function(cb) {
  var files = Object.keys(toplevels).map(function(short) {
    return configDir + '/' + short + '.cache';
  });
  async.map(files, fs.unlink, function(err, results) {
    console.log('All cache files wiped.');
    cb();
  });
  // for (var short in toplevels) {
  //
  // }
};

module.exports.run = run;
