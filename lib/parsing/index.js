// Router for mqtt to event

'use strict';

const nfc = require('./util/nfc');
const config = require('./config');
const Parsing = require('./parsing');
const convertButton = require('./util/button');

const sdk = require('nodecontainer-sdk');
const colors = require('colors');

class Index {
  constructor() {
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;
    this.msg = {};

    this.innerEvt = sdk.event;
  }

  init() {
    console.log(colors.green('Script engine is ready.'));

    this.innerEvt.on('interaction/start', msg => {
      Parsing.start(msg);
    });

    this.innerEvt.on('interaction/pause', msg => {
      Parsing.pause(msg);
    });

    this.innerEvt.on('interaction/resume', msg => {
      Parsing.resume(msg);
    });

    this.mqtt.on('message', (topic, payload) => {
      payload = payload.toString();
      try {
        this.msg = JSON.parse(payload);
      } catch (e) {
        this.msg = {};
      }
      if (topic === 'interaction/start') {
        Parsing.start(this.msg);
      } else if (topic === 'interaction/resume') {
        Parsing.resume(this.msg);
      } else if (topic === 'interaction/pause') {
        console.log(colors.red('Interaction got a pause.'));
        Parsing.pause();
      } else if (topic === 'interaction/command') {
        if (this.msg.type === 'nfc') {
          this.evt.emit('nfc', this.msg.data.nfcAlias);
        }
      } else if (topic === 'environmental_perception/mic/recording/done') { // 环境感知
        this.evt.emit('environmental_perception', this.msg.output, this.msg.correlationId);
      } else if (topic === 'speech2text/do/reply') { // 语音转换文字
        this.evt.emit('speech2text', this.msg.text, this.msg.correlationId);
      } else if (/sound_manager/.test(topic)) { // 播放声音
        let action = topic.split('/')[2];
        let soundId = topic.split('/')[1];
        if (action === 'terminate') {
          this.evt.emit('sound_manager/terminate', soundId, this.msg.progress);
        } else if (action === 'complete') {
          this.evt.emit('sound_manager/complete', soundId);
        } else if (action === 'error') {
          this.evt.emit('sound_manager/error', soundId);
        }
      } else if (topic === 'input/keyboard/keydown' || topic === 'input/keyboard/keyup' || topic === 'input/keyboard/keyhold') { // 按键相关
        let button = convertButton(this.msg.keyCode);
        if (button) {
          this.evt.emit('button', button, topic.split('/')[2], this.msg.para);
        }
      } else if (topic === 'network/bbcloudonline/status') {
        Parsing.networkstatus = this.msg.satus;
      }
    });
  }
}

new Index().init();
