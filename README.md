# node-cache

A simple in-memory cache for node.js

## Installation

Nothing really. Just clone the repo and use it.

## Usage

    var cache = require('./node-cache')
      , sys   = require('sys')

    // now just use the cache

    cache.put('foo', 'bar');
    sys.puts(cache.get('foo'))

    // that wasn't too interesting, here's the good part

    cache.put('houdini', 'disapear', 100) // Time in ms
    sys.puts('Houdini will now ' + cache.get('houdini'));

    setTimeout(function() {
      sys.puts('Houdini is ' + cache.get('houdini'));
    }, 200);

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

* Deletes a key

### size = function()

* Returns the current number of entries in the cache

### memsize = function()

* Returns the number of entries taking up space in the cache
* Will usually `== size()` unless a `setTimeout` removal went wrong

### debug = function(bool)

* Turns on or off debugging

## TODO

* Namespaces
* A way of walking the cache for diagnostic purposes

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
