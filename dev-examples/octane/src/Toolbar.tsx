/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import type {ToolbarState} from './editor';

import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/extension';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

import {useSignal} from './octane-bridge';
import {INSERT_REVIEW_CARD_COMMAND} from './ReviewCardExtension';

function Divider() {
  return <span className="octane-toolbar-divider" />;
}

interface ToolbarProps {
  editor: LexicalEditor;
  toolbar: ToolbarState;
}

/**
 * The in-editor toolbar, rendered by Octane. It holds no local state: it reads
 * the four format flags and the undo/redo availability straight from the
 * `ToolbarStateExtension`'s signals through the `useSignal` bridge, and turns
 * clicks into editor commands. Because the state lives in the extension, the
 * exact same signals could drive a React, Svelte or vanilla toolbar unchanged.
 */
export function Toolbar({editor, toolbar}: ToolbarProps) {
  const canUndo = useSignal(toolbar.canUndo);
  const canRedo = useSignal(toolbar.canRedo);
  const isBold = useSignal(toolbar.isBold);
  const isItalic = useSignal(toolbar.isItalic);
  const isUnderline = useSignal(toolbar.isUnderline);
  const isStrikethrough = useSignal(toolbar.isStrikethrough);

  return (
    <div className="octane-toolbar" role="toolbar" aria-label="Formatting">
      <button
        type="button"
        className="octane-toolbar-item"
        disabled={!canUndo}
        aria-label="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        ↶
      </button>
      <button
        type="button"
        className="octane-toolbar-item"
        disabled={!canRedo}
        aria-label="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        ↷
      </button>
      <Divider />
      <button
        type="button"
        className={
          isBold ? 'octane-toolbar-item active' : 'octane-toolbar-item'
        }
        aria-label="Bold"
        aria-pressed={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        <b>B</b>
      </button>
      <button
        type="button"
        className={
          isItalic ? 'octane-toolbar-item active' : 'octane-toolbar-item'
        }
        aria-label="Italic"
        aria-pressed={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        <i>I</i>
      </button>
      <button
        type="button"
        className={
          isUnderline ? 'octane-toolbar-item active' : 'octane-toolbar-item'
        }
        aria-label="Underline"
        aria-pressed={isUnderline}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        }>
        <u>U</u>
      </button>
      <button
        type="button"
        className={
          isStrikethrough ? 'octane-toolbar-item active' : 'octane-toolbar-item'
        }
        aria-label="Strikethrough"
        aria-pressed={isStrikethrough}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }>
        <s>S</s>
      </button>
      <Divider />
      <button
        type="button"
        className="octane-toolbar-item"
        aria-label="Bulleted list"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }>
        •
      </button>
      <button
        type="button"
        className="octane-toolbar-item"
        aria-label="Numbered list"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }>
        1.
      </button>
      <button
        type="button"
        className="octane-toolbar-item"
        aria-label="Check list"
        onClick={() =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }>
        ☑
      </button>
      <button
        type="button"
        className="octane-toolbar-item"
        aria-label="Horizontal rule"
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }>
        ─
      </button>
      <Divider />
      <button
        type="button"
        className="octane-toolbar-item octane-toolbar-insert"
        onClick={() =>
          editor.dispatchCommand(INSERT_REVIEW_CARD_COMMAND, undefined)
        }>
        ★ Review card
      </button>
    </div>
  );
}
