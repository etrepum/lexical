/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// @vitest-environment node

import {buildEditorFromExtensions} from '@lexical/extension';
import {ListExtension} from '@lexical/list';
import {$getRoot, defineExtension} from 'lexical';
import {expect, test} from 'vitest';

test('JSON list items preserve boundaries between child paragraphs', () => {
  using editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [ListExtension],
      name: 'list-paragraph-json',
    }),
  );
  const state = editor.parseEditorState(
    JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                children: ['first', 'second'].map(text => ({
                  children: [{text, type: 'text', version: 1}],
                  type: 'paragraph',
                  version: 1,
                })),
                type: 'listitem',
                value: 1,
                version: 1,
              },
            ],
            listType: 'bullet',
            start: 1,
            tag: 'ul',
            type: 'list',
            version: 1,
          },
        ],
        type: 'root',
        version: 1,
      },
    }),
  );
  expect(state.read(() => $getRoot().getTextContent())).toBe('first\nsecond');
});
