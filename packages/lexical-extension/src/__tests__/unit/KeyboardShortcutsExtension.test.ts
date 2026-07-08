/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  compileKeyboardShortcuts,
  getExtensionDependencyFromEditor,
  type KeyboardShortcut,
  KeyboardShortcutsExtension,
  registerKeyboardShortcuts,
} from '@lexical/extension';
import {
  configExtension,
  defineExtension,
  isExactShortcutMatch,
  KEY_DOWN_COMMAND,
  type KeyboardEventModifierMask,
  type KeyboardEventModifiers,
} from 'lexical';
import {describe, expect, test, vi} from 'vitest';

function makeEvent(
  key: string,
  code: string,
  bits: number,
): KeyboardEventModifiers {
  return {
    altKey: Boolean(bits & 1),
    code,
    ctrlKey: Boolean(bits & 2),
    key,
    metaKey: Boolean(bits & 4),
    shiftKey: Boolean(bits & 8),
  };
}

function keyboardEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', {cancelable: true, ...init});
}

describe('compileKeyboardShortcuts', () => {
  // Every (key, code) pair crossed with all 16 modifier states, covering
  // exact key matches, case-insensitivity, and the event.code fallback for
  // non-Latin layouts (Cyrillic letter, Arabic-Indic digit)
  const EVENT_KEYS: [string, string][] = [
    ['b', 'KeyB'],
    ['B', 'KeyB'],
    ['б', 'KeyB'],
    ['1', 'Digit1'],
    ['!', 'Digit1'],
    ['١', 'Digit1'],
    ['Enter', 'Enter'],
    [',', 'Comma'],
    ['[', 'BracketLeft'],
    ['z', 'KeyZ'],
  ];
  const SHORTCUTS: [string, KeyboardEventModifierMask][] = [
    ['b', {ctrlKey: true}],
    ['B', {metaKey: true}],
    ['1', {altKey: true, ctrlKey: true}],
    ['Enter', {shiftKey: 'any'}],
    [',', {ctrlKey: true}],
    ['[', {}],
    ['z', {ctrlKey: true, shiftKey: 'any'}],
  ];

  test('matches exactly the events that isExactShortcutMatch matches', () => {
    for (const [key, modifiers] of SHORTCUTS) {
      const compiled = compileKeyboardShortcuts([{key, modifiers}]);
      for (const [eventKey, eventCode] of EVENT_KEYS) {
        for (let bits = 0; bits < 16; bits++) {
          const event = makeEvent(eventKey, eventCode, bits);
          expect(
            compiled.match(event) !== undefined,
            `key=${key} modifiers=${JSON.stringify(
              modifiers,
            )} event=${JSON.stringify(event)}`,
          ).toBe(isExactShortcutMatch(event, key, modifiers));
        }
      }
    }
  });

  test('matches returns all matching shortcuts in insertion order', () => {
    const first = {key: 'k', modifiers: {ctrlKey: true}, name: 'first'};
    const second = {
      key: 'K',
      modifiers: {ctrlKey: true, shiftKey: 'any'},
      name: 'second',
    } as const;
    const other = {key: 'j', modifiers: {ctrlKey: true}, name: 'other'};
    const compiled = compileKeyboardShortcuts([first, second, other]);
    expect([...compiled.matches(makeEvent('k', 'KeyK', 2))]).toEqual([
      first,
      second,
    ]);
    expect([...compiled.matches(makeEvent('K', 'KeyK', 2 | 8))]).toEqual([
      second,
    ]);
    expect([...compiled.matches(makeEvent('k', 'KeyK', 0))]).toEqual([]);
  });
});

function buildTestEditor(shortcuts: KeyboardShortcut[]) {
  return buildEditorFromExtensions(
    defineExtension({
      name: 'keyboard-shortcuts-test',
      register: editor => registerKeyboardShortcuts(editor, shortcuts),
    }),
  );
}

