module.exports = function HitCache(cache) {

    this.set = function (key, value, lifeSpan) {
        var valueWrapper = { "remainingLife": 0, "value": value, "lifespan": lifeSpan };
        cache.put(key, valueWrapper, lifeSpan, this._reIncarnation);
    };

    this.get = function (key) {
        var value = cache.get(key);
        if (value != undefined) {
            value.remainingLife++;//This is by ref updated in value.
            value = value.value;
        }
        return value;
    };

    this._reIncarnation = function (key, value) {
        if (value.remainingLife > 0) {
            value.remainingLife--;
            cache.put(key, value, value.lifespan, this._reIncarnation);
        }
    };
}