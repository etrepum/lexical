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

import {createReviewEditor, hydrateFromDOM} from './editor';
import {$renderEditorTree} from './editorTree';
import {useEditorRead} from './octane-bridge';
import {ReviewCardPortals} from './ReviewCardExtension';
import {Toolbar} from './Toolbar';

/**
 * A live, readable tree view of the editor state. It is rendered client-only:
 * the server editor is empty (the content is prerendered as HTML, not built as
 * a live model there), so a `mounted` gate keeps SSR and the first client render
 * identical (both empty) and fills the tree once the editor has hydrated.
 */
function StatePanel({context}: {context: OctaneEditor}) {
  const tree = useEditorRead(context.editor, $renderEditorTree);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <details className="octane-state" open={true}>
      <summary>Editor tree</summary>
      <pre className="octane-state-tree">{mounted ? tree : ''}</pre>
    </details>
  );
}

const PLACEHOLDER = 'The whole page is Octane, the editor is Lexical…';

export interface AppProps {
  // The prerendered editor content HTML. On the server it's the freshly
  // prerendered markup; on a hydrating client it's read back out of the DOM and
  // passed in so the client renders the SAME `dangerouslySetInnerHTML` — Octane
  // then adopts the server DOM during hydration instead of wiping it. Undefined
  // for a fresh (non-SSR) client.
  editorHtml?: string;
  // Client only: true when hydrating a server-rendered page (adopt the
  // prerendered DOM back into the model), undefined when booting a fresh SPA.
  hydrated?: boolean;
}

export function App({editorHtml, hydrated}: AppProps) {
  // Server and hydrating client build an EMPTY editor so their toolbar/tree
  // snapshots match; only a fresh (non-SSR) client seeds the sample content.
  const seedFresh = !hydrated && editorHtml === undefined;
  const [context] = useState<OctaneEditor>(() =>
    createReviewEditor(seedFresh ? undefined : null),
  );

  // Attach the contenteditable. When hydrating, first adopt the prerendered DOM
  // back into the model, then attach (which re-renders the now-populated state).
  const rootRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (element === null) {
        context.editor.setRootElement(null);
        return;
      }
      if (hydrated) {
        hydrateFromDOM(context.editor, element);
      }
      context.editor.setRootElement(element);
    },
    [context, hydrated],
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
          <a href="https://github.com/octanejs/octane">Octane</a> — server-side
          rendered and hydrated. The editor is assembled entirely from Lexical{' '}
          <strong>extensions</strong> (no plugins), the review card is a{' '}
          <strong>DecoratorNode</strong> using <strong>$config</strong>,{' '}
          <strong>NodeState</strong> and named <strong>slots</strong>, and the
          content is prerendered as HTML and hydrated back through the{' '}
          <strong>DOMImportExtension</strong> pipeline.
        </p>
      </header>

      <div className="octane-editor-shell">
        <Toolbar editor={context.editor} toolbar={context.toolbar} />
        <div className="octane-editor-scroll">
          {/* One element for every mode. On the server (and the hydrating
              client) `editorHtml` seeds the same innerHTML so Octane adopts the
              prerendered DOM rather than wiping it; the ref (client only) then
              hands the container to Lexical, which re-renders the model it
              reconstructed from that DOM. A fresh SPA passes `''` and seeds from
              the model instead. */}
          <div
            className="octane-editor-input"
            role="textbox"
            aria-placeholder={PLACEHOLDER}
            contentEditable={true}
            suppressHydrationWarning={true}
            ref={rootRef}
            dangerouslySetInnerHTML={{__html: editorHtml ?? ''}}
          />
        </div>
      </div>

      {/* Portals the Octane chrome into each live review card's host DOM.
          Empty on the server (no live cards there), so it adds nothing to the
          SSR output. */}
      <ReviewCardPortals editor={context.editor} />

      <StatePanel context={context} />
    </div>
  );
}
