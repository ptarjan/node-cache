'use strict';

var cache = Object.create(null);
var debug = false;
var hitCount = 0;
var missCount = 0;
var lastHit = [];
var maxSize;
var lifeTime;

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
  }

  if (lifeTime && time === undefined) {
    time = lifeTime;
  }

  if (lastHit.indexOf(key) === -1) {
    lastHit.push(key);
  } else {
    lastHit.push(lastHit.splice(lastHit.indexOf(key), 1)[0]);
  }

  if (maxSize && lastHit.length > maxSize) {
    clearTimeout(cache[lastHit[0]].timeout);
    _del(lastHit[0]);
  }

  var record = {
    value: value,
    expire: time + Date.now()
  };

  if (!isNaN(record.expire)) {
    record.timeout = setTimeout(function() {
      _del(key);
      if (timeoutCallback) {
        timeoutCallback(key);
      }
    }, time);
  }

  cache[key] = record;

  return value;
};

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

function _del(key) {
  lastHit.splice(lastHit.indexOf(key), 1);
  delete cache[key];
}

exports.clear = function() {
  for (var key in cache) {
    clearTimeout(cache[key].timeout);
  }
  lastHit = [];
  cache = Object.create(null);
  if (debug) {
    hitCount = 0;
    missCount = 0;
  }
};

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= Date.now()) {
      lastHit.push(lastHit.splice(lastHit.indexOf(key), 1)[0]);
      if (debug) hitCount++;
      return data.value;
    } else {
      // free some space
      if (debug) missCount++;
      _del(key);
    }
  } else if (debug) {
    missCount++;
  }
  return null;
};

exports.size = function() {
  return lastHit.length;
};

exports.life = function(value) {
  if (value === 0) {
    lifeTime = undefined;
  } else if (typeof value !== 'undefined' && (typeof value !== 'number' || isNaN(value) || value <= 0)) {
    throw new Error('Cache timeout must be a positive number');
  } else if (typeof value === 'number') lifeTime = value;

  return lifeTime;
};

exports.maxSize = function(value) {
  if (value === 0) {
    maxSize = undefined;
  } else if (typeof value !== 'undefined' && (typeof value !== 'number' || isNaN(value) || value <= 0)) {
    throw new Error('max Size must be a positive number');
  } else if (typeof value === 'number') maxSize = value;

  return maxSize;
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
