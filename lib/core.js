var randomTracksBT = require('./randomTracksBT'),
    randomTracks   = require('./randomTracks'),
    thisAlbum      = require('./thisAlbum'),
    wipeCache      = require('./wipeCache'),
    latestAlbums   = require('./latestAlbums');


var run = function(client, args, cb) {

  randomTracksBT.loadClient(client);
  randomTracks.loadClient(client);
  thisAlbum.loadClient(client);
  latestAlbums.loadClient(client);

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
      cb
    );
  } else if (args['w']) {
    return wipeCache.run(cb);
  }

  cb(null, 'Usage: ' + process.argv[1] + " <arguments>\n"
    + "\n"
    + "  Required Arguments (one of the following is required)\n"
    + "    -s run web service (port optionally follows, default 6601)\n"
    + "    -r random tracks\n"
    + "    -b add the album of the currently playing song\n" 
    + "    -l latest albums\n" 
    + "    -w wipe caches\n"
    + "\n"
    + "  Optional Arguments (these modify behavior)\n"
    + "    -t <2-letter shortcode> by toplevel\n"
    + "    -c <count> (default 20)\n"
    + "    -a append to playlist\n"
  );
};

module.exports.run = run;
