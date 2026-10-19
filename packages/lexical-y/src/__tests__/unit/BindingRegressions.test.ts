/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import type {Klass, LexicalEditor, LexicalNode, ParagraphNode} from 'lexical';

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSlot,
  $removeSlot,
  $setSlot,
  $setState,
  COLLABORATION_TAG,
  configExtension,
  createState,
  defineExtension,
  ElementNode,
  TextNode,
} from 'lexical';
import {expect, onTestFinished, test, vi} from 'vitest';

class CalloutNode extends ElementNode {
  $config() {
    return this.config('binding-regression-callout', {extends: ElementNode});
  }
}

class CustomTextNode extends TextNode {
  $config() {
    return this.config('binding-regression-custom-text', {extends: TextNode});
  }
}

class OtherCustomTextNode extends TextNode {
  $config() {
    return this.config('binding-regression-other-custom-text', {
      extends: TextNode,
    });
  }
}

class InlineCalloutNode extends ElementNode {
  $config() {
    return this.config('binding-regression-inline-callout', {
      extends: ElementNode,
    });
  }
  isInline(): boolean {
    return true;
  }
}

const opaqueMetadata = createState('opaqueMetadata', {
  parse: (value: unknown) => value,
});

function create(
  doc: Y.Doc,
  nodes: Klass<LexicalNode>[] = [],
  extra: {inlineFormatTypes?: readonly string[]} = {},
) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root'), ...extra}),
      ],
      name: 'binding-regressions',
      nodes,
    }),
  );
  onTestFinished(() => editor.dispose());
  return editor;
}

function pair(nodes: Klass<LexicalNode>[] = []) {
  const a = new Y.Doc();
  const b = new Y.Doc();
  onTestFinished(() => {
    a.destroy();
    b.destroy();
  });
  const ea = create(a, nodes);
  ea.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('hello')),
        $createParagraphNode().append($createTextNode('world')),
      ),
    {discrete: true},
  );
  copy(a, b);
  const eb = create(b, nodes);
  return {a, b, ea, eb};
}

function copy(from: Y.Doc, to: Y.Doc) {
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from));
}

function content(editor: LexicalEditor) {
  return editor.getEditorState().toJSON(true);
}

function text(editor: LexicalEditor) {
  return editor.read('latest', () => $getRoot().getTextContent());
}

test.each(['before', 'after', 'remove-before'] as const)(
  'slot edits synchronize after a remote sibling is inserted %s the host (B1)',
  position => {
    const {a, b, ea, eb} = pair([CalloutNode]);
    ea.update(
      () => {
        const host = $create(CalloutNode).append(
          $createParagraphNode().append($createTextNode('body')),
        );
        $setSlot(
          host,
          'caption',
          $createParagraphNode().append($createTextNode('caption')),
        );
        $getRoot().getLastChildOrThrow().insertBefore(host);
      },
      {discrete: true},
    );
    copy(a, b);
    ea.update(
      () => {
        const host = $getRoot().getChildAtIndex(1)!;
        const sibling = $createParagraphNode().append($createTextNode('new'));
        if (position === 'remove-before')
          $getRoot().getFirstChildOrThrow().remove();
        else if (position === 'before') host.insertBefore(sibling);
        else host.insertAfter(sibling);
      },
      {discrete: true},
    );
    copy(a, b);
    eb.update(
      () => {
        const host = $getRoot()
          .getChildren()
          .find(n => n instanceof CalloutNode)!;
        ($getSlot(host, 'caption') as ParagraphNode)
          .getFirstChildOrThrow<TextNode>()
          .spliceText(0, 0, 'X');
      },
      {discrete: true},
    );
    copy(b, a);
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(b, [CalloutNode]))).toEqual(content(eb));
    ea.read('latest', () => {
      const host = $getRoot()
        .getChildren()
        .find(n => n instanceof CalloutNode)!;
      expect($getSlot(host, 'caption')!.getTextContent()).toBe('Xcaption');
    });
  },
);

