'use strict';

const singleLed = require('../util/singleUtil');
const ability = require('./ability.js');
let config = require('../config');
let def = config.def;

function log_error(msg) {
  console.log("LED Error: ", msg);
}

let getNext = (length, index) => {
  if (index < length - 1) {
    return index + 1;
  } else if (index >= length - 1) {
    return 0;
  }
}

let timeout = ms => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  })
}

let offAll = alias => {
  return new Promise((resolve, reject) => {
    for (let led of alias) {
      let mode = "off";
      singleLed(led, mode);
      resolve('');
    }
  })
}

let defValue = (option, def) => {
  if (typeof def === 'object' && !(def instanceof Array)) {
    for (let k in def) {
      if (!option[k]) option[k] = def[k];
    }
    return option;
  }
}

let allStar = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.allStar)
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cFlicker";
    } else {
      mode = "sFlicker"
    }
    singleLed(led, mode, option);
  }
}

let breath = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.breath);
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cBreathRan";
    } else {
      mode = "sBreathRan"
    }
    singleLed(led, mode, option);
  }
}

let flow = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.flow);
  let index = 0;
  let mode = "";
  let run = () => {
    singleLed(ledAlias[index], 'off')
      .then(() => {
        index = getNext(ledAlias.length, index);
        if (ability[ledAlias[index]] === "c") {
          return singleLed(ledAlias[index], 'cFlickerOn')
        } else {
          return singleLed(ledAlias[index], 'sLightOn')
        }
      })
      .then(() => {
        timeout(option.bDelay).then(() => {
          if (config.model === 'flow') {
            run()
          }
        })
      })
  }
  run();
}

let mounting = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.mounting);
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cLightUp";
    } else {
      mode = "sLightUp"
    }
    singleLed(led, mode, option);
  }
}

let decrescendo = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.decrescendo);
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cLightDown";
    } else {
      mode = "sLightDown"
    }
    singleLed(led, mode, option);
  }
}

let flickerfrequencyConstant = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.flickerfrequencyConstant);
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cFlickerRan";
    } else {
      mode = "sFlicker"
    }
    singleLed(led, mode, option);
  }
}

let reducefrequencyFlashing = (ledAlias, option) => {
  offAll(ledAlias);
  option = defValue(option, def.reducefrequencyFlashing);
  for (let led of ledAlias) {
    let mode = "";
    if (ability[led] === "c") {
      mode = "cFlicker";
    } else {
      mode = "sFlicker"
    }
    singleLed(led, mode, option);
  }
}

let off = (ledAlias, option) => {
  offAll(ledAlias);
}

module.exports = {
  allStar,
  breath,
  flow,
  decrescendo,
  mounting,
  reducefrequencyFlashing,
  flickerfrequencyConstant,
  off: off
}
