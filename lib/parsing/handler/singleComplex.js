'use strict';

const _ = require('lodash');
const colors = require('colors');

const LED = require('../util/LED');
const config = require('../config');
const Player = require('./lib/play');
const Timer = require('../util/timer');
const ledAlias = require('../util/LED/LEDAlias');
const fileResolve = require('./lib/fileResolve');
const timeStr = require('./lib/timeStr');

class SingleComplex {
  constructor(result) {
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;

    this.result = result;
    this.sentence = this.result.con; // 所有互动的描述
    this.interactions = this.sentence.input; // 所有的输入互动
    this.activies = this.sentence.output; // 所有的输出互动
    this.buttonsActivity = {}; // 按键相关的描述
    this.nfcActivity = {}; // nfc相关的互动描述
    this.keysbinding = []; // 在输入环节的时候绑定的所有按键
    this.playList = []; // 执行的音频列表
    this.progress = this.result.progress; // 是否需要从某个进度播放
    this.file = _.isArray(this.sentence.sound) ? _.sample(this.sentence.sound) : this.sentence.sound; // 播放的主音频，如果是字符串则直接返回，如果是数组随机出现要播放列表中的内容

    this.loop = this.sentence.loop ? true : false; // 主音频是否要循环播放
    this.last = 0; // last 为 0 认为主音频永远循环播放
    if (this.sentence.last) { this.last = timeStr(this.sentence.last); }
    this.loopTimer = null; // 循环执行的定时器
    this.loopFlag = true;
    this.outputActivityTimer = null; // 输出互动的定时器
    this.randomStr = this.sentence.random; // 执行概率
    this.randomNum = 0; // 执行概率
    this.variable = this.sentence.var; // 执行的音频别名
    try {
      this.randomNum = _.random(Number(this.randomStr) - 1);
    } catch (e) {
      console.log(e);
    }
    this.handlerActivity();
  }

  init() {
    this.timer_sound_evt = data => {
      this.onSound(data);
    };
    this.evt.on('timer/sound', this.timer_sound_evt); // 关于音频的定时触发

    this.timer_LED_evt = data => {
      this.onLED(data);
    };
    this.evt.on('timer/LED', this.timer_LED_evt); // 关于 LED 的定时触发

    this.button_evt = (key, keyType) => {
      this.keyEvt(key, keyType);
    };
    this.evt.on('button', this.button_evt); // 关于按键的触发

    if (this.activies) {
      this.outputActivityTimer = new Timer(this.activies);
      this.outputActivityTimer.start(this.progress);
    }

    return new Promise(resolve => {
      this.evt.once('singleComplex_end', data => {
        this.reset();
        if (data !== 'null') {
          resolve(this.playList);
        }
      });
      this.playList.push(this.variable || this.file);
      if (this.loop && this.last !== 0) {
        this.loopTimer = setTimeout(() => {
          this.reset();
          resolve(this.playList);
        }, this.last);
      }

      if (this.randomStr && this.randomNum === 0) { // 有执行概率计算概率
        this.masterPlay().then(() => {
          this.reset();
          resolve(this.playList);
        });
      } else { // 没有执行概率直接执行
        let replay = () => {
          this.masterPlay().then(() => {
            if (this.loop && this.loopFlag) {
              replay();
            } else {
              this.reset();
              resolve(this.playList);
            }
          });
        };
        replay();
      }
    });
  }

  // 主音频的播放
  masterPlay() {
    return new Promise(resolve => {
      new Player().play(fileResolve(this.result, this.file), 0, 'play', this.progress).then(resolve);
    });
  }

  handlerActivity() {
    _.forEach(this.interactions, val => {
      if (val.cmd === 'button') {
        this.buttonsActivity = val.button;
        _.forEach(val.button, (activity, buttons) => {
          this.keysbinding.push(buttons);
        });
      } else if (val.cmd === 'nfc') {
        this.nfcActivity = val;
      }
    });
  }

  onSound(args) {
    if (args.sound) {
      this.playList.push(args.sound);
      new Player().play(fileResolve(this.result, args.sound), 0, 'break');
    }
  }

  onLED(args) {
    console.log(args);
    if (args.mode) {
      LED(ledAlias(args.light), args.mode, args.option);
    }
  }

  keyEvt(key, keyType) {
    _.forEach(this.keysbinding, button => {
      if (key === button && keyType === 'keydown') {
        this.mqtt.publish('sound_manager/clear_play', JSON.stringify({}));
        let activity = this.buttonsActivity[button];
        if (activity.LED) { LED(ledAlias(activity.LED.light), activity.LED.mode, activity.LED.options); }
        if (activity.sound) {
          let sound = activity.sound.sound;
          sound = _.isArray(sound) ? _.sample(sound) : sound;
          new Player().play(fileResolve(this.result, sound)).then(() => {
            this.evt.emit('singleComplex_end');
          });
        } else {
          this.evt.emit('singleComplex_end');
        }
      }
    });
  }

  reset() {
    this.loopFlag = false;
    if (this.outputActivityTimer) { this.outputActivityTimer.stop(); }
    this.evt.removeListener('timer/sound', this.timer_sound_evt);
    this.evt.removeListener('timer/LED', this.timer_sound_evt);
    this.evt.removeListener('button', this.button_evt);
    console.log(this.evt);
  }
}

module.exports = (result) => {
  try {
    result.con = JSON.parse(result.con);
  } catch (e) {
    console.log(e);
    console.log(colors.red('Interaction: Something wrong with singleComplex sentence.'));
    return Promise.resolve();
  }
  return new Promise(resolve => {
    let handler = new SingleComplex(result);
    handler.init().then(resolve);
  });
};