test.each([false, true])(
  'local updates around remote delivery persist (pending before delivery: %s) (B4)',
  pending => {
    const {a, b, ea, eb} = pair();
    if (pending)
      eb.update(() =>
        $getRoot()
          .getLastChildOrThrow<ParagraphNode>()
          .getFirstChildOrThrow<TextNode>()
          .spliceText(5, 0, 'B'),
      );
    ea.update(
      () =>
        $getRoot()
          .getFirstChildOrThrow<ParagraphNode>()
          .getFirstChildOrThrow<TextNode>()
          .spliceText(5, 0, 'A'),
      {discrete: true},
    );
    copy(a, b);
    eb.update(() =>
      $getRoot()
        .getLastChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(pending ? 6 : 5, 0, 'C'),
    );
    eb.read('latest', () => {});
    copy(b, a);
    expect(text(ea)).toBe(pending ? 'helloA\n\nworldBC' : 'helloA\n\nworldC');
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(b))).toEqual(content(eb));
  },
);

test('local updates triggered by a remote update listener persist (B4)', () => {
  const {a, b, ea, eb} = pair();
  let responded = false;
  onTestFinished(
    eb.registerUpdateListener(({tags}) => {
      if (responded || !tags.has(COLLABORATION_TAG)) return;
      responded = true;
      eb.update(() =>
        $getRoot()
          .getLastChildOrThrow<ParagraphNode>()
          .getFirstChildOrThrow<TextNode>()
          .spliceText(5, 0, 'B'),
      );
    }),
  );
  ea.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(5, 0, 'A'),
    {discrete: true},
  );
  copy(a, b);
  eb.read('latest', () => {});
  copy(b, a);
  expect(text(ea)).toBe('helloA\n\nworldB');
  expect(content(ea)).toEqual(content(eb));
  expect(content(create(b))).toEqual(content(eb));
});

test('rejects the earlier experimental wire format before modifying shared data', () => {
  const doc = new Y.Doc();
  onTestFinished(() => doc.destroy());
  doc.get('root').setAttr('tree:format', {schema: 'default', version: 1});
  const before = Y.encodeStateAsUpdate(doc);
  expect(() => create(doc)).toThrow(/incompatible document format/);
  expect(Y.encodeStateAsUpdate(doc)).toEqual(before);
});

test.each([false, true])(
  'follows the shared document inline layout over the joining editor configuration (%s)',
  custom => {
    const doc = new Y.Doc();
    onTestFinished(() => doc.destroy());
    const types = custom
      ? ['binding-regression-inline-callout', 'mark']
      : ['link', 'autolink', 'mark'];
    const initial = create(doc, [], {inlineFormatTypes: types});
    initial.update(() => $getRoot().append($createParagraphNode()), {
      discrete: true,
    });
    const follower = create(doc, [], {
      inlineFormatTypes: custom ? [] : ['binding-regression-inline-callout'],
    });
    const binding = getExtensionDependencyFromEditor(follower, YExtension)
      .output.binding;
    expect([...binding.inlineFormatTypes].sort()).toEqual([...types].sort());
    expect(doc.get('root').getAttr('tree:format').inlineFormatTypes).toEqual(
      [...types].sort(),
    );
  },
);

test('unknown remote blocks preserve their payload while unrelated edits continue (B3)', () => {
  const {a, b, ea, eb} = pair();
  const warn = vi.spyOn(eb, '_onWarn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  const writer = create(a, [CalloutNode]);
  writer.update(
    () => {
      const callout = $create(CalloutNode).append(
        $createParagraphNode().append($createTextNode('opaque content')),
      );
      $setState(callout, opaqueMetadata, {preserve: ['all', 'values']});
      $getRoot().getFirstChildOrThrow().insertAfter(callout);
      $getRoot()
        .getLastChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(5, 0, ' remote');
    },
    {discrete: true},
  );
  copy(a, b);
  expect(text(eb)).toContain('world remote');
  expect(
    getExtensionDependencyFromEditor(eb, YExtension).output.binding.error.value,
  ).toBeNull();
  eb.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(5, 0, ' local'),
    {discrete: true},
  );
  copy(b, a);
  expect(text(writer)).toBe('hello local\n\nopaque content\n\nworld remote');
  expect(content(create(b, [CalloutNode]))).toEqual(content(writer));
  expect(content(create(a, [CalloutNode]))).toEqual(content(writer));
  // The first editor also lacks the node type and must remain writable.
  expect(text(ea)).toContain('hello local');
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0][0].message).toContain('binding-regression-callout');
});

