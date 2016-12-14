'use strict';
const config = require('../config');
const mqtt = config.mqtt;

module.exports = () => {
  mqtt.publish('sound_manager/bgm_stop', JSON.stringify({}));
  return Promise.resolve();
};
