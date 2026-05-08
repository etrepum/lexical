/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor, ParagraphNode} from '../../';

import {bench, describe} from 'vitest';

import {$createTextNode, $getRoot} from '../../';
import {createTestEditor} from '../../__tests__/utils';
import {__benchOnly} from '../../LexicalReconciler';
import {attachToDOM, buildLargeDoc} from './_utils';

const SIZES = [1000, 5000] as const;

for (const size of SIZES) {
  describe(`size=${size} :: typing 1 char per cycle`, () => {
    let editor: LexicalEditor;
    let cycle = 0;

    const typeOneChar = (): void => {
      editor.update(
        () => {
          const last = $getRoot().getLastChild();
          if (last) {
            (last as ParagraphNode).append($createTextNode(`x${cycle++}`));
          }
        },
        {discrete: true},
      );
    };

    bench(
      'with children fast path',
      () => {
        __benchOnly.skipChildrenFastPath = false;
        typeOneChar();
      },
      {
        setup: () => {
          editor = createTestEditor();
          attachToDOM(editor);
          buildLargeDoc(editor, size);
          cycle = 0;
        },
      },
    );

    bench(
      'without children fast path (general path)',
      () => {
        __benchOnly.skipChildrenFastPath = true;
        typeOneChar();
      },
      {
        setup: () => {
          editor = createTestEditor();
          attachToDOM(editor);
          buildLargeDoc(editor, size);
          cycle = 0;
        },
      },
    );
  });

  describe(`size=${size} :: read-only update (no mutation)`, () => {
    let editor: LexicalEditor;

    bench(
      'editor.update with no mutation',
      () => {
        editor.update(() => {}, {discrete: true});
      },
      {
        setup: () => {
          editor = createTestEditor();
          attachToDOM(editor);
          buildLargeDoc(editor, size);
        },
      },
    );
  });

  describe(`size=${size} :: editor.read (pure read)`, () => {
    let editor: LexicalEditor;

    bench(
      'editor.read',
      () => {
        editor.read(() => {
          $getRoot().getChildrenSize();
        });
      },
      {
        setup: () => {
          editor = createTestEditor();
          attachToDOM(editor);
          buildLargeDoc(editor, size);
        },
      },
    );
  });
}
