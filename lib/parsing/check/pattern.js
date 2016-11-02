'use strict';

// \"?([a-zA-Z0-9\-_\/]+\.(wav|ogg))\"?
// ^(\$unvar)?(\s+)?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\{.*sound.*\})$
module.exports = {
  comment: new RegExp(/^###.*/),
  bgmStart: new RegExp(/^\$bgm\s+(\[.*\])/),
  bgmStop: new RegExp(/^\$bgm\s+off/),
  paragraph: new RegExp(/^\$paragraph$/),
  share: new RegExp(/^\$share$/), // TODO:分享功能
  shareFlag: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg))\"?\s+\$share$/),
  wait: new RegExp(/^\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  waitFlag: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg))\"?\s+\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  single: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg))\"?$/),
  singleFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg))\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg))$/),
  singleComplex: new RegExp(/^(\{.*sound.*\})$/),
  singleComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg))\s+(\{.*sound.*\})$/),
  choice: new RegExp(/^(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg))$/),
  choiceFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg))\s+(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg))$/),
  choiceComplex: new RegExp(/^(\[\{.*keyword.*\}\])$/),
  choiceComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg))\s+(\[\{.*keyword.*\}\])$/),
  interaction: new RegExp(/^(\[\{.*\}\])$/),
  interactionFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg))\s+(\[\{.*\}\])$/)
};
