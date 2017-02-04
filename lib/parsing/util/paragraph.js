'use strict';

module.exports.getNextParagraph = (that) => {
  return function () {
    this.isAlive = true;
    if (this.currLineNum !== this.totalLines) {
      this.getMode(this.lines[this.currLineNum].trim()).then(mode => {
        if (mode !== 'paragraph') {
          this.currLineNum++;
          this.getNextParagraph();
        } else {
          this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'goto' });
          this.getNext();
        }
      });
    } else {
      this.currLineNum--; // 保证不会因为切换部分导致脚本解释引擎结束
      this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'goto' });
      this.getNext();
    }
  }.bind(that);
};

module.exports.getPreParagraph = (that) => {
  return function () {
    this.isAlive = true;
    if (this.currLineNum !== 1) {
      this.getMode(this.lines[this.currLineNum - 2].trim()).then(mode => {
        if (mode !== 'paragraph') {
          this.currLineNum--;
          this.getPreParagraph();
        } else if (!this.preTwice) {
          this.preTwice = true;
          this.currLineNum--;
          this.getPreParagraph();
        } else if (this.preTwice) {
          this.currLineNum--;
          this.preTwice = false;
          this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'goto' });
          this.getNext();
        }
      });
    } else {
      this.currLineNum--;
      this.preTwice = false;
      this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'goto' });
      this.getNext();
    }
  }.bind(that);
};
