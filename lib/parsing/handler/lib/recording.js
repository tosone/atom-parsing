// Get a recording text

'use strict';

const config = require('../../config');

const child_process = require('child_process');
const fs = require('fs');

const uuid = require('uuid');
const colors = require('colors');
const Promise = require('bluebird');

class Recording {
  constructor() {
    this.config = config;
    this.evt = this.config.event;
    this.mqtt = this.config.mqtt;
    this.recording_file = '/tmp/interaction_recording.fifo';
    this.recording_wav_file = '/tmp/' + uuid.v4().split('-').join('') + '.wav';
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
              console.log(stdout);
              console.log(stderr);
              reject(error);
            } else {
              resolve(true);
            }
          });
        }
      });
    });
  }

  init(keywords, maxRecording) {
    return new Promise((resolve) => {
      this.correlationId = uuid.v4();
      this.mqtt.publish('sound_manager/clear_play', JSON.stringify(), () => {
        this.mqtt.publish('environmental_perception/mic/recording/start', JSON.stringify({
          correlationId: this.correlationId,
          mode: 'active',
          max: maxRecording || this.config.recording_last,
          output: [
            {
              'type': 'local',
              'path': this.recording_file
            }, {
              'type': 'local',
              'path': this.recording_wav_file
            }
          ]
        }), () => {
          this.mqtt.publish('speech2text/do/request', JSON.stringify({
            correlationId: this.correlationId,
            pipe: this.recording_file,
            parameter: 'online|stream=1'
          }), () => {
            let timeout = setTimeout(() => {
              if (this.speech2text_evt) {
                this.evt.removeListener('speech2text', this.speech2text_evt);
              }
              resolve('');
              // 最长录音时间 = 语音转文字的最长时间 + 最长的录音时间
              // 超时之后认为录音转文字的内容为空
            }, this.config.speech2text_timeout + (maxRecording || this.config.recording_last) * 1000);

            this.speech2text_evt = (text, correlationId) => {
              if (text === 'null' && correlationId === 'null') {
                this.evt.removeListener('speech2text', this.speech2text_evt);
                if (timeout) {
                  clearTimeout(timeout);
                }
              } else if (correlationId === this.correlationId) {
                this.evt.removeListener('speech2text', this.speech2text_evt);
                if (timeout) {
                  clearTimeout(timeout);
                }
                resolve(text);
              }
            };
            this.evt.on('speech2text', this.speech2text_evt);
            this.mqtt.publish('interaction/script/keywords', JSON.stringify({ keywords, correlationId: this.correlationId }));
          });
        });
      });
    });
  }
}

module.exports = new Recording();