test('an empty peer waits for the existing document layout instead of publishing a conflicting marker', () => {
  const source = new Y.Doc();
  const target = new Y.Doc();
  onTestFinished(() => {
    source.destroy();
    target.destroy();
  });
  const writer = create(source, [InlineCalloutNode], {
    inlineFormatTypes: ['binding-regression-inline-callout'],
  });
  writer.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append(
          $create(InlineCalloutNode).append($createTextNode('annotated')),
        ),
      ),
    {discrete: true},
  );
  const before = Y.encodeStateVector(target);
  const reader = create(target, [InlineCalloutNode]);
  expect(target.get('root').getAttr('tree:format')).toBeUndefined();
  expect(Y.encodeStateVector(target)).toEqual(before);
  copy(source, target);
  const binding = getExtensionDependencyFromEditor(reader, YExtension).output
    .binding;
  expect([...binding.inlineFormatTypes]).toEqual([
    'binding-regression-inline-callout',
  ]);
  expect(content(reader)).toEqual(content(writer));
  reader.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<InlineCalloutNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(9, 0, '!'),
    {discrete: true},
  );
  copy(target, source);
  expect(text(writer)).toBe('annotated!');
  expect(content(create(target, [InlineCalloutNode]))).toEqual(content(writer));
});

test('unknown inline nodes separate adjacent text runs without rewriting either run (B3)', () => {
  const {a, b, ea, eb} = pair();
  const writer = create(a, [InlineCalloutNode]);
  writer.update(
    () => {
      const paragraph = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      const inline = $create(InlineCalloutNode).append(
        $createTextNode('unknown inline'),
      );
      paragraph.append(inline, $createTextNode(' tail'));
    },
    {discrete: true},
  );
  copy(a, b);
  eb.update(
    () => {
      const paragraph = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      expect(paragraph.getChildrenSize()).toBe(3);
      paragraph.getFirstChildOrThrow<TextNode>().spliceText(5, 0, '!');
      paragraph.getLastChildOrThrow<TextNode>().spliceText(5, 0, '?');
    },
    {discrete: true},
  );
  writer.update(
    () =>
      (
        $getRoot()
          .getFirstChildOrThrow<ParagraphNode>()
          .getChildAtIndex(1) as InlineCalloutNode
      )
        .getFirstChildOrThrow<TextNode>()
        .spliceText(14, 0, '!'),
    {discrete: true},
  );
  copy(a, b);
  copy(b, a);
  expect(text(writer)).toBe('hello!unknown inline! tail?\n\nworld');
  expect(content(create(b, [InlineCalloutNode]))).toEqual(content(writer));
  expect(content(create(a, [InlineCalloutNode]))).toEqual(content(writer));
  expect(content(ea)).toEqual(content(eb));
});

test('unknown text-run types preserve their formatting and recover when the type is removed (B3)', () => {
  const {a, b, eb} = pair();
  const writer = create(a, [CustomTextNode]);
  writer.update(
    () => {
      const special = $create(CustomTextNode).setTextContent(' special');
      special.setFormat('bold');
      $setState(special, opaqueMetadata, {private: 'schema'});
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .append(special, $createTextNode(' tail'));
    },
    {discrete: true},
  );
  copy(a, b);
  eb.update(
    () =>
      $getRoot()
        .getLastChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(5, 0, '!'),
    {discrete: true},
  );
  copy(b, a);
  expect(text(writer)).toBe('hello special tail\n\nworld!');
  expect(content(create(b, [CustomTextNode]))).toEqual(content(writer));
  writer.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getChildAtIndex(1)!
        .remove(),
    {discrete: true},
  );
  copy(a, b);
  expect(text(eb)).toBe('hello tail\n\nworld!');
  expect(content(eb)).toEqual(content(create(b)));
});

