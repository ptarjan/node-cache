var cache = require('./index')
    sys = require('sys')
;

cache.debug = true;

sys.puts('null == '+cache.get('a'));
sys.puts('0 == '+cache.size());

cache.put('a', 'b', 3000);
sys.puts('1 == '+cache.size());

sys.puts('b == '+cache.get('a'));

setTimeout(function() {
  sys.puts('b == '+cache.get('a'));
}, 2000);

setTimeout(function() {
  sys.puts('null == '+cache.get('a'));
  sys.puts('0 == '+cache.size());
}, 4000);
  
