var getRandomFrom = function(array, count) {
  var ret = [];

  for (var i=0; i<count; i++) {
    ret.push(array[
      Math.floor(Math.random() * array.length)
    ]);
  }

  return ret;
};

var filterLinesStartingWith = function(data, prefix) {

};

module.exports.getRandomFrom = getRandomFrom;
