'use strict';

const path = require('path');

const Player = require('./lib/play');
const fileResolve = require('./lib/fileResolve');

module.exports = (result) => {
  let playList = [];
  if (result.sound) {
    playList.push(result.sound);
    return new Promise((resolve, reject) => {
      new Player().play(fileResolve(result), 0, 'play', result.progress).then(() => {
        resolve(playList);
      });
    });
  } else {
    return Promise.reject({ 'Error': 'Modes get Args is error.' });
  };
};
