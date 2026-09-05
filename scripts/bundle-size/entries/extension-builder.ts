/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// The extension framework itself, with no extensions on top of it.
import {buildEditorFromExtensions} from '@lexical/extension';

export function make(root: HTMLElement) {
  const editor = buildEditorFromExtensions({
    $initialEditorState: null,
    name: '[root]',
  });
  editor.setRootElement(root);
  return editor;
}
