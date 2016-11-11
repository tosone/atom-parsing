'use strict';

const _ = require('lodash');
const colors = require('colors');
const Promise = require('bluebird');

const LED = require('../util/LED');
const ledAlias = require('../util/LED/LEDAlias');
const config = require('../config');
const Player = require('./lib/play');
const fileResolve = require('./lib/fileResolve');

const player = new Player();

class Interaction {
  constructor(result) {
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;

    this.playList = [];

    this.result = result;
    this.lists = this.result.con;
  }

  init() {
    return new Promise((resolve) => {
      _.forEach(this.lists, val => {
        if (val.cmd === 'button') {
          let activies = val.button;
          let keysbind = [];
          _.forEach(activies, (val, key) => {
            keysbind.push(key);
          });

          let keyEvt = null;

          let timeout = setTimeout(() => {
            if (keyEvt) {
              this.evt.removeListener('button', keyEvt);
            }
            if (activies.no) {
              if (activies.no.LED) {
                let activity = activies.no;
                LED('led_home', activity.LED.mode, activity.LED.option).then(() => {
                  this.evt.emit('interaction_end');
                });
              }
              player.play(fileResolve(this.result, activies.no.sound.sound)).then(() => {
                resolve(this.playList);
              });
            } else {
              resolve(this.playList);
            }
          }, this.config.wait_for_interaction_btn);

          keyEvt = (key, keyType) => {
            if (keyType === 'keydown') {
              _.forEach(keysbind, k => {
                if (k === key && activies[key]) {
                  if (timeout) {
                    clearTimeout(timeout);
                  }

                  this.evt.removeListener('button', keyEvt); // 只要按下正确的按键之后就对按键的监听释放

                  let activity = activies[key];
                  if (activity.LED) {
                    LED(ledAlias(activity.LED.light), activity.LED.mode, activity.LED.option);
                  }
                  if (activity.sound) {
                    player.play(fileResolve(this.result, activity.sound.sound)).then(() => {
                      this.playList.push(activity.sound.sound);
                      this.evt.emit('interaction_end');
                    });
                  } else {
                    this.evt.emit('interaction_end');
                  }
                  this.evt.once('interaction_end', () => {
                    resolve(this.playList);
                  });
                }
              });
            }
          };
          this.mqtt.publish('interaction/script/keysbind', JSON.stringify({ btns: keysbind }));
          this.evt.on('button', keyEvt);
        }
      });
    });
  }
}

module.exports = (result) => {
  let con = result.con;
  try {
    result.con = JSON.parse(con);
  } catch (e) {
    console.log(e);
    console.log(colors.red('Interaction: Something wrong with interaction sentence.'));
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let handler = new Interaction(result);
    handler.init().then(ret => {
      resolve(ret);
    });
  });
};