test('reports unavailable text types once each even when they initially share a run', () => {
  const {a, b, eb} = pair();
  const warn = vi.spyOn(eb, '_onWarn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  const writer = create(a, [CustomTextNode, OtherCustomTextNode]);
  writer.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .append(
          $create(CustomTextNode).setTextContent(' first'),
          $create(OtherCustomTextNode).setTextContent(' second'),
        ),
    {discrete: true},
  );
  copy(a, b);
  expect(warn).toHaveBeenCalledTimes(2);
  writer.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getChildren()
        .find(node => node instanceof CustomTextNode)!
        .remove(),
    {discrete: true},
  );
  copy(a, b);
  expect(warn).toHaveBeenCalledTimes(2);
  expect(content(create(b, [OtherCustomTextNode]))).toEqual(content(writer));
});

test('unavailable annotated wrapper types remain opaque while unrelated edits merge', () => {
  const source = new Y.Doc();
  const target = new Y.Doc();
  onTestFinished(() => {
    source.destroy();
    target.destroy();
  });
  const writer = create(source, [InlineCalloutNode], {
    inlineFormatTypes: ['binding-regression-inline-callout'],
  });
  writer.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append(
          $createTextNode('before '),
          $create(InlineCalloutNode).append($createTextNode('inside')),
          $createTextNode(' after'),
        ),
        $createParagraphNode().append($createTextNode('elsewhere')),
      ),
    {discrete: true},
  );
  const reader = create(target);
  copy(source, target);
  reader.read('latest', () =>
    expect(
      $getRoot().getFirstChildOrThrow<ParagraphNode>().getChildrenSize(),
    ).toBe(1),
  );
  reader.update(
    () => {
      $getRoot()
        .getFirstChildOrThrow()
        .insertBefore($createParagraphNode().append($createTextNode('plain')));
      $getRoot()
        .getLastChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<TextNode>()
        .spliceText(9, 0, '!');
    },
    {discrete: true},
  );
  writer.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getChildAtIndex<InlineCalloutNode>(1)!
        .getFirstChildOrThrow<TextNode>()
        .spliceText(6, 0, ' remote'),
    {discrete: true},
  );
  copy(target, source);
  copy(source, target);
  expect(text(writer)).toBe(
    'plain\n\nbefore inside remote after\n\nelsewhere!',
  );
  expect(content(create(target, [InlineCalloutNode]))).toEqual(content(writer));
  expect(content(create(target))).toEqual(content(reader));
  writer.read('latest', () => {
    const children = $getRoot()
      .getChildAtIndex<ParagraphNode>(1)!
      .getChildren();
    expect(children.map(node => node.getType())).toEqual([
      'text',
      'binding-regression-inline-callout',
      'text',
    ]);
    expect(children[1].getTextContent()).toBe('inside remote');
  });
});

test('unknown slot content survives host edits and other slot edits (B3)', () => {
  const {a, b, eb} = pair();
  const writer = create(a, [CalloutNode]);
  writer.update(
    () => {
      const host = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      $setSlot(
        host,
        'unknown',
        $create(CalloutNode).append(
          $createParagraphNode().append($createTextNode('opaque slot')),
        ),
      );
      $setSlot(
        host,
        'known',
        $createParagraphNode().append($createTextNode('known slot')),
      );
    },
    {discrete: true},
  );
  copy(a, b);
  eb.update(
    () => {
      const host = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      host.setFormat('center');
      ($getSlot(host, 'known') as ParagraphNode)
        .getFirstChildOrThrow<TextNode>()
        .spliceText(10, 0, '!');
    },
    {discrete: true},
  );
  copy(b, a);
  expect(content(create(b, [CalloutNode]))).toEqual(content(writer));
  writer.read('latest', () =>
    expect(
      $getSlot($getRoot().getFirstChildOrThrow(), 'unknown')!.getTextContent(),
    ).toBe('opaque slot'),
  );
});

