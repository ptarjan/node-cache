/* global describe, it, before, beforeEach, afterEach */
'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    cache = require('./index'),
    clock;

chai.use(sinonChai);


describe('node-cache', function() {
  beforeEach(function() {
    clock = sinon.useFakeTimers();

    cache.clear();
  });

  afterEach(function() {
    clock.restore();
  });

  describe('put()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should allow adding a new item to the cache', function() {
      expect(function() {
        cache.put('key', 'value');
      }).to.not.throw();
    });

    it('should allow adding a new item to the cache with a timeout', function() {
      expect(function() {
        cache.put('key', 'value', 100);
      }).to.not.throw();
    });

    it('should allow adding a new item to the cache with a timeout callback', function() {
      expect(function() {
        cache.put('key', 'value', 100, function() {});
      }).to.not.throw();
    });

    it('should throw an error given a non-numeric timeout', function() {
      expect(function() {
        cache.put('key', 'value', 'foo');
      }).to.throw();
    });

    it('should throw an error given a timeout of NaN', function() {
      expect(function() {
        cache.put('key', 'value', NaN);
      }).to.throw();
    });

    it('should throw an error given a timeout of 0', function() {
      expect(function() {
        cache.put('key', 'value', 0);
      }).to.throw();
    });

    it('should throw an error given a negative timeout', function() {
      expect(function() {
        cache.put('key', 'value', -100);
      }).to.throw();
    });

    it('should throw an error given a non-function timeout callback', function() {
      expect(function() {
        cache.put('key', 'value', 100, 'foo');
      }).to.throw();
    });

    it('should cause the timeout callback to fire once the cache item expires', function() {
      var spy = sinon.spy();
      cache.put('key', 'value', 1000, spy);
      clock.tick(999);
      expect(spy).to.not.have.been.called;
      clock.tick(1);
      expect(spy).to.have.been.calledOnce.and.calledWith('key');
    });

    it('should override the timeout callback on a new put() with a different timeout callback', function() {
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      cache.put('key', 'value', 1000, spy1);
      clock.tick(999);
      cache.put('key', 'value', 1000, spy2)
      clock.tick(1001);
      expect(spy1).to.not.have.been.called;
      expect(spy2).to.have.been.calledOnce.and.calledWith('key');
    });

    it('should cancel the timeout callback on a new put() without a timeout callback', function() {
      var spy = sinon.spy();
      cache.put('key', 'value', 1000, spy);
      clock.tick(999);
      cache.put('key', 'value')
      clock.tick(1);
      expect(spy).to.not.have.been.called;
    });
  });

  describe('del()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should return false given a key for an empty cache', function() {
      expect(cache.del('miss')).to.be.false;
    });

    it('should return false given a key not in a non-empty cache', function() {
      cache.put('key', 'value');
      expect(cache.del('miss')).to.be.false;
    });

    it('should return true given a key in the cache', function() {
      cache.put('key', 'value');
      expect(cache.del('key')).to.be.true;
    });

    it('should remove the provided key from the cache', function() {
      cache.put('key', 'value');
      expect(cache.get('key')).to.equal('value');
      expect(cache.del('key')).to.be.true;
      expect(cache.get('key')).to.be.null;
    });

    it('should decrement the cache size by 1', function() {
      cache.put('key', 'value');
      expect(cache.size()).to.equal(1);
      expect(cache.del('key')).to.be.true;
      expect(cache.size()).to.equal(0);
    });

    it('should not remove other keys in the cache', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.get('key1')).to.equal('value1');
      expect(cache.get('key2')).to.equal('value2');
      expect(cache.get('key3')).to.equal('value3');
      cache.del('key1');
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.equal('value2');
      expect(cache.get('key3')).to.equal('value3');
    });

    it('should only delete a key from the cache once even if called multiple times in a row', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.size()).to.equal(3);
      cache.del('key1');
      cache.del('key1');
      cache.del('key1');
      expect(cache.size()).to.equal(2);
    });

    it('should handle deleting keys which were previously deleted and then re-added to the cache', function() {
      cache.put('key', 'value');
      expect(cache.get('key')).to.equal('value');
      cache.del('key');
      expect(cache.get('key')).to.be.null;
      cache.put('key', 'value');
      expect(cache.get('key')).to.equal('value');
      cache.del('key');
      expect(cache.get('key')).to.be.null;
    });

    it('should return true given an non-expired key', function() {
      cache.put('key', 'value', 1000);
      clock.tick(999);
      expect(cache.del('key')).to.be.true;
    });

    it('should return false given an expired key', function() {
      cache.put('key', 'value', 1000);
      clock.tick(1000);
      expect(cache.del('key')).to.be.false;
    });

    it('should cancel the timeout callback for the deleted key', function() {
      var spy = sinon.spy();
      cache.put('key', 'value', 1000, spy);
      cache.del('key');
      clock.tick(1000);
      expect(spy).to.not.have.been.called;
    });
  });

  describe('clear()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should have no effect given an empty cache', function() {
      expect(cache.size()).to.equal(0);
      cache.clear();
      expect(cache.size()).to.equal(0);
    });

    it('should remove all existing keys in the cache', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.size()).to.equal(3);
      cache.clear();
      expect(cache.size()).to.equal(0);
    });

    it('should remove the keys in the cache', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.get('key1')).to.equal('value1');
      expect(cache.get('key2')).to.equal('value2');
      expect(cache.get('key3')).to.equal('value3');
      cache.clear();
      expect(cache.get('key1')).to.be.null;
      expect(cache.get('key2')).to.be.null;
      expect(cache.get('key3')).to.be.null;
    });

    it('should reset the cache size to 0', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.size()).to.equal(3);
      cache.clear();
      expect(cache.size()).to.equal(0);
    });

    it('should reset the debug cache hits', function() {
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits()).to.equal(1);
      cache.clear();
      expect(cache.hits()).to.equal(0);
    });

    it('should reset the debug cache misses', function() {
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('miss1');
      expect(cache.misses()).to.equal(1);
      cache.clear();
      expect(cache.misses()).to.equal(0);
    });

    it('should cancel the timeout callbacks for all existing keys', function() {
      var spy1 = sinon.spy();
      var spy2 = sinon.spy();
      var spy3 = sinon.spy();
      cache.put('key1', 'value1', 1000, spy1);
      cache.put('key2', 'value2', 1000, spy2);
      cache.put('key3', 'value3', 1000, spy3);
      cache.clear();
      clock.tick(1000);
      expect(spy1).to.not.have.been.called;
      expect(spy2).to.not.have.been.called;
      expect(spy3).to.not.have.been.called;
    });
  });

  describe('get()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should return null given a key for an empty cache', function() {
      expect(cache.get('miss')).to.be.null;
    });

    it('should return null given a key not in a non-empty cache', function() {
      cache.put('key', 'value');
      expect(cache.get('miss')).to.be.null;
    });

    it('should return the corresponding value of a key in the cache', function() {
      cache.put('key', 'value');
      expect(cache.get('key')).to.equal('value');
    });

    it('should return the latest corresponding value of a key in the cache', function() {
      cache.put('key', 'value1');
      cache.put('key', 'value2');
      cache.put('key', 'value3');
      expect(cache.get('key')).to.equal('value3');
    });

    it('should handle various types of cache keys', function() {
      var keys = [null, undefined, NaN, true, false, 0, 1, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '', 'a', [], {}, [1, 'a', false], {a:1,b:'a',c:false}, function() {}];
      keys.forEach(function(key, index) {
        var value = 'value' + index;
        cache.put(key, value);
        expect(cache.get(key)).to.deep.equal(value);
      });
    });

    it('should handle various types of cache values', function() {
      var values = [null, undefined, NaN, true, false, 0, 1, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '', 'a', [], {}, [1, 'a', false], {a:1,b:'a',c:false}, function() {}];
      values.forEach(function(value, index) {
        var key = 'key' + index;
        cache.put(key, value);
        expect(cache.get(key)).to.deep.equal(value);
      });
    });

    it('should return the corresponding value of a non-expired key in the cache', function() {
      cache.put('key', 'value', 1000);
      clock.tick(999);
      expect(cache.get('key')).to.equal('value');
    });

    it('should return null given an expired key', function() {
      cache.put('key', 'value', 1000);
      clock.tick(1000);
      expect(cache.get('key')).to.be.null;
    });

    it('should return null given an expired key', function() {
      cache.put('key', 'value', 1000);
      clock.tick(1000);
      expect(cache.get('key')).to.be.null;
    });
  });

  describe('size()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should return 0 given a fresh cache', function() {
      expect(cache.size()).to.equal(0);
    });

    it('should return 1 after adding a single item to the cache', function() {
      cache.put('key', 'value');
      expect(cache.size()).to.equal(1);
    });

    it('should return 3 after adding three items to the cache', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.size()).to.equal(3);
    });

    it('should not multi-count duplicate items added to the cache', function() {
      cache.put('key', 'value1');
      expect(cache.size()).to.equal(1);
      cache.put('key', 'value2');
      expect(cache.size()).to.equal(1);
    });

    it('should update when a key in the cache expires', function() {
      cache.put('key', 'value', 1000);
      expect(cache.size()).to.equal(1);
      clock.tick(999);
      expect(cache.size()).to.equal(1);
      clock.tick(1);
      expect(cache.size()).to.equal(0);
    });
  });

  describe('debug()', function() {
    it('should not count cache hits when false', function() {
      cache.debug(false);
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits()).to.equal(0);
    });

    it('should not count cache misses when false', function() {
      cache.debug(false);
      cache.put('key', 'value');
      cache.get('miss1');
      expect(cache.misses()).to.equal(0);
    });

    it('should count cache hits when true', function() {
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits()).to.equal(1);
    });

    it('should count cache misses when true', function() {
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('miss1');
      expect(cache.misses()).to.equal(1);
    });
  });

  describe('hits()', function() {
    before(function() {
      cache.debug(true);
    });

    it('should return 0 given an empty cache', function() {
      expect(cache.hits()).to.equal(0);
    });

    it('should return 0 given a non-empty cache which has not been accessed', function() {
      cache.put('key', 'value');
      expect(cache.hits()).to.equal(0);
    });

    it('should return 0 given a non-empty cache which has had only misses', function() {
      cache.put('key', 'value');
      cache.get('miss1');
      cache.get('miss2');
      cache.get('miss3');
      expect(cache.hits()).to.equal(0);
    });

    it('should return 1 given a non-empty cache which has had a single hit', function() {
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits()).to.equal(1);
    });

    it('should return 3 given a non-empty cache which has had three hits on the same key', function() {
      cache.put('key', 'value');
      cache.get('key');
      cache.get('key');
      cache.get('key');
      expect(cache.hits()).to.equal(3);
    });

    it('should return 3 given a non-empty cache which has had three hits across many keys', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('key2');
      cache.get('key3');
      expect(cache.hits()).to.equal(3);
    });

    it('should return the correct value after a sequence of hits and misses', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('miss');
      cache.get('key3');
      expect(cache.hits()).to.equal(2);
    });

    it('should not count hits for expired keys', function() {
      cache.put('key', 'value', 1000);
      cache.get('key');
      expect(cache.hits()).to.equal(1);
      clock.tick(999);
      cache.get('key');
      expect(cache.hits()).to.equal(2);
      clock.tick(1);
      cache.get('key');
      expect(cache.hits()).to.equal(2);
    });
  });

  describe('misses()', function() {
    before(function() {
      cache.debug(true);
    });

    it('should return 0 given an empty cache', function() {
      expect(cache.misses()).to.equal(0);
    });

    it('should return 0 given a non-empty cache which has not been accessed', function() {
      cache.put('key', 'value');
      expect(cache.misses()).to.equal(0);
    });

    it('should return 0 given a non-empty cache which has had only hits', function() {
      cache.put('key', 'value');
      cache.get('key');
      cache.get('key');
      cache.get('key');
      expect(cache.misses()).to.equal(0);
    });

    it('should return 1 given a non-empty cache which has had a single miss', function() {
      cache.put('key', 'value');
      cache.get('miss');
      expect(cache.misses()).to.equal(1);
    });

    it('should return 3 given a non-empty cache which has had three misses', function() {
      cache.put('key', 'value');
      cache.get('miss1');
      cache.get('miss2');
      cache.get('miss3');
      expect(cache.misses()).to.equal(3);
    });

    it('should return the correct value after a sequence of hits and misses', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('miss');
      cache.get('key3');
      expect(cache.misses()).to.equal(1);
    });

    it('should count misses for expired keys', function() {
      cache.put('key', 'value', 1000);
      cache.get('key');
      expect(cache.misses()).to.equal(0);
      clock.tick(999);
      cache.get('key');
      expect(cache.misses()).to.equal(0);
      clock.tick(1);
      cache.get('key');
      expect(cache.misses()).to.equal(1);
    });
  });

  describe('keys()', function() {
    before(function() {
      cache.debug(false);
    });

    it('should return an empty array given an empty cache', function() {
      expect(cache.keys()).to.deep.equal([]);
    });

    it('should return a single key after adding a single item to the cache', function() {
      cache.put('key', 'value');
      expect(cache.keys()).to.deep.equal(['key']);
    });

    it('should return 3 keys after adding three items to the cache', function() {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.keys()).to.deep.equal(['key1', 'key2', 'key3']);
    });

    it('should not multi-count duplicate items added to the cache', function() {
      cache.put('key', 'value1');
      expect(cache.keys()).to.deep.equal(['key']);
      cache.put('key', 'value2');
      expect(cache.keys()).to.deep.equal(['key']);
    });

    it('should update when a key in the cache expires', function() {
      cache.put('key', 'value', 1000);
      expect(cache.keys()).to.deep.equal(['key']);
      clock.tick(999);
      expect(cache.keys()).to.deep.equal(['key']);
      clock.tick(1);
      expect(cache.keys()).to.deep.equal([]);
    });
  });
});
