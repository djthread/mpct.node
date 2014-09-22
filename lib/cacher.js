var fs    = require('fs'),
    async = require('async'),

    config = require('../config'),
    
    fileSuffix = '.cache';

var filename = function(simple) {  // simple e.g. "db"
  return config.cacheDir
    + '/' + simple + fileSuffix;
};

var set = function(name, content, cb) {
  fs.writeFile(
      filename(name), content.join("\n"), cb);
};

var get = function(name, cb) {
  fs.readFile(filename(name), function(err, data) {
    if (err) return cb(err);
    cb(null, String(data).split("\n"));
  });
};

var setJson = function(name, content, cb) {
  fs.writeFile(filename(name), JSON.stringify(content), cb);
};

var getJson = function(name, cb) {
  fs.readFile(filename(name), function(err, data) {
    if (err) return cb(err);
    cb(null, JSON.parse(data));
  });
};

var exists = function(name, cb) {
  fs.stat(filename(name), function(err, stats) {
    return cb(!err && stats.isFile());
  });
};

var clear = function(cb) {
  fs.readdir(config.cacheDir, function(err, list) {
    if (err) return cb(err);
    list = list.map(function(i) {
      return config.cacheDir + '/' + i;
    });
    async.map(list, fs.unlink, cb);
  });
};

module.exports.set     = set;
module.exports.get     = get;
module.exports.setJson = setJson;
module.exports.getJson = getJson;
module.exports.exists  = exists;
module.exports.clear   = clear;
