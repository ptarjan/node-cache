'use strict';

function cache() {
  let cache = require('./index.js');
  delete require.cache[require.resolve('./index.js')];
  delete require.cache[require.resolve('./app.js')];
  return cache;
}

module.exports = cache();
