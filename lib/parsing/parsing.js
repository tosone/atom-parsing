'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');
const Promise = require('bluebird');
const sdk = require('nodecontainer-sdk');

const LED = require('./util/LED');
const config = require('./config');
const page = require('./util/page');
const Snapshot = require('./util/snapshot');
const Player = require('./handler/lib/play');
const paragraph = require('./util/paragraph');
const ledAlias = require('./util/LED/LEDAlias');
const BtnCommand = require('./util/btnCommand');

class Parsing extends Snapshot {
  constructor() {
    super();

    this.sdk = sdk;
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;

    this.macAddress = sdk.macAddress; // 设备的mac地址

    this.packageFile = this.config.packageFile; // 关于故事的相关描述信息描述文件

    this.selected = []; // 已经播过的所有声音的集合
    this.paragraph = 0; // 当前所处的段落数
    this.progress = null; // 需要从某个时间节点开始播放
    this.storyPackageInfo = {}; // 故事的相关描述信息

    this.reg = require('./check/pattern'); // 确定故事脚本的每一行所属的模式
    this.checks = require('./check'); // 对于故事脚本的每一行语句的模式匹配
    this.handler = require('./handler'); // 对于故事脚本某一种模式的处理

    this.innerEvt = sdk.event;
    this.soundId = uuid.v4();

    this.preTwice = false;
    this.timer = null;

    this.btnCommand = new BtnCommand(this);

    this.getNextParagraph = paragraph.getNextParagraph(this);
    this.getPreParagraph = paragraph.getPreParagraph(this);
    this.getNextPage = page.getNextPage(this);
    this.getPrePage = page.getPrePage(this);

    this.isAlive = false;
    this.networkstatus = true;
  }

  globalFun() {
    this.evt.on('interaction/internal/collect/story-status-changed', data => { // 引擎内部的信息收集和外部的信息抛出
      data.time = new Date().getTime();
      data.line = this.currLineNum;
      data.id = this.interactionId;
      data.storyType = this.storyType;
      data.storyTitle = this.storyTitle;
      data.storyVersion = this.storyVersion;
      data.macAddress = this.sdk.macAddress;
      this.sdk.event.emit('interaction/collect', { type: 'story-status-changed', data });
    });
    this.evt.on('interaction/internal/collect/story-choice', data => { // 引擎内部的信息收集和外部的信息抛出
      data.time = new Date().getTime();
      data.line = this.currLineNum;
      data.id = this.interactionId;
      data.script = this.storyScriptFile;
      data.storyType = this.storyType;
      data.storyTitle = this.storyTitle;
      data.storyVersion = this.storyVersion;
      data.macAddress = this.macAddress;
      this.sdk.event.emit('interaction/collect', { type: 'story-choice', data });
    });
    this.evt.on('interaction/internal/collect/story-command', data => { // 引擎内部的信息收集和外部的信息抛出
      data.time = new Date().getTime();
      data.line = this.currLineNum;
      data.id = this.interactionId;
      this.sdk.event.emit('interaction/collect', { type: 'story-command', data });
    });
  }

