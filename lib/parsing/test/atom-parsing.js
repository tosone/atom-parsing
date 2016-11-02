'use babel';

import path from 'path';
import { CompositeDisposable, tooltips } from 'atom';

import _ from 'lodash';
import { PlainMessageView, MessagePanelView, LineMessageView } from 'atom-message-panel';

let config = require('../config');
let evt = config.autoemitter;
let mqtt = config.mqtt;

require('./auto');

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
    let panel = new MessagePanelView({ rawTitle: true, title: '<span style="color:#a6e22e;font-size:16px;">Interaction Autotest generate Status for \'' + title + '\'</span>', maxHeight: '500px', autoScroll: true });
    panel.attach();
    return panel;
  },

  toggle() {
    let editor = atom.workspace.getActiveTextEditor();
    let title = editor.getTitle();
    evt.removeAllListeners();
    mqtt.publish('interaction/pause');
    if (editor && title && title === 'manifest.rc') {
      let pushMsg = (str) => {
        panel.add(new PlainMessageView({
          message: str,
          raw: true
        }));
      }
      evt.on('line', data => {
        pushMsg('<span style="color:white;font-size:16px;">Line </span><span style="color:red;font-size:16px;">' + data.line + '</span><span style="color:white;font-size:16px;"> mode is </span><span style="color:red;font-size:16px;">' + data.mode + '</span>');
      });
      evt.on('keyword', data => {
        pushMsg('<span style="color:white;font-size:12px;">All keywords are: </span><span style="color:#66d9ef;font-size:12px;">' + JSON.stringify(data.keywords) + '</span><span style="color:white;font-size:12px;"> selected keyword is </span><span style="color:red;font-size:12px;">' + data.keyword + '</span>');
      });
      evt.on('btn', data => {
        pushMsg('<span style="color:white;font-size:12px;">All btns are: </span><span style="color:#fd971f;font-size:12px;">' + JSON.stringify(data.btns) + '</span><span style="color:white;font-size:12px;"> selected keyword is </span><span style="color:red;font-size:12px;">' + data.btn + '</span>');
      });
      evt.on('play', data => {
        pushMsg('<span style="color:white;font-size:12px;">SoundManager play a sound: </span><span style="color:#248857;font-size:12px;">' + JSON.stringify(data.file) + '</span>');
      });
      evt.on('end', () => {
        pushMsg('<span style="color:red;font-size:16px;">Interaction story is over.</span>');
        evt.removeAllListeners();
      });

      atom.notifications.addInfo('Process: ' + title);
      let panel = null;
      if (this.panelModel) {
        panel = this.panelModel;
      } else {
        this.panelModel = this.panel(editor.getPath());
        panel = this.panelModel;
      }
      if (!panel.panel.visible) panel.attach();
      panel.clear();

      mqtt.publish('interaction/start', JSON.stringify({ dir: path.dirname(editor.getPath()) }));
    }
  }
};
