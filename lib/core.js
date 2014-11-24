var randomTracksBT = require('./randomTracksBT'),
    randomTracks   = require('./randomTracks'),
    thisAlbum      = require('./thisAlbum'),
    wipeCache      = require('./wipeCache'),
    latestAlbums   = require('./latestAlbums'),
    marantz        = require('./marantz'),
    mpc            = require('./mpc');


module.exports = function(client) {
  randomTracksBT.loadClient(client);
  randomTracks.loadClient(client);
  thisAlbum.loadClient(client);
  latestAlbums.loadClient(client);

  var run = function(args, cb) {

    // console.log('exec', args);

    if (args['v']) {  // set marantz to a reasonable volume
      setTimeout(function() {
        marantz.invoke('v40');
      }, 500);
    }

    if (args['r']) {
      if (args['t']) {
        return randomTracksBT.run(
          args['t'],
          args['c'] || 20,
          args['a'] || false,
          cb
        );
      } else {
        return randomTracks.run(
          args['c'] || 20,
          args['a'] || false,
          cb
        );
      }
    } else if (args['b']) {
      return thisAlbum.run(
        args['a'] || false,
        cb
      );
    } else if (args['l']) {
      return latestAlbums.run(
        args['a'] || false,
        parseInt(args['c']) || 30,
        cb
      );
    } else if (args['w']) {
      return wipeCache.run(cb);

    } else if (args['x']) {
      return mpc.run([args['x']].concat(args['_']), client.host, client.port, cb);

    } else if (args['z']) {
      return marantz.invoke(args['z'], cb);
    }

    cb('Usage: ' + process.argv[1] + " <arguments>\n"
      + "\n"
      + "  Required Arguments (one of the following is required)\n"
      + "    -r random tracks\n"
      + "    -b add the album of the currently playing song\n" 
      + "    -l latest albums\n" 
      + "    -w wipe caches\n"
      + "    -s run web service (port optionally follows, default 6601)\n"
      + "    -x <cmd> raw mpc command\n"
      + "    -z <cmd> invoke marantz.js\n"
      + "\n"
      + "  Optional Arguments (these modify behavior)\n"
      + "    -h set MPD host (default MPD_HOST env var)\n"
      + "    -p set MPD port (default MPD_PORT env var)\n"
      + "    -t <2-letter shortcode> by toplevel\n"
      + "    -c <count> (default 20)\n"
      + "    -d <cacheDir> (default ~/.mpct.node)\n"
      + "    -a append to playlist\n"
      + "    -v set marantz to a reasonable volume\n"
    );
  };

  return {
    run: run
  };
};
