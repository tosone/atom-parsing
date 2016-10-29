'use strict';

const uuid = require('uuid');
const mqtt = require('../../config.js').mqtt;
const OUTPUT_LED_SET = "output/led/set";
const modelList = require('./lib/modelList.js');

module.exports = function (ledAlias, model, option) {
  return new Promise((resolve, reject) => {
    let message = {};
    message.ledAlias = ledAlias;
    message.curAttribute = modelList[model].modelCode;
    message.correlationId = uuid.v4();
    for (let value of modelList[model].keys) {
      if (option && option.hasOwnProperty(value)) {
        message[value] = option[value];
      }
    }
    mqtt.publish(OUTPUT_LED_SET, JSON.stringify(message), error => {
      if (error) reject(error);
      resolve('success');
    });
  });
};
