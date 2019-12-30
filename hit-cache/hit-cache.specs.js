var expect = require('chai').expect;
var hitsBasedCache = require('./hit-cache');

function generateMock() {
    var mockCache = {};
    mockCache.put = function (key, value, lifespan, timeoutCallback) {
        mockCache.key = key;
        mockCache.value = value;
        mockCache.lifespan = lifespan;
        mockCache.timeoutCallback = timeoutCallback
    };
    mockCache.get = function (key) { return mockCache.value };
    return mockCache;
}

describe('Hits based cache', function () {
    it('should set correct values when set is called', function () {
        //Mock
        var mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        //Validate
        expect(mock.value.remainingLife).to.equals(0);
        expect(mock.lifespan).to.equals(lifespanInMillis);
        expect(mock.value.value).to.equals(value);
    });

    it('should get correct value after set is called', function () {
        //Mock
        var mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        var cachedvalue = UUT.get(key);
        //Validate
        expect(cachedvalue).to.equals(value);
    });

    it('should get Undefined after lifespan is over.', function () {
        //Mock
        var mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        var tempKey = mock.key;
        var tempValue = mock.value;
        delete mock.key;
        delete mock.value;
        delete mock.lifespan;
        mock.timeoutCallback(tempKey, tempValue);//Simulate timeout

        //Validate
        var actual = UUT.get(key);
        expect(undefined).to.equals(actual);
    });

    it('should increment the lifecount by one when get is called.', function () {
        //Mock
        var mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        var actual = UUT.get(key);

        //Validate
        expect(value).to.equals(actual);
        expect(mock.value.remainingLife).to.equals(1);
        expect(mock.lifespan).to.equals(lifespanInMillis);
    });

    it('should decrement the lifecount by one when lifespan is ellapsed.', function () {
        //Mock
        var mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        var actual = UUT.get(key);

        //Validate
        expect(value).to.equals(actual);
        expect(mock.value.remainingLife).to.equals(1);
        expect(mock.lifespan).to.equals(lifespanInMillis);
        mock.timeoutCallback(mock.key, mock.value);
        expect(value).to.equals(actual);
        expect(mock.value.remainingLife).to.equals(0);
        expect(mock.lifespan).to.equals(lifespanInMillis);
    });
})