var childProcess = require('child_process'),
    exec         = childProcess.exec,
    spawn        = childProcess.spawn,
    config       = require('../config');

var run = function(args, cb) {
  if (args[0] === 'status' && args.length === 1) {
    args = [];
  }

  var out = '',
    mpc          = spawn(config.mpcBin, args),
    handleOutput = function(o) { out += String(o); };

  mpc.stdout.on('data', handleOutput);
  mpc.stderr.on('data', handleOutput);
  mpc.on('exit', function(code) {
    code ? cb('Error: mpc exited with ' + code + ', ' + out) : cb(out);
  });
};

module.exports.run = run;
