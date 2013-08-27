# tinycache

A simple, small (~100 lines) in-memory cache for node.js or the browser (~1.5KB minified).

## Installation

    npm install tinycache

## Usage

### Node

    var TinyCache = require( 'tinycache' );
    var cache = new TinyCache();

    // now just use the cache

    cache.put( 'foo', 'bar' );
    console.log( cache.get( 'foo' ) );

    // that wasn't too interesting, here's the good part

    cache.put( 'houdini', 'disapear', 100 ); // Time in ms
    console.log( 'Houdini will now ' + cache.get( 'houdini' ) );

    setTimeout( function() {
      console.log( 'Houdini is ' + cache.get( 'houdini' ) );
    }, 200 );
    
    // don't want to allocate separate caches?
    // there's also a default shared cache:
    var sharedCache = Cache.shared;
    sharedCache.put( 'foo', 'bar' );

    // or you could grab it in a one-liner
    var theSharedCache = require( 'tinycache' ).shared;

### Browser

#### Using Component (http://component.io)

    component install tinycache
    
    ...
    
    var TinyCache = require( 'tinycache' );
    ...
    
#### By hand

    <script src="tinycache.min.js"></script>
    <script>
        var cache = new TinyCache();
        cache.put( 'foo', 'bar' );
    </script>

## API

### put = function(key, value, time)

* Simply stores a value. 
* If time isn't passed in, it is stored forever.
* Will actually remove the value in the specified time (via `setTimeout`)

### get = function(key)

* Retreives a value for a given key

### del = function(key)

* Deletes a key

### clear = function()

* Deletes all keys

### size = function()

* Returns the current number of entries in the cache

### memsize = function()

* Returns the number of entries taking up space in the cache
* Will usually `== size()` unless a `setTimeout` removal went wrong

### hits = function()

* Returns the number of cache hits

### misses = function()

* Returns the number of cache misses.

## TODO

* Namespaces
* A way of walking the cache for diagnostic purposes

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
