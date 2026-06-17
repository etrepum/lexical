/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$generateJSONFromSelectedNodes} from '@lexical/clipboard';
import {
  buildEditorFromExtensions,
  type LexicalEditorWithDispose,
} from '@lexical/extension';
import {$generateHtmlFromNodes} from '@lexical/html';
import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $getSlot,
  $isElementNode,
  $isRangeSelection,
  $selectAll,
  $setSelection,
  defineExtension,
} from 'lexical';
import {assert, describe, expect, it} from 'vitest';

import {
  $createSlotContainerNode,
  SlotContainerNode,
} from '../../src/nodes/SlotContainerNode';
import {CardExtension} from '../../src/plugins/CardExtension';
import {
  $createCardNode,
  CardNode,
} from '../../src/plugins/CardExtension/CardNode';
import {PullQuoteExtension} from '../../src/plugins/PullQuoteExtension';
import {
  $createPullQuoteNode,
  PullQuoteNode,
} from '../../src/plugins/PullQuoteExtension/PullQuoteNode';

// These trees are decoded verbatim from the playground.lexical.dev #doc=
// payloads attached to facebook/lexical#8712, so the reproductions use the
// real host nodes (PullQuote / Card / SlotContainer) and the real
// HorizontalRuleNode rather than test stand-ins.
const Ext = defineExtension({
  $initialEditorState: null,
  dependencies: [PullQuoteExtension, CardExtension],
  name: '[slot-8712-repro]',
  nodes: [PullQuoteNode, CardNode, SlotContainerNode, HorizontalRuleNode],
});

function build(): LexicalEditorWithDispose {
  return buildEditorFromExtensions(Ext);
}

function $pullquoteWithQuote(container: SlotContainerNode): PullQuoteNode {
  return $createPullQuoteNode(
    container,
    $createParagraphNode().append($createTextNode('Arthur C. Clarke')),
  );
}

