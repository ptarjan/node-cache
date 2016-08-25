# memory-cache [![Build Status](https://travis-ci.org/ptarjan/node-cache.svg?branch=master)](https://travis-ci.org/ptarjan/node-cache)

A simple in-memory cache for node.js

## Installation

    npm install memory-cache --save

## Usage

```javascript
var cache = require('memory-cache');

// now just use the cache

cache.put('foo', 'bar');
console.log(cache.get('foo'));

// that wasn't too interesting, here's the good part

cache.put('houdini', 'disappear', 100, function(key, value) {
    console.log(key + ' did ' + value);
}); // Time in ms

console.log('Houdini will now ' + cache.get('houdini'));

setTimeout(function() {
    console.log('Houdini is ' + cache.get('houdini'));
}, 200);
```

which should print

    bar
    Houdini will now disappear
    houdini did disappear
    Houdini is null

## API

### put = function(key, value, time, timeoutCallback)

Simply stores a value. The function returns the stored value.

* `key`:
  * Key used to store the value
* `value`:
  * The value associated to the key
* `time`:
  * If time isn't passed in, it is stored forever
  * Expressed in milliseconds
  * The function will throw an error if `time` isn't a positive number
  * If this value is passed, the key will actually be removed in the specified time (via `setTimeout`)
* `timeoutCallback`:
  * An optional function fired after entry has expired with `key` and `value` passed (`function(key, value) {}`)
  * If this parameter is not of type `function`, the function will throw an error


### get = function(key)

* Retrieves a value for a given key
* If value isn't cached, returns `null`

### del = function(key)

* Deletes a key, returns a boolean specifying whether or not the key was deleted

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

* Returns the number of cache hits (only monitored in debug mode)

### misses = function()

* Returns the number of cache misses (only monitored in debug mode)

### keys = function()

* Returns all the cache keys


## Note on Patches/Pull Requests

* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
