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
          this.getNext();
        }
      });
    } else {
      this.end();
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
          this.getNext();
        }
      });
    } else {
      this.currLineNum--;
      this.preTwice = false;
      this.getNext();
    }
  }.bind(that);
};
