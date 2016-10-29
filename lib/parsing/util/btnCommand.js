// 故事运行的过程中的一些全局按键指令

'use strict';

const config = require('../config');

module.exports = class Command {
  constructor(parsing) {
    this.parsing = parsing;
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;
  }

  run(text) {
    // TODO: 按键跳转一个播放进度，前进或者后退5s，仅对普通故事有效
    this.evt.on('button', (button, type) => {
      if (type === 'keydown' && 'PRE' === button) {
        this.parsing.getPrePage();
      } else if (type === 'keydown' && 'NEXT' === button) {
        this.parsing.getNextPage();
      }
    });
  }
}
