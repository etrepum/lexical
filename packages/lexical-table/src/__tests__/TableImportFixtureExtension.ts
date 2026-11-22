/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {ClipboardDOMImportExtension} from '@lexical/clipboard';
import {
  $propagateTextAlignToBlockChildren,
  CoreImportExtension,
  defineImportRule,
  DOMImportExtension,
  sel,
} from '@lexical/html';
import {RichTextImportRules} from '@lexical/rich-text';
import {$isTableNode, TableImportRules} from '@lexical/table';
import {
  $isElementNode,
  $setDirectionFromDOM,
  configExtension,
  defineExtension,
} from 'lexical';
import {$createTestDecoratorNode} from 'lexical/src/__tests__/utils';

// These fixtures also verify legacy HTML formatting. Compose the public
// normalizers with the replacement rules without registering table editing
// behavior a second time alongside TablePlugin.
export const TableImportFixtureExtension = defineExtension({
  dependencies: [
    CoreImportExtension,
    ClipboardDOMImportExtension,
    configExtension(DOMImportExtension, {
      rules: [
        defineImportRule({
          $import: () => [$createTestDecoratorNode()],
          match: sel.tag('test-decorator'),
          name: '[table-fixture-decorator]',
        }),
        defineImportRule({
          $import: (_ctx, el, $next) => {
            const nodes = $next();
            for (const node of nodes) {
              if ($isElementNode(node)) {
                $setDirectionFromDOM(node, el);
              }
              if ($isTableNode(node)) {
                $propagateTextAlignToBlockChildren(node.getChildren(), el);
              }
            }
            return nodes;
          },
          match: sel.tag('table', 'tr', 'td', 'th'),
          name: '[table-fixture-formatting]',
        }),
        ...TableImportRules,
        ...RichTextImportRules,
      ],
    }),
  ],
  name: '[table-import-fixture]',
});
