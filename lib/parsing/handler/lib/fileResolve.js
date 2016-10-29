'use strict';

const path = require('path');
const _ = require('lodash');

// Get a sound path, mixin a absolutely path or relative path.

// Got: ({filepath:'dir',sound:'example.ogg'},'example.ogg')
// Return: 'dir/example.ogg'

// Got: ({filepath:'dir'},'example.ogg')
// Return: 'dir/example.ogg'

// Got: ({filepath:'dir',sound:'example.ogg'})
// Return: 'dir/example.ogg'

// Got: ({filepath:'dir',sound:'/dir/example.ogg'})
// Return: '/dir/example.ogg'

// Got: ({filepath:'dir',sound:'example.ogg'},'/dir/example.ogg')
// Return: '/dir/example.ogg'

// Got: ('dir','example.ogg')
// Return: 'dir/example.ogg'

module.exports = (result, soundFile) => {
  let file = soundFile ? soundFile : result.sound;
  if (file) {
    if (path.isAbsolute(file)) {
      return file;
    } else {
      if (_.isString(result)) {
        return path.join(result, file);
      } else {
        return path.join(result.filepath, file);
      }
    }
  } else {
    return null;
  }
};
