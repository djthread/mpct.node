var async    = require('async'),
    core     = require('./core'),
    util     = require('./util'),
    cmd      = require('mpd').cmd,
    status   = {},
    sockets  = [],
    client;

// var getStatus = function() {
//   util.getStatus(client, function(s) {
//     status = s ? s : { status: 'Status Unavailable' };
//   });
// };

var init = function(c) {
  client = c;

  // When state changes, tell all the sockets about it
  client.on('system', function(type) {
    console.log('system', type);
    if (type === 'player') {
      refreshStatus();
    } else if (type === 'mixer') {
      client.sendCommand(cmd('status', []), function(err, data) {
        console.log('status', data);
      });
    } else if (type === 'playlist') {
      refreshStatus();
    }
  });

  client.on('system-player', function(a) {
    console.log('system-player', a);
  });

  if (Object.getOwnPropertyNames(status).length === 0) {
    refreshStatus();
  }
}

// Tell all the sockets about the status
var refreshStatus = function(cb) {
  async.parallel({
    currentSong: function(_cb) {
      client.sendCommand(cmd('currentsong', []), _cb);
    },
    playlist: function(_cb) {
      client.sendCommand(cmd('playlistinfo', []), _cb);
    },
    status: function(_cb) {
      client.sendCommand(cmd('status', []), _cb);
    }
  }, function(err, results) {
    if (err || !results) {
      console.log('statusRefresh failed?!:', err);
      return cb(err);
    }

    cs = util.stringToArray(results.currentSong);
    s  = util.stringToArray(results.status);

    status = {
      currentSong: {
        Artist: cs.Artist,
        Title:  cs.Title,
        Album:  cs.Album,
        Time:   cs.Time,
        Date:   cs.Date,
        Pos:    cs.Pos
      },
      status: s,
      playlist: []
    };

    var cur = {};
    
    results.playlist.trim().split("\n").filter(function(l) {
      return l.match(/^(Artist|Title|Pos):/);
    }).forEach(function(l) {
      var m = l.match(/^(\S+): (.*)$/);
      if (!m) return;

      cur[m[1]] = m[2];

      if (m[1] === 'Pos') {
        status.playlist.push(cur);
        cur = {};
      }
    });

    // console.log('statuss', typeof status, status);
    pushStatus();

    if (cb) cb();
  });
};

var pushStatus = function() {
  sockets.forEach(function(s) { s.emit('status', status); });
};

var onConnect = function(socket) {
  console.log('onConnection!', socket.id);

  sockets.push(socket);

  socket.on('status', function() {
    socket.emit('status', status);
  });

  socket.on('command', function(command) {
    core.run(client, util.parseCommand(command), function(out) {
      socket.emit('response', out);
    });
  });

  socket.on('disconnect', function() {
    console.log('discon', socket.id);
    sockets = sockets.filter(function(s) {
      return s.id !== socket.id;
    });
  });

};

module.exports.init      = init;
module.exports.onConnect = onConnect;
