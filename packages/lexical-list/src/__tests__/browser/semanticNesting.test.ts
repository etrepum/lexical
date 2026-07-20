/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  configExtension,
  TabIndentationExtension,
} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  $isWrapperListItemNode,
  CheckListExtension,
  ListExtension,
  type ListNode,
} from '@lexical/list';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  defineExtension,
  getDOMSelection,
  type LexicalEditor,
  type TextNode,
} from 'lexical';
import {$assertNodeType} from 'lexical/src/__tests__/utils/assert';
import {describe, expect, onTestFinished, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

/**
 * These tests drive a real Chromium contenteditable with actual keyboard
 * events (via CDP) against an editor in the semantic nested list
 * representation (`hasSemanticNesting`). The legacy dedicated-wrapper
 * structure existed in part because caret navigation across
 * `<li>text<ul>…</ul></li>` boundaries is native browser behavior that
 * cannot be exercised in jsdom, so navigation, selection, and deletion in
 * the semantic layout are asserted here against the browser's own caret.
 */

function mountSemanticEditor(): {
  editor: LexicalEditor;
  contentEditable: HTMLElement;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const contentEditable = document.createElement('div');
  contentEditable.contentEditable = 'true';
  container.appendChild(contentEditable);

  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        RichTextExtension,
        TabIndentationExtension,
        configExtension(ListExtension, {hasSemanticNesting: true}),
        CheckListExtension,
      ],
      name: 'semantic-list-browser-host',
      onError: error => {
        throw error;
      },
    }),
  );
  editor.setRootElement(contentEditable);

  onTestFinished(() => {
    editor.setRootElement(null);
    editor.dispose();
    document.body.removeChild(container);
  });

  return {contentEditable, editor};
}

/**
 * Semantic fixture:
 * <ul>
 *   <li>first item</li>
 *   <li>host item
 *     <ul><li>nested one</li><li>nested two</li></ul>
 *   </li>
 *   <li>last item</li>
 * </ul>
 */
function $createFixture(listType: 'bullet' | 'check' = 'bullet'): ListNode {
  return $createListNode(listType).append(
    $createListItemNode().append($createTextNode('first item')),
    $createListItemNode().append(
      $createTextNode('host item'),
      $createListNode(listType).append(
        $createListItemNode().append($createTextNode('nested one')),
        $createListItemNode().append($createTextNode('nested two')),
      ),
    ),
    $createListItemNode().append($createTextNode('last item')),
  );
}

function setUpFixture(
  editor: LexicalEditor,
  listType: 'bullet' | 'check' = 'bullet',
): void {
  editor.update(
    () => {
      $getRoot().clear().append($createFixture(listType));
    },
    {discrete: true},
  );
}

function $findTextNode(text: string): TextNode {
  const node = $getRoot()
    .getAllTextNodes()
    .find(textNode => textNode.getTextContent() === text);
  invariant(
    $isTextNode(node),
    `Expected to find a text node with content "${text}"`,
  );
  return node;
}

/**
 * Focus the editor and place a collapsed caret inside the text node with
 * the given content. Selection is set through the editor so the reconciled
 * DOM selection matches what a user would have after clicking there.
 */
function placeCaret(
  editor: LexicalEditor,
  contentEditable: HTMLElement,
  text: string,
  offset: number,
): void {
  contentEditable.focus();
  editor.update(
    () => {
      $findTextNode(text).select(offset, offset);
    },
    {discrete: true},
  );
}

/**
 * Real arrow-key caret movement updates the Lexical selection through an
 * async selectionchange event; wait until the editor selection agrees with
 * the DOM selection before asserting against it.
 */
async function domSelectionSettled(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
}

/** The text content and offset of the collapsed caret, per the browser. */
function readDOMCaret(contentEditable: HTMLElement): {
  text: string | null;
  offset: number;
} {
  const domSelection = getDOMSelection(window);
  invariant(
    domSelection !== null && domSelection.anchorNode !== null,
    'Expected a DOM selection',
  );
  invariant(
    contentEditable.contains(domSelection.anchorNode),
    'Expected the DOM selection to be inside the editor',
  );
  return {
    offset: domSelection.anchorOffset,
    text: domSelection.anchorNode.textContent,
  };
}

