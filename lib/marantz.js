var config = require('../config'),
    net    = require('net');

var marantz = function(cmd, cb) {
    var connected = false;
    var data;

    console.log('connecting to ' + config.marantzIp + ':23...');
    var client = net.connect({host: config.marantzIp, port: 23}, function() {
        connected = true;
        client.write(cmd + "\r\n");
    });
    client.on('data', function(d) {
        data = d.toString();
        client.end();
        console.log('client.end()...');
    });
    client.on('end', function() {
        connected = false;
        console.log('client disconnected');
        if (cb) cb(data);
    });
    client.on('error', function(err) {
      connected = false;
      console.log('having a bad time:', err);
      if (cb) cb(data);
    });

    setTimeout(function() {
        if (!connected) return;
        console.log('500ms, killing');
        client.end();
    }, 500);
}

var togglePower = function(cb) {
    var dice = false;

    marantz('PW?', function(ret) {
        setTimeout(function() {
            if (!ret) return;
            if (ret.match(/PWR:1/)) {  // standby
                console.log('turning on...');
                marantz('PWON', cb);
            } else {                   // on
                console.log('turning off...');
                marantz('PWSTANDBY', cb);
            }
            dice = true;
        }, 100);
    });

    setTimeout(function() {
        if (dice) return;
        console.log('last ditch, turning on.');
        marantz('PWON', cb);
    }, 1000);
};

// Toggle between 2 volume levels for annoying movies with guns and dialog
var toggleVolume = function(cb) {
    var lowOut = '-300', highOut = '-200';  // comes from MV? query
    var low    = '50',    high    = '60';   // goes after MV to change vol

    marantz('MV?', function(ret) {
        setTimeout(function() {
            if (!ret) return;
            if (ret.match(new RegExp('VOL:' + lowOut))) {  // standby
                console.log('raising volume');
                marantz('MV' + high, cb);
            } else {                   // on
                console.log('lowering volume');
                marantz('MV' + low, cb);
            }
        }, 100);
    });
};

var switchInput = function(input, cb) {
    marantz('SI' + input, cb);
};

var invoke = function(command, cb) {
  var matches;

  if (command === 'toggle') {
      togglePower(cb);
  } else if (command === 'pwon') {
      marantz('PWON', cb);
  } else if (command === 'pwoff') {
      marantz('PWSTANDBY', cb);

  } else if (command === 'mobius') {
      switchInput('SAT/CBL', cb);
  } else if (command === 'ccast') {
      switchInput('MPLAY', cb);
  } else if (command === 'mini') {
      switchInput('CD', cb);

  } else if (command === 'vup') {
      marantz('MVUP', cb);
  } else if (command === 'vdn') {
      marantz('MVDOWN', cb);
  } else if (command === 'vtog') {
      toggleVolume(cb);
  } else if (matches = command.match(/^v(\d\d)$/)) {
      marantz('MV' + matches[1], cb);

  } else {
      var usage = '\n  Usage: ' + executable + " <cmd>\n\n"
          + "    toggle - toggle power\n"
          + "    pwon   - power on\n"
          + "    pwoff  - power off\n"
          + "    mobius - switch input to mobius\n"
          + "    ccast  - switch input to chromecast\n"
          + "    mini   - switch input to mini\n"
          + "    vup    - nudge volume up\n"
          + "    vdn    - nudge volume down\n"
          + "    v##    - set volume. 2-digit number between 00 and 98\n";
      console.log(usage);
  }
};

module.exports.marantz      = marantz;
module.exports.togglePower  = togglePower;
module.exports.toggleVolume = toggleVolume;
module.exports.switchInput  = switchInput;
module.exports.invoke       = invoke;

// marantz('MV10', function(r) {
//     console.log(r);
// });
// process.exit();

/*
process.argv.shift();
var executable = process.argv.shift();
var command    = process.argv.shift() || '';

var matches;
*/
