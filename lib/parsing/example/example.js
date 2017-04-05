// 按键规则
// 任意键: any
// 没有按键: no
// 鼻子按键：'C'
// 右手按键：'D'
// 左手按键：'E'

// 在故事中分为页和段的概念。
// 一个页的实现是一个空行来分割。
// 段的概念是通过一个命令的符号来分割。
// 一个段可以包含多个页。
//
// 在目前的实现中长按按键是可以实现跳页的功能。
// 上一页：会跳到上一个空行的上一页的开始的地方。（不关注故事的类型）
// 下一页：会跳到下一个空行的下一行的地方开始播放。（不关注故事的类型）
// 如果一个故事不想实现跳页的功能可以中间不加任何的空行。
//
// 在目前的实现中有跳段的功能，之前是通过语音的指令来实现跳段的概念，但是按住U键会打断当前的应用，所以暂时不可以用，之后讨论再用。
// 上一段：会跳到上一个命令符的上一段的开始的地方。（不关注故事的类型）
// 下一段：会跳到下一个命令符的下一行的地方开始播放。（不关注故事的类型）
// 关于段的命令符出现只出现在绘本故事中。

// 单句模式：
// 1.wav

// 条件模式：
// 说明：大多数时候条件模式的flag是某个语句中的var设置出来的虚拟flag。
// 大多数时候是单个条件，即：只判断一个东西没有没有播放然后是否继续之后的流程。书写方式如下：
// flag.ogg a.ogg
// flag.ogg {choiceComplex}
// 多个条件的时候书写方式如下：
// ["a.ogg","b.ogg"] c.ogg
// ["a.ogg","b.ogg"] {choiceComplex}
// 当有多个条件需要判断的时候，前置的flag是一个数组，当数组内的所有flag满足的时候，执行后续的模式。
// 复杂的flag
var complexFlag = {
  "mode": "and", // mode: and or
  "unvar": true, // 是否为反flag
  "complexFlagList": [] // flag 列表或者一个字符串
}

// 如下例子：
// 1.ogg
// 2.ogg
// ### 1.ogg 和 2.ogg 必须都播放过才能播放 3.ogg
// {"mode":"and","complexFlagList":["1.ogg","2.ogg"]} 3.ogg
// ### 1.ogg 和 2.ogg 必须都没有播放过才能播放 3.ogg
// {"mode":"and","unvar":true,"complexFlagList":["1.ogg","2.ogg"]} 3.ogg
// ### 1.ogg 和 2.ogg 至少有一个播放过才能播放 3.ogg
// {"mode":"or","complexFlagList":["1.ogg","2.ogg"]} 3.ogg
// ### 1.ogg 和 2.ogg 至少有一个没有播放过播放过才能播放 3.ogg
// {"mode":"or","unvar":true,"complexFlagList":["1.ogg","2.ogg"]} 3.ogg

// 选择模式：
// 1.wav {"2.wav":["是"],"3.wav":["不是"]} 4.wav

