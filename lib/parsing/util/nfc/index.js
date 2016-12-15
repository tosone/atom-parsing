'use strict';
const colors = require('colors');
const config = require('../../config');

class Nfc {
  constructor() {
    this.config = config;
    this.redis = this.config.redis8;
    this.nfc_redis_key = this.config.nfc_redis_key;
  }
  get(code) {
    if (code.length > 10) {
      return new Promise(resolve => {
        this.redis.hget(this.nfc_redis_key, code, (err, reply) => {
          let data = null;
          if (err) {
            console.log(colors.red(err));
          } else {
            try {
              data = JSON.parse(reply).keywords;
            } catch (e) {
              console.log(colors.red(e));
            }
          }
          resolve(data);
        });
      });
    } else {
      return Promise.resolve(code);
    }
  }
}

let nfc = new Nfc();
module.exports = nfc.get.bind(nfc);
