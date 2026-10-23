/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {$isLinkNode, $toggleLink, AutoLinkNode, LinkNode} from '@lexical/link';
import {$isMarkNode, $wrapSelectionInMarkNode, MarkNode} from '@lexical/mark';
import {YExtension, YHistoryExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createLineBreakNode,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  COMPOSITION_END_COMMAND,
  configExtension,
  DecoratorNode,
  defineExtension,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  LineBreakNode,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import {describe, expect, onTestFinished, test} from 'vitest';

import {readText} from '../../Sync';
import {getNodeByID} from '../../Topology';

const ORIGINAL = 'Revenue grew 4% in Q3.';
function create(
  doc: Y.Doc,
  inlineFormatTypes?: readonly string[],
  extraNodes: Klass<LexicalNode>[] = [],
) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {
          root: doc.get('root'),
          ...(inlineFormatTypes ? {inlineFormatTypes} : {}),
        }),
        YHistoryExtension,
      ],
      name: 'test-inline',
      nodes: [LinkNode, AutoLinkNode, MarkNode, ...extraNodes],
    }),
  );
  onTestFinished(() => editor.dispose());
  return editor;
}
function update(editor: LexicalEditor, callback: () => void) {
  editor.update(callback, {discrete: true});
}
function sync(a: Y.Doc, b: Y.Doc) {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
}
function manager(editor: LexicalEditor) {
  return getExtensionDependencyFromEditor(editor, YHistoryExtension).output
    .undoManager.value!;
}
function pair(reverse = false, nodes: Klass<LexicalNode>[] = []) {
  const a = new Y.Doc({gc: false});
  const b = new Y.Doc({gc: false});
  a.clientID = reverse ? 2 : 1;
  b.clientID = reverse ? 1 : 2;
  onTestFinished(() => {
    a.destroy();
    b.destroy();
  });
  const ea = create(a, undefined, nodes);
  update(ea, () => {
    $getRoot().append($createParagraphNode().append($createTextNode(ORIGINAL)));
  });
  sync(a, b);
  const eb = create(b, undefined, nodes);
  manager(ea).clear();
  manager(eb).clear();
  return {a, b, ea, eb};
}
function leaves(node: LexicalNode): TextNode[] {
  if ($isTextNode(node)) return [node];
  return $isElementNode(node) ? node.getChildren().flatMap(leaves) : [];
}
function $select(start: number, end = start) {
  const nodes = leaves($getRoot());
  const selection = $createRangeSelection();
  const point = (offset: number) => {
    for (const node of nodes) {
      const length = node.getTextContentSize();
      if (offset <= length) return {node, offset};
      offset -= length;
    }
    throw new Error('offset out of range');
  };
  const a = point(start);
  const b = point(end);
  selection.anchor.set(a.node.getKey(), a.offset, 'text');
  selection.focus.set(b.node.getKey(), b.offset, 'text');
  $setSelection(selection);
  return selection;
}
function $typeAt(offset: number, value: string) {
  $select(offset).insertText(value);
}
function $wrap(kind: string, id = 'c1') {
  const selection = $select(8, 15);
  if (kind === 'mark') $wrapSelectionInMarkNode(selection, false, id);
  else $toggleLink('https://x');
}
function tree(editor: LexicalEditor) {
  return editor.getEditorState().toJSON(true);
}
function text(editor: LexicalEditor) {
  return editor.read('latest', () => $getRoot().getTextContent());
}
function settle(p: ReturnType<typeof pair>) {
  sync(p.a, p.b);
  sync(p.b, p.a);
  sync(p.a, p.b);
  expect(tree(p.ea)).toEqual(tree(p.eb));
  expect(tree(create(p.a))).toEqual(tree(p.ea));
}
function wrappers(editor: LexicalEditor) {
  return editor.read('latest', () => {
    const result: {type: string; text: string; ids?: string[]}[] = [];
    function visit(node: LexicalNode) {
      if ($isLinkNode(node))
        result.push({text: node.getTextContent(), type: 'link'});
      if ($isMarkNode(node))
        result.push({
          ids: node.getIDs().sort(),
          text: node.getTextContent(),
          type: 'mark',
        });
      if ($isElementNode(node)) node.getChildren().forEach(visit);
    }
    visit($getRoot());
    return result;
  });
}
function run(doc: Y.Doc) {
  const root = doc.get('root');
  const p = root.get(0) as {id: string};
  const paragraph = getNodeByID(root, p.id) as Y.Node;
  const edge = paragraph.get(0) as {id: string};
  return getNodeByID(root, edge.id) as Y.Node;
}
function characters(type: Y.Node) {
  const result: string[] = [];
  let item = type._start;
  while (item) {
    if (!item.deleted && item.content.constructor.name === 'ContentString') {
      for (let i = 0; i < item.length; i++)
        result.push(item.id.client + ':' + (item.id.clock + i));
    }
    item = item.right;
  }
  return result;
}

