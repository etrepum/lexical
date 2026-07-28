/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import type {OctaneEditor} from './editor';

import {useCallback, useEffect, useState} from 'octane';

import {createReviewEditor} from './editor';
import {$renderEditorTree} from './editorTree';
import {useEditorRead} from './octane-bridge';
import {Toolbar} from './Toolbar';

/**
 * A live, readable tree view of the editor state — easier to scan than raw JSON,
 * and it shows the ReviewCard's named slots and `rating` NodeState inline. It
 * re-renders on every commit via `useEditorRead`.
 */
function StatePanel({context}: {context: OctaneEditor}) {
  const tree = useEditorRead(context.editor, $renderEditorTree);
  return (
    <details className="octane-state" open={true}>
      <summary>Editor tree</summary>
      <pre className="octane-state-tree">{tree}</pre>
    </details>
  );
}

const PLACEHOLDER = 'The whole page is Octane, the editor is Lexical…';

export function App() {
  // The editor needs no DOM to be constructed, so build it synchronously on the
  // first render. The contenteditable host is attached later through the ref
  // callback below — no null-context flicker, no guards on the view.
  const [context] = useState<OctaneEditor>(createReviewEditor);

  // Attach/detach the editor's root element as the contenteditable mounts and
  // unmounts. The callback is stable (context never changes), so it doesn't
  // churn the root element on re-render.
  const rootRef = useCallback(
    (element: HTMLDivElement | null) => {
      context.editor.setRootElement(element);
    },
    [context],
  );

  useEffect(() => () => context.editor.dispose(), [context]);

  return (
    <div className="octane-page">
      <header className="octane-header">
        <h1>
          Lexical <span className="octane-times">×</span> Octane
        </h1>
        <p>
          A Lexical rich-text editor whose page shell, in-editor toolbar and an
          in-editor review card are all rendered with{' '}
          <a href="https://github.com/octanejs/octane">Octane</a>. The editor is
          assembled entirely from Lexical <strong>extensions</strong> (no
          plugins), the review card is a <strong>DecoratorNode</strong> using{' '}
          <strong>$config</strong>, <strong>NodeState</strong> and named{' '}
          <strong>slots</strong>, and pastes flow through the{' '}
          <strong>DOMImportExtension</strong> pipeline.
        </p>
      </header>

      <div className="octane-editor-shell">
        <Toolbar editor={context.editor} toolbar={context.toolbar} />
        <div className="octane-editor-scroll">
          <div
            className="octane-editor-input"
            role="textbox"
            aria-placeholder={PLACEHOLDER}
            contentEditable={true}
            ref={rootRef}
          />
        </div>
      </div>

      <StatePanel context={context} />
    </div>
  );
}
