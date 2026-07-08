/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {KeyboardShortcutMatch} from '@lexical/extension';

import {IS_APPLE} from 'lexical';

//disable eslint sorting rule for quick reference to shortcuts
/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SHORTCUTS = Object.freeze({
  // (Ctrl|⌘) + (Alt|Option) + <key> shortcuts
  NORMAL: IS_APPLE ? '⌘+Opt+0' : 'Ctrl+Alt+0',
  HEADING1: IS_APPLE ? '⌘+Opt+1' : 'Ctrl+Alt+1',
  HEADING2: IS_APPLE ? '⌘+Opt+2' : 'Ctrl+Alt+2',
  HEADING3: IS_APPLE ? '⌘+Opt+3' : 'Ctrl+Alt+3',
  NUMBERED_LIST: IS_APPLE ? '⌘+Shift+7' : 'Ctrl+Shift+7',
  BULLET_LIST: IS_APPLE ? '⌘+Shift+8' : 'Ctrl+Shift+8',
  CHECK_LIST: IS_APPLE ? '⌘+Shift+9' : 'Ctrl+Shift+9',
  CODE_BLOCK: IS_APPLE ? '⌘+Opt+C' : 'Ctrl+Alt+C',
  QUOTE: IS_APPLE ? '⌃+Shift+Q' : 'Ctrl+Shift+Q',
  ADD_COMMENT: IS_APPLE ? '⌘+Opt+M' : 'Ctrl+Alt+M',

  // (Ctrl|⌘) + Shift + <key> shortcuts
  INCREASE_FONT_SIZE: IS_APPLE ? '⌘+Shift+.' : 'Ctrl+Shift+.',
  DECREASE_FONT_SIZE: IS_APPLE ? '⌘+Shift+,' : 'Ctrl+Shift+,',
  INSERT_CODE_BLOCK: IS_APPLE ? '⌘+Shift+C' : 'Ctrl+Shift+C',
  STRIKETHROUGH: IS_APPLE ? '⌘+Shift+X' : 'Ctrl+Shift+X',
  LOWERCASE: IS_APPLE ? '⌃+Shift+1' : 'Ctrl+Shift+1',
  UPPERCASE: IS_APPLE ? '⌃+Shift+2' : 'Ctrl+Shift+2',
  CAPITALIZE: IS_APPLE ? '⌃+Shift+3' : 'Ctrl+Shift+3',
  CENTER_ALIGN: IS_APPLE ? '⌘+Shift+E' : 'Ctrl+Shift+E',
  JUSTIFY_ALIGN: IS_APPLE ? '⌘+Shift+J' : 'Ctrl+Shift+J',
  LEFT_ALIGN: IS_APPLE ? '⌘+Shift+L' : 'Ctrl+Shift+L',
  RIGHT_ALIGN: IS_APPLE ? '⌘+Shift+R' : 'Ctrl+Shift+R',

  // (Ctrl|⌘) + <key> shortcuts
  SUBSCRIPT: IS_APPLE ? '⌘+,' : 'Ctrl+,',
  SUPERSCRIPT: IS_APPLE ? '⌘+.' : 'Ctrl+.',
  INDENT: IS_APPLE ? '⌘+]' : 'Ctrl+]',
  OUTDENT: IS_APPLE ? '⌘+[' : 'Ctrl+[',
  CLEAR_FORMATTING: IS_APPLE ? '⌘+\\' : 'Ctrl+\\',
  REDO: IS_APPLE ? '⌘+Shift+Z' : 'Ctrl+Y',
  UNDO: IS_APPLE ? '⌘+Z' : 'Ctrl+Z',
  BOLD: IS_APPLE ? '⌘+B' : 'Ctrl+B',
  ITALIC: IS_APPLE ? '⌘+I' : 'Ctrl+I',
  UNDERLINE: IS_APPLE ? '⌘+U' : 'Ctrl+U',
  INSERT_LINK: IS_APPLE ? '⌘+K' : 'Ctrl+K',
});

const CONTROL_OR_META = {ctrlKey: !IS_APPLE, metaKey: IS_APPLE};
const CONTROL_OR_META_ALT = {...CONTROL_OR_META, altKey: true};
const CONTROL_OR_META_SHIFT = {...CONTROL_OR_META, shiftKey: true};
const CONTROL_SHIFT = {ctrlKey: true, shiftKey: true};

/**
 * The key bindings for the shortcuts that ShortcutsPlugin handles (a subset
 * of the {@link SHORTCUTS} display strings above; the rest are handled by
 * the rich-text and history extensions). This table is compiled down to an
 * O(1) dispatch by key and modifiers with
 * {@link registerKeyboardShortcuts}.
 */
export const SHORTCUT_BINDINGS = Object.freeze({
  NORMAL: {key: '0', modifiers: CONTROL_OR_META_ALT},
  HEADING1: {key: '1', modifiers: CONTROL_OR_META_ALT},
  HEADING2: {key: '2', modifiers: CONTROL_OR_META_ALT},
  HEADING3: {key: '3', modifiers: CONTROL_OR_META_ALT},
  NUMBERED_LIST: {key: '7', modifiers: CONTROL_OR_META_SHIFT},
  BULLET_LIST: {key: '8', modifiers: CONTROL_OR_META_SHIFT},
  CHECK_LIST: {key: '9', modifiers: CONTROL_OR_META_SHIFT},
  CODE_BLOCK: {key: 'c', modifiers: CONTROL_OR_META_ALT},
  QUOTE: {key: 'q', modifiers: CONTROL_SHIFT},
  ADD_COMMENT: {key: 'm', modifiers: CONTROL_OR_META_ALT},

  INCREASE_FONT_SIZE: {key: '>', modifiers: CONTROL_OR_META_SHIFT},
  DECREASE_FONT_SIZE: {key: '<', modifiers: CONTROL_OR_META_SHIFT},
  INSERT_CODE_BLOCK: {key: 'c', modifiers: CONTROL_OR_META_SHIFT},
  STRIKETHROUGH: {key: 'x', modifiers: CONTROL_OR_META_SHIFT},
  LOWERCASE: {key: '1', modifiers: CONTROL_SHIFT},
  UPPERCASE: {key: '2', modifiers: CONTROL_SHIFT},
  CAPITALIZE: {key: '3', modifiers: CONTROL_SHIFT},
  CENTER_ALIGN: {key: 'e', modifiers: CONTROL_OR_META_SHIFT},
  JUSTIFY_ALIGN: {key: 'j', modifiers: CONTROL_OR_META_SHIFT},
  LEFT_ALIGN: {key: 'l', modifiers: CONTROL_OR_META_SHIFT},
  RIGHT_ALIGN: {key: 'r', modifiers: CONTROL_OR_META_SHIFT},

  SUBSCRIPT: {key: ',', modifiers: CONTROL_OR_META},
  SUPERSCRIPT: {key: '.', modifiers: CONTROL_OR_META},
  INDENT: {key: ']', modifiers: CONTROL_OR_META},
  OUTDENT: {key: '[', modifiers: CONTROL_OR_META},
  CLEAR_FORMATTING: {key: '\\', modifiers: CONTROL_OR_META},
  INSERT_LINK: {key: 'k', modifiers: CONTROL_OR_META},
}) satisfies Record<string, KeyboardShortcutMatch>;