describe.each([false, true])(
  'inline wrappers, reverse client ids=%s',
  reverse => {
    test.each(['link', 'mark'])(
      'W1/B2 %s wrapping keeps character identities and concurrent interior typing',
      kind => {
        const p = pair(reverse);
        const shared = run(p.b);
        const ids = characters(shared);
        update(p.ea, () => $typeAt(13, 'by '));
        update(p.eb, () => $wrap(kind));
        expect(run(p.b)).toBe(shared);
        expect(characters(shared)).toEqual(ids);
        settle(p);
        expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
        expect(wrappers(p.ea)).toEqual([
          {
            ...(kind === 'mark' ? {ids: ['c1']} : {}),
            text: 'grew by 4%',
            type: kind,
          },
        ]);
      },
    );
    test('W2 existing mark gains a second id without moving concurrent typing', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('mark', 'c0'));
      sync(p.a, p.b);
      manager(p.ea).clear();
      update(p.ea, () => $typeAt(13, 'by '));
      update(p.eb, () => $wrap('mark', 'c1'));
      settle(p);
      expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
      expect(wrappers(p.ea)).toEqual([
        {ids: ['c0', 'c1'], text: 'grew by 4%', type: 'mark'},
      ]);
    });
    test('W3 concurrent comments merge per id without duplicating text', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('mark', 'c1'));
      update(p.eb, () => $wrap('mark', 'c2'));
      settle(p);
      expect(text(p.ea)).toBe(ORIGINAL);
      expect(wrappers(p.ea)).toEqual([
        {ids: ['c1', 'c2'], text: 'grew 4%', type: 'mark'},
      ]);
      manager(p.ea).undo();
      settle(p);
      expect(wrappers(p.ea)).toEqual([
        {ids: ['c2'], text: 'grew 4%', type: 'mark'},
      ]);
    });
    test.each(['link', 'mark'])(
      'W4 undo own %s preserves peer typing',
      kind => {
        const p = pair(reverse);
        update(p.ea, () => $wrap(kind));
        sync(p.a, p.b);
        manager(p.ea).stopCapturing();
        update(p.eb, () => $typeAt(13, 'by '));
        sync(p.b, p.a);
        manager(p.ea).undo();
        settle(p);
        expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
        expect(wrappers(p.ea)).toEqual([]);
      },
    );
    test('W5 replacing link text retains concurrent end typing beside replacement', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('link'));
      sync(p.a, p.b);
      manager(p.ea).clear();
      update(p.ea, () => $typeAt(15, '!'));
      update(p.eb, () => $select(8, 15).insertText('D124'));
      settle(p);
      expect(text(p.ea)).toMatch(/^Revenue (?:D124!|!D124) in Q3\.$/);
    });
    test('unlink preserves concurrent interior typing', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('link'));
      sync(p.a, p.b);
      update(p.ea, () => $typeAt(13, 'by '));
      update(p.eb, () => {
        $select(8, 15);
        $toggleLink(null);
      });
      settle(p);
      expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
      expect(wrappers(p.ea)).toEqual([]);
    });

    test('unknown wrapper types and properties survive local edits', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('link'));
      sync(p.a, p.b);
      const future = 'inline:link:attr:p%3Afuture';
      const unknown = 'inline:new-wrapper';
      run(p.a).format(8, 7, {[future]: ['next-version'], [unknown]: [true]});
      sync(p.a, p.b);
      update(p.eb, () => {
        $typeAt(0, 'Z');
        const link = leaves($getRoot())[1].getParentOrThrow();
        if ($isLinkNode(link)) link.setURL('https://changed');
      });
      settle(p);
      const delta = readText(run(p.a));
      expect(
        delta.some(
          op =>
            JSON.stringify(op.formats[future]) ===
            JSON.stringify(['next-version']),
        ),
      ).toBe(true);
      expect(
        delta.some(
          op => JSON.stringify(op.formats[unknown]) === JSON.stringify([true]),
        ),
      ).toBe(true);
    });
    test.each([0, 8, 11, 15, 21])(
      'typing at %s while a peer links keeps text at its original position',
      offset => {
        const p = pair(reverse);
        update(p.ea, () => $typeAt(offset, 'ZZ'));
        update(p.eb, () => $wrap('link'));
        settle(p);
        expect(text(p.ea)).toBe(
          ORIGINAL.slice(0, offset) + 'ZZ' + ORIGINAL.slice(offset),
        );
      },
    );
    test('URL changes do not leak stale link properties onto text typed after a link', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('link'));
      sync(p.a, p.b);
      update(p.ea, () => {
        const link = leaves($getRoot())[1].getParentOrThrow();
        if ($isLinkNode(link)) link.setURL('https://new');
      });
      update(p.eb, () => {
        const after = leaves($getRoot())[2];
        after.spliceText(0, 0, '!');
      });
      settle(p);
      expect(text(p.ea)).toBe('Revenue grew 4%! in Q3.');
      expect(wrappers(p.ea)).toEqual([{text: 'grew 4%', type: 'link'}]);
    });
    test('B2 removing the first text segment preserves concurrent typing and neighbors', () => {
      const p = pair(reverse);
      update(p.ea, () => {
        $getRoot()
          .getFirstChildOrThrow<ParagraphNode>()
          .clear()
          .append(
            $createTextNode('aaa '),
            $createTextNode('BOLD').toggleFormat('bold'),
            $createTextNode(' ccc'),
          );
      });
      sync(p.a, p.b);
      update(p.ea, () => $typeAt(2, '!'));
      update(p.eb, () => {
        leaves($getRoot())[0].remove();
      });
      settle(p);
      expect(text(p.ea)).toBe('!BOLD ccc');
    });
    test('B2 wrapping from paragraph start preserves concurrent typing', () => {
      const p = pair(reverse);
      update(p.ea, () => $typeAt(2, '!'));
      update(p.eb, () => {
        $wrapSelectionInMarkNode($select(0, 7), false, 'start');
      });
      settle(p);
      expect(text(p.ea)).toBe('Re!venue grew 4% in Q3.');
      expect(wrappers(p.ea)).toEqual([
        {ids: ['start'], text: 'Re!venue', type: 'mark'},
      ]);
    });
    test('concurrent links on the same characters produce a single copy', () => {
      const p = pair(reverse);
      update(p.ea, () => {
        $select(8, 15);
        $toggleLink('https://a');
      });
      update(p.eb, () => {
        $select(8, 15);
        $toggleLink('https://b');
      });
      settle(p);
      expect(text(p.ea)).toBe(ORIGINAL);
      expect(wrappers(p.ea)).toHaveLength(1);
    });
    test('URL and target updates merge independently and wrapper keys survive reads', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('link'));
      sync(p.a, p.b);
      const key = p.ea.read('latest', () =>
        leaves($getRoot())[1].getParentOrThrow().getKey(),
      );
      update(p.ea, () => {
        const link = leaves($getRoot())[1].getParentOrThrow();
        if ($isLinkNode(link)) link.setURL('https://new');
      });
      update(p.eb, () => {
        const link = leaves($getRoot())[1].getParentOrThrow();
        if ($isLinkNode(link)) link.setTarget('_blank');
      });
      settle(p);
      p.ea.read('latest', () => {
        const link = leaves($getRoot())[1].getParentOrThrow();
        expect(link.getKey()).toBe(key);
        expect($isLinkNode(link) && link.getURL()).toBe('https://new');
        expect($isLinkNode(link) && link.getTarget()).toBe('_blank');
      });
    });
    test('local nested marks immediately canonicalize and reload identically', () => {
      const p = pair(reverse);
      update(p.ea, () => $wrap('mark', 'c0'));
      update(p.ea, () => $wrap('mark', 'c1'));
      expect(wrappers(p.ea)).toEqual([
        {ids: ['c0', 'c1'], text: 'grew 4%', type: 'mark'},
      ]);
      expect(tree(create(p.a))).toEqual(tree(p.ea));
    });
    test('two adjacent linebreaks stay distinct and remain inside the link', () => {
      const p = pair(reverse);
      update(p.ea, () => {
        $select(11).insertNodes([
          $createLineBreakNode(),
          $createLineBreakNode(),
        ]);
      });
      update(p.eb, () => $wrap('link'));
      settle(p);
      expect(text(p.ea)).toBe('Revenue gre\n\nw 4% in Q3.');
      expect(wrappers(p.ea)).toEqual([{text: 'gre\n\nw 4%', type: 'link'}]);
    });
    test.each([7, 11])(
      'concurrent line break at %s and linking never split shared identity',
      offset => {
        const p = pair(reverse);
        const shared = run(p.a);
        update(p.ea, () => {
          $select(offset).insertNodes([$createLineBreakNode()]);
        });
        update(p.eb, () => $wrap('link'));
        settle(p);
        expect(text(p.ea)).toBe(
          ORIGINAL.slice(0, offset) + '\n' + ORIGINAL.slice(offset),
        );
        expect(run(p.a)).toBe(shared);
      },
    );
  },
);

