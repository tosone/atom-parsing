// 按键规则
// 以大写A开始编号 依照剧本中出现的编号
// 任意键: any
// 没有按键: no

// 单句模式：
// 1.wav

// 单句条件模式：
// 1.wav 2.wav

// 条件模式（尚未实现）
// a.ogg 是一种非条件模式，如果有被设置，则跳过，没有被设置，则继续执行
// $unvar a.ogg [{}]

// 选择模式：
// 1.wav {"2.wav":["是"],"3.wav":["不是"]} 4.wav

// 复杂的单句模式
var complexSingleMode1 = {
    "sound": "1.wav", //播放的声音片段
    "random": "10",
    "last": "5'0", //持续多久
    "loop": [{ //是否循环
      "cmd": "button",
      "button": [{
        "button": "C",
        "description": {},
        "action": [{
          "LED": [{
            "start": "2'2", //开始时间
            "mode": "happy" //模式
        }],
          "sound": [{
            "sound": "2.wav", //声音文件，可以加路径
            "effect": ["trim 2"], //效果
            "start": "" //开始时间
        }]
      }]
    }]
  }],
    "input": [{
        "cmd": "button", // 必须 互动类型 关于按键的互动输入
        "start": "2'2", // 可选 开始时间，没有则认为开始音频的时候就开始互动活动
        "break": false, // 可选 互动活动是否打断正在播放的音频
        "mode": "single", // 可选 按键模式 hold（长按） double 双击
        "button": [{
            "A": {
              "LED": {
                "start": "2'2", //开始时间
                "mode": "happy" //模式
              },
              "sound": {
                "sound": "2.wav", // 必须 声音文件，可以加路径
                "effect": ["trim 2"], // 可选 给声音添加音效
                "start": "" // 必须 开始时间
              }
            }]
        }]
    }],
  "output": {
    "sound": [{
      "sound": "2.wav", // 必须 声音文件，可以加路径
      "effect": ["trim 2"], // 可选 给声音添加音效
      "start": "" //开始时间
    }],
    "LED": [{
      "start": "2'2", //开始时间
      "mode": "happy" //模式
    }]
  }
};

// 互动模式[1]
var interaction = [{
  "cmd": "button",
  "button": [{
    num: 5,
    mode: "gt", // "gt", "lt", "gte", "lte", "eq"
    button: "A",
    output: {
      "LED": {
        "start": "2'2", //开始时间
        "mode": "happy" //模式
      },
      "sound": {
        "sound": "sound",
        "effect": ["trim 2"] //效果
      }
    }
  }]
}, {
  "cmd": "nfc",
  "nfc": [{}]
}];

// 互动模式[2]
var interaction = [{
  "cmd": "button",
  "button": {
    "A": {
      "LED": {
        "start": "2'2", //开始时间
        "mode": "happy" //模式
      },
      "sound": {
        "sound": "sound",
        "effect": ["trim 2"] //效果
      }
    }
  }
}, {
  "cmd": "nfc",
  "nfc": [{
    "mode": "and", // 模式规定下边的 keywords 指定卡的，刷卡模式
    // 刷卡模式 and：以下的所有卡都要刷
    // 刷卡模式 sort：刷卡必须按照以下的顺序刷卡
    // 刷卡模式 or：下边的任意的一张卡刷了就会认为刷卡成功
    // 刷卡模式 no：没有刷卡
    // 刷卡模式 failure：用户刷了卡，但是设置的模式都没有完成
    "keywords": ["字母卡e", "字母卡a"], // 所需要刷的卡的列表，如果只需要刷一个卡可以写成一个字符串
    // "keywords":"字幕卡a"
    "output": {
      "LED": {
        "mode": "happy" //模式
      },
      "sound": {
        "sound": "sound",
        "effect": ["trim 2"] //效果
      }
    }
  }, {
    "mode": "",
    "keywords": "",
    "output": {
      "LED": {
        "mode": "happy" //模式
      },
      "sound": {
        "sound": "sound",
        "effect": ["trim 2"] //效果
      }
    }
  }]
}];

//等待模式
// $wait 30 waitArgs
var waitArgs = [{
  "cmd": "button",
  "button": [{
    "A": [{
      "LED": [{
        "start": "2'2", //开始时间
        "mode": "happy" //模式
      }]
    }]
  }]
}];

//复杂的选择模式
var choiceComplex = [{
  "sound": "sound1",
  "keyword": ["", ""],
  "exceptKeyword": ["", ""], // 优先级是非常高的，会优先处理
  "var": "flag-flag.ogg",
  "preSound": "sound.wav",
  "maxRecording": 5, // 可选 最长录音时间
  "LED": {
    "mode": "light", //模式
    "light": "ab",
    "color": "yellow"
  }
}, {
  "sound": 'sound2',
  "keyword": ["", ""],
  "LED": {
    "mode": "light", //模式
    "light": "ab",
    "color": "yellow"
  }
}, {
  "sound": "moren.ogg",
  "default": true,
  "keyword": ["", ""],
  "wait": 10000, // 在默认分支有一个超时的时间，单位毫秒
  "LED": {
    "mode": "light", //模式
    "light": "ab",
    "color": "yellow"
  }
}];

//复杂的单句模式
var complexSingleMode2 = {
  "sound": "1.wav", //播放的声音片段
  // "sound": ["1.wav","2.wav","3.wav"] 随机从这三个音频中选取一个播放
  "random": "7", // 可选 该语句有七分之一的概率播放
  "backline": "2",
  // 可选 跳行的功能：值的内容必须是字符串
  // 0 为此句执行完成之后从本句开始又重新播放，需要配合 var 参数 和 $unvar 指令使用
  // 1 向下跳 1 行
  // -5 向上跳 5 行
  "loop": true, // 可选 是否循环 尚未实现
  "last": "5'0", // 可选 持续多久 尚未实现
  "input": [{
    "cmd": "button", //关于按键的互动输入
    "start": "", //开始时间，没有则认为开始音频的时候就开始互动活动
    "break": false, //互动活动是否打断正在播放的音频
    "button": [{
      "C": [{
        "sound": [{
          "sound": "Hudong1.ogg",
        }],
        "output": [{
          "LED": [{
            "start": "", //开始时间
            "mode": "mounting", //模式
            "light": "ab",
            "color": "red"
          }],
          "sound": [{
            "sound": "breathing.ogg",
            "start": "", //开始时间
            "break": "true"
          }]
        }]
      }]
    }]
  }],
  "output": [{
    "sound": [{
      "sound": "2.wav", //声音文件，可以加路径
      "effect": ["trim 2"], //效果
      "start": "" //开始时间
    }],
    "LED": [{
      "start": "2'2", //开始时间
      "mode": "happy" //模式
    }]
  }]
};

// 关闭所有的背景音乐
// $bgm off

// 开始背景音乐,背景音乐会在之后的时间内不断的循环播放，直到得到停止的标识或者故事进行结束
// $bgm ["a.ogg","b.ogg"]

// 分享内容到朋友圈家庭圈
// $share {}
