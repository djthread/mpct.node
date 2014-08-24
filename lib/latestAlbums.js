var cmd = require('mpd').cmd,
    
    client;

module.exports.loadClient = function(_client) { client = _client; }

module.exports.run = function(append, cb) {
  var command = cmd('stat', ['modified-since', '2014']);
  client.sendCommand(command, function(err, ret) {
    console.log('uh', err, ret);
    cb();
  });
};
