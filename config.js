// Config

'use strict';

const fs = require('fs');
const os = require('os');

const redis = require('redis');
const mqtt = require('mqtt');
const pinyin = require('convertPinyin');

const redis1 = redis.createClient({ 'db': 1 });
const redis3 = redis.createClient({ 'db': 3 });
const redis8 = redis.createClient({ 'db': 8 });

let mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
  mqttClient.subscribe('#');
});

const macLocation = "/sys/class/net/wlan0/address";
let macAddress = null;
if (fs.existsSync(macLocation)) {
  macAddress = fs.readFileSync(macLocation).toString().trim().toUpperCase();
}

module.exports = {
  macAddress,
  redis1,
  redis3,
  redis8,
  mqtt: mqttClient,
  pinyin
};
