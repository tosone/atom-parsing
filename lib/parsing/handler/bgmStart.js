'use strict';

const _ = require('lodash');

const config = require('../config');
const fileResolve = require('./lib/fileResolve');

const mqtt = config.mqtt;

module.exports = (result) => {
  let bgms = JSON.parse(result.con);
  let bgmsWithPath = [];
  _.forEach(bgms, val => {
    bgmsWithPath.push(fileResolve(result, val));
  });
  mqtt.publish('sound_manager/bgm', JSON.stringify({ files: bgmsWithPath }));
  return Promise.resolve();
};
