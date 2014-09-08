var childProcess = require('child_process'),
    exec         = childProcess.exec,
    spawn        = childProcess.spawn,
		config       = require('../config');

var run = function(cmd, cb) {
	console.log('mpc cmd:', cmd);
	var out,
  	mpc					 = spawn(config.mpcBin, cmd.split(' ')),
		handleOutput = function(o) { out += String(o); };

	mpc.stdout.on('data', handleOutput);
	mpc.stderr.on('data', handleOutput);
	mpc.on('exit', function(code) {
		return code ? cb(out) : cb(null, out);
	});
};

module.exports.run = run;
