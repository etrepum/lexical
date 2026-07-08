/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  type KeyboardShortcut,
  registerKeyboardShortcuts,
} from '@lexical/extension';
import {TOGGLE_LINK_COMMAND} from '@lexical/link';
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  type LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import {type Dispatch, useEffect} from 'react';

import {useToolbarState} from '../../context/ToolbarContext';
import {sanitizeUrl} from '../../utils/url';
import {INSERT_INLINE_COMMAND} from '../CommentPlugin';
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
  updateFontSize,
  UpdateFontSizeType,
} from '../ToolbarPlugin/utils';
import {SHORTCUT_BINDINGS} from './shortcuts';

export default function ShortcutsPlugin({
  editor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  setIsLinkEditMode: Dispatch<boolean>;
}): null {
  const {toolbarState} = useToolbarState();

  useEffect(() => {
    // Pair each named key binding from SHORTCUT_BINDINGS with its action.
    // registerKeyboardShortcuts compiles the table down to a single
    // KEY_DOWN_COMMAND listener that dispatches by key and modifiers in
    // O(1), rather than testing every shortcut in sequence.
    const bind = (
      name: keyof typeof SHORTCUT_BINDINGS,
      action: () => void,
    ): KeyboardShortcut => ({
      ...SHORTCUT_BINDINGS[name],
      handler: () => {
        action();
        return true;
      },
    });
    return registerKeyboardShortcuts(
      editor,
      [
        bind('NORMAL', () => formatParagraph(editor)),
        bind('HEADING1', () =>
          formatHeading(editor, toolbarState.blockType, 'h1'),
        ),
        bind('HEADING2', () =>
          formatHeading(editor, toolbarState.blockType, 'h2'),
        ),
        bind('HEADING3', () =>
          formatHeading(editor, toolbarState.blockType, 'h3'),
        ),
        bind('NUMBERED_LIST', () =>
          formatNumberedList(editor, toolbarState.blockType),
        ),
        bind('BULLET_LIST', () =>
          formatBulletList(editor, toolbarState.blockType),
        ),
        bind('CHECK_LIST', () =>
          formatCheckList(editor, toolbarState.blockType),
        ),
        bind('CODE_BLOCK', () => formatCode(editor, toolbarState.blockType)),
        bind('QUOTE', () => formatQuote(editor, toolbarState.blockType)),
        bind('ADD_COMMENT', () =>
          editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined),
        ),
        bind('INCREASE_FONT_SIZE', () =>
          updateFontSize(
            editor,
            UpdateFontSizeType.increment,
            toolbarState.fontSizeInputValue,
          ),
        ),
        bind('DECREASE_FONT_SIZE', () =>
          updateFontSize(
            editor,
            UpdateFontSizeType.decrement,
            toolbarState.fontSizeInputValue,
          ),
        ),
        bind('INSERT_CODE_BLOCK', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'),
        ),
        bind('STRIKETHROUGH', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
        ),
        bind('LOWERCASE', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase'),
        ),
        bind('UPPERCASE', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase'),
        ),
        bind('CAPITALIZE', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize'),
        ),
        bind('CENTER_ALIGN', () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
        ),
        bind('JUSTIFY_ALIGN', () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
        ),
        bind('LEFT_ALIGN', () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
        ),
        bind('RIGHT_ALIGN', () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
        ),
        bind('SUBSCRIPT', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'),
        ),
        bind('SUPERSCRIPT', () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'),
        ),
        bind('INDENT', () =>
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined),
        ),
        bind('OUTDENT', () =>
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined),
        ),
        bind('CLEAR_FORMATTING', () => clearFormatting(editor)),
        bind('INSERT_LINK', () => {
          const url = toolbarState.isLink ? null : sanitizeUrl('https://');
          setIsLinkEditMode(!toolbarState.isLink);
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }),
      ],
      {priority: COMMAND_PRIORITY_NORMAL},
    );
  }, [
    editor,
    toolbarState.isLink,
    toolbarState.blockType,
    toolbarState.fontSizeInputValue,
    setIsLinkEditMode,
  ]);

  return null;
}
