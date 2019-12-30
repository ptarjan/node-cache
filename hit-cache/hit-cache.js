module.exports = class HitCache {
    constructor(cache) {
        this._cache = cache;

        this._reIncarnation = this._reIncarnation.bind(this);
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);
    }

    set(key, value, oneLifeSpan) {
        let valueWrapper = { "remainingLife": 0, "value": value, "lifespan": oneLifeSpan };
        this._cache.put(key, valueWrapper, oneLifeSpan, this._reIncarnation);
    }

    get(key) {
        let value = this._cache.get(key);
        if (value !== undefined) {
            value.remainingLife++;//This is by ref updated in value.
            value = value.value;
        }
        return value;
    }

    _reIncarnation(key, value) {
        if (value.remainingLife > 0) {
            value.remainingLife--;
            this._cache.put(key, value, value.lifespan, this._reIncarnation);
        }
    }
}