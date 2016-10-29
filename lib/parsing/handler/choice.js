'use strict';

const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');

const config = require('../config');
const Player = require('./lib/play');
const recording = require('./lib/recording');
const beforeChoice = require('../util/beforeChoice');

module.exports = (args) => {
  let con = JSON.parse(args.con.replace(/'/g, '"'));
  let def = args.default;
  let playList = [];
  let evt = config.event;

  let Keywords = [];
  let soundList = [];
  _.forEach(con, (value, key) => {
    Keywords = Keywords.concat(value);
    soundList.push(key);
  });
  Keywords.sort((a, b) => {
    return b.length - a.length;
  });

  let count = 0; // 语音识别次数

  let secondTime = false; // 是否是第二次识别
  let once = true; // 语音只能识别出来一次，然后结束

  let recordingFun = () => {
    if (secondTime && once) {
      new Player().play(config.identifacation_failed_file, 0, 'break').then(() => {
        secondTime = false;
        recordingFun();
      });
    } else {
      recording.init().then(text => {
        count = count + 1;
        for (let t of Keywords) {
          if (text.indexOf(t) !== -1) {
            _.forEach(con, (value, key) => {
              if (value.indexOf(t) !== -1) {
                once = false;
                evt.emit('choice_end', key);
              }
            });
          }
        }
        if (once) {
          if (count === 2) {
            evt.emit('choice_end', def);
          } else if (count === 1) {
            secondTime = true;
            recordingFun();
          }
        }
      });
    }
  }

  return new Promise((resolve, reject) => {
    recordingFun();
    evt.once('choice_end', sound => {
      if (sound) {
        playList.push(sound);
        beforeChoice.init().then(() => {
          new Player().play(path.join(args.filepath, sound)).then(() => {
            resolve(playList);
          });
        });
      }
    });

    evt.once('button', (button, type) => {
      if (type === 'keydown') {
        if (button === 'D') {
          evt.emit('choice_end', soundList[0]);
        } else if (button === 'E') {
          evt.emit('choice_end', soundList[1] || soundList[0]);
        }
      }
    });
  });
};
