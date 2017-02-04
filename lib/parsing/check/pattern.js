'use strict';

module.exports = {
  comment: new RegExp(/^###.*/),
  bgmStart: new RegExp(/^\$bgm\s+(\[.*\])/),
  bgmStop: new RegExp(/^\$bgm\s+off/),
  paragraph: new RegExp(/^\$paragraph$/),
  share: new RegExp(/^\$share$/),
  // timerCount: new RegExp(/^\$timerCount$/),
  // timerCountEnd: new RegExp(/^\$timerCountEnd$/),
  shareFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+\$share$/),
  wait: new RegExp(/^\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  waitFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  single: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3))\"?$/),
  singleFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3))$/),
  singleComplex: new RegExp(/^(\{.*sound.*\})$/),
  singleComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+(\{.*sound.*\})$/),
  choice: new RegExp(/^(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3))$/),
  choiceFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3))$/),
  choiceComplex: new RegExp(/^(\[\{.*keyword.*\}\])$/),
  choiceComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+(\[\{.*keyword.*\}\])$/),
  interaction: new RegExp(/^(\[\{.*\}\])$/),
  interactionFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr|mp3)|\[.*\]|\{.*complexFlagList.*\})\s+(\[\{.*\}\])$/)
};