  check(str) {
    new Promise(resolve => {
      this.getMode(str).then(mode => {
        this.mqtt.publish('interaction/script/line', JSON.stringify({ mode, line: this.currLineNum }));
        console.log(colors.green('Line ' + this.currLineNum + ' mode is ' + mode));
        if (mode === 'blank') { // 空行
          this.paragraph = this.paragraph + 1;
          resolve();
        } else if (mode === 'none') { // 没有匹配到任何模式
          resolve();
        } else {
          let result = this.checks[mode](str);
          result.filepath = this.filepath;
          result.networkstatus = this.networkstatus;
          if (mode.indexOf('single') !== -1 && this.progress) { // 查看是否有从某个时间节点播放的请求，仅仅单句模式才能跳转节点
            result.progress = this.progress;
          }
          if (result.flag && this.checkSelected(result.flag)) {
            console.log(colors.red('Line ' + this.currLineNum.toString() + ' has been jumped.'));
            resolve();
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
              resolve();
            });
          }
        }
      });
    }).then(() => {
      this.getNext();
    }, err => {
      console.log(colors.red(err));
      this.getNext();
    });
  }

  checkSelected(flag) {
    if (flag[0] === '{') {
      let parseFlag = {};
      try {
        parseFlag = JSON.parse(flag);
      } catch (e) {
        console.log(e);
      } finally {
        let flagList = _.isString(parseFlag) ? [parseFlag.complexFlagList] : parseFlag.complexFlagList;
        if (parseFlag.mode === 'and') {
          if (parseFlag.unvar) { // 所有的list中出现的音频都没有播放过
            for (let f of flagList) {
              if (this.selected.indexOf(f) !== -1) {
                return true;
              }
            }
            return false;
          } else { // 所有的list中出现的音频都播放过
            for (let f of flagList) {
              if (this.selected.indexOf(f) === -1) {
                return true;
              }
            }
            return false;
          }
        } else if (parseFlag.mode === 'or') {
          let count = 0;
          if (parseFlag.unvar) { // 在list中出现的音频至少有一个没有播放过
            for (let f of flagList) {
              if (this.selected.indexOf(f) === -1) {
                count++;
              }
            }
            if (count > 0) {
              return false;
            } else {
              return true;
            }
          } else { // 在list中出现的音频至少有一个播放过
            for (let f of flagList) {
              if (this.selected.indexOf(f) !== -1) {
                count++;
              }
            }
            if (count > 0) {
              return false;
            } else {
              return true;
            }
          }
        }
        for (let f of parseFlag) {
          if (this.selected.indexOf(f) === -1) {
            return true;
          }
        }
        return false;
      }
    } else if (flag[0] === '[') { // 当flag是一个数组的时候匹配已经播放的所有文件中是否含有设置的所有flag
      let parseFlag = [];
      try {
        parseFlag = JSON.parse(flag);
      } catch (e) {
        console.log(e);
      } finally {
        for (let f of parseFlag) {
          if (this.selected.indexOf(f) === -1) {
            return true;
          }
        }
        return false;
      }
    } else { // 当flag是单个的时候，判断已经播放过的音频中是否含有这个flag
      return this.selected.indexOf(flag) === -1 ? true : false;
    }
  }

  getMode(str) {
    return new Promise(resolve => {
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
    if (progress) { this.progress = progress; }
    this.currLineNum++;
    let currLineStr = this.lines[this.currLineNum - 1];
    if (this.currLineNum > this.totalLines) {
      this.end();
    } else {
      return this.check(currLineStr.trim());
    }
  }

  end(err) {
    if (err && (err.cmd === 'args error' || err.cmd === 'story crashed')) {
      new Player().play(this.config.crashed);
      console.log(JSON.stringify(err));
    } else {
      console.log(colors.green('Interaction is over.'));
      this.clear();
    }
    this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'stop' });
    this.reset();
    this.mqtt.publish('interaction/stopped', JSON.stringify({ correlationId: this.interactionId }));
    this.innerEvt.emit('interaction/stopped', { correlationId: this.interactionId });
    this.isAlive = false;
  }

  reset() {
    this.isAlive = false;
    this.resetMode();
    this.evt.removeAllListeners();
    this.mqtt.publish('sound_manager/pause', JSON.stringify({ soundId: this.soundId }));
    this.mqtt.publish('sound_manager/bgm_stop', JSON.stringify({}));
    LED(ledAlias('all'), 'off', {});
  }

  resetMode() { // 清除之前的模式状态
    // TODO: 清除状态之后对 Promise cancel
    this.evt.emit('choiceComplex_end', null);
    this.evt.emit('choice_end', null);
    this.evt.emit('interaction_end', 'null');
    this.evt.emit('speech2text', 'null', 'null');
    this.evt.emit('singleComplex_end', 'null');
  }

  pause() { // 停止引擎，但是会暂时保留状态，等待恢复
    this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'pause' });
    this.reset();
    this.innerEvt.emit('interaction/paused', { correlationId: this.interactionId });
    this.mqtt.publish('interaction/paused', JSON.stringify({ correlationId: this.interactionId }));
  }

  start(setting) {
    this.progress = null;
    this.init(setting).then(() => {
      this.isAlive = true;
      this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'start' });
      this.getNext();
    }).catch(e => {
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
            this.isAlive = true;
            this.chooseBreakpoint(progress);
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

  chooseBreakpoint(progress) {
    this.getMode(this.lines[this.currLineNum + 1].trim()).then(mode => {
      if (/single/.test(mode)) {
        this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'resume' });
        this.getNext(progress);
      } else {
        if (this.currLineNum === 0) {
          this.evt.emit('interaction/internal/collect/story-status-changed', { type: 'resume' });
          this.getNext(progress);
        } else {
          this.currLineNum--;
          this.chooseBreakpoint(progress);
        }
      }
    });
  }

  init(setting) {
    let filepath = setting.dir;
    this.interactionId = setting.correlationId || uuid.v4();
    this.reset(); // 初始化所有的状态
    this.globalFun(); // 注册引擎开始的必要组件和监听
    this.btnCommand.run(); // 启动故事全局按键监听处理
    this.manifestFile = setting.manifest ? setting.manifest : this.config.manifest; // 关于故事执行逻辑的相关描述文件

    return new Promise((resolve, reject) => {
      if (typeof filepath === 'undefined' || filepath === '') {
        reject({ cmd: 'args error', info: 'Got a undefined interaction story path or filepath is blank.' });
      }
      this.selected = [];
      this.filepath = filepath;
      this.name = path.basename(this.filepath);

      if (fs.existsSync(path.join(this.filepath, this.packageFile))) {
        this.storyPackageInfo = require(path.join(this.filepath, this.packageFile));
      } else {
        reject({ cmd: 'story crashed', info: 'Can not find out file in ' + path.join(this.filepath, this.manifestFile) + '.' });
      }
      this.storyTitle = this.storyPackageInfo.name;
      this.storyScriptFile = this.manifestFile;
      this.storyVersion = this.storyPackageInfo.version;
      this.storyType = this.storyPackageInfo.type;
      if (!setting.manifest && !this.networkstatus && this.storyPackageInfo.offlineManifest) this.manifestFile = this.storyPackageInfo.offlineManifest;

      if (fs.existsSync(path.join(this.filepath, this.manifestFile))) {
        this.lines = fs.readFileSync(path.join(this.filepath, this.manifestFile), 'utf-8').split(/\r?\n/);
      } else {
        reject({ cmd: 'story crashed', info: 'Can not find out file in ' + path.join(this.filepath, this.manifestFile) + '.' });
      }

      this.currLineNum = 0;
      this.totalLines = this.lines.length;
      this.snapshotInit(); // 开启引擎的快照功能
      resolve();
    });
  }
}

module.exports = new Parsing();
