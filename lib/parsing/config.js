const path = require('path');
const events = require('events');
const config = require("../../config");
const appDir = '/home/root/userdata/apps/interaction_story';
let emitter = new events.EventEmitter();
let autoemitter = new events.EventEmitter();

emitter.setMaxListeners(0); // 引擎内部的 eventBus
autoemitter.setMaxListeners(0); // 自动测试脚本的 eventBus

module.exports = {
  manifest: 'manifest.rc',
  packageFile: 'package.json',
  mqtt: config.mqtt,
  event: emitter,
  autoemitter,
  redis8: config.redis8,
  identifacation_failed_file: path.join(appDir, 'identification_failed.ogg'), // 用户输入没有匹配到内容
  identification_null_file: path.join(appDir, 'identification_null.ogg'), // 用户输入的信息匹配的结果是空的
  tip_page_change: path.join(appDir, 'page.ogg'), // 翻页的音效
  interaction_bgm: path.join(appDir, 'interaction_bgm.ogg'), // 在互动活动过程中的背景音
  speech2text_timeout: 5000, // 语音识别成文字的最长时间
  crashed: path.join(appDir, 'file_crashed.ogg'), // 故事损坏
  wait_for_interaction_btn: 10000, // 在互动环节等待用户按键的最大时长
  wait_for_interaction_nfc: 10000, // 在互动环节等待用户 nfc 的最大时长
  button_timeout: 10000, // 按键超时时间，超过后将继续默认流程
  line_stop_time: 1000, // 在脚本的每一行之间的播放时间间隔
  recording_last: 5, //录音的持续时间
  nfc_redis_key: 'NfcCardGame'
};
