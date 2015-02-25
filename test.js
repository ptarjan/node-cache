"use strict";
var cache = require('./index');

cache.debug(false);

cache.put('a', true);
console.log('true == %s', cache.get('a'));
cache.clear();
console.log('null == %s', cache.get('a'));

console.log('null == %s', cache.get('a'));
console.log('0 == %s', cache.size());

cache.put('a', 'b', 3000);
console.log('1 == %s', cache.size());

console.log('b == %s', cache.get('a'));

console.log("keys == ", cache.keys());

var complicated = ['a',{'b':'c','d':['e',3]},'@'];
cache.put(complicated, true);
console.log('true == %s', cache.get(complicated));
cache.del(complicated);
console.log('null == %s', cache.get(complicated));

console.log('1 == %s', cache.size());
cache.put(0, 0);
console.log('2 == %s', cache.size());
cache.del(0);

cache.put('c', 'd', 1000, function() { 
  console.log('callback was called');
});

cache.debug(true);

var basicObject = { foo: 'b', baz: 'a', nug: 'd'};
cache.put('obj', basicObject);
cache.del('obj');

var notObject = "bad";
cache.put('notObj', notObject);
cache.del('notObj');

cache.debug(false);

setTimeout(function() {
  console.log('b == %s', cache.get('a'));
}, 2000);

setTimeout(function() {
  console.log('null == %s', cache.get('a'));
  console.log('0 == %s', cache.size());
}, 4000);

setTimeout(function() {
	console.log('Cache hits: %s',  cache.hits());
	console.log('Cache misses: %s',  cache.misses());
}, 5000);

cache.put('timeout', 'timeout', 2000);

setTimeout(function() {
	console.log('timeout == %s', cache.get('timeout'));
	cache.put('timeout', 'timeout-re', 2000); // Cancel timeout on NEW put
}, 1000);

setTimeout(function() {
	console.log('timeout-re == %s', cache.get('timeout'));
}, 3000);
