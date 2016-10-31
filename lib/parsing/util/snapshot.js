//SnapShot for Interaction story

'use strict';

const config = require('../config');

const Promise = require('bluebird');
const colors = require('colors');
const _ = require('lodash');

module.exports = class Snapshot {
  constructor() {
    this.redis = config.redis8;
    this.evt = config.event;
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.redis.del(this.name, err => {
        if (err) console.log(colors.red(err));
        resolve(true);
      });
    });
  }

  save(value) {
    return new Promise((resolve, reject) => {
      this.redis.rpush(this.name, value, err => {
        if (err) console.log(colors.red(err));
        resolve(true);
      });
    });
  }

  pop() {
    return new Promise((resolve, reject) => {
      this.redis.rpop(this.name, (err, msg) => {
        if (err) console.log(colors.red(err));
        resolve(JSON.parse(msg));
      });
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.redis.lrange(this.name, 0, -1, (err, reply) => {
        if (err) console.log(colors.red(err));
        let msg = _.map(reply, (m) => {
          return JSON.parse(m);
        });
        msg = _.reverse(msg);
        let voicePath = [];
        _.forEach(msg, (val) => {
          voicePath.push(val.voice);
        });
        resolve(voicePath);
      });
    });
  }

  snapshotInit() {
    this.snapshotReset();
    this.onStart();
    this.onTerminate();
    this.onComplete();
  }

  snapshotReset() {
    this.onStart_evt && this.evt.removeListener('play/start', this.onStart_evt);
    this.onTerminate_evt && this.evt.removeListener('play/terminate', this.onTerminate_evt);
    this.onComplete_evt && this.evt.removeListener('play/complete', this.onComplete_evt);
  }

  onStart() {
    this.onStart_evt = file => {
      this.save(JSON.stringify({
        line: this.currLineNum,
        voice: file,
        status: '0'
      }));
    };
    this.evt.on('play/start', this.onStart_evt);
  }

  onTerminate() {
    this.onTerminate_evt = (progress, file) => {
      this.pop().then(msg => {
        if (msg.line === this.currLineNum) {
          this.save(JSON.stringify({
            line: this.currLineNum,
            voice: file,
            status: progress
          }));
        } else {
          this.save(JSON.stringify(msg));
        }
      });
    };
    this.evt.on('play/terminate', this.onTerminate_evt);
  }

  onComplete() {
    this.onComplete_evt = file => {
      this.save(JSON.stringify({
        line: this.currLineNum,
        voice: file,
        status: 'done'
      }));
    }
    this.evt.on('play/complete', this.onComplete_evt);
  }
}
