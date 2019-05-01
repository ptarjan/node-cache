'use strict';

function HashMap() {
  var _map = [];
  var _keys = [];

  this.put = function(key, value) {
    var hashCode = _hash(key);

    // get the bucket that the hashcode points to
    // or create a new one
    var bucket = _map[hashCode]

    if(bucket) {
      // If the key was already added then we will just update the value.
      var exists = false;
      for(var i = 0; i < bucket.length; i ++) {
        if(bucket[i][0] === key) {
          exists = true;
          bucket[i][1] = value;
          break;
        }
      }

      if(!exists) {
        _keys.push(key);
        bucket.push([key, value]);
      }
    } else {
      _keys.push(key);
      _map[hashCode] = [[key, value]];
    }
  }

  this.del = function(key) {
    var hashCode = _hash(key);
    var bucket = _map[hashCode];

    if(bucket) {
      if(bucket.length === 1) {
        _map[hashCode] = null;
      } else {

        // There was a collision so find which keys match.
        for(var i = 0; i < bucket.length; i ++) {
          if(bucket[i][0] === key) {
            bucket.splice(i, 1);
            break;
          }
        }
      }

      for(var i = 0; i < _keys.length; i ++) {
        if(_keys[i] === key) {
          _keys.splice(i, 1);
          break;
        }
      }
    }
  }

  this.get = function(key) {
    var hashCode = _hash(key);
    var bucket = _map[hashCode];
    var value; // return undefined if not found

    if(bucket) {
      if(bucket.length === 1) {
        value = bucket[0][1];
      } else {
        // There was a collision so find which keys match.
        bucket.some(function(tuple){
          if(tuple[0] === key) {
            value = tuple[1];
            return true;
          }

          return false;
        });
      }
    }

    return value;
  }

  this.size = function() {
    var size = 0;

    _map.forEach(function(bucket){
      if(bucket) {
        size += bucket.length;
      }
    });

    return size;
  }

  this.getKeys = function(){
    return _keys;
  }

  function _hash(key) {
    var str = String(key);
    var hash = 0;

    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return hash;
  }
}

function Cache () {
  var _cache = new HashMap();
  var _hitCount = 0;
  var _missCount = 0;
  var _size = 0;
  var _debug = false;

  this.put = function(key, value, time, timeoutCallback) {
    if (_debug) {
      console.log('caching: %s = %j (@%s)', key, value, time);
    }

    if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
      throw new Error('Cache timeout must be a positive number');
    } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
      throw new Error('Cache timeout callback must be a function');
    }

    var oldRecord = _cache.get(key);
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      _size++;
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
      }.bind(this), time);
    }

    _cache.put(key,record);

    return value;
  };

  this.del = function(key) {
    var canDelete = true;

    var oldRecord = _cache.get(key);
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

  function _del(key){
    _size--;
    _cache.del(key);
  }

  this.clear = function() {
    _cache.getKeys().forEach(function(key) {
      clearTimeout(_cache.get(key).timeout);
    });
    _size = 0;
    _cache = new HashMap();
    if (_debug) {
      _hitCount = 0;
      _missCount = 0;
    }
  };

  this.get = function(key) {
    var data = _cache.get(key);
    if (typeof data != "undefined") {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        if (_debug) _hitCount++;
        return data.value;
      } else {
        // free some space
        if (_debug) _missCount++;
        del(key);
      }
    } else if (_debug) {
      _missCount++;
    }
    return null;
  };

  this.size = function() {
    return _size;
  };

  this.memsize = function() {
    return _cache.size();
  };

  this.debug = function(bool) {
    _debug = bool;
  };

  this.hits = function() {
    return _hitCount;
  };

  this.misses = function() {
    return _missCount;
  };

  this.keys = function() {
    return _cache.getKeys();
  };

  this.exportJson = function() {
    var plainJsCache = {};

    // Discard the `timeout` property.
    // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
    _cache.getKeys().forEach(function(key) {
      var record = _cache.get(key);
      plainJsCache[key] = {
        value: record.value,
        expire: record.expire || 'NaN',
      };
    });

    return JSON.stringify(plainJsCache);
  };

  this.importJson = function(jsonToImport, options) {
    var cacheToImport = JSON.parse(jsonToImport);
    var currTime = Date.now();

    var skipDuplicates = options && options.skipDuplicates;

    for (var key in cacheToImport) {
      if (cacheToImport.hasOwnProperty(key)) {
        if (skipDuplicates) {
          var existingRecord = _cache.get(key);
          if (existingRecord) {
            if (_debug) {
              console.log('Skipping duplicate imported key \'%s\'', key);
            }
            continue;
          }
        }

        var record = cacheToImport[key];

        // record.expire could be `'NaN'` if no expiry was set.
        // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
        var remainingTime = record.expire - currTime;

        if (remainingTime <= 0) {
          // Delete any record that might exist with the same key, since this key is expired.
          this.del(key);
          continue;
        }

        // Remaining time must now be either positive or `NaN`,
        // but `put` will throw an error if we try to give it `NaN`.
        remainingTime = remainingTime > 0 ? remainingTime : undefined;

        this.put(key, record.value, remainingTime);
      }
    }

    return this.size();
  };
}

module.exports = new Cache();
module.exports.Cache = Cache;
