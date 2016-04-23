'use strict';

function getCache() {
  const cacheModule = require('./index.js');
  delete require.cache[require.resolve('./index.js')];
  delete require.cache[require.resolve('./app.js')];
  return cacheModule;
}

module.exports = getCache();
