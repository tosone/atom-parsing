'use strict';

const multipleModelList = require('../lib/multipleModelList.js');
const defLedList = require('../lib/defaultLedList.js');
const ability = require('../lib/ability.js');

function checkParams(ledAlias) {
  if (!Array.isArray(ledAlias)) {
    throw new Error("LED Error: ledAlias is not a Array!");
  }
  return ledAlias.length ? ledAlias : defLedList;
}

function multipleLed(ledAlias, model, option) {
  return new Promise((resolve, reject) => {
    ledAlias = checkParams(ledAlias);
    if (multipleModelList && multipleModelList[model]) {
      multipleModelList[model](ledAlias, option);
    }
  })
}

module.exports = multipleLed;
