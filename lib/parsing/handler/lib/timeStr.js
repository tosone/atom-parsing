'use strict';

const re = /'/;

let convertNum = (str) => {
  let ret = 0;
  try {
    ret = Number(str);
  } catch (e) {
    console.log(e);
  }
  return ret;
};

module.exports = (str) => {
  if (re.test(str)) {
    let timeList = str.split('\'');
    if (timeList.length === 2) {
      return (convertNum(timeList[0]) * 60 + convertNum(timeList[1])) * 1000;
    } else {
      return 0;
    }
  } else {
    return convertNum(str) * 1000;
  }
};
