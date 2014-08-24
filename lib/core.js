var randomTracksBT = require('./randomTracksBT'),
    thisAlbum      = require('./thisAlbum'),
    wipeCache      = require('./wipeCache'),
    latestAlbums   = require('./latestAlbums');


module.exports.run = function(client, args, cb) {

  randomTracksBT.loadClient(client);
  thisAlbum.loadClient(client);
  latestAlbums.loadClient(client);

  if (args['r']) {
    return randomTracksBT.run(
      args['t'] || false,
      args['c'] || 20,
      args['a'] || false,
      cb
    );
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

  console.log('Usage: ' + process.argv[1] + " <arguments>\n"
    + "\n"
    + "  Required Arguments (one of the following is required)\n"
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

  cb();
};
