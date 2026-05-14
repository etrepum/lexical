/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
'use client';

import {AutoFocusExtension} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalExtensionComposer} from '@lexical/react/LexicalExtensionComposer';
import {RichTextExtension} from '@lexical/rich-text';
import {defineExtension} from 'lexical';

import ExampleTheme from './ExampleTheme';
import {CodeShikiDemoExtension} from './extensions/CodeShikiDemoExtension';

const placeholder = 'Enter some rich text...';

const editorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    AutoFocusExtension,
    CodeShikiDemoExtension,
  ],
  name: '@lexical/nextjs-code-shiki-example/Editor',
  namespace: '@lexical/nextjs-code-shiki-example',
  theme: ExampleTheme,
});

export default function EditorClient() {
  return (
    <LexicalExtensionComposer
      extension={editorExtension}
      contentEditable={null}>
      <div className="editor-container">
        <div className="editor-inner">
          <ContentEditable
            className="editor-input"
            aria-placeholder={placeholder}
            placeholder={
              <div className="editor-placeholder">{placeholder}</div>
            }
          />
        </div>
      </div>
    </LexicalExtensionComposer>
  );
}
