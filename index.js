'use strict';

var cache = {};

function now() {
  return (new Date()).getTime();
}
var debug = false;
var hitCount = 0;
var missCount = 0;
var size = 0;

exports.put = function(key, value, time, timeoutCallback) {
  if (debug) {
    console.log('caching: %s = %j (@%s)', key, value, time);
  }

  if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
    throw new Error('Cache timeout must be a positive number');
  } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
    throw new Error('Cache timeout callback must be a function');
  }

  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
  } else {
    size++;
  }

  var record = {
    value: value,
    expire: time + now()
  };

  var timeout = setTimeout(function() {
    exports.del(key);
    if (timeoutCallback) {
      timeoutCallback(key);
    }
  }, time);
  record.timeout = timeout;

  cache[key] = record;
};

exports.del = function(key) {
  var deleted = false;

  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
    size--;
    delete cache[key];
    deleted = true;
  }

  return deleted;
};

exports.clear = function() {
  for (var key in cache) {
    var oldRecord = cache[key];
    clearTimeout(oldRecord.timeout);
  }
  size = 0;
  cache = {};
  if (debug) {
    hitCount = 0;
    missCount = 0;
  }
};

exports.get = function(key) {
  var value = null;

  var data = cache[key];
  if (typeof data !== "undefined") {
    if (debug) hitCount++;
    value = data.value;
  } else if (debug) {
    missCount++;
  }

  return value;
};

exports.size = function() {
  return size;
};

exports.debug = function(bool) {
  debug = bool;
};

exports.hits = function() {
  return hitCount;
};

exports.misses = function() {
  return missCount;
};

exports.keys = function() {
  return Object.keys(cache);
};
