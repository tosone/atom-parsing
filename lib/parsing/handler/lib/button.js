'use strict';

const _ = require('lodash');
const colors = require('colors');

const config = require('../../config');
const Player = require('./play');

class Button {
  constructor(actives) {
    this.config = config;
    this.evt = this.config.event;
    this.actives = actives;
    this.keysbind = [];
  }

  init() {
    _.forEach(this.actives, (val, key) => {
      this.keysbind.push(key);
      this.listenOnKey(key, val);
    });
  }

  listenOnKey() {
    let key_evt = (key, keyType) => {
      _.forEach(this.keysbind, k => {
        if (k === key && this.actives[key]) {
          _.forEach(this.actives[key], (value, type) => {
            if (type === 'LED') {

            } else if (type === 'sound') {
              new Player().play(value.sound, 0, 'break').then(() => {
                this.evt.emit('interaction_over');
              });
            }
          });
          this.evt.removeListener('button', key_evt);
        }
      });
    };
    this.evt.on('button', key_evt);
  }
}

module.exports = Button;
