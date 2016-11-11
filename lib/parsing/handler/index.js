'use strict';

const glob = require('glob');
const path = require('path');
const _ = require('lodash');

let ret = {};

// 可以写标识的模式
let hasFlag = ['wait', 'share', 'choice', 'single', 'singleComplex', 'interaction', 'choiceComplex'];

let files = glob.sync(path.join(__dirname, '*.js'));

_.forEach(files, file => {
  let filebase = path.parse(file);
  if (filebase.name !== 'index' && filebase.ext === '.js') {
    ret[filebase.name] = require('./' + filebase.name);
    if (hasFlag.indexOf(filebase.name) !== -1) {
      ret[filebase.name + 'Flag'] = require('./' + filebase.name);
    }
  }
});

module.exports = ret;
