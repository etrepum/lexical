/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {buildEditorFromExtensions} from '@lexical/extension';
import {$createLinkNode, LinkExtension} from '@lexical/link';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  type ElementNode,
  type LexicalEditor,
  type NodeKey,
  type TextNode,
} from 'lexical';
import {describe, expect, onTestFinished, test} from 'vitest';

// Moving a node into an earlier sibling element (which is reconciled first
// and reuses the moved node's DOM) while inserting a node where it used to
// be must not use the moved DOM as an insertion anchor in the later element.
// https://github.com/facebook/lexical/issues/9273
function makeEditor(): {editor: LexicalEditor; errors: Error[]} {
  const errors: Error[] = [];
  const editor = buildEditorFromExtensions({
    dependencies: [RichTextExtension, LinkExtension],
    name: 'issue-9273',
    onError: e => {
      errors.push(e);
    },
  });
  editor.setRootElement(document.createElement('div'));
  onTestFinished(() => editor.dispose());
  return {editor, errors};
}

function $token(text: string): TextNode {
  return $createTextNode(text).setMode('token');
}

function paragraphTexts(editor: LexicalEditor): string[] {
  return Array.from(editor.getRootElement()!.children, p =>
    Array.from(p.childNodes, n =>
      n.nodeName === 'BR' ? '' : n.textContent,
    ).join(''),
  );
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Issue #9273: move into an earlier sibling element', () => {
  test.each([
    {expected: ['axb', 'zy'], first: ['a', 'b']},
    {expected: ['ax', 'zy'], first: ['a']},
  ])('first paragraph $first', ({first, expected}) => {
    const {editor, errors} = makeEditor();
    let keys: Record<string, NodeKey> = {};
    editor.update(
      () => {
        const nodes = [...first, 'x', 'y'].map($token);
        keys = Object.fromEntries(
          nodes.map(n => [n.getTextContent(), n.getKey()]),
        );
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(...nodes.slice(0, first.length)),
            $createParagraphNode().append(...nodes.slice(first.length)),
          );
      },
      {discrete: true},
    );
    const initialDOM = editor.getElementByKey(keys.x);
    editor.update(
      () => {
        $getNodeByKey(keys.a)!.insertAfter($getNodeByKey(keys.x)!);
        $getNodeByKey(keys.y)!.insertBefore($token('z'));
      },
      {discrete: true},
    );
    expect(errors).toEqual([]);
    expect(
      editor.read(() =>
        $getRoot()
          .getChildren()
          .map(p => p.getTextContent()),
      ),
    ).toEqual(expected);
    expect(paragraphTexts(editor)).toEqual(expected);
    // The moved node's DOM was reused rather than recreated by error recovery
    expect(editor.getElementByKey(keys.x)).toBe(initialDOM);
  });

  // Random batches of cross-paragraph moves, inserts, removals and link
  // wrapping in single updates; the DOM must match the state without the
  // reconciler throwing and falling back to a full re-render.
  test('randomized cross-parent moves keep the DOM in sync', () => {
    for (let seed = 0; seed < 500; seed++) {
      const rng = mulberry32(seed);
      const pick = (n: number) => Math.floor(rng() * n);
      const {editor, errors} = makeEditor();
      let n = 0;
      const $nextToken = () => $token(`t${n++} `);
      editor.update(
        () => {
          const root = $getRoot().clear();
          for (let p = 2 + pick(3); p > 0; p--) {
            const paragraph = $createParagraphNode();
            for (let c = 1 + pick(6); c > 0; c--) {
              paragraph.append($nextToken());
            }
            root.append(paragraph);
          }
        },
        {discrete: true},
      );
      for (let step = 0; step < 4; step++) {
        editor.update(
          () => {
            for (let op = 1 + pick(3); op > 0; op--) {
              const paragraphs = $getRoot().getChildren<ElementNode>();
              const tokens = paragraphs.flatMap(p =>
                p
                  .getChildren()
                  .flatMap(c => ($isElementNode(c) ? c.getChildren() : [c])),
              );
              const token = tokens[pick(tokens.length)];
              switch (pick(5)) {
                case 0: {
                  const target = tokens[pick(tokens.length)];
                  if (token && target && token !== target) {
                    if (rng() < 0.5) {
                      target.insertAfter(token);
                    } else {
                      target.insertBefore(token);
                    }
                  }
                  break;
                }
                case 1:
                  if (token) {
                    if (rng() < 0.5) {
                      token.insertBefore($nextToken());
                    } else {
                      token.insertAfter($nextToken());
                    }
                  }
                  break;
                case 2:
                  if (tokens.length > 2) {
                    token.remove();
                  }
                  break;
                case 3:
                  paragraphs[pick(paragraphs.length)].append($nextToken());
                  break;
                default:
                  if (token && token.getParent()!.getType() === 'paragraph') {
                    const link = $createLinkNode('https://lexical.dev');
                    token.insertBefore(link);
                    link.append(token);
                    if (rng() < 0.5) {
                      link.append(tokens[pick(tokens.length)]);
                    }
                  }
              }
            }
          },
          {discrete: true},
        );
        const context = `seed ${seed} step ${step}`;
        expect(errors, context).toEqual([]);
        expect(paragraphTexts(editor), context).toEqual(
          editor.read(() =>
            $getRoot()
              .getChildren()
              .map(p => p.getTextContent()),
          ),
        );
      }
    }
  }, 60000);
});
