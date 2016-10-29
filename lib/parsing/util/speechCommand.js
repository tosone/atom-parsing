// 故事运行的过程中的一些全局语音指令

'use strict';

const config = require('../config');

module.exports = class Command {
  constructor(parsing) {
    this.parsing = parsing;
    this.config = config;
    this.mqtt = this.config.mqtt;
  }

  run(text) {
    if (text.indexOf('上一页') !== -1) {
      this.parsing.pause();
      this.parsing.getPrePage();
    } else if (text.indexOf('下一页') !== -1) {
      this.parsing.pause();
      this.parsing.getNextPage();
    } else if (text.indexOf('上一部分') !== -1) {
      this.parsing.pause();
      this.parsing.getPreParagraph();
    } else if (text.indexOf('下一部分') !== -1) {
      this.parsing.pause();
      this.parsing.getNextParagraph();
    } else if (text.indexOf("暂停") !== -1 || text.indexOf("停止") !== -1) {
      this.parsing.pause();
    } else {
      this.mqtt.publish("interaction/not_related", JSON.stringify({}));
    }
  }
}
