// Before interaction story over

'use strict';

const path = require('path');

const config = require('../config');
const Player = require('../handler/lib/play');

const Promise = require('bluebird');
const uuid = require('uuid');

class Before {
  constructor() {
    this.config = config;
  }

  init() {
    return new Promise((resolve) => {
      Promise.delay(config.choice_timeout_before).then(() => {
        new Player().play(this.config.beforeChoice_sound[Math.round(Math.random())], 0, 'play').then(() => {
          Promise.delay(this.config.choice_timeout_after).then(() => {
            resolve(true);
          });
        });
      });
    });
  }
}

module.exports = new Before();
