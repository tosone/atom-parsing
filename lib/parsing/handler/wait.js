'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const config = require('../config');

class Wait {
  init(result) {
    this.config = config;
    this.evt = this.config.event;
    this.deadline = result.time; // 等待模式中的等待时间
    let continueNext = true;
    try {
      this.con = JSON.parse(result.con); // 脚本内容的正文内容
    } catch (e) {
      continueNext = false;
      return Promise.resolve();
    }
    if (continueNext) { // 当脚本内容的正文部分解析错误，保证之后的逻辑不会继续执行
      return new Promise(resolve => {
        let timer = setTimeout(() => { resolve(true); }, this.deadline);
        if (this.con.length !== 0) {
          _.forEach(this.con, val => {
            if (val.cmd === 'button') {
              this.evt.once('button', (button, type) => {
                if (type === 'keydown' && val.button === button) {
                  if (timer) {
                    clearTimeout(timer);
                  }
                  resolve();
                }
              });
            }
          });
        }
      });
    }
  }
}

let wait = new Wait();
module.exports = wait.init.bind(wait);
