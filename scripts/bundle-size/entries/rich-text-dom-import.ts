/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// The scenario the README analyses: a rich text editor whose HTML pastes and
// drops are routed through the DOMImportExtension rule pipeline.
import {ClipboardDOMImportExtension} from '@lexical/clipboard';
import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';

export function make(root: HTMLElement) {
  const editor = buildEditorFromExtensions({
    $initialEditorState: null,
    dependencies: [RichTextExtension, ClipboardDOMImportExtension],
    name: '[root]',
  });
  editor.setRootElement(root);
  return editor;
}
