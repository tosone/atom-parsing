// 按键规则
// 以大写A开始编号 依照剧本中出现的编号
// 任意键: any
// 没有按键: no

// 单句模式：
// 1.wav

// 单句条件模式：
// 1.wav 2.wav

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
      'button': "C",
      'description': {},
      'action': [{
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
    "cmd": "button", //关于按键的互动输入
    "start": "2'2", //开始时间，没有则认为开始音频的时候就开始互动活动
    "break": false, //互动活动是否打断正在播放的音频
    "button": [{
      "A": [{
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
  "output": {
    "sound": [{
      "sound": "2.wav", //声音文件，可以加路径
      "effect": ["trim 2"], //效果
      "start": "" //开始时间
    }],
    "LED": [{
      "start": "2'2", //开始时间
      "mode": "happy" //模式
    }]
  }
}

// 互动模式
var interaction = [{
  "cmd": "button",
  "button": [{
    "A": [{
      "LED": {
        "start": "2'2", //开始时间
        "mode": "happy" //模式
      },
      'sound': {
        'sound': 'sound',
        "effect": ["trim 2"] //效果
      }
    }]
  }]
}]

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
}]
  //复杂的选择模式
[{
    "sound": 'sound1',
    keyword: [''],
    "var": "flag-flag.ogg"
    "output": [{
      "LED": [{
        "mode": "light" //模式
        "light": "ab"
        "color": "yellow"
    }]
  }]
  }, {
    sound: 'sound2',
    keyword: ['', '', '', ''],
    "output": [{
      "LED": [{
        "start": " ", //开始时间
        "mode": "light" //模式
        "light": "ab"
        "color": "yellow"
    }]
  }]
}, {
    sound: "moren.ogg",
    default: true,
    "output": [{
      "LED": [{
        "start": " ", //开始时间
        "mode": "light" //模式
        "light": "ab"
        "color": "yellow"
    }]
  }]
}]


//复杂的互动模式
[{
  "cmd": "button",
  "button": [{
    "button": 'C',
    "description": [{
      "last": { "gt": "5000" } //gt代表大于5s
    }],
    "action": [{
      "sound": {
        "sound": '1.ogg'
      },
      "output": [{
        "LED": [{
          "start": " ", //开始时间
          "mode": "light", //模式
          "light": "b",
          "color": "red"
        }]
      }]
    }]
  }]
}]

//复杂的单句模式
var complexSingleMode2 = {
  "sound": "1.wav", //播放的声音片段
  "loop": true, //是否循环
  "last": "5'0", //持续多久
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
            "mode": "mounting" //模式
            "light": "ab"
            "color": "red"
          }],
          "sound": [{
            "sound": "breathing.ogg",
            "start": "" //开始时间
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
}

// 关闭所有的背景音乐
// $bgm off

// 开始背景音乐,背景音乐会在之后的时间内不断的循环播放，直到得到停止的标识或者故事进行结束
// $bgm ["a.ogg","b.ogg"]
//

// 分享内容到朋友圈家庭圈
// $share {}


// $bgm ["a.ogg", "b.ogg"]
