var childProcess = require('child_process'),
    exec         = childProcess.exec,
    spawn        = childProcess.spawn,
    config       = require('../config');

var run = function(args, host, port, cb) {
  if (args[0] === 'status' && args.length === 1) {
    args = [];
  }

  args = ['-h', host, '-p', port].concat(args);

  var out          = '',
      mpc          = spawn(config.mpcBin, args),
      handleOutput = function(o) { out += String(o); };

  mpc.stdout.on('data', handleOutput);
  mpc.stderr.on('data', handleOutput);
  mpc.on('exit', function(code) {
    out = out.trim();
    code ? cb('Error: mpc exited with ' + code + ', ' + out) : cb(out);
  });
};

module.exports.run = run;