describe('#8712 reproductions (real playground nodes)', () => {
  // Regression guard: a HorizontalRule that is editable *content* inside the
  // slot-container (not the slot value itself) deletes through the normal
  // NodeSelection path. The slot value stays component-owned and is never
  // touched here. (The issue's "won't delete until Ctrl+C" symptom is in the
  // browser event path, not in deleteNodes — see the chat summary.)
  it('BUG1: deletes in-slot content (HR inside the slot-container)', () => {
    using editor = build();
    let hrKey = '';
    let containerKey = '';
    editor.update(
      () => {
        const container = $createSlotContainerNode();
        const hr = $createHorizontalRuleNode();
        container.append(hr);
        $getRoot().clear().append($pullquoteWithQuote(container));
        $getRoot().append($createParagraphNode());
        hrKey = hr.getKey();
        containerKey = container.getKey();
      },
      {discrete: true},
    );
    editor.update(
      () => {
        const sel = $createNodeSelection();
        sel.add(hrKey);
        $setSelection(sel);
        sel.deleteNodes();
      },
      {discrete: true},
    );
    editor.read(() => {
      expect(editor.getEditorState()._nodeMap.has(hrKey)).toBe(false);
      // the slot-container (the slot value) survives
      expect(editor.getEditorState()._nodeMap.has(containerKey)).toBe(true);
    });
  });

  // BUG 2: copying a HorizontalRule that is content inside the slot-container
  // returned an empty payload, because the exporters only walked the root (or,
  // for a RangeSelection, a slot frame) and never reached into the slot for a
  // NodeSelection. Fixed by $getSelectionTopLevelNodes.
  it('BUG2: copies in-slot content (HR inside the slot-container)', () => {
    using editor = build();
    let hrKey = '';
    editor.update(
      () => {
        const container = $createSlotContainerNode();
        container.append($createHorizontalRuleNode());
        $getRoot().clear().append($pullquoteWithQuote(container));
        hrKey = container.getFirstChild()!.getKey();
      },
      {discrete: true},
    );
    editor.read(() => {
      const sel = $createNodeSelection();
      sel.add(hrKey);
      const json = $generateJSONFromSelectedNodes(editor, sel);
      const html = $generateHtmlFromNodes(editor, sel);
      expect(json.nodes.length).toBeGreaterThan(0);
      expect(html.length).toBeGreaterThan(0);
      // the host's attribution slot stays out of an in-slot copy
      expect(JSON.stringify(json.nodes)).not.toContain('Arthur');
    });
  });

  // BUG 3: pasting a block decorator at a block cursor (an element point) in a
  // slot-container that already holds a decorator recursed forever, because the
  // insertNodes redirect called selectStart() on the leaf decorator, which
  // bounced back to the same element point. Fixed by seeding a paragraph.
  it('BUG3: pastes a HorizontalRule at a block cursor in the slot-container', () => {
    using editor = build();
    let containerKey = '';
    editor.update(
      () => {
        const container = $createSlotContainerNode();
        container.append($createHorizontalRuleNode());
        $getRoot().clear().append($pullquoteWithQuote(container));
        containerKey = container.getKey();
      },
      {discrete: true},
    );
    editor.update(
      () => {
        const sel = $createRangeSelection();
        sel.anchor.set(containerKey, 1, 'element');
        sel.focus.set(containerKey, 1, 'element');
        $setSelection(sel);
        expect(() =>
          $getSelection()!.insertNodes([$createHorizontalRuleNode()]),
        ).not.toThrow();
      },
      {discrete: true},
    );
  });

  // BUG 4: the #8712 repro had bare text directly inside the slot-container
  // ([text, hr]) — an invalid state (a shadow root cannot hold inline content)
  // that then crashed SELECT_ALL in getTopLevelElementOrThrow. The fix
  // prevents the state at the source: typing before a block decorator in a
  // shadow-root container wraps the text in a paragraph, so the tree stays
  // [paragraph, hr] and SELECT_ALL works.
  it('BUG4: typing before a decorator in a slot-container wraps text in a block', () => {
    using editor = build();
    let containerKey = '';
    editor.update(
      () => {
        const container = $createSlotContainerNode();
        container.append($createHorizontalRuleNode());
        $getRoot().clear().append($pullquoteWithQuote(container));
        containerKey = container.getKey();
      },
      {discrete: true},
    );
    // type "hello" at the leading edge (an element point before the hr)
    editor.update(
      () => {
        const sel = $createRangeSelection();
        sel.anchor.set(containerKey, 0, 'element');
        sel.focus.set(containerKey, 0, 'element');
        $setSelection(sel);
        const s = $getSelection();
        if ($isRangeSelection(s)) {
          s.insertText('hello');
        }
      },
      {discrete: true},
    );
    editor.read(() => {
      const container = $getRoot().getFirstChild();
      const slot = $getSlot(container!, 'quote')!;
      // text is wrapped in a block, never a bare child of the shadow root
      expect(
        (slot as SlotContainerNode).getChildren().map(c => c.getType()),
      ).toEqual(['paragraph', 'horizontalrule']);
    });
    // SELECT_ALL on the now-valid tree does not throw
    editor.update(
      () => {
        const container = $getRoot().getFirstChild();
        const slot = $getSlot(container!, 'quote') as SlotContainerNode;
        const para = slot.getFirstChild();
        assert($isElementNode(para), 'wrapped text must live in a block');
        const text = para.getFirstChild()!;
        const sel = $createRangeSelection();
        sel.anchor.set(text.getKey(), 1, 'text');
        sel.focus.set(text.getKey(), 1, 'text');
        $setSelection(sel);
        const cur = $getSelection();
        expect(() =>
          $selectAll($isRangeSelection(cur) ? cur : null),
        ).not.toThrow();
      },
      {discrete: true},
    );
  });

  // Regression guard: backspacing in an empty paragraph after a Card (an
  // ElementNode host that holds content only in slots + body) leaves the Card
  // and its slot intact — its slot-aware isEmpty() and the shadow-root branch
  // in deleteCharacter already protect it.
  it('BUG5: backspace after a Card keeps the Card and its slot', () => {
    using editor = build();
    let cardKey = '';
    editor.update(
      () => {
        const card = $createCardNode();
        $getRoot().clear().append(card);
        const trailing = $createParagraphNode();
        $getRoot().append(trailing);
        cardKey = card.getKey();
        trailing.selectStart();
      },
      {discrete: true},
    );
    editor.update(
      () => {
        const s = $getSelection();
        if ($isRangeSelection(s)) {
          s.deleteCharacter(true);
        }
      },
      {discrete: true},
    );
    editor.read(() => {
      expect(editor.getEditorState()._nodeMap.has(cardKey)).toBe(true);
      const card = $getRoot().getFirstChild();
      expect(card).not.toBeNull();
      expect($getSlot(card!, 'title')).not.toBeNull();
    });
  });
});
