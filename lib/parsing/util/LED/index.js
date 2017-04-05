'use strict';

let singleLed = require('./util/singleUtil.js');
let multipleLed = require('./util/multipleUtil.js');
let config = require('./config.js');

module.exports = function (ledAlias, model, option) {
  option = option || {};
  if (Array.isArray(ledAlias) && ledAlias.length === 3) {
    config.model = model;
    return multipleLed(ledAlias, model, option)
  } else if (Array.isArray(ledAlias) && ledAlias.length === 2) {
    singleLed(ledAlias[0], model, option)
    singleLed(ledAlias[1], model, option)
  } else {
    return singleLed(ledAlias, model, option)
  }
};
