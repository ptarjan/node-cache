'use strict';

var cache = Object.create(null);
var debug = false;
var hitCount = 0;
var missCount = 0;
var size = 0;
var limit = null;
var keysArray = [];

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
    expire: time + Date.now()
  };

  if (!isNaN(record.expire)) {
    record.timeout = setTimeout(function() {
      _del(key);
      if (timeoutCallback) {
        timeoutCallback(key, value);
      }
    }, time);
  }

  cache[key] = record;
  keysArray.push(key);
  removeOutOfLimit();

  return value;
};

function removeOutOfLimit() {
  while (limit && (size > limit)) {
	_del(keysArray[0]);
  }
}

exports.del = function(key) {
  var canDelete = true;

  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
    if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
      canDelete = false;
    }
  } else {
    canDelete = false;
  }

  if (canDelete) {
    _del(key);
  }

  return canDelete;
};

exports.limit = function(value) {
  if (value === undefined) {
    return limit;
  }
  var numValue = Number(value);
  limit = numValue > 0 ? numValue : null;
  removeOutOfLimit();
}

function _del(key){
  size--;
  keysArray = keysArray.filter(function(keyItem) {
    return keyItem !== key;
  });
  delete cache[key];
}

exports.clear = function() {
  for (var key in cache) {
    clearTimeout(cache[key].timeout);
  }
  size = 0;
  cache = Object.create(null);
  keysArray = [];
  if (debug) {
    hitCount = 0;
    missCount = 0;
  }
};

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= Date.now()) {
      if (debug) hitCount++;
      return data.value;
    } else {
      // free some space
      if (debug) missCount++;
      size--;
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
