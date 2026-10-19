/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  CoreImportExtension,
  DOMImportExtension,
} from '@lexical/html';
import {
  $createParagraphNode,
  $createTextNode,
  $getDocument,
  $getRoot,
  defineExtension,
  ParagraphNode,
} from 'lexical';
import {describe, expect, test, vi} from 'vitest';

describe('HTML serialization boundaries', () => {
  test.each(['legacy', 'extension'])(
    '%s preserves spaces around unknown inline elements',
    pipeline => {
      using editor = buildEditorFromExtensions(
        defineExtension({
          dependencies: [CoreImportExtension],
          name: 'serialization-boundaries',
        }),
      );
      for (const [html, expected] of [
        ['<p>a <x-chip>b</x-chip> c</p>', 'a b c'],
        ['<p>a <tooltip><span>b</span></tooltip> c</p>', 'a b c'],
        ['<p>a <x-chip style="display: block">b</x-chip> c</p>', 'abc'],
        ['<p>a<br> b</p>', 'a\nb'],
      ]) {
        editor.update(
          () => {
            const dom = new DOMParser().parseFromString(html, 'text/html');
            const nodes =
              pipeline === 'legacy'
                ? $generateNodesFromDOM(editor, dom)
                : getExtensionDependencyFromEditor(
                    editor,
                    DOMImportExtension,
                  ).output.$generateNodesFromDOM(dom);
            $getRoot()
              .clear()
              .append(...nodes);
          },
          {discrete: true},
        );
        expect(editor.read(() => $getRoot().getTextContent())).toBe(expected);
      }
    },
  );

  test('does not replace an export element with itself', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        $initialEditorState: () =>
          $getRoot().append(
            $createParagraphNode().append($createTextNode('body')),
          ),
        html: {
          export: new Map([
            [
              ParagraphNode,
              () => ({
                after: element => element,
                element: $getDocument().createElement('p'),
              }),
            ],
          ]),
        },
        name: 'same-element-export',
      }),
    );
    const replaceWith = vi.spyOn(Element.prototype, 'replaceWith');
    try {
      const html = editor.read(() => $generateHtmlFromNodes(editor));
      expect(html).toContain('body');
      expect(
        replaceWith.mock.calls.every(
          (args, index) => args[0] !== replaceWith.mock.instances[index],
        ),
      ).toBe(true);
    } finally {
      replaceWith.mockRestore();
    }
  });
});
