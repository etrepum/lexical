/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import './styles.css';

import {createRoot, hydrateRoot} from 'octane';

import {App} from './App';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Missing #root element');
}

// If the server prerendered the page into #root, hydrate and adopt it. Capture
// the prerendered editor HTML from the DOM first and pass it back in, so the
// client renders the same `dangerouslySetInnerHTML` and Octane adopts (rather
// than wipes) the server DOM during hydration; the App then hands it to Lexical.
// Otherwise this is a plain client-only SPA (e.g. `vite dev`), so create a fresh
// root that seeds the sample content.
if (container.firstElementChild !== null) {
  const input = container.querySelector('.octane-editor-input');
  const editorHtml = input === null ? '' : input.innerHTML;
  hydrateRoot(container, App, {editorHtml, hydrated: true});
} else {
  createRoot(container).render(App, {});
}
