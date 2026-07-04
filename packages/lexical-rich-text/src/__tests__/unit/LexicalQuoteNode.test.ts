/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createQuoteNode, QuoteNode} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  ParagraphNode,
} from 'lexical';
import {initializeUnitTest} from 'lexical/src/__tests__/utils';
import {describe, expect, test} from 'vitest';

const editorConfig = Object.freeze({
  namespace: '',
  theme: {
    quote: 'my-quote-class',
  },
});

describe('LexicalQuoteNode tests', () => {
  initializeUnitTest(testEnv => {
    test('QuoteNode.constructor', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        expect(quoteNode.getType()).toBe('quote');
        expect(quoteNode.getTextContent()).toBe('');
      });
      expect(() => $createQuoteNode()).toThrow();
    });

    test('QuoteNode.createDOM()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        expect(quoteNode.createDOM(editorConfig).outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
        expect(
          quoteNode.createDOM({
            namespace: '',
            theme: {},
          }).outerHTML,
        ).toBe('<blockquote></blockquote>');
      });
    });

    test('QuoteNode.updateDOM()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        const domElement = quoteNode.createDOM(editorConfig);
        expect(domElement.outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
        const newQuoteNode = $createQuoteNode();
        const result = newQuoteNode.updateDOM(quoteNode, domElement);
        expect(result).toBe(false);
        expect(domElement.outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
      });
    });

    test('QuoteNode.insertNewAfter()', async () => {
      const {editor} = testEnv;
      let quoteNode: QuoteNode;
      await editor.update(() => {
        const root = $getRoot();
        quoteNode = $createQuoteNode();
        root.append(quoteNode);
      });
      expect(testEnv.outerHTML).toBe(
        '<div contenteditable="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><blockquote dir="auto"><br data-lexical-managed-linebreak="true"></blockquote></div>',
      );
      await editor.update(() => {
        const result = quoteNode.insertNewAfter($createRangeSelection());
        expect(result).toBeInstanceOf(ParagraphNode);
        expect(result.getDirection()).toEqual(quoteNode.getDirection());
      });
      expect(testEnv.outerHTML).toBe(
        '<div contenteditable="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><blockquote dir="auto"><br data-lexical-managed-linebreak="true"></blockquote><p dir="auto"><br data-lexical-managed-linebreak="true"></p></div>',
      );
    });

    test('$createQuoteNode()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        const createdQuoteNode = $createQuoteNode();
        expect(quoteNode.__type).toEqual(createdQuoteNode.__type);
        expect(quoteNode.__parent).toEqual(createdQuoteNode.__parent);
        expect(quoteNode.__key).not.toEqual(createdQuoteNode.__key);
      });
    });

    test('QuoteNode.isShadowRoot() defaults to false and serializes nothing', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        expect(quoteNode.isShadowRoot()).toBe(false);
        expect('shadowRoot' in quoteNode.exportJSON()).toBe(false);
      });
    });

    test('QuoteNode shadow root opt-in with $createQuoteNode and setIsShadowRoot', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode({shadowRoot: true});
        expect(quoteNode.isShadowRoot()).toBe(true);
        expect(quoteNode.exportJSON().shadowRoot).toBe(true);
        quoteNode.setIsShadowRoot(false);
        expect(quoteNode.isShadowRoot()).toBe(false);
        expect('shadowRoot' in quoteNode.exportJSON()).toBe(false);
        quoteNode.setIsShadowRoot(true);
        expect(quoteNode.isShadowRoot()).toBe(true);
      });
    });

    test('QuoteNode shadow root round-trips through JSON', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode({shadowRoot: true});
        const imported = QuoteNode.importJSON(quoteNode.exportJSON());
        expect(imported.isShadowRoot()).toBe(true);
        const importedDefault = QuoteNode.importJSON(
          $createQuoteNode().exportJSON(),
        );
        expect(importedDefault.isShadowRoot()).toBe(false);
      });
    });

    test('QuoteNode.collapseAtStart() lifts blocks out of a shadow root quote', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const root = $getRoot();
        const quoteNode = $createQuoteNode({shadowRoot: true});
        quoteNode.append(
          $createParagraphNode().append($createTextNode('a')),
          $createParagraphNode().append($createTextNode('b')),
        );
        root.append(quoteNode);
        quoteNode.collapseAtStart();
        const children = root.getChildren();
        expect(children.length).toBe(2);
        expect(children.every($isParagraphNode)).toBe(true);
        expect(children.map(node => node.getTextContent())).toEqual(['a', 'b']);
      });
    });

    test('getTopLevelElement() stops at a shadow root quote', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const root = $getRoot();
        const quoteNode = $createQuoteNode({shadowRoot: true});
        const paragraph = $createParagraphNode().append($createTextNode('a'));
        quoteNode.append(paragraph);
        root.append(quoteNode);
        expect(paragraph.getTopLevelElementOrThrow().is(paragraph)).toBe(true);
        quoteNode.setIsShadowRoot(false);
        expect(paragraph.getTopLevelElementOrThrow().is(quoteNode)).toBe(true);
      });
    });
  });
});
