var sys = require('sys');

var cache = {}
function now() { return (new Date).getTime(); }
var debug = false;

exports.put = function(key, value, time) {
  if (debug) sys.puts('caching: '+key+' = '+value+' (@'+time+')');
  var expire = time + now();
  cache[key] = {value: value, expire: expire}

  // clean up space
  if (!isNaN(expire)) {
    setTimeout(function() {
      exports.del(key);
    }, expire);
  }
}

exports.del = function(key) {
  delete cache[key];
}

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != "undefined") {
    if (isNaN(data.expire) || data.expire >= now()) {
      return data.value;
    } else {
      // free some space
      exports.del(key);
    }
  }
  return null;
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