class CustomLink extends LinkNode {
  $config() {
    return this.config('custom-link', {extends: LinkNode});
  }
}

test('schema-defined inline wrappers opt in without adding base package dependencies', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();
  onTestFinished(() => {
    a.destroy();
    b.destroy();
  });
  const options = ['custom-link', 'mark', 'link'];
  const ea = create(a, options, [CustomLink]);
  update(ea, () => {
    $getRoot().append($createParagraphNode().append($createTextNode(ORIGINAL)));
  });
  sync(a, b);
  const eb = create(b, [...options].reverse(), [CustomLink]);
  const shared = run(a);
  const ids = characters(shared);
  update(ea, () => {
    const selection = $select(8, 15);
    const nodes = selection.extract();
    const wrapper = $create(CustomLink).setURL('https://custom');
    nodes[0].insertBefore(wrapper);
    wrapper.append(...nodes);
  });
  expect(run(a)).toBe(shared);
  expect(characters(shared)).toEqual(ids);
  update(eb, () => $typeAt(13, 'by '));
  sync(a, b);
  sync(b, a);
  expect(tree(ea)).toEqual(tree(eb));
  expect(text(ea)).toBe('Revenue grew by 4% in Q3.');
  expect(tree(create(a, options, [CustomLink]))).toEqual(tree(ea));
});

