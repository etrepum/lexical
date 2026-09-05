/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Floor: the core editor with no extension framework and no feature packages.
import {createEditor} from 'lexical';

export function make(root: HTMLElement) {
  const editor = createEditor({});
  editor.setRootElement(root);
  return editor;
}
