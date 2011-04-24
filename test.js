var cache = require('./index')
    sys = require('sys')
;

cache.debug(false);

sys.puts('null == '+cache.get('a'));
sys.puts('0 == '+cache.size());

cache.put('a', 'b', 3000);
sys.puts('1 == '+cache.size());

sys.puts('b == '+cache.get('a'));

var complicated = ['a',{'b':'c','d':['e',3]},'@'];
cache.put(complicated, true);
sys.puts('true == '+cache.get(complicated));
cache.del(complicated);
sys.puts('null == '+cache.get(complicated));

sys.puts('1 == '+cache.size());
cache.put(0, 0);
sys.puts('2 == '+cache.size());
cache.del(0);

setTimeout(function() {
  sys.puts('b == '+cache.get('a'));
}, 2000);

setTimeout(function() {
  sys.puts('null == '+cache.get('a'));
  sys.puts('0 == '+cache.size());
}, 4000);
  
setTimeout(function() {
	sys.puts('Cache hits: ' + cache.hits());
	sys.puts('Cache misses: ' + cache.misses());	
}, 5000);