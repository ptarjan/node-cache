const expect = require('chai').expect;
//const sinon = require('sinon');
const hitsBasedCache = require('./hit-cache');

function generateMock() {
    const mockCache = {};
    mockCache.put = (key, value, lifespan, timeoutCallback) => {
        mockCache.key = key;
        mockCache.value = value;
        mockCache.lifespan = lifespan;
        mockCache.timeoutCallback = timeoutCallback
    };
    mockCache.get = (key) => mockCache.value;
    return mockCache;
}

describe('Hits based cache', () => {
    it('should set correct values when set is called', () => {
        //Mock
        let mock = generateMock();
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

    it('should get correct value after set is called', () => {
        //Mock
        let mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        let cachedvalue = UUT.get(key);
        //Validate
        expect(cachedvalue).to.equals(value);
    });

    it('should get Undefined after lifespan is over.', () => {
        //Mock
        let mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        let tempKey = mock.key;
        let tempValue = mock.value;
        delete mock.key;
        delete mock.value;
        delete mock.lifespan;
        mock.timeoutCallback(tempKey, tempValue);//Simulate timeout

        //Validate
        let actual = UUT.get(key);
        expect(undefined).to.equals(actual);
    });

    it('should increment the lifecount by one when get is called.', () => {
        //Mock
        let mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        let actual = UUT.get(key);

        //Validate
        expect(value).to.equals(actual);
        expect(mock.value.remainingLife).to.equals(1);
        expect(mock.lifespan).to.equals(lifespanInMillis);
    });

    it('should decrement the lifecount by one when lifespan is ellapsed.', () => {
        //Mock
        let mock = generateMock();
        //Setup
        const UUT = new hitsBasedCache(mock);
        const key = 'Hello';
        const value = 'World';
        const lifespanInMillis = 5000;

        UUT.set(key, value, lifespanInMillis);
        let actual = UUT.get(key);

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