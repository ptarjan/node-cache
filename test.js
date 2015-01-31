var assert = require('assert');
var cache = require('./index');

function equal(actual, expected) {
    console.log("got: " + actual + ", expected: " + expected);
    assert.equal(actual, expected);
}

cache.debug(false);

// Boolean value
cache.put('keyTrue', true);
equal(cache.get('keyTrue'), true);
cache.clear();
equal(cache.get('keyTrue'), null);
equal(0, cache.size());

// String value
cache.put('keyB', 'valueB', 3000);
equal(cache.size(), 1);
equal(cache.get('keyB'), 'valueB');

console.log("keys == ", cache.keys());

// complicated key
var complicatedKey = ['a', {'b': 'c', 'd': ['e', 3]}, '@'];
cache.put(complicatedKey, true);
equal(cache.get(complicatedKey), true);
cache.del(complicatedKey);
equal(cache.get(complicatedKey), null);

// pure number as key
cache.clear();
equal(cache.size(), 0);
cache.put(0, 0);
equal(cache.size(), 1);
cache.del(0);
equal(cache.size(), 0);

// value auto expire
cache.put('some key', 'some value', 150);
setTimeout(function () {
    equal(cache.get('some key'), 'some value');
    setTimeout(function () {
        equal(cache.get('some key'), null);
    }, 200);
}, 100);

cache.put('timeout', 'timeout', 100);
setTimeout(function () {
    equal(cache.get('timeout'), 'timeout');
    cache.put('timeout', 'timeout-re', 100); // Cancel timeout on NEW put
    setTimeout(function () {
        equal(cache.get('timeout'), 'timeout-re');
    }, 80);
}, 50);

// test callback
cache.put('keyCallbackA', 'ValueCallbackA', 200, function (key, value) {
    equal(key, 'keyCallbackA');
    equal(value, 'ValueCallbackA');
    equal(cache.get('keyCallbackA'), null);
});

// update
cache.put('keyUpdateA', 1);
cache.update('keyUpdateA', 2);
equal(cache.get('keyUpdateA'), 2);

// update timeout
cache.put('keyUpdateB', 1, 100, function (key, value) {
    equal(value, 2);
    equal(cache.get('keyUpdateB'), null);
});
cache.update('keyUpdateB', 2, 200);

setTimeout(function () {
    equal(cache.get('keyUpdateB'), 2)
}, 50);

setTimeout(function () {
    equal(cache.get('keyUpdateB'), 2)
}, 150);
setTimeout(function () {
    equal(cache.get('keyUpdateB'), null)
}, 250);

// final statistic
setTimeout(function () {
    console.log('Cache hits: ' + cache.hits());
    console.log('Cache misses: ' + cache.misses());
}, 2000);