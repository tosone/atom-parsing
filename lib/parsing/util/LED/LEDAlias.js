'use strict';

const _ = require('lodash');

const config = {
  'a': ['led_left', 'led_right'],
  'b': ['led_home']
};


module.exports = (lightAlias) => {
  if (lightAlias) {
    if (lightAlias !== 'all') {
      let lights = lightAlias.split('');
      let ret = [];
      _.forEach(lights, light => {
        if (config[light]) {
          ret = _.concat(ret, config[light]);
        }
      });
      return ret;
    } else {
      let ret = [];
      _.forEach(config, val => {
        ret = _.concat(ret, val);
      });
      return ret;
    }
  } else {
    return [];
  }
};
