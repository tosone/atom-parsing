'use strict';

const Promise = require('bluebird');
const config = require('../config');
const _ = require('lodash');

class Wait {
  init(result) {
    this.config = config;
    this.evt = this.config.event;
    this.deadline = result.time;
    this.con = JSON.parse(result.con);
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => { resolve(true); }, this.deadline);
      if (this.con.length !== 0) {
        _.forEach(this.con, val => {
          if (val.cmd === 'button') {
            this.evt.once('button', (button, type) => {
              if (type === 'keydown' && val.button === button) {
                timer && clearTimeout(timer);
                resolve();
              }
            });
          }

          // TODO: NFC 相关的输入的一些互动处理
        });
      }
    });
  };
}

let wait = new Wait();
module.exports = wait.init.bind(wait);
