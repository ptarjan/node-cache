var cache = {};

function now() {
    return (new Date).getTime();
}

function log(s) {
    console.log(new Date() + s);
}

var debug = false;
var hitCount = 0;
var missCount = 0;

exports.put = function (key, value, time, timeoutCallback) {
    if (debug) log('caching: ' + key + ' = ' + value + ' (@' + time + ')');
    exports.del(key);

    var expire = time + now();
    var record = {
        value: value,
        expire: expire,
        timeout: null,
        callback: null,
        timeoutCallback: timeoutCallback
    };

    if (!isNaN(expire)) {
        record.callback = function (key) {
            if (typeof this.timeoutCallback === 'function')
                this.timeoutCallback(key, this.value);
            exports.del(key);
        };
        record.timeout = setTimeout(function () {
            var record = cache[key];
            if (record) record.callback(key);
        }, time);
    }
    cache[key] = record;
};

exports.update = function (key, value, time) {
    var record = cache[key];
    if (record) {
        if (debug) log("update [" + key + "] with value: " + value + ", timeout: " + time);
        record.value = value;
        record.expire = time + now();
        if (!isNaN(time)) {
            clearTimeout(record.timeout);
            record.timeout = setTimeout(function () {
                var record = cache[key];
                if (record) record.callback(key);
            }, time);
        }
    } else {
        exports.put(key, value, time);
    }
};

exports.del = function (key) {
    var record = cache[key];
    if (record) {
        clearTimeout(record.timeout);
        delete cache[key];
    }
};

exports.clear = function () {
    cache = {};
};

exports.get = function (key) {
    var data = cache[key];
    if (typeof data != "undefined") {
        if (isNaN(data.expire) || data.expire >= now()) {
            if (debug) hitCount++;
            return data.value;
        } else {
            // free some space
            if (debug) missCount++;
            exports.del(key);
        }
    } else if (debug) {
        missCount++;
    }
    return null;
};

exports.size = function () {
    var size = 0, key;
    for (key in cache) {
        if (cache.hasOwnProperty(key))
            if (exports.get(key) !== null)
                size++;
    }
    return size;
};

exports.memsize = function () {
    var size = 0, key;
    for (key in cache) {
        if (cache.hasOwnProperty(key)) size++;
    }
    return size;
};

exports.debug = function (bool) {
    debug = bool;
};

exports.hits = function () {
    return hitCount;
};

exports.misses = function () {
    return missCount;
};

exports.keys = function () {
    return Object.keys(cache);
};