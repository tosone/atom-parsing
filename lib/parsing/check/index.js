'use strict';

const pattern = require('./pattern');

module.exports = {
  comment: () => { return {}; },
  bgmStart: str => {
    let result = pattern.bgmStart.exec(str);
    return {
      con: result[1]
    };
  },
  bgmStop: () => { return {}; },
  paragraph: () => { return {}; },
  share: () => { return {}; },
  shareFlag: str => {
    let result = pattern.shareFlag.exec(str);
    return {
      flag: result[1]
    };
  },
  wait: str => {
    let result = pattern.wait.exec(str);
    return {
      time: result[1],
      con: result[2]
    };
  },
  waitFlag: str => {
    let result = pattern.waitFlag.exec(str);
    return {
      flag: result[1],
      time: result[3],
      con: result[4]
    };
  },
  single: str => {
    let result = pattern.single.exec(str);
    return {
      sound: result[1]
    };
  },
  singleFlag: str => {
    let result = pattern.singleFlag.exec(str);
    return {
      flag: result[1],
      sound: result[3]
    };
  },
  singleComplex: str => {
    let result = pattern.singleComplex.exec(str);
    return {
      con: result[1]
    };
  },
  singleComplexFlag: str => {
    let result = pattern.singleComplexFlag.exec(str);
    return {
      flag: result[1],
      con: result[3]
    };
  },
  choice: str => {
    let result = pattern.choice.exec(str);
    return {
      con: result[1],
      default: result[2]
    };
  },
  choiceFlag: str => {
    let result = pattern.choiceFlag.exec(str);
    return {
      flag: result[1],
      con: result[3],
      default: result[4]
    };
  },
  choiceComplex: str => {
    let result = pattern.choiceComplex.exec(str);
    return {
      con: result[1]
    };
  },
  choiceComplexFlag: str => {
    let result = pattern.choiceComplexFlag.exec(str);
    return {
      flag: result[1],
      con: result[3]
    };
  },
  interaction: str => {
    let result = pattern.interaction.exec(str);
    return {
      con: result[1]
    };
  },
  interactionFlag: str => {
    let result = pattern.interactionFlag.exec(str);
    return {
      flag: result[1],
      con: result[3]
    };
  }
};