/** The Lexical caret as `[textContent, offset]` of its anchor text node. */
function readLexicalCaret(editor: LexicalEditor): [string, number] {
  return editor.read('force-commit', () => {
    const selection = $getSelection();
    invariant(
      $isRangeSelection(selection) && selection.isCollapsed(),
      'Expected a collapsed RangeSelection',
    );
    const anchorNode = selection.anchor.getNode();
    invariant(
      $isTextNode(anchorNode),
      'Expected the selection anchor to be a text node',
    );
    return [anchorNode.getTextContent(), selection.anchor.offset];
  });
}

function $rootList(): ListNode {
  return $assertNodeType($getRoot().getFirstChild(), $isListNode);
}

/** Rendered text of every row (li) in visual order, wrappers excluded. */
function $rowTexts(): string[] {
  const texts: string[] = [];
  const $collect = (list: ListNode): void => {
    for (const item of list.getChildren()) {
      if (!$isListItemNode(item)) {
        continue;
      }
      if (!$isWrapperListItemNode(item)) {
        texts.push(
          item
            .getChildren()
            .filter($isTextNode)
            .map(textNode => textNode.getTextContent())
            .join(''),
        );
      }
      for (const child of item.getChildren()) {
        if ($isListNode(child)) {
          $collect(child);
        }
      }
    }
  };
  $collect($rootList());
  return texts;
}

/** Asserts the fixture's semantic shape: no dedicated wrapper items. */
function $expectSemanticShape(editor: LexicalEditor): void {
  editor.read('force-commit', () => {
    const $checkList = (list: ListNode) => {
      for (const child of list.getChildren()) {
        expect($isListItemNode(child)).toBe(true);
        if ($isListItemNode(child)) {
          expect($isWrapperListItemNode(child)).toBe(false);
          for (const grandchild of child.getChildren()) {
            if ($isListNode(grandchild)) {
              $checkList(grandchild);
            }
          }
        }
      }
    };
    $checkList($rootList());
  });
}

