'use strict';

let singleLed = require('./util/singleUtil.js');
let multipleLed = require('./util/multipleUtil.js');
let config = require('./config.js');

module.exports = function (ledAlias, model, option) {
  option = option || {};
  if (Array.isArray(ledAlias)) {
    config.model = model;
    return multipleLed(ledAlias, model, option)
  } else {
    return singleLed(ledAlias, model, option)
  }
};
