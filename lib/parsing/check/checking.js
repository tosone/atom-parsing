// Checking manifest.rc is correct or not.

'use strict';

const fs = require('fs');
const path = require('path');
const colors = require('colors');

const check = require('.');
const config = require('./config');

class Checking {
  constructor(filepath) {
    this.config = config;
    this.manifestFile = this.config.manifest;

    this.hasManifest = true;

    this.filepath = filepath;
    this.name = path.basename(this.filepath);

    if (fs.existsSync(path.join(this.filepath, this.manifestFile))) {
      this.lines = fs.readFileSync(path.join(this.filepath, this.manifestFile), 'utf-8').split('\n');
      this.hasManifest = true;
    } else {
      console.log(colors.red('Parsing: can not get ' + path.join(this.filepath, this.manifestFile) + '.'));
      this.hasManifest = false;
      return;
    }

    this.currLineNum = 0;
    this.totalLines = this.lines.length;
    this.choicelist = [];
    this.choicejsonlist = [];

    this.sound = '';
    this.flag = '';
    this.default = '';
    this.choice = '';

  }

  getNext() {
    this.currLineNum++;
    if (this.currLineNum >= this.totalLines) {
      if (this.choicelist) {
        for (var i = 0; i < this.choicelist.length; i++) {
          for (var key in this.choicelist[i]) {
            if (this._checkNameisRationality(this.choicelist[i][key]) && this._checkNameisExists(this.choicelist[i][key], key))
              return true;
          }
        }
      }
      return null;
    } else {
      if (!this._checkChinesesymbolsisExists(this.lines[this.currLineNum - 1]))
        return this._check(this.lines[this.currLineNum - 1]);
    }
  }

  _checkchoiceJson(str) {
    try {
      JSON.parse(str.replace(/'/g, '"'));
    } catch (err) {
      if (err) {
        console.log(this.currLineNum + ":" + str);
        console.log(this.currLineNum + " Error:" + "不符合json格式");
        return false;
      } else
        return true;
    }
  }

  _checkJSON(str) {
    return /\{.*\}/.test(str);
  }

  _checkComment(str) { //检查是否为注释模式
    return /###.*/.test(str);
  }

  //判断文件名是否符合规则
  _checkNameisRationality(str, flag, num) {
    let re = '';
    re = /^([a-zA-Z0-9]+\.(wav|ogg))$/;
    if (re) {
      if (re.test(str)) {
        let result = re.exec(str);
        if (result[1]) {
          return result[1];
        }
      } else {
        console.log("line" + num + ":" + str);
        console.log("line" + num + " Error:" + str + " is not rationality file");
        return null;
      }
    }
  }

  //判断文件名是否存在
  _checkNameisExists(str, num) {
    fs.stat(str, function (err, stat) {
      if (stat && stat.isFile()) {
        return true;
      } else {
        console.log("line" + num + ":" + str);
        console.log("line" + num + " Error: " + str + " is not exists");
        return false;
      }
    });
  }

  _checkChoiceOnlyWithDefault(str) {
    let re = /^(\{.*\})\s+([a-zA-Z0-9]*\.(wav|ogg))/;
    if (re.test(str)) {
      let result = re.exec(str);
      if (result[1] && result[2]) {
        let json = { choice: result[1], sound: result[2] };
        let json1 = { choice: result[1] };
        this.choicejsonlist.push(json1);
        this.choicelist.push(json);
        return {
          choice: result[1],
          sound: result[2]
        }
      }
    }
  }

  //不要出现中文的分隔符
  _checkChinesesymbolsisExists(str) {
    let re = /([——，“”‘’。：（）【】]+)/;
    if (re.test(str)) {
      console.log("line" + this.currLineNum + ":" + str);
      console.log("line" + this.currLineNum + " Error:" + "exists Chinese symbols!");
      return true;
    }
    return false;
  }

  _checkShare(str) {
    let re = /\$share/;
    if (re.test(str)) return true;
    return null;
  }

  argsCheck(str) {
    let obj = str;
    if (obj['sound']) {
      this.sound = obj['sound'];
      this._checkNameisRationality(this.sound, '', this.currLineNum);
      this._checkNameisExists(this.sound, this.currLineNum);
    } else if (obj['sound'] == undefined)
      this.sound = '';
    if (obj['flag']) {
      this.flag = obj['flag'];
      this._checkNameisRationality(this.flag, '', this.currLineNum);
      this._checkNameisExists(this.flag, this.currLineNum);
    } else if (obj['flag'] == undefined)
      this.flag = '';
    if (obj['default']) {
      this.default = obj['default'];
      this._checkNameisRationality(this.default, '', this.currLineNum);
      this._checkNameisExists(this.default, this.currLineNum);
    } else if (obj['default'] == undefined)
      this.default = '';
    if (obj['choice']) {
      this.choice = obj['choice'];
      try {
        JSON.parse(this.choice.replace(/'/g, '"'));
      } catch (err) {
        if (err) {
          return;
        }
      }
      let choices = JSON.parse(this.choice.replace(/'/g, '"'));
      for (let key in choices) {
        this._checkNameisRationality(key, '', this.currLineNum);
        this._checkNameisExists(key, this.currLineNum);
      }
    } else if (obj['choice'] == undefined)
      this.choice = '';
    if (obj && !obj['choice'] && !obj['default'] && !obj['flag'] && !obj['sound'])
      this._checkNameisRationality(obj, '', this.currLineNum);
    if (this.choice) {
      try {
        let obj = JSON.stringify(this.choice.replace(/'/g, '"'));
        JSON.parse(this.choice.replace(/'/g, '"'));
      } catch (err) {
        if (err) {
          console.log("line" + this.currLineNum + ":" + this.choice);
          console.log("line" + this.currLineNum + " Error:" + "不符合json格式");
          return false;
        } else {
          return true;
        }
      }
    }
  }

  _check(str) {
    if (this._checkJSON(str)) { //如果语句中含有json
      if (check.choice.test(str)) { // c2.wav {'c5.wav': ['左'], 'c6.wav': ['右']} 01.wav
        let checkchoice = check.choice.init(str);
        if (checkchoice) {
          this.argsCheck(checkchoice, this.currLineNum);
        }
        console.log("_checkChoice: " + JSON.stringify(check.choice.test(str)));
      } else if (check.choicenoflag.test(str)) { //{'c5.wav': ['左'], 'c6.wav': ['右']} 01.wav
        let choicenoflag = check.choicenoflag.init(str);
        if (choicenoflag) {
          this.argsCheck(choicenoflag);
        }
        console.log("_choicenoflag: " + JSON.stringify(check.choicenoflag.test(str)));
      }
    } else { //如果语句中不含有json
      if (check.single.test(str)) {
        let single = check.single.init(str);
        if (single) {
          this.argsCheck(single);
        }
        console.log("_checkIfSingle: " + JSON.stringify(check.single.test(str)));
      } else if (check.ifsingle.test(str)) {
        let ifsingle = check.ifsingle.init(str);
        if (ifsingle) {
          this.argsCheck(ifsingle);
        }
        console.log("_checkSingle: " + JSON.stringify(check.ifsingle.test(str)));
      } else if (this._checkShare(str)) {
        console.log("_checkShare: share 模式。");
      } else {
        this.argsCheck(str);
      }
    }
  }

  init() {
    while (this.currLineNum < this.totalLines) this.getNext();
  }
}

new Checking().init();
