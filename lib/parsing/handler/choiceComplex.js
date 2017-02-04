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
    this.networkstatus = this.str.networkstatus;

    this.count = 0; // 语音识别次数
    this.once = true; // 语音只能识别出来一次，然后结束

    this.default = this.getDefault();
    this.keywords = this.getKeywords();
    this.soundList = this.getSoundList();

    this.playList = [];
    this.maxRecording = this.config.recording_last;

    this.matchResult = null;
    this.text = '';

    this.recording_stop = false;

    this.identifacation_failed_file = this.config.identifacation_failed_file;
    this.identification_null_file = this.config.identification_null_file;

    this.recording_before = null; // 在录音开始之前需要进行的动作
    this.text = ''; // 语音识别结果，默认为空
  }

  init() {
    this.withoutNetworkTimer = null;
    this.recording_stop = false;
    let recordingFun = () => {
      if (this.count === 1 && this.once) {
        let tipSound = this.identifacation_failed_file;
        if (this.text === '') {
          tipSound = this.identifacation_failed_file;
        } else if (this.matchResult === null) {
          tipSound = this.config.identification_null_file;
        }
        new Player().play(tipSound[0] === '/' ? tipSound : fileResolve(this.str, tipSound)).then(() => { // 播放对应的错误提示音
          this.once = false;
          recordingFun();
        });
      } else {
        if (this.networkstatus || !this.recording_before) { // 有网 或者 没有设置无网的前提示音的时候进行正常的录音
          recording.init(this.keywords, this.maxRecording).then(text => {
            if (!this.recording_stop) {
              this.count = this.count + 1;
              this.text = text;
              this.matchResult = betterMatch(this.text, this.keywords);
              if (this.matchResult) {
                _.forEach(this.con, value => {
                  if (value.keyword && value.keyword.indexOf(this.matchResult) !== -1) {
                    this.once = false;
                    this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: value || '', sttResult: this.text, retry: false });
                    this.evt.emit('choiceComplex_end', value);
                  }
                });
              } else {
                if (this.count === 2) {
                  this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: this.default.sound || '', sttResult: this.text, retry: true });
                  this.evt.emit('choiceComplex_end', this.default);
                } else if (this.count === 1) {
                  this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: '', sttResult: this.text, retry: true });
                  recordingFun();
                }
              }
            }
          });
        } else {
          this.withoutNetworkTimer = setTimeout(() => {
            this.matchResult === null
            this.count = this.count + 1;
            if (this.count === 2) {
              this.evt.emit('choiceComplex_end', this.default);
            } else if (this.count === 1) {
              recordingFun();
            }
          }, this.config.button_timeout);
        }
      }
    };

    return new Promise(resolve => {
      this.getDefault();
      if (this.recording_before) {
        new Player().play(fileResolve(this.str, this.recording_before)).then(() => { // 播放对应的错误提示音
          recordingFun();
        });
      } else {
        recordingFun();
      }
      this.evt.once('choiceComplex_end', result => {
        if (this.withoutNetworkTimer) clearTimeout(this.withoutNetworkTimer);
        if (result) {
          if (result === 'first' || result === 'second') {
            this.recording_stop = true;
            result = (result === 'first') ? this.con[0] : (this.con[1] ? this.con[1] : this.con[0]);
            this.evt.emit('interaction/internal/collect/story-choice', { type: 'choose', data: { selectedAudio: result, button: true, sttResult: '', retry: false } });
          }
          if (result.var) {
            this.playList.push(result.var);
          } else {
            this.playList.push(result.sound);
          }
          // 嵌入单句复杂模式
          new Promise(res => {
            if (result.preSound) {
              new Player().play(fileResolve(this.str, result.preSound)).then(() => {
                res();
              });
            } else {
              res();
            }
          }).then(() => {
            if (result.LED) {
              LED(ledAlias(result.LED.light), result.LED.mode, result.LED.option);
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

      if (val.saidNothing && this.networkstatus) {
        this.identification_null_file = val.saidNothing;
        this.identifacation_failed_file = val.saidNothing;
      } else if (!this.networkstatus && val.offlineSaidNothing) {
        this.identification_null_file = val.offlineSaidNothing;
        this.identifacation_failed_file = val.offlineSaidNothing;
      }
      if (val.saidWrong && this.networkstatus) {
        this.identifacation_failed_file = val.saidWrong;
      } else if (!this.networkstatus && val.offlineSaidWrong) {
        this.identifacation_failed_file = val.offlineSaidWrong;
      }
      if (val.before && this.networkstatus) {
        this.recording_before = val.before;
      } else if (!this.networkstatus && val.offlineBefore) {
        this.recording_before = val.offlineBefore;
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
          let temp = Number(val.maxRecording) / 1000;
          if (temp > this.config.recording_last) {
            this.maxRecording = temp;
          }
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

module.exports = str => {
  let con = str.con;
  try {
    str.con = JSON.parse(con);
  } catch (e) {
    console.log(e);
    console.log(colors.red('Interaction: Something wrong with choiceComplex sentence.'));
    return Promise.resolve(true);
  }
  return new Promise(resolve => {
    let handler = new ChoiceComplex(str);
    handler.init().then(result => {
      resolve(result);
    });
  });
};
