// Play a voice and wait for it

'use strict';

const config = require('../../config');

const uuid = require('uuid');

const nullAudio = 'null.ogg';
/**
 * Play: play a specially sound file.
 */
class Player {
  constructor() {
    this.config = config;
    this.mqtt = this.config.mqtt;
    this.evt = this.config.event;
  }

  /**
   * play: play a specially sound file.
   *
   * file: path to file
   * deadline: deadline for play a sound file.
   * type: play or break
   * progress: progress for play
   */
  play(file, deadline, type, progress) {
    this.type = type || 'play'; // default for play
    this.progress = 0;

    if (this.type === 'play') {
      this.progress = progress || 0;
    }

    this.file = file;
    this.topic = 'sound_manager/' + this.type;
    try {
      if (typeof deadline === 'undefined') {
        this.deadline = 0;
      } else {
        this.deadline = deadline === 0 ? 0 : Number(deadline);
      }
    } catch (e) {
      this.deadline = 0;
    }
    this.soundId = uuid.v4();
    return new Promise(resolve => {
      if (this.file === nullAudio) {
        resolve();
      } else {
        let timeout = null;
        if (this.deadline !== 0) {
          timeout = setTimeout(() => {
            resolve();
          }, this.deadline);
        }
        let payload = JSON.stringify({
          file: this.file,
          soundId: this.soundId,
          args: this.progress
        });

        this.mqtt.publish(this.topic, payload, () => {
          this.evt.emit('play/start');
          this.evt.emit('play/soundId', this.soundId);
          let terminate_evt = (soundId, currProgress) => {
            if (soundId === this.soundId) {
              this.evt.emit('play/terminate', currProgress, this.file);
            }
          };

          this.evt.on('sound_manager/terminate', terminate_evt);

          let complete_evt = soundId => {
            if (soundId === this.soundId) {
              if (timeout) { clearTimeout(timeout); }
              this.evt.removeListener('sound_manager/complete', complete_evt);
              this.evt.removeListener('sound_manager/terminate', terminate_evt);
              this.evt.emit('play/complete', this.file);
              resolve();
            }
          };
          this.evt.on('sound_manager/complete', complete_evt);
          this.evt.on('sound_manager/error', complete_evt);
        });
      }
    });
  }
}

module.exports = Player;
