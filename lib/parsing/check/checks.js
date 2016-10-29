// Checking manifest.rc is correct or not.

'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const colors = require('colors');

const checks = require('.');
const config = require('../config');
const reg = require('./pattern/regex');

class Checking {
  constructor(filepath) {
    this.config = config;
    this.reg = reg;
    this.hasManifest = true;
    this.filepath = filepath;
    this.name = path.basename(this.filepath);
    this.manifestFile = config.manifest;

    this.checks = checks;

    if (fs.existsSync(path.join(this.filepath, this.manifestFile))) {
      this.lines = fs.readFileSync(path.join(this.filepath, this.manifestFile), 'utf-8').split(/\r?\n/);
      this.hasManifest = true;
    } else {
      console.log('Parsing: can not get ' + path.join(this.filepath, this.manifestFile) + '.');
      this.hasManifest = false;
      return;
    }

    this.currLineNum = 0;
    this.totalLines = this.lines.length;
    this.user = {
      selected: [],
      unselected: []
    };
    this.result = {};
  }

  check(str) {
    let once = true;
    _.forEach(this.reg, (val, key) => {
      if (val.test(str)) {
        once && console.log(colors.green('Line ' + this.currLineNum + ': ' + key));
        once = false;
      }
    });
    once && console.log(colors.red('Line ' + this.currLineNum + ': No mode match.'));
    this.getNext();
  }

  checkArgs() {

  }

  checkChinese(str) {
    let re = /([——，“”‘’。：（）【】]+)/;
    if (re.test(str)) {
      console.log('Line ' + this.currLineNum + ' Error:' + 'exists Chinese symbols!');
      return true;
    }
    return false;
  }

  getNext() {
    this.currLineNum++;
    let currLineStr = this.lines[this.currLineNum - 1];
    if (this.currLineNum > this.totalLines) {
      console.log(colors.green('Interaction is over.'));
      process.exit(0);
    } else if (this.checkChinese(currLineStr)) {
      this.getNext();
    } else {
      return this.check(currLineStr);
    }
  }

  init() {
    this.getNext();
  }
}

new Checking('/home/tosone/').init();
