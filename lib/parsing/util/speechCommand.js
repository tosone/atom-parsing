// 故事运行的过程中的一些全局语音指令

'use strict';

const config = require('../config');
const betterMatch = require('betterMatch');

module.exports = class Command {
  constructor(parsing) {
    this.parsing = parsing;
    this.config = config;
    this.mqtt = this.config.mqtt;
  }

  run(text) {
    if (betterMatch(text, ['上一页'])) {
      this.parsing.pause();
      this.parsing.getPrePage();
    } else if (betterMatch(text, ['下一页'])) {
      this.parsing.pause();
      this.parsing.getNextPage();
    } else if (betterMatch(text, ['上一部分'])) {
      this.parsing.pause();
      this.parsing.getPreParagraph();
    } else if (betterMatch(text, ['下一部分'])) {
      this.parsing.pause();
      this.parsing.getNextParagraph();
    } else {
      this.mqtt.publish("interaction/not_related", JSON.stringify({}));
    }
  }
};
