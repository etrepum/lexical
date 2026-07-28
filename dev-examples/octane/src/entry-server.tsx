/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import {renderToString} from 'octane/server';

import {App} from './App';
import {prerenderEditorHtml} from './editor';

/**
 * Render the page to HTML for SSR / prerendering. The editor content is
 * prerendered headlessly to HTML and passed to the App, which injects it into
 * the contentEditable so the first paint shows the document; the client then
 * hydrates and adopts it.
 */
export async function render(): Promise<{html: string; css: string}> {
  const editorHtml = prerenderEditorHtml();
  const {html, css} = await renderToString(App, {editorHtml});
  return {css, html};
}
