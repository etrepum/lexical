/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {domOverride, DOMRenderExtension} from '@lexical/html';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  $isTextNode,
  $markSlotEditable,
  $setSlot,
  COLLABORATION_TAG,
  configExtension,
  DecoratorNode,
  type EditorConfig,
  type ElementDOMSlot,
  ElementNode,
  getDOMSelection,
  type LexicalEditor,
  type LexicalNode,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import {assert, describe, expect, onTestFinished, test} from 'vitest';

// A block decorator whose slot is revealed in place inside its DOM, so the
// slot's container is an editing host of its own, like the playground's
// Pull Quote.
class SlotHostNode extends DecoratorNode<null> {
  $config() {
    return this.config('test_scroll_slot_host', {
      extends: DecoratorNode,
      slots: ['body'],
    });
  }
  createDOM(): HTMLElement {
    return document.createElement('div');
  }
  updateDOM(): boolean {
    return false;
  }
  isInline(): boolean {
    return false;
  }
  decorate(): null {
    return null;
  }
}

class SlotValueNode extends ElementNode {
  $config() {
    return this.config('test_scroll_slot_value', {extends: ElementNode});
  }
  createDOM(): HTMLElement {
    return document.createElement('div');
  }
  updateDOM(): boolean {
    return false;
  }
  isShadowRoot(): boolean {
    return true;
  }
}

// An element whose children render into an editable island inside a
// non-editable shell, like the playground's Review body.
class IslandHostNode extends ElementNode {
  $config() {
    return this.config('test_scroll_island_host', {extends: ElementNode});
  }
  createDOM(_config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div');
    dom.contentEditable = 'false';
    const island = document.createElement('div');
    $markSlotEditable(island, editor);
    dom.appendChild(island);
    return dom;
  }
  updateDOM(): boolean {
    return false;
  }
  getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLElement> {
    return super
      .getDOMSlot(element)
      .withElement(element.firstElementChild as HTMLElement);
  }
  isShadowRoot(): boolean {
    return true;
  }
}

// A root that scrolls, with 30 lines of text above `$build`'s content and a
// line after it. Returns the key of the line `$build` puts the caret's target
// in.
function setUp($build: (line: ParagraphNode) => LexicalNode): {
  editor: LexicalEditor;
  root: HTMLElement;
  targetKey: string;
} {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  root.style.cssText =
    'height: 150px; overflow-y: auto; font: 16px monospace; line-height: 20px';
  document.body.appendChild(root);
  let targetKey = '';
  const editor = buildEditorFromExtensions({
    $initialEditorState: () => {
      const lines = Array.from({length: 30}, (_, i) =>
        $createParagraphNode().append($createTextNode(`line ${i + 1}`)),
      );
      const target = $createParagraphNode().append($createTextNode('target'));
      targetKey = target.getKey();
      $getRoot().append(
        ...lines,
        $build(target),
        $createParagraphNode().append($createTextNode('after')),
      );
      lines[0].selectStart();
    },
    dependencies: [
      RichTextExtension,
      configExtension(DOMRenderExtension, {
        overrides: [
          domOverride([SlotHostNode], {
            $getSlotTargetElement: (_node, _slotName, hostDom) => hostDom,
          }),
        ],
      }),
    ],
    name: '[slot-caret-scroll-into-view]',
    nodes: [SlotHostNode, SlotValueNode, IslandHostNode],
  });
  onTestFinished(() => {
    editor.dispose();
    root.remove();
  });
  editor.setRootElement(root);
  root.focus();
  root.scrollTop = 0;
  return {editor, root, targetKey};
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

// Whether the line the DOM caret is in lies inside the root's visible box,
// within a pixel: lines can sit on half pixels while scrollTop is whole, so a
// line scrolled to the bottom edge can end 0.5px past it (Firefox, and WebKit
// on macOS).
function isCaretInView(root: HTMLElement): boolean {
  const anchor = getDOMSelection(window)!.anchorNode!;
  const line = (
    anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor
  ) as HTMLElement;
  const caret = line.getBoundingClientRect();
  const view = root.getBoundingClientRect();
  return caret.top >= view.top - 1 && caret.bottom <= view.bottom + 1;
}

const PLACES: [string, (line: ParagraphNode) => LexicalNode][] = [
  ["the root's own text", line => line],
  [
    "a named slot's text",
    line => {
      const host = $create(SlotHostNode);
      $setSlot(host, 'body', $create(SlotValueNode).append(line));
      return host;
    },
  ],
  ["an editable island's text", line => $create(IslandHostNode).append(line)],
];

function $getTargetText(targetKey: string): TextNode {
  const line = $getNodeByKey(targetKey);
  assert($isElementNode(line));
  const text = line.getFirstDescendant();
  assert($isTextNode(text));
  return text;
}

describe('scrolling a caret moved in an update into view (#9279)', () => {
  test.each(PLACES)(
    'scrolls to a caret in %s far below',
    async (_where, $build) => {
      const {editor, root, targetKey} = setUp($build);
      expect(isCaretInView(root)).toBe(true);
      editor.update(
        () => {
          $getNodeByKey(targetKey)!.selectEnd();
        },
        {discrete: true},
      );
      await nextFrame();
      expect(getDOMSelection(window)!.anchorNode!.textContent).toBe('target');
      expect(isCaretInView(root)).toBe(true);
    },
  );
});

describe('a collaboration update with the caret in an editing host', () => {
  test.each(PLACES)(
    'keeps the DOM caret in step in %s',
    async (_where, $build) => {
      const {editor, targetKey} = setUp($build);
      editor.update(() => $getTargetText(targetKey).select(3, 3), {
        discrete: true,
      });
      await nextFrame();
      // A remote edit around the local caret. Wrapping the text makes the DOM
      // write cover the caret in every engine, which puts the DOM caret at 0.
      editor.update(
        () => {
          const text = $getTargetText(targetKey);
          text.setTextContent('XX' + text.getTextContent() + 'YY');
          text.select(5, 5);
        },
        {discrete: true, tag: COLLABORATION_TAG},
      );
      await nextFrame();
      const domSelection = getDOMSelection(window)!;
      expect(domSelection.anchorNode!.textContent).toBe('XXtargetYY');
      expect(domSelection.anchorOffset).toBe(5);
    },
  );
});
