'use strict';

const uuid = require('uuid');
const config = require('../config');
const mqtt = config.mqtt;
const singleModelList = require('../lib/singleModelList.js');


function singleLed(ledAlias, model, option) {
  return new Promise((resolve, reject) => {
    let message = {};
    message.ledAlias = ledAlias;
    message.curAttribute = singleModelList[model].modelCode;
    message.correlationId = uuid.v4();
    for (let value of singleModelList[model].keys) {
      if (option && option.hasOwnProperty(value)) {
        message[value] = option[value];
      }
    }
    console.log(message)
    mqtt.publish(config.OUTPUT_LED_SET, JSON.stringify(message), error => {
      if (error) reject(error);
      resolve('success');
    });
  });
}



module.exports = singleLed
