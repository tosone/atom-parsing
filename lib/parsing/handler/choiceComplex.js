'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const betterMatch = require('betterMatch');
const colors = require('colors');

const LED = require('../util/LED');
const config = require('../config');
const Player = require('./lib/play');
const recording = require('./lib/recording');
const ledAlias = require('../util/LED/LEDAlias');
const fileResolve = require('./lib/fileResolve');

class ChoiceComplex {
  constructor(str) {
    this.config = config;
    this.evt = this.config.event;

    this.str = str;
    this.filepath = this.str.filepath;
    this.con = this.str.con;

    this.count = 0; // 语音识别次数
    this.once = true; // 语音只能识别出来一次，然后结束

    this.default = this.getDefault();
    this.keywords = this.getKeywords();
    this.soundList = this.getSoundList();

    this.playList = [];
    this.maxRecording = this.config.recording_last;

    this.matchResult = null;
    this.text = '';
  }

  init() {
    let recordingFun = () => {
      if (this.count === 1 && this.once) {
        let tipSound = this.config.identifacation_failed_file;
        if (this.text === '') {
          tipSound = this.config.identifacation_failed_file;
        } else if (this.matchResult === null) {
          tipSound = this.config.identification_null_file;
        }
        new Player().play(this.config.identifacation_failed_file).then(() => {
          this.once = false;
          recordingFun();
        });
      } else {
        recording.init(this.keywords, this.maxRecording).then(text => {
          this.count = this.count + 1;
          this.text = text;
          this.matchResult = betterMatch(this.text, this.keywords);
          if (this.matchResult) {
            _.forEach(this.con, value => {
              if (value.keyword && value.keyword.indexOf(this.matchResult) !== -1) {
                this.once = false;
                this.evt.emit('choiceComplex_end', value);
              }
            });
          } else {
            if (this.count === 2) {
              this.evt.emit('choiceComplex_end', this.default);
            } else if (this.count === 1) {
              recordingFun();
            }
          }
        });
      }
    };

    return new Promise(resolve => {
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
          new Promise((res) => {
            if (result.preSound) {
              new Player().play(fileResolve(this.str, result.preSound)).then(() => {
                res();
              });
            } else {
              res();
            }
          }).then(() => {
            if (result.LED) {
              LED(ledAlias(result.LED.light), result.LED.mode, result.LED.options);
            }

            if (result.sound) {
              new Player().play(fileResolve(this.str, _.isArray(result.sound) ? _.sample(result.sound) : result.sound)).then(() => {
                if (result.backline) {
                  resolve({ lists: this.playList, backline: result.backline });
                } else {
                  resolve(this.playList);
                }
              });
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  getDefault() {
    let once = true;
    let ret = {};
    _.forEach(this.con, val => {
      if (val.default && once) {
        if (val.once) {
          this.count = 1; // 语音识别次数
          this.once = false; // 语音只能识别出来一次，然后结束
        }
        once = false;
        ret = val;
      }
    });
    return ret;
  }

  getSoundList() {
    let list = [];
    _.forEach(this.con, val => {
      if (val.sound) {
        if (_.isString(val.sound)) {
          list.push(val.sound);
        } else if (_.isArray(val.sound)) {
          list.push(_.sample(val.sound));
        }
      }
      if (val.maxRecording) {
        try {
          this.maxRecording = Number(val.maxRecording) / 1000;
        } catch (e) {
          console.log(e);
        }
      }
    });
    return list;
  }

  getKeywords() {
    let keywords = [];
    _.forEach(this.con, val => {
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
    str.con = JSON.parse(con);
  } catch (e) {
    console.log(e);
    console.log(colors.red('Interaction: Something wrong with choiceComplex sentence.'));
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let handler = new ChoiceComplex(str);
    handler.init().then(result => {
      resolve(result);
    });
  });
};
