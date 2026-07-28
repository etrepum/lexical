/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import type {ToolbarState} from './editor';
import type {ReadableSignal} from '@lexical/extension';
import type {LexicalCommand, LexicalEditor, TextFormatType} from 'lexical';
import type {OctaneNode} from 'octane';

import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/extension';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND} from 'lexical';

import {useSignal} from './octane-bridge';
import {INSERT_REVIEW_CARD_COMMAND} from './ReviewCardExtension';

function Divider() {
  return <span className="octane-toolbar-divider" />;
}

/**
 * A history button. It subscribes to *only* its own `enabled` signal, so a
 * change to undo-availability re-renders this button alone — not the toolbar.
 */
function HistoryButton({
  editor,
  enabled,
  command,
  label,
  children,
}: {
  editor: LexicalEditor;
  enabled: ReadableSignal<boolean>;
  command: LexicalCommand<void>;
  label: string;
  children: OctaneNode;
}) {
  const canRun = useSignal(enabled);
  return (
    <button
      type="button"
      className="octane-toolbar-item octane-toolbar-icon"
      disabled={!canRun}
      aria-label={label}
      onClick={() => editor.dispatchCommand(command, undefined)}>
      {children}
    </button>
  );
}

/**
 * A text-format toggle. It subscribes to *only* its own `active` signal, so
 * flipping bold re-renders the Bold button and nothing else.
 */
function FormatButton({
  editor,
  active,
  format,
  label,
  children,
}: {
  editor: LexicalEditor;
  active: ReadableSignal<boolean>;
  format: TextFormatType;
  label: string;
  children: OctaneNode;
}) {
  const isActive = useSignal(active);
  return (
    <button
      type="button"
      className={
        isActive ? 'octane-toolbar-item active' : 'octane-toolbar-item'
      }
      aria-label={label}
      aria-pressed={isActive}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}>
      {children}
    </button>
  );
}

/** A stateless command button (no signal subscription). */
function CommandButton({
  editor,
  command,
  label,
  className = 'octane-toolbar-item',
  children,
}: {
  editor: LexicalEditor;
  command: LexicalCommand<void>;
  label: string;
  className?: string;
  children: OctaneNode;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => editor.dispatchCommand(command, undefined)}>
      {children}
    </button>
  );
}

interface ToolbarProps {
  editor: LexicalEditor;
  toolbar: ToolbarState;
}

/**
 * The in-editor toolbar, rendered by Octane. It holds no local state and — by
 * design — subscribes to no signals itself: each stateful button is its own
 * component that reads a single signal through the `useSignal` bridge, so a
 * selection or history change re-renders only the affected button. The state
 * lives entirely in the extensions (`ToolbarStateExtension`, which re-exposes
 * `HistoryExtension`'s `canUndo` / `canRedo`), so these same signals could drive
 * a React, Svelte or vanilla toolbar unchanged.
 */
export function Toolbar({editor, toolbar}: ToolbarProps) {
  return (
    <div className="octane-toolbar" role="toolbar" aria-label="Formatting">
      <HistoryButton
        editor={editor}
        enabled={toolbar.canUndo}
        command={UNDO_COMMAND}
        label="Undo">
        ↺
      </HistoryButton>
      <HistoryButton
        editor={editor}
        enabled={toolbar.canRedo}
        command={REDO_COMMAND}
        label="Redo">
        ↻
      </HistoryButton>
      <Divider />
      <FormatButton
        editor={editor}
        active={toolbar.isBold}
        format="bold"
        label="Bold">
        <b>B</b>
      </FormatButton>
      <FormatButton
        editor={editor}
        active={toolbar.isItalic}
        format="italic"
        label="Italic">
        <i>I</i>
      </FormatButton>
      <FormatButton
        editor={editor}
        active={toolbar.isUnderline}
        format="underline"
        label="Underline">
        <u>U</u>
      </FormatButton>
      <FormatButton
        editor={editor}
        active={toolbar.isStrikethrough}
        format="strikethrough"
        label="Strikethrough">
        <s>S</s>
      </FormatButton>
      <Divider />
      <CommandButton
        editor={editor}
        command={INSERT_UNORDERED_LIST_COMMAND}
        label="Bulleted list">
        •
      </CommandButton>
      <CommandButton
        editor={editor}
        command={INSERT_ORDERED_LIST_COMMAND}
        label="Numbered list">
        1.
      </CommandButton>
      <CommandButton
        editor={editor}
        command={INSERT_CHECK_LIST_COMMAND}
        label="Check list">
        ☑
      </CommandButton>
      <CommandButton
        editor={editor}
        command={INSERT_HORIZONTAL_RULE_COMMAND}
        label="Horizontal rule">
        ─
      </CommandButton>
      <Divider />
      <CommandButton
        editor={editor}
        command={INSERT_REVIEW_CARD_COMMAND}
        label="Insert review card"
        className="octane-toolbar-item octane-toolbar-insert">
        ★ Review card
      </CommandButton>
    </div>
  );
}
