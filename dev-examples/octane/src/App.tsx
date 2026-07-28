/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import type {OctaneEditor} from './editor';

import {useEffect, useRef, useState} from 'octane';

import {createReviewEditor} from './editor';
import {useSignal} from './octane-bridge';
import {Toolbar} from './Toolbar';

/** Live view of the editor's serialized state — proof the model round-trips. */
function StatePanel({context}: {context: OctaneEditor}) {
  const editorState = useSignal(context.editorState);
  return (
    <details className="octane-state" open={true}>
      <summary>Editor state (JSON)</summary>
      <pre className="octane-state-json">
        {JSON.stringify(editorState.toJSON(), undefined, 2)}
      </pre>
    </details>
  );
}

const PLACEHOLDER = 'The whole page is Octane, the editor is Lexical…';

export function App() {
  // The Lexical editor is created once, after the contenteditable host mounts.
  const [context, setContext] = useState<OctaneEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    const built = createReviewEditor(container);
    setContext(built);
    return () => built.editor.dispose();
  }, []);

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
        {context !== null ? (
          <Toolbar editor={context.editor} toolbar={context.toolbar} />
        ) : null}
        <div className="octane-editor-scroll">
          <div
            className="octane-editor-input"
            role="textbox"
            aria-placeholder={PLACEHOLDER}
            contentEditable={true}
            ref={containerRef}
          />
        </div>
      </div>

      {context !== null ? <StatePanel context={context} /> : null}
    </div>
  );
}
