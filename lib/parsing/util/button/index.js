//Button

'use strict';

const _ = require('lodash');
const fs = require('fs');

const config = require('./config');

let getToyName = () => {
  if (fs.existsSync('/usr/nativeapps/version')) {
    let version = fs.readFileSync('/usr/nativeapps/version');
    if (/P1A/.test(version)) {
      return 'P1A';
    } else if (/R1A/.test(version)) {
      return 'R1A';
    } else {
      return 'R1A';
    }
  } else {
    return 'R1A';
  }
}

let toyName = getToyName();

module.exports = (keyCode) => {
  let ret = false;
  let once = true;
  _.forEach(config[toyName].keyCode, (value, key) => {
    if (once && value === keyCode) {
      ret = key;
      once = false;
    }
  });
  return ret;
};