test('an application transform can split equal links without a transform loop', () => {
  const doc = new Y.Doc();
  onTestFinished(() => doc.destroy());
  const editor = create(doc);
  editor.registerNodeTransform(LinkNode, node => {
    for (const child of node.getChildren().slice(1))
      node.insertAfter($create(LinkNode).setURL(node.getURL()).append(child));
  });
  update(editor, () => {
    $getRoot().append(
      $createParagraphNode().append(
        $create(LinkNode)
          .setURL('https://x')
          .append(
            $createTextNode('a').toggleFormat('bold'),
            $createTextNode('b'),
          ),
      ),
    );
  });
  expect(text(editor)).toBe('ab');
  expect(text(create(doc))).toBe('ab');
});

test('wrapper projection waits for composition end', () => {
  const p = pair();
  update(p.ea, () => $wrap('mark', 'c0'));
  p.ea._compositionKey = p.ea.read('latest', () =>
    leaves($getRoot())[1].getKey(),
  );
  update(p.ea, () => $wrap('mark', 'c1'));
  expect(wrappers(p.ea)).toHaveLength(2);
  p.ea._compositionKey = null;
  p.ea.registerCommand(
    COMPOSITION_END_COMMAND,
    () => true,
    COMMAND_PRIORITY_LOW,
  );
  p.ea.dispatchCommand(COMPOSITION_END_COMMAND, {} as CompositionEvent);
  p.ea.read('force-commit', () => {});
  expect(wrappers(p.ea)).toEqual([
    {ids: ['c0', 'c1'], text: 'grew 4%', type: 'mark'},
  ]);
  expect(tree(create(p.a))).toEqual(tree(p.ea));
});

