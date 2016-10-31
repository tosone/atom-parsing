'use babel';

import path from 'path';
import { CompositeDisposable, tooltips } from 'atom';

import _ from 'lodash';
import { PlainMessageView, MessagePanelView, LineMessageView } from 'atom-message-panel';



export default {
  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'Parsing': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  panel(title) {
    let panel = new MessagePanelView({ title: 'Status for \'' + title + '\'', maxHeight: '500px' });
    panel.attach();
    return panel;
  },

  toggle() {
    let evt = require('./parsing/config').event;
    let mqtt = require('../config').mqtt;
    let editor = atom.workspace.getActiveTextEditor();
    let title = editor.getTitle();
    // evt.removeAllListeners();
    if (editor && title && title === 'manifest.rc') {
      let panel = null;
      if (this.panelModel) {
        panel = this.panelModel;
      } else {
        this.panelModel = this.panel(editor.getPath());
        panel = this.panelModel;
      }
      panel.clear();
      // atom.notifications.addInfo('message');
      let pushMsg = (str) => {
        panel.add(new PlainMessageView({
          message: str,
          raw: true
        }));
      }
      evt.on('line', data => {
        pushMsg('<span style="color:red">' + data.line + data.mode + '</span>')
      });
      evt.on('keyword', data => {
        pushMsg('<span style="color:red">' + data.keyword + '</span>')
      });
      evt.on('btn', data => {
        pushMsg('<span style="color:red">' + data.btn + '</span>')
      });
      require('./parsing/test/auto')(evt);
      mqtt.publish('interaction/start', JSON.stringify({ dir: path.dirname(editor.getPath()) }));
    }
  }
};
