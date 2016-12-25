'use strict';

const path = require('path');
const events = require("events");

const config = require('../../config');

const appDir = '/home/root/userdata/apps/interaction_story';

let emitter = new events.EventEmitter();
let autoemitter = new events.EventEmitter();

emitter.setMaxListeners(0); // 引擎内部的 eventBus
autoemitter.setMaxListeners(0); // 自动测试脚本的 eventBus

module.exports = {
  manifest: 'manifest.rc',
  mqtt: config.mqtt,
  event: emitter,
  autoemitter,
  redis8: config.redis8,

  identifacation_failed_file: path.join(appDir, 'identification_failed.ogg'), // 用户输入没有匹配到内容
  identification_null_file: path.join(appDir, 'identification_null.ogg'), // 用户输入的信息匹配的结果是空的

  speech2text_timeout: 10000, // 语音识别成文字的最长时间

  crashed: path.join(appDir, 'file_crashed.ogg'), // 故事损坏

  wait_for_interaction_btn: 10000, // 在互动环节等待用户按键的最大时长

  choice_timeout_before: 1000, // 在故事进行选择分支完成即将进入分支的时候需要播放提示音之前的延时
  beforeChoice_sound: [path.join(appDir, 'before_choice_2.ogg'), path.join(appDir, 'before_choice_1.ogg')], // 在进入某个分支之前的提示音
  choice_timeout_after: 1000, // 在故事进行选择分支完成即将进入分支的时候需要播放提示音之后的延时

  button_tip_sound: path.join(appDir, 'button_tip.ogg'), // 在互动环节所有按键的提示音

  button_timeout: 10000, // 按键超时时间，超过后将继续默认流程

  line_stop_time: 1000, // 在脚本的每一行之间的播放时间间隔
  recording_last: 5 //录音的持续时间
};
