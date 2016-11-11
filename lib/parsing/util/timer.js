'use strict';

const _ = require('lodash');
const colors = require('colors');
const moment = require('moment');

const config = require('../config');
const timeStr = require('../handler/lib/timeStr');

class Timer {
  constructor(timeList) {
    this.config = config;
    this.evt = this.config.event;

    this.count = 0;
    this.timer = null;
    this.timeList = timeList;
    this.tasks = [];
    this.init();
  }

  start(val) {
    this.count = val || 0;
    this.timer = setInterval(() => {
      this.count++;
      let length = this.tasks.length;
      if (this.tasks.length > 0) {
        if (this.tasks[length - 1].start === (this.count * 1000)) {
          this.begin(this.tasks[length - 1]);
          this.tasks.pop();
          if (this.tasks.length === 0) {
            this.stop();
            console.log(colors.green('[' + moment().format('HH:mm:ss:SSS') + '] Interaction: run all schedule tasks.'));
          }
        }
      }
    }, 1000);
  }

  init() {
    _.forEach(this.timeList, (val, key) => {
      _.forEach(val, (v, k) => {
        if (_.isArray(v)) {
          _.forEach(v, valt => {
            valt.type = k;
            valt.start = timeStr(valt.start);
            this.tasks.push(valt);
          });
        } else if (_.isPlainObject(v)) {
          v.type = key;
          v.start = timeStr(v.start);
          this.tasks.push(v);
        } else {
          console.log("Interaction tasks' setting is wrong.");
        }
      });
    });

    this.tasks.sort((a, b) => {
      return b.start - a.start;
    });
  }

  begin(item) {
    console.log(colors.green('[' + moment().format('HH:mm:ss:SSS') + '] Interaction event emmiter: ') + JSON.stringify(item));
    this.evt.emit('timer/' + item.type, item);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    return this.count;
  }

  resume() {
    if (this.isStop) {
      this.count = 0;
    }
    this.pause();
    this.start();
  }

  stop() {
    this.pause();
    this.timeList = [];
    this.tasks = [];
    this.isStop = true;
    return this.count;
  }
}

module.exports = Timer;
