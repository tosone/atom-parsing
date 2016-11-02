'use strict';

const fs = require('fs');
const os = require('os');

const redis = require('redis');
const mqtt = require('mqtt');
const pinyin = require('convertPinyin');

const host = '120.27.94.189';

const redis1 = redis.createClient({ 'db': 1, host });
const redis3 = redis.createClient({ 'db': 3, host });
const redis8 = redis.createClient({ 'db': 8, host });

let mqttClient = mqtt.connect('mqtt://' + host + ':1883');

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
