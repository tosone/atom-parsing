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
    this.evt.on('button', (button, type, strategy) => {
      if (type === 'keydown') {
        if (button === 'D') {
          this.evt.emit('choice_end', 'first');
          this.evt.emit('choiceComplex_end', 'first');
          this.evt.emit('recording_stop');
        } else if (button === 'E') {
          this.evt.emit('choice_end', 'second');
          this.evt.emit('choiceComplex_end', 'second');
          this.evt.emit('recording_stop');
        }
      }
    });
  }
};
