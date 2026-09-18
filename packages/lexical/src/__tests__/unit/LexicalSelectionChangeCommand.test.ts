/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import {assert, describe, expect, onTestFinished, test, vi} from 'vitest';

describe('SELECTION_CHANGE_COMMAND', () => {
  test('reports committed selection changes without requiring DOM events', () => {
    using editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        $getRoot().append($createParagraphNode().append(text));
        text.select(2, 9);
      },
      {discrete: true},
    );

    const onSelectionChange = vi.fn(() => false);
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_LOW,
    );

    editor.update(
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        selection.removeText();
      },
      {discrete: true},
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    editor.update(
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        selection.insertText('y');
      },
      {discrete: true},
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    editor.update(() => $getRoot().selectEnd(), {discrete: true});
    expect(onSelectionChange).toHaveBeenCalledTimes(3);

    editor.update(
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        selection.toggleFormat('bold');
      },
      {discrete: true},
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(4);

    editor.update(
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        selection.setStyle('color: red');
      },
      {discrete: true},
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(5);

    // Dirtying the same selection or changing content without moving it is
    // not a selection change.
    editor.update(() => $setSelection($getSelection()!.clone()), {
      discrete: true,
    });
    editor.update(() => $getRoot().append($createParagraphNode()), {
      discrete: true,
    });
    expect(onSelectionChange).toHaveBeenCalledTimes(5);

    editor.update(
      () => {
        const selection = $createNodeSelection();
        selection.add($getRoot().getFirstChildOrThrow().getKey());
        $setSelection(selection);
      },
      {discrete: true},
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(6);

    editor.update(() => $setSelection(null), {discrete: true});
    expect(onSelectionChange).toHaveBeenCalledTimes(7);
    editor.update(() => $setSelection(null), {discrete: true});
    expect(onSelectionChange).toHaveBeenCalledTimes(7);
  });

  test('reports selection changes from setEditorState', () => {
    using editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        $getRoot().append($createParagraphNode().append(text));
        text.select(2, 9);
      },
      {discrete: true},
    );
    const previousState = editor.getEditorState();
    editor.update(() => $getRoot().selectEnd(), {discrete: true});

    const onSelectionChange = vi.fn(() => false);
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_LOW,
    );
    editor.setEditorState(previousState);
    editor.read(() => {});
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  test('listeners see the committed selection when DOM synchronization is skipped', () => {
    const root = document.createElement('div');
    root.contentEditable = 'true';
    document.body.appendChild(root);
    onTestFinished(() => root.remove());
    using editor = buildEditorFromExtensions();
    editor.setRootElement(root);
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        $getRoot().clear().append($createParagraphNode().append(text));
        text.select(1, 1);
      },
      {discrete: true},
    );

    const onSelectionChange = vi.fn(() => {
      const selection = $getSelection();
      assert($isRangeSelection(selection));
      expect([selection.anchor.offset, selection.focus.offset]).toEqual([3, 7]);
      return false;
    });
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_LOW,
    );
    editor.update(() => $getRoot().getAllTextNodes()[0].select(3, 7), {
      discrete: true,
      tag: SKIP_DOM_SELECTION_TAG,
    });
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    // Disposal clears the selection, which is a separate notification.
    unregister();
  });

  test('notifies a selection change made by a command listener', () => {
    using editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        $getRoot().append($createParagraphNode().append(text));
        text.select(1, 1);
      },
      {discrete: true},
    );
    const offsets: number[] = [];
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        offsets.push(selection.anchor.offset);
        if (selection.anchor.offset === 3) {
          $getRoot().getAllTextNodes()[0].select(4, 4);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    editor.update(() => $getRoot().getAllTextNodes()[0].select(3, 3), {
      discrete: true,
    });
    editor.read(() => {});
    expect(offsets).toEqual([3, 4]);
  });

  test('notifies once for batched changes and skips a batch with no net change', () => {
    using editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        $getRoot().append($createParagraphNode().append(text));
        text.select(1, 1);
      },
      {discrete: true},
    );
    const onSelectionChange = vi.fn(() => false);
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_LOW,
    );
    editor.update(() => $getRoot().getAllTextNodes()[0].select(2, 2));
    editor.update(() => $getRoot().getAllTextNodes()[0].select(3, 3));
    editor.read(() => {});
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    editor.update(() => $getRoot().getAllTextNodes()[0].select(4, 4));
    editor.update(() => $getRoot().getAllTextNodes()[0].select(3, 3));
    editor.read(() => {});
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