// Splitting/merging blocks and inserting structural inline nodes still move
// characters between runs. Keep these regressions visible until source-run
// fragments can be projected without deleting and copying their characters.
test.fails(
  'known limitation: splitting a paragraph must preserve concurrent tail typing',
  () => {
    const p = pair();
    update(p.ea, () => {
      $select(11).insertParagraph();
    });
    update(p.eb, () => $typeAt(13, 'by '));
    sync(p.a, p.b);
    sync(p.b, p.a);
    sync(p.a, p.b);
    expect(text(p.ea)).toBe('Revenue gre\n\nw by 4% in Q3.');
    expect(tree(p.ea)).toEqual(tree(p.eb));
  },
);

test.fails(
  'known limitation: joining paragraphs must preserve concurrent second-block typing',
  () => {
    const p = pair();
    update(p.ea, () => {
      $getRoot()
        .clear()
        .append(
          $createParagraphNode().append($createTextNode('Revenue ')),
          $createParagraphNode().append($createTextNode('grew 4% in Q3.')),
        );
    });
    sync(p.a, p.b);
    update(p.ea, () => {
      const first = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      const second = first.getNextSibling<ParagraphNode>()!;
      first.append(...second.getChildren());
      second.remove();
    });
    update(p.eb, () => $typeAt(13, 'by '));
    sync(p.a, p.b);
    sync(p.b, p.a);
    sync(p.a, p.b);
    expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
    expect(tree(p.ea)).toEqual(tree(p.eb));
  },
);

class InlineCard extends DecoratorNode<null> {
  $config() {
    return this.config('inline-card', {extends: DecoratorNode});
  }
  isInline(): true {
    return true;
  }
  decorate(): null {
    return null;
  }
}

test.fails(
  'known limitation: inline decorator insertion must preserve concurrent tail typing',
  () => {
    const p = pair(false, [InlineCard]);
    update(p.ea, () => {
      $select(11).insertNodes([$create(InlineCard)]);
    });
    update(p.eb, () => $typeAt(13, 'by '));
    sync(p.a, p.b);
    sync(p.b, p.a);
    sync(p.a, p.b);
    expect(text(p.ea)).toBe('Revenue grew by 4% in Q3.');
    expect(tree(p.ea)).toEqual(tree(p.eb));
  },
);

class CustomLineBreak extends LineBreakNode {
  $config() {
    return this.config('custom-linebreak', {extends: LineBreakNode});
  }
}

test('consecutive custom linebreaks survive coalesced shared text deltas', () => {
  const doc = new Y.Doc();
  onTestFinished(() => doc.destroy());
  const editor = create(doc, undefined, [CustomLineBreak]);
  update(editor, () => {
    $getRoot().append(
      $createParagraphNode().append(
        $createTextNode('a'),
        $create(CustomLineBreak),
        $create(CustomLineBreak),
        $createTextNode('b'),
      ),
    );
  });
  expect(tree(create(doc, undefined, [CustomLineBreak]))).toEqual(tree(editor));
  expect(text(editor)).toBe('a\n\nb');
});
