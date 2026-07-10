/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$appendNodeToHTML} from '@lexical/html';
import {
  $create,
  $createParagraphNode,
  $getSlot,
  $getState,
  $isElementNode,
  $setSlot,
  $setState,
  createState,
  type DOMExportOutput,
  type EditorConfig,
  type ElementDOMSlot,
  ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type NodeStateVersion,
} from 'lexical';

// Whether the section is expanded, stored as NodeState (rather than a bespoke
// serialized field) so it rides copy/paste, undo, and JSON for free. The
// default is open so freshly inserted collapsibles show their content;
// markdown `<details>` without the `open` attribute imports as closed.
const collapsibleOpenState = createState('open', {
  parse: (v): boolean => (typeof v === 'boolean' ? v : true),
});

/**
 * The collapsible section demonstrated by this example: an ElementNode host
 * whose *summary* line lives in a named slot (its own isolated single-line
 * editable region, see the named-slots docs) while the collapsed body is the
 * node's regular children channel. In Markdown it round-trips through the
 * GFM-style raw HTML encoding:
 *
 * ```
 * <details><summary>
 * The *summary* line
 * </summary>
 *
 * The body blocks
 * </details>
 * ```
 *
 * See `MdastCollapsibleExtension` for the mdast wiring.
 */
export class CollapsibleNode extends ElementNode {
  $config() {
    return this.config('collapsible', {
      // The body must always have a block to put the caret in; the summary
      // slot needs no equivalent because a slot value is never removed by
      // editing within it.
      $transform(node: CollapsibleNode) {
        if (node.isEmpty()) {
          node.append($createParagraphNode());
        }
      },
      extends: ElementNode,
      slots: ['summary'],
      stateConfigs: [{flat: true, stateConfig: collapsibleOpenState}],
    });
  }

  getOpen(version?: NodeStateVersion): boolean {
    return $getState(this, collapsibleOpenState, version);
  }

  setOpen(open: boolean): this {
    return $setState(this, collapsibleOpenState, open);
  }

  toggleOpen(): this {
    return this.setOpen(!this.getOpen());
  }

  // Block-level inserts (and the markdown shortcut transforms) land in the
  // body instead of splitting the collapsible, and selection helpers treat
  // the body like a nested document.
  isShadowRoot(): true {
    return true;
  }

  // The host DOM is a styled stand-in for `<details>`: a summary row of
  // chrome (the toggle chevron plus the revealed `summary` slot container)
  // followed by a content element the children channel renders into (see
  // getDOMSlot). A real `<details>` element is deliberately not used —
  // native summary activation inside contentEditable is inconsistent
  // across browsers — so the chevron drives the model state and CSS hides
  // the content element when closed.
  createDOM(_config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('div');
    dom.className = 'collapsible-container';
    if (this.getOpen()) {
      dom.setAttribute('data-open', 'true');
    }
    const row = document.createElement('div');
    row.className = 'collapsible-summary-row';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'collapsible-toggle';
    // Chrome, not content: keep the caret out of the button.
    toggle.contentEditable = 'false';
    toggle.setAttribute('aria-label', 'Toggle collapsible section');
    toggle.addEventListener('click', event => {
      event.preventDefault();
      editor.update(() => {
        this.getLatest().toggleOpen();
      });
    });
    row.appendChild(toggle);
    dom.appendChild(row);
    const content = document.createElement('div');
    content.className = 'collapsible-content';
    dom.appendChild(content);
    return dom;
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    const open = this.getOpen();
    if (open !== prevNode.getOpen('direct')) {
      if (open) {
        dom.setAttribute('data-open', 'true');
      } else {
        dom.removeAttribute('data-open');
      }
    }
    return false;
  }

  // The linked-list children (the body blocks) render into the content
  // element rather than the host, so the summary row stays chrome. When the
  // reconciler asks about the summary slot's own subtree it passes the slot
  // container as `element`; the `:scope >` query misses there and falls back
  // to the default slot, which is exactly right.
  getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLElement> {
    const content = element.querySelector<HTMLElement>(
      ':scope > .collapsible-content',
    );
    const domSlot = super.getDOMSlot(element);
    return content !== null ? domSlot.withElement(content) : domSlot;
  }

  // HTML export mirrors the GFM encoding: a real `<details>`/`<summary>`.
  // Slots ride a separate Map, so the exporter never descends into them on
  // its own — emit the summary explicitly; the body children serialize
  // through the normal child path into this element.
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('details');
    if (this.getOpen()) {
      element.setAttribute('open', '');
    }
    const summary = $getSlot(this, 'summary');
    if ($isElementNode(summary)) {
      const summaryElement = document.createElement('summary');
      $appendNodeToHTML(editor, summary, summaryElement);
      element.append(summaryElement);
    }
    return {element};
  }
}

export function $createCollapsibleNode(open: boolean = true): CollapsibleNode {
  const node = $create(CollapsibleNode).setOpen(open);
  // Single-line summary: the bare paragraph IS the slot value (the slot link
  // itself is the virtual shadow root, no container wrapper needed).
  $setSlot(node, 'summary', $createParagraphNode());
  node.append($createParagraphNode());
  return node;
}

export function $isCollapsibleNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleNode {
  return node instanceof CollapsibleNode;
}
