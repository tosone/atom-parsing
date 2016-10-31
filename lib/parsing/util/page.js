'use strict';

module.exports.getNextPage = (that) => {
  return function () {
    if (this.currLineNum !== this.totalLines) {
      this.getMode(this.lines[this.currLineNum].trim()).then(mode => {
        if (mode !== 'blank') {
          this.currLineNum++;
          this.getNextPage();
        } else {
          this.getNext();
        }
      });
    } else {
      this.end();
    }
  }.bind(that);
}

module.exports.getPrePage = (that) => {
  return function () {
    if (this.currLineNum !== 1) {
      this.getMode(this.lines[this.currLineNum - 2].trim()).then(mode => {
        if (mode !== 'blank') {
          this.currLineNum--;
          this.getPrePage();
        } else if (!this.preTwice) {
          this.preTwice = true;
          this.currLineNum--;
          this.getPrePage();
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
}
