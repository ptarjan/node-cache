'use strict';

function createStore () {
  var store = {};
  var cache = Object.create(null);
  var debug = false;
  var hitCount = 0;
  var missCount = 0;
  var size = 0;

  store.put = function(key, value, time, timeoutCallback) {
    if (debug) {
      console.log('caching: %s = %j (@%s)', key, value, time);
    }
    var oldRecord = cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      size++;
    }

    var expire = time + Date.now();
    var record = {
      value: value,
      expire: expire
    };

    if (!isNaN(expire)) {
      var timeout = setTimeout(function() {
        store.del(key);
        if (typeof timeoutCallback === 'function') {
          timeoutCallback(key);
        }
      }, time);
      record.timeout = timeout;
    }

    cache[key] = record;
  };

  store.del = function(key) {
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
      size--;
      delete cache[key];
    }

    return canDelete;
  };

  store.clear = function() {
    for (var key in cache) {
      var oldRecord = cache[key];
      if (oldRecord) {
        clearTimeout(oldRecord.timeout);
      }
    }
    size = 0;
    cache = Object.create(null);
    if (debug) {
      hitCount = 0;
      missCount = 0;
    }
  };

  store.get = function(key) {
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

  store.size = function() {
    return size;
  };

  store.memsize = function() {
    var size = 0,
      key;
    for (key in cache) {
      size++;
    }
    return size;
  };

  store.debug = function(bool) {
    debug = bool;
  };

  store.hits = function() {
    return hitCount;
  };

  store.misses = function() {
    return missCount;
  };

  store.keys = function() {
    return Object.keys(cache);
  };

  return store;
}

module.exports = createStore();
module.exports.createStore = createStore;
