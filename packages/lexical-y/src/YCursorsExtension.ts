/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {effect} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {createDOMRange, createRectsFromDOMRange} from '@lexical/selection';
import {defineExtension, type RangeSelection, safeCast} from 'lexical';

import {$resolveYSelection} from './Selection';
import {YAwarenessExtension, type YPresence} from './YAwarenessExtension';
import {YExtension} from './YExtension';

export interface YCursorContext {
  clientID: number;
  presence: YPresence;
  selection: RangeSelection;
  rects: DOMRect[];
  caret: DOMRect | null;
  /** Fixed-position overlay; all geometry uses viewport coordinates. */
  container: HTMLElement;
}

export interface YCursorsConfig {
  /** Mount the fixed-position overlay in this container in the root's document. */
  container: ((root: HTMLElement) => HTMLElement) | null;
  /** Called per peer on refresh. Returned cleanup runs before the next render. */
  renderCursor: ((context: YCursorContext) => void | (() => void)) | null;
  className: string;
  zIndex: number;
}

/** Optional DOM cursor rendering; the binding and awareness also run headlessly. */
export const YCursorsExtension = defineExtension({
  config: safeCast<YCursorsConfig>({
    className: 'lexical-y-cursors',
    container: null,
    renderCursor: null,
    zIndex: 1000,
  }),
  dependencies: [YExtension, YAwarenessExtension],
  name: '@lexical/y/Cursors',
  register(editor, config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const {peers} = state.getDependency(YAwarenessExtension).output;
    let unmount = () => {};
    const unregister = editor.registerRootListener(root => {
      unmount();
      unmount = () => {};
      if (!root) return;
      const doc = root.ownerDocument;
      const win = doc.defaultView;
      if (!win) return;
      const overlay = doc.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.dataset.lexicalYCursors = '';
      Object.assign(overlay.style, {
        inset: '0',
        pointerEvents: 'none',
        position: 'fixed',
        zIndex: String(config.zIndex),
      });
      overlay.className = config.className;
      const container = config.container ? config.container(root) : doc.body;
      invariant(
        container.ownerDocument === doc,
        '@lexical/y: cursor container must belong to the editor document',
      );
      container.append(overlay);
      let cleanups: (() => void)[] = [];
      const render = (currentPeers = peers.peek()) => {
        cleanups.forEach(cleanup => cleanup());
        cleanups = [];
        overlay.replaceChildren();
        editor.read('latest', () => {
          for (const [id, presence] of currentPeers) {
            if (!presence.selection) continue;
            const selection = $resolveYSelection(binding, presence.selection);
            if (!selection) continue;
            const {anchor, focus} = selection;
            const range = createDOMRange(
              editor,
              anchor.getNode(),
              anchor.offset,
              focus.getNode(),
              focus.offset,
            );
            if (!range) continue;
            const rects = createRectsFromDOMRange(editor, range);
            const caretRange = createDOMRange(
              editor,
              focus.getNode(),
              focus.offset,
              focus.getNode(),
              focus.offset,
            );
            const caretRect = caretRange && caretRange.getBoundingClientRect();
            if (config.renderCursor) {
              const cleanup = config.renderCursor({
                caret: caretRect,
                clientID: id,
                container: overlay,
                presence,
                rects,
                selection,
              });
              if (cleanup) cleanups.push(cleanup);
              continue;
            }
            for (const rect of rects) {
              const highlight = doc.createElement('div');
              highlight.className = 'lexical-y-highlight';
              Object.assign(highlight.style, {
                backgroundColor: presence.user.color,
                height: `${rect.height}px`,
                left: `${rect.left}px`,
                opacity: '0.2',
                position: 'absolute',
                top: `${rect.top}px`,
                width: `${rect.width}px`,
              });
              overlay.append(highlight);
            }
            if (!caretRect || caretRect.height === 0) continue;
            const caret = doc.createElement('div');
            caret.className = 'lexical-y-caret';
            caret.dataset.clientId = String(id);
            Object.assign(caret.style, {
              backgroundColor: presence.user.color,
              height: `${caretRect.height}px`,
              left: `${caretRect.left}px`,
              position: 'absolute',
              top: `${caretRect.top}px`,
              width: '2px',
            });
            const label = doc.createElement('span');
            label.className = 'lexical-y-label';
            label.textContent = presence.user.name;
            Object.assign(label.style, {
              backgroundColor: presence.user.color,
              bottom: '100%',
              color: presence.user.textColor,
              fontSize: '12px',
              padding: '2px 4px',
              position: 'absolute',
              whiteSpace: 'nowrap',
            });
            caret.append(label);
            overlay.append(caret);
          }
        });
      };
      const stop = effect(() => render(peers.value));
      const refresh = () => render();
      const update = editor.registerUpdateListener(refresh);
      const resize = new win.ResizeObserver(refresh);
      resize.observe(root);
      doc.fonts.addEventListener('loadingdone', refresh);
      win.addEventListener('resize', refresh);
      doc.addEventListener('scroll', refresh, true);
      unmount = () => {
        stop();
        resize.disconnect();
        doc.fonts.removeEventListener('loadingdone', refresh);
        cleanups.forEach(cleanup => cleanup());
        cleanups = [];
        update();
        win.removeEventListener('resize', refresh);
        doc.removeEventListener('scroll', refresh, true);
        overlay.remove();
      };
    });
    return () => {
      unregister();
      unmount();
    };
  },
});