test.each([false, true])(
  'replacing local content preserves unavailable subtrees (nested: %s) (B3)',
  nested => {
    const {a, b, eb} = pair();
    const writer = create(a, [CalloutNode]);
    writer.update(
      () => {
        const opaque = $create(CalloutNode).append(
          $createParagraphNode().append($createTextNode('keep me')),
        );
        $getRoot().append(
          nested ? $createParagraphNode().append(opaque) : opaque,
        );
      },
      {discrete: true},
    );
    copy(a, b);
    eb.update(
      () =>
        $getRoot()
          .clear()
          .append($createParagraphNode().append($createTextNode('fresh'))),
      {discrete: true},
    );
    copy(b, a);
    expect(text(writer)).toContain('keep me');
    expect(text(writer)).toContain('fresh');
    expect(content(create(b, [CalloutNode]))).toEqual(content(writer));
    expect(content(create(b))).toEqual(content(eb));
  },
);

test.each([
  ['remove', 1, 2],
  ['replace', 1, 2],
  ['remove', 2, 1],
  ['replace', 2, 1],
] as const)(
  'removing or replacing unavailable slot data preserves its original payload (%s, client IDs %i/%i) (B3)',
  (operation, aid, bid) => {
    const {a, b, eb} = pair();
    a.clientID = aid;
    b.clientID = bid;
    const writer = create(a, [CalloutNode]);
    writer.update(
      () =>
        $setSlot(
          $getRoot().getFirstChildOrThrow<ParagraphNode>(),
          'caption',
          $create(CalloutNode).append(
            $createParagraphNode().append($createTextNode('original')),
          ),
        ),
      {discrete: true},
    );
    copy(a, b);
    eb.update(
      () =>
        operation === 'remove'
          ? $removeSlot(
              $getRoot().getFirstChildOrThrow<ParagraphNode>(),
              'caption',
            )
          : $setSlot(
              $getRoot().getFirstChildOrThrow<ParagraphNode>(),
              'caption',
              $createParagraphNode().append(
                $createTextNode('cannot overwrite'),
              ),
            ),
      {discrete: true},
    );
    copy(b, a);
    writer.read('latest', () =>
      expect(
        $getSlot(
          $getRoot().getFirstChildOrThrow(),
          'caption',
        )!.getTextContent(),
      ).toBe('original'),
    );
    expect(content(create(b, [CalloutNode]))).toEqual(content(writer));
    expect(content(create(b))).toEqual(content(eb));
  },
);

test('edits preserve unknown element schema fields and shared references', () => {
  const {a, b, ea, eb} = pair();
  const root = b.get('root');
  const edge = root.get(0) as {id: string};
  const paragraph = root.getAttr('tree:node:' + edge.id) as Y.Node;
  const shared = new Y.Node();
  b.transact(() => {
    root.setAttr('shared:future', shared);
    shared.insert(0, 'live future value');
    paragraph.setAttr('p:futureJSON', {newer: [1, 'two']});
    paragraph.setAttr('ref:p:futureShared', {
      container: Y.relativePositionToJSON(
        Y.createRelativePositionFromTypeIndex(root, root.length),
      ),
      key: 'shared:future',
    });
  });
  eb.update(
    () => {
      const node = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      node.setFormat('center');
      node.getFirstChildOrThrow<TextNode>().spliceText(5, 0, '!');
    },
    {discrete: true},
  );
  expect(paragraph.getAttr('p:futureJSON')).toEqual({newer: [1, 'two']});
  expect(paragraph.getAttr('ref:p:futureShared').key).toBe('shared:future');
  const binding = getExtensionDependencyFromEditor(eb, YExtension).output
    .binding;
  expect(() => binding.releaseSharedType(shared)).toThrow(/references/);
  copy(b, a);
  expect(content(create(b))).toEqual(content(eb));
  expect(content(ea)).toEqual(content(eb));
});
