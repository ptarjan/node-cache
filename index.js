var cache = {}
function now() { return (new Date).getTime(); }
var debug = false;
var hitCount = 0;
var missCount = 0;

exports.put = function(key, value, time, timeoutCallback) {
  if (debug) console.log('caching: '+key+' = '+value+' (@'+time+')');
  var oldRecord = cache[key];
	if (oldRecord) {
		clearTimeout(oldRecord.timeout);
	}

	var expire = time + now();
	var record = {value: value, expire: expire};

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
}

exports.del = function(key) {
  delete cache[key];
}

exports.clear = function() {
  cache = {};
}

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= now()) {
	  if (debug) hitCount++;
      return data.value;
    } else {
      // free some space
      if (debug) missCount++;
      exports.del(key);
    }
  } else if (debug) {
    missCount++;
  }
  return null;
}


exports.fetch = function(key, time, timeoutCallback) {
  function setFromCallback(callback) {
    this._from_callback = callback;
    return this;
  }

  function setThenCallback(callback) {
    this._then_callback = callback;

    value = exports.get(this.key, this.time, this.timeoutCallback)

    if (value === null || typeof value === "undefined")
      this._from_callback(this); //Otherwise, node-cache expects the caller to resolve
    else
      this.resolve(value, true); //If value is present, node-cache resolves and force it not to cache again
    return this;
  }

  function resolveCacheValue(value, do_not_cache) {
    if (!do_not_cache) exports.put(this.key, value, this.time, this.timeoutCallback);
    this._then_callback(value);
  }

  return {
    key: key,
    time: time,
    timeoutCallback: timeoutCallback,
    from: setFromCallback,
    then: setThenCallback,
    resolve: resolveCacheValue
  }
}

exports.size = function() {
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key))
      if (exports.get(key) !== null)
        size++;
  }
  return size;
}

exports.memsize = function() {
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key))
      size++;
  }
  return size;
}

exports.debug = function(bool) {
  debug = bool;
}

exports.hits = function() {
	return hitCount;
}

exports.misses = function() {
	return missCount;
}

exports.keys = function() {
  return Object.keys(cache);
};
