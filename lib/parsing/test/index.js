'use strict';
const repl = require('repl');
const path = require('path');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');

const Lib = require('./lib');

class Test extends Lib {
  constructor() {
    super();
    this.repl = repl.start('');
    this.run();
  }

  run() {
    this.repl.on('exit', () => {
      console.log('Good Bye!');
      process.exit(0);
    });

    this.repl.defineCommand('complete', {
      help: 'sound_manager complete',
      action: this.complete.bind(this)
    });

    this.repl.defineCommand('command', {
      help: 'Interaction Command',
      action: this.command.bind(this)
    });

    this.repl.defineCommand('terminate', {
      help: 'sound_manager terminate',
      action: this.terminate.bind(this)
    });

    this.repl.defineCommand('reply', {
      help: 'STT reply',
      action: this.reply.bind(this)
    });

    this.repl.defineCommand('pause', {
      help: 'Interaction pause',
      action: this.pause.bind(this)
    });

    this.repl.defineCommand('mode', {
      help: 'Interaction mode test',
      action: this.mode.bind(this)
    });

    this.repl.defineCommand('start', {
      help: 'Interaction start',
      action: this.start.bind(this)
    });

    this.repl.defineCommand('resume', {
      help: 'Interaction resume',
      action: this.resume.bind(this)
    });

    this.repl.defineCommand('btn', {
      help: 'Press button',
      action: this.btn.bind(this)
    });
  }
}

let test = new Test();
