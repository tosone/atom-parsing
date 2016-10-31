'use strict';

const path = require('path');

const config = require('../config');
const Player = require('./lib/play');
const fileResolve = require('./lib/fileResolve');

class Single {
  constructor() {
    this.config = config;
    this.evt = this.config.event;
  }

  init(result) {
    if (result.sound) {
      return new Promise((resolve, reject) => {
        new Player().play(fileResolve(result), 0, 'play', result.progress).then(() => {
          resolve([result.sound]);
        });
      });
    } else {
      console.log(colors.red('Interaction: Something wrong with single mode.'));
      this.evt.emit('interaction/error/choice');
      return Promise.resolve();
    };
  }
};

let single = new Single();
module.exports = single.init.bind(single);
