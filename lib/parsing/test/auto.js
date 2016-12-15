'use strict';
const path = require('path');
const repl = require('repl');

const _ = require('lodash');

const Lib = require('./lib');
const config = require('../config');

class Test extends Lib {
  constructor() {
    super();
    this.config = config;
    this.repl = repl.start('');
    this.mqtt = this.config.mqtt;
    this.evt = this.config.autoemitter;

    this.currLineNum = 0;

    this.repl.defineCommand('mode', {
      help: 'Interaction mode test',
      action: this.mode.bind(this)
    });

    this.mqtt.on('message', (topic, payload) => {
      if (topic === 'interaction/script/nfcsbind') {
        let nfcs = [];
        try {
          nfcs = JSON.parse(payload.toString()).nfcs;
        } catch (e) {
          console.log(e);
        }
        _.forEach(nfcs, nfc => {
          this.nfc(nfc);
        });
      } else if (topic === 'interaction/script/keysbind') {
        let btns = [];
        try {
          btns = JSON.parse(payload.toString()).btns;
        } catch (e) {
          console.log(e);
        } finally {
          if (btns.length === 0) {
            console.log('Interaction: interaction mode keysbind is blank.');
          } else {
            let btn = _.sample(btns);
            while (btn === 'no') {
              btn = _.sample(btns);
            }
            this.evt.emit('btn', { btns, btn });
            this.btn(btn);
          }
        }
      } else if (topic === 'interaction/script/keywords') {
        let keywords = [];
        let correlationId = '';
        try {
          let json = JSON.parse(payload.toString());
          keywords = json.keywords;
          correlationId = json.correlationId;
        } catch (e) {
          console.log(e);
        } finally {
          if (keywords.length === 0) {
            console.log('Interaction: choice mode keywords is blank.');
          } else {
            let keyword = _.sample(keywords);
            this.evt.emit('keyword', { keyword, keywords });
            this.reply(keyword);
          }
        }
      } else if (topic === 'sound_manager/play') {
        let json = JSON.parse(payload.toString());
        let soundId = json.soundId;
        let file = path.basename(json.file);
        this.evt.emit('play', { file });
        this.mqtt.publish('sound_manager/' + soundId + '/complete', JSON.stringify({}));
      } else if (topic === 'interaction/script/line') {
        let json = JSON.parse(payload.toString());
        this.evt.emit('line', { line: json.line, mode: json.mode });
      } else if (topic === 'interaction/stopped') {
        this.evt.emit('end');
      }
    });
  }
}

new Test();
