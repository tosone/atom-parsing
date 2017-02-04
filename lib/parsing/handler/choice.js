'use strict';

const _ = require('lodash');
const colors = require('colors');
const Promise = require('bluebird');
const betterMatch = require('betterMatch');

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
    this.networkstatus = this.str.networkstatus;

    this.keywords = this.getKeywords();
    this.soundList = this.getSoundList();

    this.playList = [];

    this.recording_stop = false; // 标明录音的互动已经结束，录音的结果将要丢弃
  }

  getKeywords() {
    let keywords = [];
    _.forEach(this.con, val => {
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
    this.withoutNetworkTimer = null;
    this.recording_stop = false;
    let count = 0; // 语音识别次数
    let once = true; // 语音只能识别出来一次，然后结束
    let recordingFun = () => {
      if (count === 1 && once) {
        new Player().play(this.config.identifacation_failed_file).then(() => {
          once = false;
          recordingFun();
        });
      } else {
        recording.init(this.keywords).then(text => { // 简单的选择模式不支持有网无网的判断，统一都录音
          if (!this.recording_stop) {
            count = count + 1;
            let matchResult = betterMatch(text, this.keywords);
            if (matchResult) {
              _.forEach(this.con, (value, key) => {
                if (value.indexOf(matchResult) !== -1) {
                  once = false;
                  this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: key, sttResult: text, retry: false });
                  this.evt.emit('choice_end', key);
                }
              });
            } else {
              if (count === 2) {
                this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: this.default, sttResult: text, retry: false });
                this.evt.emit('choice_end', this.default);
              } else if (count === 1) {
                this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: '', sttResult: text, retry: true });
                recordingFun();
              }
            }
          }
        });
      }
    };

    return new Promise((resolve) => {
      if (this.recording_before) {
        new Player().play(fileResolve(this.str, this.recording_before)).then(() => { // 播放对应的错误提示音
          recordingFun();
        });
      } else {
        recordingFun();
      }
      this.evt.once('choice_end', result => {
        if (this.withoutNetworkTimer) clearTimeout(this.withoutNetworkTimer);
        if (result) {
          if (result === 'first' || result === 'second') {
            this.recording_stop = true;
            result = (result === 'first') ? this.soundList[0] : (this.soundList[1] ? this.soundList[1] : this.soundList[0]);
            this.evt.emit('interaction/internal/collect/story-choice', { selectedAudio: result, button: true, sttResult: '', retry: false });
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
  } catch (e) {
    console.log(e);
    console.log(colors.red('Interaction: Something wrong with choice sentence.'));
    this.evt.emit('interaction/error/choice');
    return Promise.resolve();
  }
  return new Promise(resolve => {
    let handler = new Choice(str);
    handler.init().then(result => {
      resolve(result);
    });
  });
};
