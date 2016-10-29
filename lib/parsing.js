'use babel';

import path from 'path';
import { CompositeDisposable, tooltips } from 'atom';

import _ from 'lodash';
import { PlainMessageView, MessagePanelView, LineMessageView } from 'atom-message-panel';

export default {
  subscriptions: null,
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
    let panel = new MessagePanelView({ title: 'Status for \'' + title + '\'' });
    panel.attach();
    return panel;
  },

  toggle() {
    this.main();
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      editor.onDidSave(() => {
        console.log('ok saved');
      })
    }
  },
  main() {
    let editor = atom.workspace.getActiveTextEditor();
    let title = editor.getTitle();
    if (editor && title === 'manifest.rc') {
      let panel = null;
      if (this.panelModel) {
        panel = this.panelModel;
      } else {
        this.panelModel = this.panel(editor.getPath());
        panel = this.panelModel;
      }
      panel.clear();
      atom.notifications.addInfo('message');
      _.forEach(editor.getText().split(/\r?\n/), (message, line) => {
        panel.add(new LineMessageView({
          line,
          message,
          className: 'text-success'
        }));
      });
    }
  }
};
