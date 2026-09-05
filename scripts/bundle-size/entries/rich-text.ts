/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// RichTextExtension on its own. It already depends on CoreImportExtension and
// DOMImportExtension, so the rule-based import pipeline is in the graph even
// though nothing routes HTML through it yet.
import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';

export function make(root: HTMLElement) {
  const editor = buildEditorFromExtensions({
    $initialEditorState: null,
    dependencies: [RichTextExtension],
    name: '[root]',
  });
  editor.setRootElement(root);
  return editor;
}
