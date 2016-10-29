'use strict';
// #Today:30 互动故事暂停，保存状态

const config = require('../config');

const mqtt = config.mqtt;

class Pause {
  constructor() {
    this.config = config;
    this.mqtt = this.config.mqtt;
  }

  init() {
    return new Promise((resolve, reject) => {
      let payload = JSON.stringify({});
      this.mqtt.publish('sound_manager/play', payload, () => {
        resolve(true);
      });
    });
  }
}