describe('registerKeyboardShortcuts', () => {
  test('dispatches to the matching handler and prevents default', () => {
    const bold = vi.fn().mockReturnValue(true);
    const italic = vi.fn().mockReturnValue(true);
    const editor = buildTestEditor([
      {handler: bold, key: 'b', modifiers: {ctrlKey: true}},
      {handler: italic, key: 'i', modifiers: {ctrlKey: true}},
    ]);
    const event = keyboardEvent({ctrlKey: true, key: 'b'});
    expect(editor.dispatchCommand(KEY_DOWN_COMMAND, event)).toBe(true);
    expect(bold).toHaveBeenCalledTimes(1);
    expect(italic).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    // No modifier match -> no handler (the event may still be handled by
    // the core $handleKeyDown listener at COMMAND_PRIORITY_EDITOR)
    const plain = keyboardEvent({key: 'b'});
    editor.dispatchCommand(KEY_DOWN_COMMAND, plain);
    expect(bold).toHaveBeenCalledTimes(1);
    editor.dispose();
  });

  test('falls through to the next matching shortcut when a handler returns false', () => {
    const skipped = vi.fn().mockReturnValue(false);
    const handled = vi.fn().mockReturnValue(true);
    const editor = buildTestEditor([
      {handler: skipped, key: 'k', modifiers: {ctrlKey: true}},
      {handler: handled, key: 'k', modifiers: {ctrlKey: true}},
    ]);
    const event = keyboardEvent({ctrlKey: true, key: 'k'});
    expect(editor.dispatchCommand(KEY_DOWN_COMMAND, event)).toBe(true);
    expect(skipped).toHaveBeenCalledTimes(1);
    expect(handled).toHaveBeenCalledTimes(1);
    editor.dispose();
  });

  test('respects preventDefault: false', () => {
    const handler = vi.fn().mockReturnValue(true);
    const editor = buildTestEditor([
      {
        handler,
        key: 'b',
        modifiers: {ctrlKey: true},
        preventDefault: false,
      },
    ]);
    const event = keyboardEvent({ctrlKey: true, key: 'b'});
    expect(editor.dispatchCommand(KEY_DOWN_COMMAND, event)).toBe(true);
    expect(event.defaultPrevented).toBe(false);
    editor.dispose();
  });
});

describe('KeyboardShortcutsExtension', () => {
  test('dispatches configured shortcuts', () => {
    const bold = vi.fn().mockReturnValue(true);
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(KeyboardShortcutsExtension, {
            shortcuts: {
              bold: {handler: bold, key: 'b', modifiers: {ctrlKey: true}},
            },
          }),
        ],
        name: 'extension-test',
      }),
    );
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({ctrlKey: true, key: 'b'}),
    );
    expect(bold).toHaveBeenCalledTimes(1);
    editor.dispose();
  });

  test('overlays merge by name: add, remap, and disable', () => {
    const bold = vi.fn().mockReturnValue(true);
    const italic = vi.fn().mockReturnValue(true);
    const custom = vi.fn().mockReturnValue(true);
    const remappedBold = vi.fn().mockReturnValue(true);
    const BaseExtension = defineExtension({
      dependencies: [
        configExtension(KeyboardShortcutsExtension, {
          shortcuts: {
            bold: {handler: bold, key: 'b', modifiers: {ctrlKey: true}},
            italic: {handler: italic, key: 'i', modifiers: {ctrlKey: true}},
          },
        }),
      ],
      name: 'base-shortcuts',
    });
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          BaseExtension,
          configExtension(KeyboardShortcutsExtension, {
            shortcuts: {
              // remap bold to a different key and handler
              bold: {
                handler: remappedBold,
                key: 'b',
                modifiers: {ctrlKey: true, shiftKey: true},
              },
              // add a new shortcut
              custom: {handler: custom, key: 'm', modifiers: {altKey: true}},
              // disable italic
              italic: null,
            },
          }),
        ],
        name: 'overlay-test',
      }),
    );
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({ctrlKey: true, key: 'b'}),
    );
    expect(bold).not.toHaveBeenCalled();
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({ctrlKey: true, key: 'b', shiftKey: true}),
    );
    expect(remappedBold).toHaveBeenCalledTimes(1);
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({ctrlKey: true, key: 'i'}),
    );
    expect(italic).not.toHaveBeenCalled();
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({altKey: true, key: 'm'}),
    );
    expect(custom).toHaveBeenCalledTimes(1);
    editor.dispose();
  });

  test('shortcuts can be remapped and disabled at runtime through the output signals', () => {
    const bold = vi.fn().mockReturnValue(true);
    const remapped = vi.fn().mockReturnValue(true);
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(KeyboardShortcutsExtension, {
            shortcuts: {
              bold: {handler: bold, key: 'b', modifiers: {ctrlKey: true}},
            },
          }),
        ],
        name: 'runtime-remap-test',
      }),
    );
    const {output} = getExtensionDependencyFromEditor(
      editor,
      KeyboardShortcutsExtension,
    );
    output.shortcuts.value = {
      ...output.shortcuts.value,
      bold: {handler: remapped, key: 'b', modifiers: {metaKey: true}},
    };
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({ctrlKey: true, key: 'b'}),
    );
    expect(bold).not.toHaveBeenCalled();
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({key: 'b', metaKey: true}),
    );
    expect(remapped).toHaveBeenCalledTimes(1);

    output.disabled.value = true;
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      keyboardEvent({key: 'b', metaKey: true}),
    );
    expect(remapped).toHaveBeenCalledTimes(1);
    editor.dispose();
  });
});
