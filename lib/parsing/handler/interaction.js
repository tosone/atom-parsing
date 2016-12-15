'use strict';

const _ = require('lodash');
const colors = require('colors');
const Promise = require('bluebird');

const LED = require('../util/LED');
const config = require('../config');
const player = require('./lib/newPlayer');
const fileResolve = require('./lib/fileResolve');
const ledAlias = require('../util/LED/LEDAlias');

class Interaction {
  constructor(result) {
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;

    this.playList = [];

    this.result = result;
    this.lists = this.result.con;

    this.nfcBindings = [];

    this.button_timer = null;
    this.nfc_timer = null;

    this.button_evt = null;
    this.nfc_evt = null;
  }

  init() {
    return new Promise((resolve) => {
      this.evt.once('interaction_end', data => {
        if (data !== 'null') resolve(this.playList);
        else this.clear();
      });
      let interactionOnce = true; // 保证有互动的流程
      _.forEach(this.lists, action => { // 遍历所有的互动类型
        if (action.cmd === 'button') { // 按键的互动流程
          interactionOnce = false;
          let activies = action.button; // 所有的按键所导致的行为列表
          let keysbind = []; // 所有的按键列表

          _.forEach(activies, (val, key) => { keysbind.push(key); }); // 将所有的按键监听收集起来

          this.button_timer = setTimeout(() => { // 按键的超时处理
            this.clear(); // 清除所有的超时和按键nfc监听
            let activity = activies.no; // 没有按键处理的逻辑
            if (activity) { // 当存在没有按键触发的逻辑
              if (activity.LED) { // 判断是否有 LED 的逻辑
                LED(ledAlias(activity.LED.light), activity.LED.mode, activity.LED.option).then(() => {
                  this.evt.emit('interaction_end');
                });
              }
              if (activity.sound) { // 判断是否存在有声音的逻辑
                player(fileResolve(this.result, activity.sound.sound)).then(() => {
                  resolve(this.playList);
                });
              } else {
                resolve(this.playList);
              }
            } else {
              resolve(this.playList);
            }
          }, this.config.wait_for_interaction_btn);

          this.button_evt = (key, keyType) => {
            if (keyType === 'keydown') {
              _.forEach(keysbind, k => {
                if (k === key && activies[key]) {
                  this.clear(); // 只要按下正确的按键之后就对按键的监听释放
                  let activity = activies[key];
                  if (activity.LED) {
                    LED(ledAlias(activity.LED.light), activity.LED.mode, activity.LED.option);
                  }
                  if (activity.sound) {
                    player(fileResolve(this.result, activity.sound.preSound)).then(() => {
                      player(fileResolve(this.result, activity.sound.sound)).then(() => {
                        this.playList.push(activity.sound.sound);
                        this.evt.emit('interaction_end');
                      });
                    });
                  } else {
                    this.evt.emit('interaction_end');
                  }
                }
              });
            }
          };
          this.mqtt.publish('interaction/script/keysbind', JSON.stringify({ btns: keysbind }));
          this.evt.on('button', this.button_evt);
        } else if (action.cmd === 'nfc') {
          interactionOnce = false;
          this.nfcTimeoutDeadline = this.config.wait_for_interaction_nfc;

          // 整理所有的 nfc 绑定
          this.nfcBindings = [];
          _.forEach(action.nfc, v => {
            if (v.maxNfc && v.maxNfc > this.nfcTimeoutDeadline) this.nfcTimeoutDeadline = v.maxNfc;
            if (_.isString(v.nfc)) this.nfcBindings.push(v.nfc);
            else if (_.isArray(v.nfc)) this.nfcBindings = _.concat(this.nfcBindings, v.nfc);
          });
          let tempNfcBindings = [];
          _.forEach(this.nfcBindings, v => {
            if (v !== '') {
              tempNfcBindings.push(v);
            }
          });
          this.nfcBindings = tempNfcBindings;

          let getNfCard = []; // 当前刷过多少张卡

          let doneNFC = activity => {
            this.clear();
            if (activity) {
              if (activity.output.LED) {
                LED(ledAlias(activity.output.LED.light), activity.output.LED.mode, activity.output.LED.option);
              }
              if (activity.output.sound) {
                player(fileResolve(this.result, activity.output.sound.preSound)).then(() => {
                  player(fileResolve(this.result, activity.output.sound.sound)).then(() => {
                    this.playList.push(activity.output.sound.var || activity.output.sound);
                    this.evt.emit('interaction_end', this.playList);
                  });
                });
              } else {
                this.evt.emit('interaction_end', this.playList);
              }
            } else {
              // wrong mode
              let once = true;
              _.forEach(action.nfc, v => {
                if (v.mode === 'wrong') {
                  once = false;
                  doneNFC(v);
                }
              });
              if (this.nfcBindings.length === 0 && once) {
                _.forEach(action.nfc, v => {
                  if (v.mode === 'no') {
                    once = false;
                    doneNFC(v);
                  }
                });
              }
              if (once) resolve(this.playList);
            }
          };

          this.nfc_timer = setTimeout(() => {
            let once = true;
            _.forEach(action.nfc, v => {
              if (v.mode === 'no' && once) {
                once = false;
                doneNFC(v);
              }
            });
            if (once) { doneNFC(); }
          }, this.nfcTimeoutDeadline);

          this.nfc_evt = code => {
            if (_.indexOf(this.nfcBindings, code) !== -1) {
              _.forEach(this.nfcBindings, v => { // 遍历所有的nfc卡的绑定
                if (v === code) {
                  getNfCard.push(v); // 将当前刷的卡加入刷卡列表
                  _.forEach(action.nfc, val => { // 遍历所有的刷卡互动
                    if (val.mode) {
                      if (val.mode === 'and') {
                        if (val.nfc) {
                          if (_.isString(val.nfc) && val.nfc === v) {
                            doneNFC(val);
                          } else if (_.isArray(val.nfc) && _.indexOf(val.nfc, v) !== -1 && _.isEqual(val.nfc.sort(), _.intersection(getNfCard, val.nfc).sort())) {
                            doneNFC(val);
                          }
                        } else {
                          doneNFC(); // 当 and 模式的时候没有 nfc 列表的时候执行 wrong 或者 no 的流程
                        }
                      } else if (val.mode === 'or') {
                        if (val.nfc) {
                          if (_.isString(val.nfc) && val.nfc === v) {
                            doneNFC(val);
                          } else if (_.isArray(val.nfc) && _.indexOf(val.nfc, v) !== -1) {
                            doneNFC(val);
                          }
                        } else {
                          doneNFC(val);
                        }
                      } else if (val.mode === 'wrong') {
                        if (val.nfc) {
                          if (_.isString(val.nfc) && val.nfc === v) {
                            doneNFC(val);
                          } else if (_.isArray(val.nfc) && _.indexOf(val.nfc, v) !== -1) {
                            doneNFC(val);
                          }
                        } else {
                          doneNFC(val);
                        }
                      }
                    } else {
                      if (_.isString(val.nfc) && val.nfc === v) {
                        doneNFC(val);
                      } else if (_.isArray(val.nfc) && val.indexOf(v) !== -1) {
                        doneNFC(val);
                      }
                    }
                  });
                }
              });
            } else {
              doneNFC();
            }
          };
          this.mqtt.publish('interaction/script/nfcsbind', JSON.stringify({ nfcs: this.nfcBindings }));
          this.evt.on('nfc', this.nfc_evt);
        }
        if (interactionOnce) { resolve(this.playList); }
      });
    });
  }

  clear() {
    if (this.button_timer) {
      clearTimeout(this.button_timer);
      this.button_timer = null;
    }
    if (this.nfc_timer) {
      clearTimeout(this.nfc_timer);
      this.nfc_timer = null;
    }
    if (this.nfc_evt) this.evt.removeListener('nfc', this.nfc_evt);
    if (this.button_evt) this.evt.removeListener('button', this.button_evt);
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