// 互动模式[1]
var interaction1 = [{ // 关于按键的复杂模式的互动模式（真拗口）
  "cmd": "button",
  "button": [{
    "num": 5, // 不必须，按键次数，默认一次
    "mode": "gt", // 不必须，用户按键次数和如上设置的数目的关系，默认等于，可选的参数有："gt"（大于）, "lt"（小于）, "gte"（大于等于）, "lte"（小于等于）, "eq"（等于）
    "button": "A",
    "output": {
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
interaction1 = {};

// 互动模式[2]
var interaction2 = [{
  "cmd": "button",
  "interactionBgm": "a.ogg", // 在等待用户按键的过程中或者刷卡的过程中出现的音频
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
    // 刷卡模式 and：nfc 匹配列表字段中所有卡都要刷
    // 刷卡模式 or：nfc 匹配列表字段中任意的一张卡刷了就会认为刷卡成功
    // 刷卡模式 no：没有刷卡，不需要有下边的 nfc 匹配列表字段，如果有会忽略
    // 刷卡模式 wrong：用户刷了卡，但是刷卡错误，所有模式都没有匹配到，不需要有下边的 nfc 匹配列表字段，如果有会忽略
    "nfc": ["字母卡e", "字母卡a"], // 所需要刷的卡的列表，如果只需要刷一个卡可以写成一个字符串
    // "nfc":"字母卡a"
    "maxNfc": 10, // NFC 刷卡过程中
    "output": {
      "LED": {
        "mode": "happy" //模式
      },
      "sound": {
        "sound": "sound",
        "effect": ["trim 2"] //效果
      }
    },
    "failedOutput": { // 当刷卡的模式是and的时候，将会有一个failed的参数，在用户没有完成刷卡任务的情况下触发
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
interaction2 = {};

//等待模式
// $wait 30 waitArgs
var waitArgs = [{
  "cmd": "button",
  "button": {
    "A": {
      "LED": {
        "start": "2'2", //开始时间
        "mode": "happy" //模式
      }
    }
  }
}];
waitArgs = {};

//复杂的选择模式
var choiceComplex = [{
  "before": "beforeTip.ogg", // 进入一个分支之前所播放的提示音频，如果是数组随机选取一个播放
  "offlineBefore": "offlineBefore.ogg", // 在无网的情况下在录音之前需要播放的提示音频
  "sound": "sound1", // 进入一个分支之后所需要播放的音频，可以是一个数组，当是数组的时候将会从其中随机选择一个播放
  "keyword": ["", ""], // 进入一个分支所需要匹配到的关键词列表
  "var": "flag-flag.ogg", // 当用户的行为导致选择了一个分支之后，这个分支需要播放的音频的别名，而播放的整个流程中这个选择的分支的音频将会不会出现。
  "preSound": "sound.wav", // 当用户的行为导致选择了一个分支之后，执行分支之前所需要播放的音频
  "once": true, // 录音将只会有一次，如果得到正确的结果之后进行正确的流程，如果录音的结果为空或者匹配不到任何的关键词将进入默认的流程。
  "saidNothing": "null.ogg", // 当用户什么都没有说，将会播放此音频，然后再次录音。此参数和once的参数将会有冲突，建议二选一。默认会播放"我没有听清你说的话，可以再说一遍么？"。
  "saidWrong": "wrong.ogg", // 用户说了一些东西，但是说的话匹配不到任何的关键词，将会播放此音频，然后再次录音。此参数和once的参数将会有冲突，建议二选一。默认会播放"你说的不对哦，再说一次吧。"。
  "offlineSaidNothing": "", // 无网的情况下什么都没有说
  "offlineSaidWrong": "", // 无网的情况下说了错误的话
  "maxRecording": 5, // 可选 最长录音时间 单位毫秒
  "LED": { // 进入某个分支之后LED的亮灯的模式和参数
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
  "LED": {
    "mode": "light", //模式
    "light": "ab",
    "color": "yellow"
  }
}];
choiceComplex = {};

//复杂的单句模式
var singleComplex = {
  "sound": "1.wav", //播放的声音片段
  // "sound": ["1.wav","2.wav","3.wav"] 随机从这三个音频中选取一个播放
  "random": "7", // 可选 该语句有七分之一的概率播放
  "backline": "2", // 可选 跳行的功能：值的内容必须是字符串
  // 0 为此句执行完成之后从本句开始又重新播放，需要配合 var 参数
  // 1 向下跳 1 行
  // -5 向上跳 5 行
  "loop": true, // 可选 是否循环
  "last": "5'0", // 可选 持续多久
  "input": [{
    "cmd": "button", //关于按键的互动输入
    "start": "", //开始时间，没有则认为开始音频的时候就开始互动活动
    "break": false, //互动活动是否打断正在播放的音频
    "button": [{
      "C": {
        "LED": {
          "mode": "happy"
        },
        "sound": {
          "sound": "1.ogg"
        },
        "break": true // 是否暂停当前声音的播放
      },
      "D": {
        "LED": {
          "mode": "happy"
        },
        "sound": {
          "sound": "1.ogg"
        },
        "break": true // 是否暂停当前声音的播放
      }
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
singleComplex = {};

// 关闭所有的背景音乐
// $bgm off

// 开始背景音乐,背景音乐会在之后的时间内不断的循环播放，直到得到停止的标识或者故事进行结束
// $bgm ["a.ogg","b.ogg"]

// 分享内容到朋友圈家庭圈
// $share {}
