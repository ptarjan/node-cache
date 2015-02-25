var cache = {}
function now() { return (new Date).getTime(); }
var debug = false;
var hitCount = 0;
var missCount = 0;
var size = 0;

exports.put = function(key, value, time, timeoutCallback) {
  if (debug) console.log('caching: '+key+' = '+value+' (@'+time+')');
  var oldRecord = cache[key];
	if (oldRecord) {
		clearTimeout(oldRecord.timeout);
	} else {
	  size++;
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
  size--;
  delete cache[key];
}

exports.clear = function() {
  size = 0;
  cache = {};
}

exports.__get = function (key) {
    var data = cache[key];
    if (typeof data != "undefined") {
        if (isNaN(data.expire) || data.expire >= now()) {
            if (debug) hitCount++;
            return data.value;
        } else {
            if (debug) missCount++;
            exports.del(key);
        }
    } else if (debug) {
        missCount++;
    }
    return null;
}

exports.get = function (key, def, args, timeout, TOcb) {
    var data = exports.__get(key);
    if (data === null) {
        var res = null;
        if (typeof def == "function") {
            res = def(args);
        } else {
            res = def;
        }
        exports.put(key, res, timeout, TOcb);
        return res || null;
    } else {
        return data;
    }
}

exports.size = function() {
  return size;
}

exports.memsize = function() {
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
