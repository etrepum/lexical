/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createHorizontalRuleNode,
  buildEditorFromExtensions,
  HorizontalRuleExtension,
} from '@lexical/extension';
import {
  $getRoot,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  type NodeKey,
  SKIP_SCROLL_INTO_VIEW_TAG,
} from 'lexical';
import {expect, test} from 'vitest';

test('selecting a horizontal rule does not scroll the previous DOM selection into view', () => {
  using editor = buildEditorFromExtensions(HorizontalRuleExtension);
  const rootElement = document.createElement('div');
  document.body.appendChild(rootElement);
  editor.setRootElement(rootElement);

  let key: NodeKey = '';
  editor.update(
    () => {
      const horizontalRule = $createHorizontalRuleNode();
      key = horizontalRule.getKey();
      $getRoot().append(horizontalRule);
    },
    {discrete: true},
  );

  let updateTags: ReadonlySet<string> | null = null;
  const unregister = editor.registerUpdateListener(({tags}) => {
    updateTags = tags;
  });
  const event = new MouseEvent('click');
  Object.defineProperty(event, 'target', {
    value: editor.getElementByKey(key),
  });

  expect(editor.dispatchCommand(CLICK_COMMAND, event)).toBe(true);
  const isSelected = editor.read(() => {
    const selection = $getSelection();
    return $isNodeSelection(selection) && selection.has(key);
  });
  unregister();

  expect(updateTags).toContain(SKIP_SCROLL_INTO_VIEW_TAG);
  expect(isSelected).toBe(true);
  rootElement.remove();
});
