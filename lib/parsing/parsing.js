'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');
const Promise = require('bluebird');

const config = require('./config');
const btnCommand = require('./util/btnCommand');
const Snapshot = require('./util/snapshot');

class Parsing extends Snapshot {
  constructor() {
    super();

    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;

    this.selected = []; // 已经播过的所有声音的集合
    this.paragraph = 0; // 当前所处的段落数
    this.progress = null; // 需要从某个时间节点开始播放

    this.reg = require('./check/pattern'); // 确定故事脚本的每一行所属的模式
    this.checks = require('./check'); // 对于故事脚本的每一行语句的模式匹配
    this.handler = require('./handler'); // 对于故事脚本某一种模式的处理

    this.soundId = uuid.v4();

    this.preTwice = false;
    this.timer = null;

    this.btnCommand = new btnCommand(this);
  }

  globalFun() {
    this.evt.on('play/soundId', soundId => { this.soundId = soundId; });
  }

  check(str) {
    new Promise((resolve, reject) => {

      Promise.delay(this.config.line_stop_time).then(() => {
        this.getMode(str).then(mode => {
          console.log(colors.green('Line ' + this.currLineNum + ' mode is ' + mode));
          if (mode === 'blank') { // 空行
            this.paragraph = this.paragraph + 1;
            resolve(true);
          } else if (mode === 'none') { // 没有匹配到任何模式
            resolve(true);
          } else {
            let result = this.checks[mode](str);
            result.filepath = this.filepath;
            if (mode.indexOf('single') !== -1 && this.progress) { // 查看是否有从某个时间节点播放的请求，仅仅单句模式才能跳转节点
              result.progress = this.progress;
            }
            if (result.flag && this.selected.indexOf(result.flag) === -1) {
              console.log(colors.red('Line ' + this.currLineNum.toString() + ' has been jumped.'));
              resolve(true);
            } else {
              this.handler[mode](result).then(backwords => {
                if (_.isArray(backwords)) {
                  this.selected = this.selected.concat(backwords);
                } else if (_.isPlainObject(backwords)) {
                  this.selected = this.selected.concat(backwords.lists);
                  if (backwords.backline) {
                    this.currLineNum = this.currLineNum + Number(backwords.backline) - 1;
                  }
                }
                if (this.currLineNum < 0) {
                  this.currLineNum = 0;
                }
                this.progress = null;
                resolve(true);
              });
            }
          }
        });
      });
    }).then(val => {
      this.getNext();
    }, err => {
      console.log(colors.red(err));
      this.getNext();
    });
  }

  getNextParagraph() {
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
  }

  getPreParagraph() {
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
  }

  getNextPage() {
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
  }

  getPrePage() {
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
  }

  getMode(str) {
    return new Promise((resolve, reject) => {
      if (typeof str === 'undefined') {
        resolve('none');
      } else if (str === '') {
        resolve('blank');
      } else {
        _.forEach(this.reg, (val, key) => {
          if (val.test(str)) {
            resolve(key);
          }
        });
        resolve('none');
      }
    });
  }

  getNext(progress) {
    if (progress) {
      this.progress = progress;
    }
    this.currLineNum++;
    let currLineStr = this.lines[this.currLineNum - 1];
    if (this.currLineNum > this.totalLines) {
      this.end();
    } else {
      this.evt.emit('interaction/lineNum', this.currLineNum);
      return this.check(currLineStr.trim());
    }
  }

  end(err) {
    if (err && (err.cmd === 'args error' || err.cmd === 'story crashed')) {
      console.log(JSON.stringify(err));
    } else {
      console.log(colors.green('Interaction is over.'));
      this.clear();
    }
    this.mqtt.publish('interaction/stopped', JSON.stringify({ interactionId: this.interactionId }));
  }

  pause() {
    this.reset();
    this.mqtt.publish('sound_manager/pause', JSON.stringify({ soundId: this.soundId }));
    this.evt.emit('choice_end');
    this.evt.emit('interaction_end');
    this.evt.emit('choiceComplex_end');
  }

  start(setting) {
    this.init(setting).then(() => {
      this.getNext();
    }).catch(e => {
      console.log(JSON.stringify(e));
      this.end(e);
    });
  }

  resume(setting) {
    this.init(setting).then(() => {
      this.pop().then((msg) => {
        if (msg) {
          if (msg.line) {
            this.currLineNum = msg.line - 1;
          } else {
            this.clear();
          }
          let progress = 0;
          if (msg.status === 'done') {
            this.currLineNum = this.currLineNum + 1;
          } else if (msg.status === '0') {
            this.currLineNum = this.currLineNum;
          } else {
            this.currLineNum = this.currLineNum;
            progress = Number(msg.status);
          }
          this.getAll().then(msg => {
            this.selected = msg;
            this.getNext(progress);
          });
        } else {
          this.start(setting);
        }
      });
    }).catch(e => {
      this.start(setting);
      console.log(JSON.stringify(e));
    });
  }

  reset() {
    this.evt.removeAllListeners();
  }

  init(setting) {
    let filepath = setting.dir;
    this.interactionId = setting.interactionId || uuid.v4();
    this.globalFun();
    this.pause();
    this.btnCommand.run(); // 启动故事全局按键监听处理
    return new Promise((resolve, reject) => {
      if (typeof filepath === 'undefined' || filepath === '') {
        reject({ cmd: 'args error', info: 'Got a undefined interaction story path or filepath is blank.' });
      }
      this.selected = [];
      this.filepath = filepath;
      this.name = path.basename(this.filepath);
      this.manifestFile = config.manifest;

      if (fs.existsSync(path.join(this.filepath, this.manifestFile))) {
        this.lines = fs.readFileSync(path.join(this.filepath, this.manifestFile), 'utf-8').split(/\r?\n/);
      } else {
        reject({ cmd: 'story crashed', info: 'Can not find out file in ' + path.join(this.filepath, this.manifestFile) + '.' });
      }
      this.currLineNum = 0;
      this.totalLines = this.lines.length;
      this.snapshotInit();
      resolve(true);
    });
  }
}

module.exports = new Parsing();
