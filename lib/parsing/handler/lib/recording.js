// Get a recording text

'use strict';

const config = require('../../config');

const child_process = require('child_process');
const fs = require('fs');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');
const Promise = require('bluebird');

class Recording {
  constructor() {
    this.config = config;
    this.evt = this.config.event;
    this.mqtt = this.config.mqtt;
    this.recording_file = '/tmp/interaction_recording.fifo';
    this.correlationId = uuid.v4();
    this.mkfifo();
  }

  mkfifo() {
    return new Promise((resolve, reject) => {
      fs.access(this.recording_file, fs.F_OK, err => {
        if (err) {
          child_process.exec('mkfifo -m 644 /tmp/interaction_recording.fifo', (error, stdout, stderr) => {
            if (error) {
              console.log(colors.red(error));
              reject(error);
            } else {
              resolve(true);
            }
          });
        }
      });
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      this.correlationId = uuid.v4();
      // TODO: check online is or not
      this.mqtt.publish('environmental_perception/mic/recording/start', JSON.stringify({
        correlationId: this.correlationId,
        mode: 'passive',
        max: this.config.recording_last, // Recording speech 3s
        output: [
          {
            'type': 'local',
            'path': this.recording_file
          }
        ]
      }), () => {
        this.mqtt.publish('speech2text/do/request', JSON.stringify({
          correlationId: this.correlationId,
          file: this.recording_file,
          parameter: 'online|stream=1'
        }), () => {
          let speech2text_evt = (text, correlationId) => {
            if (correlationId == this.correlationId) {
              this.evt.removeListener('speech2text', speech2text_evt);
              timeout && clearTimeout(timeout);
              resolve(text);
            }
          }
          let timeout = setTimeout(() => {
            this.evt.removeListener('speech2text', speech2text_evt);
            resolve('');
          }, this.config.speech2text_timeout);
          this.evt.on('speech2text', speech2text_evt);
        });
      });
    });
  }
}

module.exports = new Recording();
