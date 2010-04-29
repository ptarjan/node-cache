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

## TODO

* Namespaces

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Send me a pull request.
