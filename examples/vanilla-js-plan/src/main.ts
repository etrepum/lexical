/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './styles.css';

import {
  DragonPlan,
  HistoryPlan,
  LexicalBuilder,
  RichTextPlan,
} from '@lexical/builder';
import {LexicalEditor} from 'lexical';

import {$prepopulatedRichText} from './$prepopulatedRichText';
import {EmojiPlan} from './emoji-plan/EmojiPlan';

const editorRef = document.getElementById('lexical-editor');
const stateRef = document.getElementById(
  'lexical-state',
) as HTMLTextAreaElement;

const {editor} = LexicalBuilder.fromPlans({
  $initialEditorState: $prepopulatedRichText,
  config: {},
  dependencies: [DragonPlan, RichTextPlan, HistoryPlan, EmojiPlan],
  name: '@lexical/examples/vanilla-js-plan',
  namespace: 'Vanilla JS Plan Demo',
  onError: (error: Error) => {
    throw error;
  },
  register: (_editor: LexicalEditor) =>
    _editor.registerUpdateListener(({editorState}) => {
      stateRef!.value = JSON.stringify(editorState.toJSON(), undefined, 2);
    }),
}).buildEditor();
editor.setRootElement(editorRef);
