'use strict';
let mqtt = require('../../config.js').mqtt;

module.exports = {
  OUTPUT_LED_SET: "output/led/set",
  mqtt,
  state: "stop",
  def: {
    allStar: {
      dTime: 0,
      bDelay: 300,
      bMode: 1,
      bStep: 10
    },
    breath: {
      dTime: 0,
      gSpeed: 500
    },
    flow: {
      dTime: 0,
      bDelay: 300
    },
    mounting: {
      colors: "020202",
      gSpeed: 500
    },
    decrescendo: {
      colors: "ffffff",
      gSpeed: 500
    },
    flickerfrequencyConstant: {
      dTime: 0,
      bDelay: 200
    },
    reducefrequencyFlashing: {
      dTime: 0,
      bDelay: 200,
      bMode: 2,
      bStep: 20
    }
  }
}
