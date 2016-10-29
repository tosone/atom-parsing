'use strict';

// 开始计时插入计时任务
// 开始播放
// 监听计时任务的消息
// 计时任务执行完毕，停止
// 播放完毕，通知停止计时

const path = require('path');

const _ = require('lodash');
const colors = require('colors');

const LED = require('../util/LED');
const config = require('../config');
const Player = require('./lib/play');
const Timer = require('../util/timer');
const fileResolve = require('./lib/fileResolve');

module.exports = (result) => {
  let sentence = JSON.parse(result.con);
  let progress = result.progress;
  let file = _.isArray(sentence.sound) ? _.sample(sentence.sound) : sentence.sound; //随机出现要播放列表中的内容
  let activies = sentence.output;
  let interactions = sentence.input;
  let output_timer = null;
  let evt = config.event;

  let playList = [];

  // 执行概率
  let randomStr = sentence.random;
  let randomNum = _.random(Number(randomStr) - 1);

  let variable = sentence.var;

  if (activies) {
    output_timer = new Timer(activies);
    output_timer.start(progress);
  }

  let onSound = (args) => {
    if (args.sound) {
      playList.push(args.sound);
      new Player().play(fileResolve(result, args.sound), 0, 'break');
    }
  }

  let onLED = (args) => {
    if (args.mode) {
      LED('led_home', args.mode, args.options);
    }
  }

  evt.on('timer/sound', onSound);
  evt.on('timer/LED', onLED);

  return new Promise((resolve, reject) => {
    playList.push(variable ? variable : file);

    let reset = () => {
      output_timer && output_timer.stop();
      evt.removeListener('timer/sound', onSound);
      evt.removeListener('timer/LED', onLED);
    }
    if (randomStr && randomNum === 0) { // 有执行概率计算概率
      new Player().play(path.join(result.filepath, file), 0, 'play', progress).then(() => {
        reset();
        resolve(playList);
      });
    } else if (!randomStr) { // 没有执行概率直接执行
      new Player().play(path.join(result.filepath, file), 0, 'play', progress).then(() => {
        reset();
        resolve(playList);
      });
    }
  });
};
