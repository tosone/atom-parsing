'use strict';

module.exports = {
  "cBreath": {
    "modelCode": "0x00001000",
    keys: ["colors", "dTime", "gSpeed"]
  },
  "cBreathRan": {
    "modelCode": "0x00000800",
    keys: ["dTime", "gSpeed"]
  },
  "cLightUp": {
    "modelCode": "0x00000200",
    keys: ["colors", "gSpeed"]
  },
  "cLightDown": {
    "modelCode": "0x00000100",
    keys: ["colors", "gSpeed"]
  },
  "cFlicker": {
    "modelCode": "0x00000020",
    keys: ["colors", "dTime", "bDelay", "bMode", "bStep"]
  },
  "cFlickerRan": {
    "modelCode": "0x00000010",
    keys: ["dTime", "bDelay"]
  },
  "cLightOn": {
    "modelCode": "0x00000004",
    keys: ["colors"]
  },
  "sBreathRan": {
    "modelCode": "0x00000400",
    keys: ["dTime", "gSpeed"]
  },
  "sLightUp": {
    "modelCode": "0x00000080",
    keys: ["gSpeed"]
  },
  "sLightDown": {
    "modelCode": "0x00000040",
    keys: ["gSpeed"]
  },
  "sFlicker": {
    "modelCode": "0x00000008",
    keys: ["dTime", "bDelay", "bMode", "bStep"]
  },
  "sLightOn": {
    "modelCode": "0x00000002",
    keys: []
  },
  "off": {
    "modelCode": "0x00000001",
    keys: []
  },
};
