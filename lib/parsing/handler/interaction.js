'use strict';

const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');

const LED = require('../util/LED');
const config = require('../config');
const player = require('./lib/play');
const Button = require('./lib/button');
const fileResolve = require('./lib/fileResolve');

const Player = new player();

module.exports = (result) => {
  let evt = config.event;
  let mqtt = config.mqtt;
  let activies = JSON.parse(result.con);
  let playList = [];

  return new Promise((resolve, reject) => {
    _.forEach(activies, (val, key) => {
      if (val.cmd === 'button') {
        let activies = val.button;
        let keysbind = [];
        _.forEach(activies, (val, key) => {
          keysbind.push(key);
        });

        let key_evt = null;

        let timeout = setTimeout(() => {
          key_evt && evt.removeListener('button', key_evt);
          if (activies["no"]) {
            if (activies["no"]["LED"]) {
              LED('led_home', activity["LED"].mode, activity["LED"].option).then(() => {
                evt.emit('interaction_end');
              });
            }
            Player.play(fileResolve(result, activies["no"].sound.sound)).then(() => {
              resolve(playList);
            });
          } else {
            resolve(playList);
          }
        }, config.wait_for_interaction_btn);

        key_evt = (key, keyType) => {
          if (keyType === 'keydown') {
            Player.play(config.button_tip_sound, 0).then(() => {
              _.forEach(keysbind, k => {
                if (k === key && activies[key]) {
                  let activity = activies[key];
                  if (activity.sound) {
                    Player.play(fileResolve(result, activity.sound.sound)).then(() => {
                      playList.push(activity.sound.sound);
                      if (activity["LED"]) {
                        LED('led_home', activity["LED"].mode, activity["LED"].option).then(() => {
                          evt.emit('interaction_end');
                        });
                      } else { evt.emit('interaction_end'); }
                    });
                  } else {
                    evt.emit('interaction_end');
                  }
                  evt.once('interaction_end', () => {
                    timeout && clearTimeout(timeout);
                    evt.removeListener('button', key_evt);
                    resolve(playList);
                  });
                }
              });
            });
          }
        };
        mqtt.publish('interaction/script/keysbind', JSON.stringify({ btns: keysbind }));
        evt.on('button', key_evt);
      }
    });
  });
};
