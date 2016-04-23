'use strict';

function getCache() {
  var cacheModule = require('./index.js');
  delete require.cache[require.resolve('./index.js')];
  delete require.cache[require.resolve('./app.js')];
  return cacheModule;
}

module.exports = getCache();
