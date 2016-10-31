'use strict';

const repl = require('repl');
const path = require('path');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');

const config = require('../config');
const convertButton = require('../util/button/config');

class Library {
  constructor() {
    this.config = config;

    this.play_soundId = uuid.v4();
    this.break_soundId = uuid.v4();
    this.correlationId = uuid.v4();

    this.mqtt = this.config.mqtt;

    this.sound_manager = 'sound_manager';
    this.sound_manager_complete = 'complete';
    this.sound_manager_terminate = 'terminate';
    this.sound_manager_play = 'sound_manager/play';
    this.sound_manager_break = 'sound_manager/break';

    this.speech2text_request = 'speech2text/do/request';
    this.speech2text_reply = 'speech2text/do/reply';

    this.interaction_start = 'interaction/start';
    this.interaction_pause = 'interaction/pause';
    this.interaction_resume = 'interaction/resume';

    this.interaction_commnad = 'interaction/command';

    this.button = 'input/keyboard/keydown';

    this.stt_reply = '好的可以是';

    this.interaction_dir = path.resolve(__dirname, '../example/test');

    this.init();
  }

  init() {
    this.mqtt.on('connect', () => {
      console.log('Parsing test connect MQTT succ.');
      this.mqtt.subscribe(this.sound_manager_play);
      this.mqtt.subscribe(this.sound_manager_break);
    });

    this.mqtt.on('message', (topic, payload) => {
      let msg = {};
      try { msg = JSON.parse(payload.toString()); } catch (e) { msg = {}; }
      if (topic === this.sound_manager_play) {
        this.play_soundId = msg.soundId;
      } else if (topic === this.sound_manager_break) {
        this.break_soundId = msg.soundId;
        let topic = this.sound_manager + '/' + this.break_soundId + '/' + this.sound_manager_complete;
        let payload = JSON.stringify({});
        this.mqtt.publish(topic, payload);
      } else if (topic === this.speech2text_request) {
        this.correlationId = msg.correlationId;
      }
    });
  }

  pause() {
    let payload = JSON.stringify({});
    this.mqtt.publish(this.interaction_pause);
  }

  reply(reply) {
    let text = reply !== '' ? reply : this.stt_reply
    let payload = JSON.stringify({ text, correlationId: this.correlationId });
    this.mqtt.publish(this.speech2text_reply, payload);
  }

  terminate(num) {
    let progress = num !== '' ? num : 3;
    let topic = this.sound_manager + '/' + this.play_soundId + '/' + this.sound_manager_terminate;
    let payload = JSON.stringify({ progress });
    this.mqtt.publish(topic, payload);
  }

  command(command) {
    let cmd = command !== '' ? command : '下一页';
    let topic = this.interaction_commnad;
    let payload = JSON.stringify({ "command": cmd });
    this.mqtt.publish(topic, payload);
  }

  complete() {
    let topic = this.sound_manager + '/' + this.play_soundId + '/' + this.sound_manager_complete;
    let payload = JSON.stringify({});
    this.mqtt.publish(topic, payload);
  }

  mode(dir) {
    let directory = (dir && dir !== '') ? path.resolve(__dirname, '../example', dir) : this.interaction_dir;
    let payload = JSON.stringify({ dir: directory });
    this.mqtt.publish(this.interaction_start, payload);
  }

  start(dir) {
    let directory = (dir && dir !== '') ? dir : this.interaction_dir;
    let payload = JSON.stringify({ dir: directory });
    this.mqtt.publish(this.interaction_start, payload);
  }

  resume(dir) {
    let directory = (dir && dir !== '') ? dir : this.interaction_dir;
    let payload = JSON.stringify({ dir: directory });
    this.mqtt.publish(this.interaction_resume, payload);
  }

  btn(buttonKey) {
    let keyCode = (buttonKey !== '' ? convertButton['R1A']['keyCode'][buttonKey] : 'key12') || 'key12';
    let payload = JSON.stringify({ keyCode: keyCode });
    this.mqtt.publish(this.button, payload);
  }
}

module.exports = Library;
