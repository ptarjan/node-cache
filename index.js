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
  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
  } else {
    size++;
  }

  var expire = time + now();
  var record = {
    value: value,
    expire: expire
  };

  if (!isNaN(expire)) {
    var timeout = setTimeout(function() {
      exports.del(key);
      if (typeof timeoutCallback === 'function') {
        timeoutCallback(key);
      }
    }, time);
    record.timeout = timeout;
  }

  cache[key] = record;
};

exports.del = function(key) {
  var oldRecord = cache[key];
  var ret = true;
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
    if (!isNaN(oldRecord.expire) && oldRecord.expire < now()) {
      ret = false;
    }
  } else {
    return false;
  }
  size--;
  delete cache[key];
  return true;
};

exports.clear = function() {
  for (var key in cache) {
    var oldRecord = cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    }
  }
  size = 0;
  cache = {};
};

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= now()) {
      if (debug) hitCount++;
      return data.value;
    } else {
      // free some space
      if (debug) missCount++;
      delete cache[key];
    }
  } else if (debug) {
    missCount++;
  }
  return null;
};

exports.size = function() {
  return size;
};

exports.memsize = function() {
  var size = 0,
    key;
  for (key in cache) {
    if (cache.hasOwnProperty(key))
      size++;
  }
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