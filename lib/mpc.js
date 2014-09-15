var childProcess = require('child_process'),
    exec         = childProcess.exec,
    spawn        = childProcess.spawn,
    config       = require('../config');

var run = function(args, cb) {
  var out,
    mpc          = spawn(config.mpcBin, args),
    handleOutput = function(o) { out += String(o); };

  mpc.stdout.on('data', handleOutput);
  mpc.stderr.on('data', handleOutput);
  mpc.on('exit', function(code) {
    return code ? cb(out) : cb(null, out);
  });
};

module.exports.run = run;
