# node-cache

A simple in-memory cache for node.js

## Installation

    npm install memory-cache

## Usage

```javascript
var cache = require('memory-cache');

// now just use the cache

cache.put('foo', 'bar');
console.log(cache.get('foo'))

// that wasn't too interesting, here's the good part

cache.put('houdini', 'disapear', 100) // Time in ms
console.log('Houdini will now ' + cache.get('houdini'));

setTimeout(function() {
  console.log('Houdini is ' + cache.get('houdini'));
}, 200);
```

which should print

    bar
    Houdini will now disapear
    Houdini is null

## API

### put = function(key, value, time)

* Simply stores a value. 
* If time isn't passed in, it is stored forever.
* Will actually remove the value in the specified time (via `setTimeout`)

### get = function(key)

* Retreives a value for a given key

### del = function(key)

* Deletes a key, return a bool specify whether or not a key was deleted.

### clear = function()

* Deletes all keys

### size = function()

* Returns the current number of entries in the cache

### memsize = function()

* Returns the number of entries taking up space in the cache
* Will usually `== size()` unless a `setTimeout` removal went wrong

### debug = function(bool)

* Turns on or off debugging

### hits = function()

* Returns the number of cache hits

### misses = function()

* Returns the number of cache misses.

### keys = function()

* Returns all the cache keys


## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
