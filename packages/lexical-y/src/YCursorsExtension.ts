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
import {
  $isRangeSelection,
  type BaseSelection,
  defineExtension,
  safeCast,
} from 'lexical';

import {$resolveYSelection} from './Selection';
import {YAwarenessExtension, type YPresence} from './YAwarenessExtension';
import {YExtension} from './YExtension';

export interface YCursorContext {
  clientID: number;
  presence: YPresence;
  selection: BaseSelection;
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

/** Cancel the mounting container's 2D transform so children use viewport pixels. */
function alignOverlayToViewport(overlay: HTMLElement): boolean {
  overlay.style.transform = 'none';
  overlay.style.transformOrigin = '0 0';
  const points = [
    [0, 0],
    [100, 0],
    [0, 100],
  ].map(([left, top]) => {
    const probe = overlay.ownerDocument.createElement('span');
    Object.assign(probe.style, {
      height: '0',
      left: `${left}px`,
      position: 'absolute',
      top: `${top}px`,
      width: '0',
    });
    overlay.append(probe);
    return probe;
  });
  const [origin, x, y] = points.map(point => point.getBoundingClientRect());
  points.forEach(point => point.remove());
  const a = (x.left - origin.left) / 100;
  const b = (x.top - origin.top) / 100;
  const c = (y.left - origin.left) / 100;
  const d = (y.top - origin.top) / 100;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-8)
    return false;
  overlay.style.transform = `matrix(${d / determinant}, ${-b / determinant}, ${-c / determinant}, ${a / determinant}, ${(c * origin.top - d * origin.left) / determinant}, ${(b * origin.left - a * origin.top) / determinant})`;
  return true;
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
        if (!alignOverlayToViewport(overlay)) return;
        editor.read('latest', () => {
          for (const [id, presence] of currentPeers) {
            if (!presence.selection) continue;
            const selection = $resolveYSelection(binding, presence.selection);
            if (!selection) continue;
            const rangeSelection = $isRangeSelection(selection)
              ? selection
              : null;
            const rects: DOMRect[] = [];
            let caretRect: DOMRect | null = null;
            if (rangeSelection) {
              const {anchor, focus} = rangeSelection;
              const range = createDOMRange(
                editor,
                anchor.getNode(),
                anchor.offset,
                focus.getNode(),
                focus.offset,
              );
              if (!range) continue;
              rects.push(...createRectsFromDOMRange(editor, range));
              const caretRange = createDOMRange(
                editor,
                focus.getNode(),
                focus.offset,
                focus.getNode(),
                focus.offset,
              );
              caretRect = caretRange && caretRange.getBoundingClientRect();
            } else {
              const codec = binding.selectionCodecs.get(
                presence.selection.kind,
              );
              const nodes =
                codec && codec.getNodesForHighlight
                  ? codec.getNodesForHighlight(selection)
                  : selection.getNodes();
              for (const node of nodes) {
                const dom = editor.getElementByKey(node.getKey());
                if (dom) rects.push(dom.getBoundingClientRect());
              }
            }
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
            const labelRect =
              caretRect && caretRect.height > 0 ? caretRect : rects[0];
            if (!labelRect) continue;
            const caret = doc.createElement('div');
            caret.className = caretRect
              ? 'lexical-y-caret'
              : 'lexical-y-selection-label';
            caret.dataset.clientId = String(id);
            Object.assign(caret.style, {
              backgroundColor: presence.user.color,
              height: `${caretRect ? labelRect.height : 0}px`,
              left: `${labelRect.left}px`,
              position: 'absolute',
              top: `${labelRect.top}px`,
              width: caretRect ? '2px' : '0',
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
