'use strict';

var Cache = (function () {
  var cache = Object.create(null);
  var hitCount = 0;
  var missCount = 0;
  var size = 0;

  function Cache (debug) {
    this._debug = debug || false;
  }

  Cache.prototype.put = function(key, value, time, timeoutCallback) {
    if (this._debug) {
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
        this.del(key);
        if (timeoutCallback) {
          timeoutCallback(key);
        }
      }.bind(this), time);
    }

    cache[key] = record;

    return value;
  };

  Cache.prototype.del = function(key) {
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

  Cache.prototype.clear = function() {
    for (var key in cache) {
      clearTimeout(cache[key].timeout);
    }
    size = 0;
    cache = Object.create(null);
    if (this._debug) {
      hitCount = 0;
      missCount = 0;
    }
  };

  Cache.prototype.get = function(key) {
    var data = cache[key];
    if (typeof data != "undefined") {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        if (this._debug) hitCount++;
        return data.value;
      } else {
        // free some space
        if (this._debug) missCount++;
        size--;
        delete cache[key];
      }
    } else if (this._debug) {
      missCount++;
    }
    return null;
  };

  Cache.prototype.size = function() {
    return size;
  };

  Cache.prototype.memsize = function() {
    var size = 0,
      key;
    for (key in cache) {
      size++;
    }
    return size;
  };

  Cache.prototype.debug = function(bool) {
    this._debug = bool;
  };

  Cache.prototype.hits = function() {
    return hitCount;
  };

  Cache.prototype.misses = function() {
    return missCount;
  };

  Cache.prototype.keys = function() {
    return Object.keys(cache);
  };

  return Cache;
})();

module.exports = new Cache();
module.exports.Cache = Cache;