describe('semantic nested list browser behavior', () => {
  test('renders the semantic DOM shape', () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    const hostLi = contentEditable.querySelectorAll(':scope > ul > li')[1];
    invariant(hostLi !== undefined, 'Expected a host <li>');
    // The nested <ul> lives inside the same <li> as the host row's text.
    expect(hostLi.textContent).toBe('host itemnested onenested two');
    expect(hostLi.querySelector(':scope > ul')).not.toBeNull();
    expect(contentEditable.querySelectorAll('li').length).toBe(5);
    $expectSemanticShape(editor);
  });

  test('typing goes into the host row, not the nested list', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'host item', 'host item'.length);

    await userEvent.keyboard('s!');

    editor.read('force-commit', () => {
      expect($rowTexts()).toEqual([
        'first item',
        'host items!',
        'nested one',
        'nested two',
        'last item',
      ]);
    });
    $expectSemanticShape(editor);
  });

  test('ArrowRight at the end of the host text enters the nested list', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'host item', 'host item'.length);

    await userEvent.keyboard('{ArrowRight}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable)).toEqual({
      offset: 0,
      text: 'nested one',
    });
    expect(readLexicalCaret(editor)).toEqual(['nested one', 0]);
  });

  test('ArrowLeft at the start of the first nested row returns to the host text', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'nested one', 0);

    await userEvent.keyboard('{ArrowLeft}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable)).toEqual({
      offset: 'host item'.length,
      text: 'host item',
    });
    expect(readLexicalCaret(editor)).toEqual(['host item', 'host item'.length]);
  });

  test('ArrowLeft at the start of a row below the nested list enters its last row', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'last item', 0);

    await userEvent.keyboard('{ArrowLeft}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable)).toEqual({
      offset: 'nested two'.length,
      text: 'nested two',
    });
  });

  test('ArrowDown from the host row lands in the first nested row', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'host item', 0);

    await userEvent.keyboard('{ArrowDown}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable).text).toBe('nested one');
  });

  test('ArrowUp from the first nested row returns to the host row', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'nested one', 0);

    await userEvent.keyboard('{ArrowUp}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable).text).toBe('host item');
  });

  test('ArrowUp from below the nested list lands in its last row', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'last item', 0);

    await userEvent.keyboard('{ArrowUp}');
    await domSelectionSettled();

    expect(readDOMCaret(contentEditable).text).toBe('nested two');
  });

  test('Backspace at the start of the first nested row outdents it, keeping the remaining rows nested', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'nested one', 0);

    await userEvent.keyboard('{Backspace}');

    // Matches the default representation: the row becomes a top-level item
    // and the rest of the nested list stays nested — now beneath it.
    editor.read('force-commit', () => {
      expect($rowTexts()).toEqual([
        'first item',
        'host item',
        'nested one',
        'nested two',
        'last item',
      ]);
      const rootListChildren = $rootList().getChildren();
      expect(rootListChildren.length).toBe(4);
      const outdentedRow = $assertNodeType(
        rootListChildren[2],
        $isListItemNode,
      );
      expect(
        outdentedRow
          .getChildren()
          .filter($isTextNode)
          .map(textNode => textNode.getTextContent())
          .join(''),
      ).toBe('nested one');
      const remainingList = $assertNodeType(
        outdentedRow.getChildren().find($isListNode),
        $isListNode,
      );
      expect(remainingList.getTextContent()).toBe('nested two');
    });
    $expectSemanticShape(editor);
    expect(readLexicalCaret(editor)).toEqual(['nested one', 0]);
  });

  test('deleting all of the host text keeps the row (not mistaken for a wrapper)', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    // Select the host row's inline text with the native selection, like a
    // user double-click-drag, and delete it.
    contentEditable.focus();
    editor.update(
      () => {
        const textNode = $findTextNode('host item');
        textNode.select(0, 'host item'.length);
      },
      {discrete: true},
    );

    await userEvent.keyboard('{Backspace}');

    editor.read('force-commit', () => {
      const rootListChildren = $rootList().getChildren();
      // The emptied row must survive as a row of its own: still three
      // top-level items, the middle one still hosting the nested list.
      expect(rootListChildren.length).toBe(3);
      const emptiedRow = $assertNodeType(rootListChildren[1], $isListItemNode);
      expect($isWrapperListItemNode(emptiedRow)).toBe(false);
      expect(emptiedRow.getChildren().filter($isListNode).length).toBe(1);
      expect($rowTexts()).toEqual([
        'first item',
        '',
        'nested one',
        'nested two',
        'last item',
      ]);
    });
  });

  test('Enter in the middle of the host text splits the row and keeps the nested list attached', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'host item', 'host'.length);

    await userEvent.keyboard('{Enter}');

    editor.read('force-commit', () => {
      expect($rowTexts()).toEqual([
        'first item',
        'host',
        ' item',
        'nested one',
        'nested two',
        'last item',
      ]);
      // The nested list follows the text that moved to the new row.
      const rootListChildren = $rootList().getChildren();
      expect(rootListChildren.length).toBe(4);
      const newRow = $assertNodeType(rootListChildren[2], $isListItemNode);
      expect(newRow.getChildren().filter($isListNode).length).toBe(1);
    });
    $expectSemanticShape(editor);
  });

  test('Tab indents a row into the previous row without creating a wrapper', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'last item', 0);

    await userEvent.keyboard('{Tab}');

    editor.read('force-commit', () => {
      // "last item" joins the host's nested list as its third row.
      const rootListChildren = $rootList().getChildren();
      expect(rootListChildren.length).toBe(2);
      const hostRow = $assertNodeType(rootListChildren[1], $isListItemNode);
      const nestedLists = hostRow.getChildren().filter($isListNode);
      expect(nestedLists.length).toBe(1);
      expect($rowTexts()).toEqual([
        'first item',
        'host item',
        'nested one',
        'nested two',
        'last item',
      ]);
    });
    $expectSemanticShape(editor);

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

    editor.read('force-commit', () => {
      expect($rootList().getChildren().length).toBe(3);
      expect($rowTexts()).toEqual([
        'first item',
        'host item',
        'nested one',
        'nested two',
        'last item',
      ]);
    });
    $expectSemanticShape(editor);
  });

  test('deleting a selection that crosses the host/nested boundary merges cleanly', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    // Select from the middle of "host item" to the middle of "nested one"
    // with the native selection, crossing the <li> text / nested <ul>
    // boundary, then delete.
    contentEditable.focus();
    editor.update(
      () => {
        const anchor = $findTextNode('host item');
        const focus = $findTextNode('nested one');
        const selection = $getSelection();
        invariant($isRangeSelection(selection), 'Expected a RangeSelection');
        selection.anchor.set(anchor.getKey(), 'host '.length, 'text');
        selection.focus.set(focus.getKey(), 'nested '.length, 'text');
      },
      {discrete: true},
    );

    await userEvent.keyboard('{Backspace}');

    // Matches the default representation for the same selection: the text in
    // the range is removed and the partially-deleted nested row keeps its own
    // row identity under the host.
    editor.read('force-commit', () => {
      expect($rowTexts()).toEqual([
        'first item',
        'host ',
        'one',
        'nested two',
        'last item',
      ]);
      const rootListChildren = $rootList().getChildren();
      expect(rootListChildren.length).toBe(3);
      const hostRow = $assertNodeType(rootListChildren[1], $isListItemNode);
      const nestedList = $assertNodeType(
        hostRow.getChildren().find($isListNode),
        $isListNode,
      );
      expect(nestedList.getChildrenSize()).toBe(2);
    });
    $expectSemanticShape(editor);
  });

  test('select-all then Backspace empties the editor without error', async () => {
    const {contentEditable, editor} = mountSemanticEditor();
    setUpFixture(editor);
    placeCaret(editor, contentEditable, 'host item', 0);

    await userEvent.keyboard('{Control>}a{/Control}');
    await domSelectionSettled();
    await userEvent.keyboard('{Backspace}');

    editor.read('force-commit', () => {
      expect($getRoot().getTextContent()).toBe('');
    });
  });

  describe('check lists', () => {
    /** Inline text of a row's own li, excluding any nested list content. */
    function inlineText(element: Element | null): string | null {
      if (element === null || element.tagName !== 'LI') {
        return null;
      }
      let text = '';
      for (const child of Array.from(element.childNodes)) {
        if (
          child instanceof HTMLElement &&
          (child.tagName === 'UL' || child.tagName === 'OL')
        ) {
          continue;
        }
        text += child.textContent ?? '';
      }
      return text;
    }

    function findRowLi(
      contentEditable: HTMLElement,
      text: string,
    ): HTMLElement {
      const li = Array.from(contentEditable.querySelectorAll('li')).find(
        candidate => inlineText(candidate) === text,
      );
      invariant(li !== undefined, `Expected a row <li> with text "${text}"`);
      return li;
    }

    /** The row's native checkbox input (first child of the li). */
    function rowCheckbox(li: HTMLElement): HTMLInputElement {
      const input = li.firstElementChild;
      invariant(
        input instanceof HTMLInputElement && input.type === 'checkbox',
        'Expected the row to render a native checkbox input',
      );
      return input;
    }

    /** The row li that owns checkbox focus, resolved from activeElement. */
    function focusedRow(): Element | null {
      const active = document.activeElement;
      return active instanceof HTMLInputElement ? active.parentElement : active;
    }

    /**
     * Enter checkbox focus mode the way a user does: click the row's native
     * checkbox input. The click handlers prevent the default caret placement
     * and native toggle, focus the input, and toggle through the editor.
     */
    async function clickCheckbox(li: HTMLElement): Promise<void> {
      await userEvent.click(rowCheckbox(li));
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(rowCheckbox(li));
      });
    }

    test('check rows render native checkbox inputs instead of ARIA emulation', () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      const hostLi = findRowLi(contentEditable, 'host item');
      const input = rowCheckbox(hostLi);
      expect(input.checked).toBe(false);
      // Accessible name: the input is labelled by its row li.
      expect(input.getAttribute('aria-labelledby')).toBe(hostLi.id);
      expect(hostLi.id).not.toBe('');
      expect(hostLi.getAttribute('role')).toBe(null);
      // aria-checked stays (inert without the role) so live-DOM HTML
      // captures keep their checked state importable.
      expect(hostLi.getAttribute('aria-checked')).toBe('false');
      // Every row (including nested ones) has one; 5 rows in the fixture.
      expect(
        contentEditable.querySelectorAll('li > input[type=checkbox]').length,
      ).toBe(5);
    });

    test('ArrowDown/ArrowUp move checkbox focus through the semantic nesting in visual order', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      // A user enters checkbox focus mode while editing, with the DOM and
      // editor selections in sync; without this, the first keydown
      // reconciles the never-applied editor selection and steals focus
      // from the row back to the editing host.
      placeCaret(editor, contentEditable, 'first item', 0);
      const hostLi = findRowLi(contentEditable, 'host item');
      await clickCheckbox(hostLi);

      // Into the first nested row inside the same <li>.
      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('nested one');
      });
      expect(document.activeElement).toBeInstanceOf(HTMLInputElement);

      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('nested two');
      });

      // Crossing back out of the nested list to the following top-level row.
      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('last item');
      });

      await userEvent.keyboard('{ArrowUp}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('nested two');
      });
    });

    test('ArrowLeft focuses the row checkbox from text start; ArrowRight returns to the text', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      // Caret at the very start of a check row's text.
      placeCaret(editor, contentEditable, 'first item', 0);
      const firstLi = findRowLi(contentEditable, 'first item');

      // ArrowLeft at offset 0 hands focus to the row's native checkbox.
      await userEvent.keyboard('{ArrowLeft}');
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(rowCheckbox(firstLi));
      });

      // ArrowRight is symmetric: focus goes back to the editor with the caret
      // at the row's text start, so focus is never stranded on the checkbox.
      await userEvent.keyboard('{ArrowRight}');
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(contentEditable);
      });
      expect(readLexicalCaret(editor)).toEqual(['first item', 0]);
    });

    test('ArrowRight after ArrowDown lands on the text of the row Down moved to', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      placeCaret(editor, contentEditable, 'first item', 0);

      // Enter checkbox focus, move it down a row, then exit with Right.
      await userEvent.keyboard('{ArrowLeft}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('first item');
      });
      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('host item');
      });
      await userEvent.keyboard('{ArrowRight}');
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(contentEditable);
      });
      // Not back on 'first item': Right follows the checkbox focus, which Down
      // moved, rather than a stale caret left on the original row.
      expect(readLexicalCaret(editor)).toEqual(['host item', 0]);
    });

    test('Left/Right round-trips leave a clean text caret (Left re-enters checkbox focus)', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      placeCaret(editor, contentEditable, 'first item', 0);
      const firstLi = findRowLi(contentEditable, 'first item');

      // Left (focus checkbox), Left (no-op, already focused), Right (back to
      // text), Left (must re-enter checkbox focus — not land on a stray
      // element selection before the checkbox).
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowRight}{ArrowLeft}');
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(rowCheckbox(firstLi));
      });
    });

    test('clicking and Space toggle only the host row checkbox, not the nested rows', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      placeCaret(editor, contentEditable, 'first item', 0);
      const hostLi = findRowLi(contentEditable, 'host item');

      const $checkedStates = () =>
        editor.read('force-commit', () => {
          const rootListChildren = $rootList().getChildren();
          const hostRow = $assertNodeType(rootListChildren[1], $isListItemNode);
          const nestedList = $assertNodeType(
            hostRow.getChildren().find($isListNode),
            $isListNode,
          );
          return {
            host: hostRow.getChecked() === true,
            nested: nestedList
              .getChildren()
              .map(row => $assertNodeType(row, $isListItemNode).getChecked()),
          };
        });

      await clickCheckbox(hostLi);
      expect($checkedStates()).toEqual({
        host: true,
        nested: [false, false],
      });
      // The DOM input tracks the editor state, not the native toggle.
      expect(rowCheckbox(hostLi).checked).toBe(true);

      // Space activates the focused input; the resulting click routes the
      // toggle through the editor exactly once.
      await userEvent.keyboard(' ');
      await vi.waitFor(() => {
        expect($checkedStates()).toEqual({
          host: false,
          nested: [false, false],
        });
      });
      expect(rowCheckbox(hostLi).checked).toBe(false);
    });

    test('emptying a check row keeps its checkbox input', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      contentEditable.focus();
      editor.update(
        () => {
          const textNode = $findTextNode('host item');
          textNode.select(0, 'host item'.length);
        },
        {discrete: true},
      );

      await userEvent.keyboard('{Backspace}');

      const listItems = Array.from(contentEditable.querySelectorAll('li'));
      expect(listItems.length).toBe(5);
      for (const li of listItems) {
        expect(li.firstElementChild?.nodeName).toBe('INPUT');
      }
    });

    test('clicking a themed ::before marker area toggles the row', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      // A theme that draws its own marker ahead of (or instead of) the
      // input; its area must stay a click target like in the ARIA mode.
      const style = document.createElement('style');
      style.textContent =
        'li:has(> input[type=checkbox])::before {' +
        "content: ''; display: inline-block; width: 24px; height: 20px;}";
      contentEditable.appendChild(style);
      setUpFixture(editor, 'check');
      placeCaret(editor, contentEditable, 'first item', 0);
      const hostLi = findRowLi(contentEditable, 'host item');

      // x=10 lands in the ::before region, so the event target is the li
      // itself, not the input.
      await userEvent.click(hostLi, {position: {x: 10, y: 10}});

      await vi.waitFor(() => {
        expect(rowCheckbox(hostLi).checked).toBe(true);
      });
      editor.read('force-commit', () => {
        const hostRow = $assertNodeType(
          $rootList().getChildren()[1],
          $isListItemNode,
        );
        expect(hostRow.getChecked()).toBe(true);
      });
      // Focus mode landed on the row's input.
      expect(document.activeElement).toBe(rowCheckbox(hostLi));
    });

    test('arrow navigation onto an emptied row anchors the selection on that row', async () => {
      const {contentEditable, editor} = mountSemanticEditor();
      setUpFixture(editor, 'check');
      // Empty the host row (it survives thanks to the semantic mark).
      editor.update(
        () => {
          $findTextNode('host item').remove();
        },
        {discrete: true},
      );
      placeCaret(editor, contentEditable, 'first item', 0);
      const firstLi = findRowLi(contentEditable, 'first item');
      await clickCheckbox(firstLi);

      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => {
        expect(inlineText(focusedRow())).toBe('');
      });
      // The selection agrees with checkbox focus: it is anchored on the
      // emptied row itself, not on the first nested row's text.
      editor.read('force-commit', () => {
        const selection = $getSelection();
        invariant($isRangeSelection(selection), 'Expected a range selection');
        const anchorNode = selection.anchor.getNode();
        expect(selection.anchor.type).toBe('element');
        expect($isListItemNode(anchorNode)).toBe(true);
        invariant($isListItemNode(anchorNode), 'expected a list item');
        expect($isListNode(anchorNode.getFirstChild())).toBe(true);
      });
    });
  });
});
