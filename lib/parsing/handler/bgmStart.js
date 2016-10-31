'use strict';
const config = require('../config');
const mqtt = config.mqtt;

module.exports = (str) => {
  mqtt.publish('sound_manager/bgm', JSON.stringify({ files: str.con }));
  return Promise.resolve();
};
