// 故事运行的过程中的一些全局按键指令

'use strict';

const config = require('../config');
const Play = require('../handler/lib/play');

module.exports = class Command {
  constructor(parsing) {
    this.parsing = parsing;
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;
  }

  run() {
    this.btnOver = true;
    this.evt.on('button', (button, type) => {
      if (type === 'keydown' && 'PRE' === button && this.btnOver) {
        this.btnOver = false;
        this.parsing.resetMode(); // 有正确的翻页请求的时候 清除之前的状态
        this.config.mqtt.publish('sound_manager/pause', JSON.stringify({}), () => {
          this.config.mqtt.publish('sound_manager/clear_play', JSON.stringify({}), () => {
            new Play().play(config.tip_page_change).then(() => { // 翻页的提示音
              this.btnOver = true;
              this.parsing.getPrePage();
            });
          });
        });
      } else if (type === 'keydown' && 'NEXT' === button && this.btnOver) {
        this.btnOver = false;
        this.parsing.resetMode(); // 有正确的翻页请求的时候 清除之前的状态
        this.config.mqtt.publish('sound_manager/pause', JSON.stringify({}), () => {
          this.config.mqtt.publish('sound_manager/clear_play', JSON.stringify({}), () => {
            new Play().play(config.tip_page_change).then(() => { // 翻页的提示音
              this.btnOver = true;
              this.parsing.getNextPage();
            });
          });
        });
      } else if (type === 'keydown') {
        if (button === 'D') {
          this.evt.emit('choice_end', 'first');
          this.evt.emit('choiceComplex_end', 'first');
        } else if (button === 'E') {
          this.evt.emit('choice_end', 'second');
          this.evt.emit('choiceComplex_end', 'second');
        }
      }
    });
  }
};
