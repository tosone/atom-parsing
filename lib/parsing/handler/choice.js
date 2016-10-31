'use strict';

const path = require('path');

const _ = require('lodash');
const colors = require('colors');
const Promise = require('bluebird');

const config = require('../config');
const Player = require('./lib/play');
const recording = require('./lib/recording');
const fileResolve = require('./lib/fileResolve');

class Choice {
  constructor(str) {
    this.config = config;
    this.evt = this.config.event;

    this.str = str;
    this.filepath = this.str.filepath;
    this.con = this.str.con;

    this.default = this.str.default;
    this.keywords = this.getKeywords();
    this.soundList = this.getSoundList();

    this.playList = [];
  }

  getKeywords() {
    let keywords = [];
    _.forEach(this.con, (val, key) => {
      keywords = keywords.concat(val);
    });
    keywords.sort((a, b) => {
      return b.length - a.length;
    });
    return keywords;
  }

  getSoundList() {
    let list = [];
    _.forEach(this.con, (value, key) => {
      list.push(key);
    });
    return list;
  }

  init() {
    let count = 0; // 语音识别次数
    let once = true; // 语音只能识别出来一次，然后结束
    let recordingFun = () => {
      if (count === 1 && once) {
        new Player().play(this.config.identifacation_failed_file).then(() => {
          once = false;
          recordingFun();
        });
      } else {
        recording.init(this.keywords).then(text => {
          count = count + 1;
          let temp = 0;
          for (let t of this.keywords) {
            if (text.indexOf(t) !== -1) {
              _.forEach(this.con, (value, key) => {
                if (value.indexOf(t) !== -1) {
                  once = false;
                  this.evt.emit('choice_end', key);
                }
              });
            } else {
              temp++; // 保证在遍历完成整个关键词列表之后再决定是否进入下一次的录音循环
            }
          }
          if (temp === this.keywords.length) {
            if (count === 2) {
              this.evt.emit('choice_end', this.default);
            } else if (count === 1) {
              recordingFun();
            }
          }
        });
      }
    }

    return new Promise((resolve, reject) => {
      recordingFun();
      this.evt.once('choice_end', result => {
        if (result) {
          if (result === 'first' || result === 'second') {
            result = (result === 'first') ? this.soundList[0] : (this.soundList[1] ? this.soundList[1] : this.soundList[0]);
          }
          this.playList.push(result);
          new Player().play(fileResolve(this.str, result)).then(() => {
            resolve(this.playList);
          });
        }
      });
    });
  }
}

module.exports = (str) => {
  let con = str.con;
  try {
    str.con = JSON.parse(con);
    return new Promise((resolve, reject) => {
      let handler = new Choice(str);
      handler.init().then(result => {
        resolve(result);
      });
    });
  } catch (e) {
    console.log(colors.red('Interaction: Something wrong with choice mode.'));
    this.evt.emit('interaction/error/choice');
    return Promise.resolve();
  }
};
