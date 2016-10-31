'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const config = require('../config');
const Player = require('./lib/play');
const recording = require('./lib/recording');
const fileResolve = require('./lib/fileResolve');

class choiceComplex {
  constructor(str) {
    this.config = config;
    this.evt = this.config.event;

    this.str = str;
    this.filepath = this.str.filepath;
    this.con = this.str.con;

    this.default = this.getDefault();
    this.keywords = this.getKeywords();
    this.soundList = this.getSoundList();

    this.playList = [];
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
                if (value.keyword.indexOf(t) !== -1) {
                  once = false;
                  this.evt.emit('choiceComplex_end', value);
                }
              });
            } else {
              temp++; // 保证在遍历完成整个关键词列表之后再决定是否进入下一次的录音循环
            }
          }
          if (temp === this.keywords.length) {
            if (count === 2) {
              this.evt.emit('choiceComplex_end', this.default);
            } else if (count === 1) {
              recordingFun();
            }
          }
        });
      }
    }

    return new Promise((resolve, reject) => {
      recordingFun();
      this.evt.once('choiceComplex_end', result => {
        if (result) {
          if (result === 'first' || result === 'second') {
            result = (result === 'first') ? this.con[0] : (this.con[1] ? this.con[1] : this.con[0]);
          }
          if (result.var) {
            this.playList.push(result.var);
          } else {
            this.playList.push(result.sound);
          }
          // 嵌入单句复杂模式
          new Promise((res, rej) => {
            if (result.preSound) {
              new Player().play(fileResolve(this.str, result.preSound)).then(() => {
                res();
              });
            } else {
              res();
            }
          }).then(() => {
            new Player().play(fileResolve(this.str, _.isArray(result.sound) ? _.sample(result.sound) : result.sound)).then(() => {
              if (result.backline) {
                resolve({ lists: this.playList, backline: result.backline });
              } else {
                resolve(this.playList);
              }
            });
          });
        }
      });
    });
  }

  getDefault() {
    let once = true;
    let ret = {};
    _.forEach(this.con, (val, key) => {
      if (val.default && once) {
        once = false;
        ret = val;
      }
    });
    return ret;
  }

  getSoundList() {
    let list = [];
    _.forEach(this.con, (val, key) => {
      if (val.sound) {
        if (_.isString(val.sound)) {
          list.push(val.sound);
        } else if (_.isArray(val.sound)) {
          list.push(_.sample(val.sound));
        }
      }
    });
    return list;
  }

  getKeywords() {
    let keywords = [];
    _.forEach(this.con, (val, key) => {
      if (val.keyword && _.isArray(val.keyword)) {
        keywords = keywords.concat(val.keyword);
      }
    });
    keywords.sort((a, b) => {
      return b.length - a.length;
    });
    return keywords;
  }
}

module.exports = (str) => {
  let con = str.con;
  try {
    con = JSON.parse(con);
  } catch (e) {
    return Promise.resolve(true);
  }
  str.con = con;
  return new Promise((resolve, reject) => {
    let handler = new choiceComplex(str);
    handler.init().then(result => {
      resolve(result);
    });
  });
};
