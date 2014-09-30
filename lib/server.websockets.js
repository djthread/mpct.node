var core     = require('./core'),
    util     = require('./util'),
    cmd      = require('mpd').cmd,
    status   = {},
    client;

var getStatus = function() {
  util.getStatus(client, function(s) {
    console.log('k', s);
    if (!s) return;
    status = s;
  });
};

var onConnection = function(socket) {
  console.log('hai!');
};

var init = function(c) {
  client = c;

  if (Object.getOwnPropertyNames(status).length === 0) {
    getStatus();
  }
}


module.exports.onConnection = onConnection;
module.exports.init         = init;
