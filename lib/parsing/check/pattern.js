'use strict';

// \"?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\"?
// ^(\$unvar)?(\s+)?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\{.*sound.*\})$
module.exports = {
  comment: new RegExp(/^###.*/),
  bgmStart: new RegExp(/^\$bgm\s+(\[.*\])/),
  bgmStop: new RegExp(/^\$bgm\s+off/),
  paragraph: new RegExp(/^\$paragraph$/),
  share: new RegExp(/^\$share$/),
  shareFlag: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\"?\s+\$share$/),
  wait: new RegExp(/^\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  waitFlag: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\"?\s+\$wait\s+(\d+)\s+(\[\{.*\}\])$/),
  single: new RegExp(/^\"?([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\"?$/),
  singleFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))$/),
  singleComplex: new RegExp(/^(\{.*sound.*\})$/),
  singleComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\{.*sound.*\})$/),
  choice: new RegExp(/^(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))$/),
  choiceFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\{.*\})\s+([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))$/),
  choiceComplex: new RegExp(/^(\[\{.*keyword.*\}\])$/),
  choiceComplexFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\[\{.*keyword.*\}\])$/),
  interaction: new RegExp(/^(\[\{.*\}\])$/),
  interactionFlag: new RegExp(/^([a-zA-Z0-9\-_\/]+\.(wav|ogg|amr))\s+(\[\{.*\}\])$/)
};
