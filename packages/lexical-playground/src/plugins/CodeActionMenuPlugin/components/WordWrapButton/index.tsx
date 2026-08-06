/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {$isCodeNode} from '@lexical/code';
import {$getNearestNodeFromDOMNode, type LexicalEditor} from 'lexical';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';

interface Props {
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

export function WordWrapButton({editor, getCodeDOMNode}: Props) {
  const [isWordWrap, setIsWordWrap] = useState(false);

  // The action menu is a single shared instance that moves between code
  // blocks, so the label must be derived from the currently hovered
  // node rather than tracked locally — otherwise it goes stale when the
  // menu moves to another block or when the node changes underneath us
  // (undo/redo, collaboration).
  const syncFromNode = useCallback(() => {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) {
      return;
    }
    editor.read('latest', () => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
      if ($isCodeNode(codeNode)) {
        setIsWordWrap(codeNode.getWordWrap());
      }
    });
  }, [editor, getCodeDOMNode]);

  useEffect(() => {
    syncFromNode();
    return editor.registerUpdateListener(syncFromNode);
  }, [editor, syncFromNode]);

  function handleClick(): void {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        codeNode.setWordWrap(!codeNode.getWordWrap());
      }
    });
  }

  return (
    <button
      className="menu-item"
      onClick={handleClick}
      aria-label="word wrap"
      title={isWordWrap ? 'Disable word wrap' : 'Enable word wrap'}>
      {isWordWrap ? '↩ unwrap' : '↩ wrap'}
    </button>
  );
}
