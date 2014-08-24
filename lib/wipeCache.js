var cacher = require('./cacher');

module.exports.run = function(cb) {
  console.log('Clearing cache files');
  cacher.clear(cb);
};
