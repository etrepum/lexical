/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Probe for facebook/lexical#9112: on iOS, tapping a decorator (an image)
// selects it as a NodeSelection and the page jumps to the top of the editor.
// This plugin logs what scrolls, when, and what focus and the DOM selection
// look like at each step, and lets the tester switch between candidate fixes
// that do not put a DOM caret beside the NodeSelection. It is a diagnostic
// for this one issue and is only mounted in builds made with
// VITE_PROBE_9112=1 or with ?probe9112 in the URL.

import type {JSX} from 'react';

import {editorStateFromSerializedDocument} from '@lexical/file';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  CAN_USE_DOM,
  getDOMSelection,
  IS_IOS,
  type LexicalEditor,
  mergeRegister,
  registerEventListener,
} from 'lexical';
import {useCallback, useEffect, useRef, useState} from 'react';

import {ISSUE_9112_DOC} from './issueDoc';

export type ProbeMode =
  | 'baseline'
  | 'no-focus'
  | 'no-focus+blur'
  | 'no-focus+reveal'
  | 'blur'
  | 'inputmode-none'
  | 'quiet-focus'
  | 'focus-prevent-scroll'
  | 'restore-scroll';

const MODES: readonly {mode: ProbeMode; label: string; detail: string}[] = [
  {
    detail: 'Stock Lexical, no fix.',
    label: 'Baseline',
    mode: 'baseline',
  },
  {
    detail:
      'preventDefault on mousedown over a decorator, so the tap never focuses the editor.',
    label: 'No focus',
    mode: 'no-focus',
  },
  {
    detail:
      'No focus, and if the editor already has focus, blur it when the NodeSelection commits.',
    label: 'No focus + blur',
    mode: 'no-focus+blur',
  },
  {
    detail:
      'No focus, and when the keyboard resizes the visual viewport while the editor has a caret, scroll the caret above the keyboard.',
    label: 'No focus + reveal caret',
    mode: 'no-focus+reveal',
  },
  {
    detail:
      'Let the tap focus the editor, then blur it when the NodeSelection commits.',
    label: 'Blur',
    mode: 'blur',
  },
  {
    detail:
      'Set inputmode="none" on the root before the tap focuses it, so no keyboard shows; cleared when a RangeSelection returns.',
    label: 'inputmode=none',
    mode: 'inputmode-none',
  },
  {
    detail:
      'No focus jump: cancel the mousedown, set inputmode="none", then focus the root with preventScroll, so keys reach the editor with no software keyboard. Tapping text clears inputmode.',
    label: 'Quiet focus',
    mode: 'quiet-focus',
  },
  {
    detail:
      'preventDefault on mousedown, then focus the root with preventScroll (the playground hostChromeSelection pattern).',
    label: 'Focus, preventScroll',
    mode: 'focus-prevent-scroll',
  },
  {
    detail:
      'Change nothing about focus or selection; undo any scroll that happens right after the tap.',
    label: 'Restore scroll',
    mode: 'restore-scroll',
  },
];

const MODE_STORAGE_KEY = 'lexical-probe-9112-mode';
const PANEL_STORAGE_KEY = 'lexical-probe-9112-panel';
const MAX_ENTRIES = 800;
const JUMP_THRESHOLD_PX = 40;
const SETTLE_MS = 1500;

export function isProbe9112Enabled(): boolean {
  if (!CAN_USE_DOM) {
    return false;
  }
  return (
    import.meta.env.VITE_PROBE_9112 === '1' ||
    new URLSearchParams(window.location.search).has('probe9112')
  );
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (_e) {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (_e) {
    // Private mode or blocked storage: the setting just won't persist.
  }
}

function initialMode(): ProbeMode {
  const stored = readStorage(MODE_STORAGE_KEY);
  return MODES.some(m => m.mode === stored)
    ? (stored as ProbeMode)
    : 'baseline';
}

function describeNode(node: Node | null | undefined): string {
  if (node === null || node === undefined) {
    return 'null';
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || '').slice(0, 12);
    return `#text"${text}"`;
  }
  if (!(node instanceof Element)) {
    return node.nodeName;
  }
  let s = node.tagName.toLowerCase();
  if (node.id) {
    s += `#${node.id}`;
  }
  const cls = node.getAttribute('class');
  if (cls) {
    s += `.${cls.trim().split(/\s+/).slice(0, 2).join('.')}`;
  }
  if (node.hasAttribute('data-lexical-decorator')) {
    s += '[deco]';
  }
  if (node.getAttribute('contenteditable') === 'true') {
    s += '[ce]';
  }
  if (node.hasAttribute('data-lexical-editor')) {
    s += '[root]';
  }
  return s;
}

const INTERACTIVE_SELECTOR =
  'input,textarea,select,button,a[href],label,[tabindex],[contenteditable="true"]';

// The decorator element a tap landed on, or null when the target is not in a
// decorator of this editor or is an interactive control inside one (a
// caption editor, a poll input), which must keep its own focus behavior.
function getDecoratorTarget(
  target: EventTarget | null,
  root: HTMLElement,
): HTMLElement | null {
  if (!(target instanceof Element) || !root.contains(target)) {
    return null;
  }
  const decorator = target.closest<HTMLElement>('[data-lexical-decorator]');
  if (decorator === null || !root.contains(decorator)) {
    return null;
  }
  const interactive = target.closest(INTERACTIVE_SELECTOR);
  if (interactive !== null && decorator.contains(interactive)) {
    return null;
  }
  return decorator;
}

function isScrollable(el: Element): boolean {
  const style = getComputedStyle(el);
  return (
    /(auto|scroll|overlay)/.test(style.overflowY + style.overflowX) &&
    (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
  );
}

interface ScrollSnapshot {
  x: number;
  y: number;
  elements: {el: Element; top: number; left: number}[];
}

function snapshotScroll(root: HTMLElement): ScrollSnapshot {
  const elements: ScrollSnapshot['elements'] = [];
  for (let el = root.parentElement; el !== null; el = el.parentElement) {
    if (isScrollable(el)) {
      elements.push({el, left: el.scrollLeft, top: el.scrollTop});
    }
  }
  return {elements, x: window.scrollX, y: window.scrollY};
}

interface TapSummary {
  startY: number;
  maxDelta: number;
  finalDelta: number;
  done: boolean;
  mode: ProbeMode;
}

class ProbeLog {
  entries: string[] = [];
  t0 = performance.now();
  tapStart: number | null = null;
  tap: TapSummary | null = null;
  listeners = new Set<() => void>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  notify(): void {
    for (const fn of this.listeners) {
      fn();
    }
  }

  clear(): void {
    this.entries = [];
    this.tap = null;
    this.tapStart = null;
    this.notify();
  }

  add(type: string, detail: string): void {
    const now = performance.now();
    const rel =
      this.tapStart === null
        ? `@${Math.round(now - this.t0)}`
        : `+${Math.round(now - this.tapStart)}`;
    const vv = window.visualViewport;
    const vvText = vv
      ? ` vv[h=${Math.round(vv.height)} top=${Math.round(vv.offsetTop)} page=${Math.round(vv.pageTop)}]`
      : '';
    const active = describeNode(document.activeElement);
    const sel = document.getSelection();
    const selText =
      sel === null || sel.rangeCount === 0
        ? 'sel=none'
        : `sel=${describeNode(sel.anchorNode)}:${sel.anchorOffset}${
            sel.isCollapsed
              ? ''
              : `..${describeNode(sel.focusNode)}:${sel.focusOffset}`
          }`;
    this.entries.push(
      `${rel} ${type} ${detail} | y=${Math.round(window.scrollY)}${vvText} act=${active} ${selText}`,
    );
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - MAX_ENTRIES);
    }
    if (this.tap !== null && !this.tap.done) {
      const delta = Math.round(window.scrollY - this.tap.startY);
      this.tap.finalDelta = delta;
      if (Math.abs(delta) > Math.abs(this.tap.maxDelta)) {
        this.tap.maxDelta = delta;
      }
    }
    this.notify();
  }

  startTap(mode: ProbeMode): void {
    this.tapStart = performance.now();
    this.tap = {
      done: false,
      finalDelta: 0,
      maxDelta: 0,
      mode,
      startY: window.scrollY,
    };
  }

  text(): string {
    const nav = navigator as Navigator & {standalone?: boolean};
    const header = [
      `lexical#9112 probe, ${new Date().toISOString()}`,
      `UA: ${navigator.userAgent}`,
      `IS_IOS=${IS_IOS} standalone=${String(nav.standalone)} inIframe=${String(
        window.top !== window,
      )} touchPoints=${navigator.maxTouchPoints}`,
      `inner=${window.innerWidth}x${window.innerHeight} dpr=${window.devicePixelRatio}`,
    ];
    return [...header, ...this.entries].join('\n');
  }
}

function useProbeLog(): ProbeLog {
  const ref = useRef<ProbeLog | null>(null);
  if (ref.current === null) {
    ref.current = new ProbeLog();
  }
  return ref.current;
}

function registerInstrumentation(
  editor: LexicalEditor,
  log: ProbeLog,
  getMode: () => ProbeMode,
): () => void {
  const doc = document;
  const targetOf = (e: Event) => describeNode(e.target as Node | null);
  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  const onTapStart = (e: Event) => {
    const root = editor.getRootElement();
    if (root !== null && e.target instanceof Node && root.contains(e.target)) {
      log.startTap(getMode());
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
      }
      settleTimer = setTimeout(() => {
        if (log.tap !== null) {
          log.tap.finalDelta = Math.round(window.scrollY - log.tap.startY);
          log.tap.done = true;
          log.add(
            'settled',
            `delta=${log.tap.finalDelta} maxDelta=${log.tap.maxDelta} mode=${log.tap.mode}`,
          );
        }
      }, SETTLE_MS);
    }
  };
  const plain = (type: string) => (e: Event) =>
    log.add(
      type,
      `${targetOf(e)}${e.defaultPrevented ? ' (prevented)' : ''}${
        'pointerType' in e ? ` ${(e as PointerEvent).pointerType}` : ''
      }${'key' in e ? ` key=${(e as KeyboardEvent).key}` : ''}`,
    );
  const unregisterEvents = mergeRegister(
    registerEventListener(doc, 'touchstart', onTapStart, {
      capture: true,
      passive: true,
    }),
    registerEventListener(
      doc,
      'pointerdown',
      e => {
        if ((e as PointerEvent).pointerType !== 'touch') {
          onTapStart(e);
        }
      },
      {capture: true},
    ),
    ...(
      [
        'touchstart',
        'touchend',
        'pointerdown',
        'pointerup',
        'mousedown',
        'mouseup',
        'click',
        'focusin',
        'focusout',
        'beforeinput',
        'keydown',
      ] as const
    ).map(type =>
      // Bubble phase on window so defaultPrevented reflects every handler.
      registerEventListener(window, type, plain(type), {passive: true}),
    ),
    registerEventListener(doc, 'selectionchange', () =>
      log.add('selectionchange', ''),
    ),
    registerEventListener(
      doc,
      'scroll',
      e =>
        log.add(
          'scroll',
          e.target === doc ? 'document' : describeNode(e.target as Node),
        ),
      {capture: true, passive: true},
    ),
    ...(window.visualViewport
      ? [
          registerEventListener(window.visualViewport, 'resize', () =>
            log.add('vv-resize', ''),
          ),
          registerEventListener(window.visualViewport, 'scroll', () =>
            log.add('vv-scroll', ''),
          ),
        ]
      : []),
  );
  return mergeRegister(
    unregisterEvents,
    registerApiTracing(log),
    () => {
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
      }
    },
    editor.registerUpdateListener(({editorState, tags}) => {
      const kind = editorState.read(() => {
        const selection = $getSelection();
        if (selection === null) {
          return 'null';
        }
        if ($isRangeSelection(selection)) {
          return selection.isCollapsed() ? 'range(collapsed)' : 'range';
        }
        if ($isNodeSelection(selection)) {
          return `node(${selection
            .getNodes()
            .map(n => n.getType())
            .join(',')})`;
        }
        return selection.constructor.name;
      });
      log.add(
        'lexical-update',
        `selection=${kind} tags=[${[...tags].join(',')}]`,
      );
    }),
  );
}

// The first two stack frames outside this file, to say who made a call.
function caller(): string {
  const stack = new Error().stack || '';
  return stack
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => line !== '' && !/IOSProbe9112|traced|caller/.test(line))
    .slice(0, 2)
    .map(line => line.replace(/^at /, '').replace(/https?:\/\/[^/]+\//, ''))
    .join(' < ');
}

// Wrap the scroll, focus and DOM selection APIs so every call that can move
// the page or the selection shows up in the log with its caller.
function registerApiTracing(log: ProbeLog): () => void {
  const restores: (() => void)[] = [];
  const wrap = <T extends object>(proto: T, name: string) => {
    const original = (proto as Record<string, unknown>)[name];
    if (typeof original !== 'function') {
      return;
    }
    const traced = function (this: unknown, ...args: unknown[]) {
      const target =
        this instanceof Node
          ? describeNode(this)
          : this === window
            ? 'window'
            : '';
      log.add(
        `call ${name}`,
        `${target}(${args
          .map(a =>
            a instanceof Node
              ? describeNode(a)
              : typeof a === 'object'
                ? JSON.stringify(a)
                : String(a),
          )
          .join(', ')}) from ${caller()}`,
      );
      return original.apply(this, args);
    };
    (proto as Record<string, unknown>)[name] = traced;
    restores.push(() => {
      (proto as Record<string, unknown>)[name] = original;
    });
  };
  wrap(Selection.prototype, 'removeAllRanges');
  wrap(Selection.prototype, 'addRange');
  wrap(Selection.prototype, 'setBaseAndExtent');
  wrap(Selection.prototype, 'collapse');
  wrap(HTMLElement.prototype, 'focus');
  wrap(HTMLElement.prototype, 'blur');
  wrap(Element.prototype, 'scrollIntoView');
  wrap(Element.prototype, 'scrollTo');
  wrap(Element.prototype, 'scrollBy');
  wrap(window, 'scrollTo');
  wrap(window, 'scrollBy');
  return () => {
    for (const restore of restores) {
      restore();
    }
  };
}

// Room left between the caret and the top of the keyboard. It also clears the
// probe's own bar, which sits just above the keyboard.
const REVEAL_MARGIN = 72;

function getCaretClientRect(range: Range): DOMRect | null {
  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }
  const rect = range.getBoundingClientRect();
  if (rect.height > 0) {
    return rect;
  }
  // A collapsed range in an empty block has no rects; use the block.
  const node = range.startContainer;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  return element !== null ? element.getBoundingClientRect() : null;
}

function revealCaretAboveKeyboard(root: HTMLElement, log: ProbeLog): void {
  const vv = window.visualViewport;
  if (vv === null || document.activeElement !== root) {
    return;
  }
  const domSelection = getDOMSelection(window);
  if (
    domSelection === null ||
    domSelection.rangeCount === 0 ||
    !domSelection.isCollapsed ||
    !root.contains(domSelection.anchorNode)
  ) {
    return;
  }
  const rect = getCaretClientRect(domSelection.getRangeAt(0));
  if (rect === null) {
    return;
  }
  // getBoundingClientRect is in layout-viewport coordinates; the keyboard only
  // shrinks the visual viewport.
  const visibleTop = vv.offsetTop;
  const visibleBottom = vv.offsetTop + vv.height - REVEAL_MARGIN;
  let diff = 0;
  if (rect.bottom > visibleBottom) {
    diff = rect.bottom - visibleBottom;
  } else if (rect.top < visibleTop) {
    diff = rect.top - visibleTop;
  }
  if (diff !== 0) {
    window.scrollBy(0, diff);
    log.add(
      'fix',
      `revealed caret: scrollBy ${Math.round(diff)} (caret bottom ${Math.round(rect.bottom)}, visible bottom ${Math.round(visibleBottom)})`,
    );
  }
}

function registerCandidateFixes(
  editor: LexicalEditor,
  log: ProbeLog,
  getMode: () => ProbeMode,
): () => void {
  let inputModeSet = false;
  let restore: {snapshot: ScrollSnapshot; until: number} | null = null;

  const clearInputMode = (root: HTMLElement) => {
    if (inputModeSet) {
      inputModeSet = false;
      root.removeAttribute('inputmode');
      log.add('fix', 'inputmode cleared');
    }
  };

  return mergeRegister(
    editor.registerRootListener(root => {
      if (root === null) {
        return;
      }
      const onPointerish = (event: Event) => {
        const mode = getMode();
        if (mode !== 'restore-scroll') {
          return;
        }
        if (getDecoratorTarget(event.target, root) !== null) {
          restore = {
            snapshot: snapshotScroll(root),
            until: performance.now() + SETTLE_MS,
          };
          log.add('fix', `scroll snapshot y=${Math.round(window.scrollY)}`);
        }
      };
      const onMouseDown = (event: MouseEvent) => {
        const mode = getMode();
        if (mode !== 'inputmode-none' && mode !== 'quiet-focus') {
          clearInputMode(root);
        }
        if (
          mode === 'quiet-focus' &&
          getDecoratorTarget(event.target, root) === null
        ) {
          clearInputMode(root);
        }
        if (getDecoratorTarget(event.target, root) === null) {
          return;
        }
        if (
          mode === 'no-focus' ||
          mode === 'no-focus+blur' ||
          mode === 'no-focus+reveal'
        ) {
          event.preventDefault();
          log.add('fix', 'mousedown prevented (no focus)');
        } else if (mode === 'focus-prevent-scroll') {
          event.preventDefault();
          if (document.activeElement !== root) {
            root.focus({preventScroll: true});
          }
          log.add('fix', 'mousedown prevented, root.focus({preventScroll})');
        } else if (mode === 'quiet-focus') {
          event.preventDefault();
          root.setAttribute('inputmode', 'none');
          inputModeSet = true;
          if (document.activeElement !== root) {
            root.focus({preventScroll: true});
          }
          log.add('fix', 'mousedown prevented, inputmode=none, quiet focus');
        } else if (mode === 'inputmode-none') {
          root.setAttribute('inputmode', 'none');
          inputModeSet = true;
          log.add('fix', 'inputmode=none set');
        }
      };
      const onScroll = () => {
        if (restore === null) {
          return;
        }
        if (performance.now() > restore.until) {
          restore = null;
          return;
        }
        const {snapshot} = restore;
        if (window.scrollY !== snapshot.y || window.scrollX !== snapshot.x) {
          window.scrollTo(snapshot.x, snapshot.y);
          log.add('fix', `restored window scroll to y=${snapshot.y}`);
        }
        for (const {el, top, left} of snapshot.elements) {
          if (el.scrollTop !== top || el.scrollLeft !== left) {
            el.scrollTop = top;
            el.scrollLeft = left;
            log.add('fix', `restored ${describeNode(el)} scroll`);
          }
        }
      };
      const cancelRestore = () => {
        // A drag is the user scrolling on purpose.
        restore = null;
      };
      return mergeRegister(
        registerEventListener(root, 'pointerdown', onPointerish, {
          capture: true,
        }),
        registerEventListener(root, 'touchstart', onPointerish, {
          capture: true,
          passive: true,
        }),
        registerEventListener(root, 'touchmove', cancelRestore, {
          passive: true,
        }),
        registerEventListener(root, 'mousedown', onMouseDown, {capture: true}),
        registerEventListener(document, 'scroll', onScroll, {
          capture: true,
          passive: true,
        }),
        () => clearInputMode(root),
        window.visualViewport
          ? registerEventListener(window.visualViewport, 'resize', () => {
              if (getMode() === 'no-focus+reveal') {
                revealCaretAboveKeyboard(root, log);
              }
            })
          : () => {},
      );
    }),
    editor.registerUpdateListener(({editorState}) => {
      const root = editor.getRootElement();
      if (root === null) {
        return;
      }
      const mode = getMode();
      const isNode = editorState.read(() => $isNodeSelection($getSelection()));
      const isRange = editorState.read(() =>
        $isRangeSelection($getSelection()),
      );
      if (isRange) {
        clearInputMode(root);
      }
      if (
        isNode &&
        (mode === 'blur' || mode === 'no-focus+blur') &&
        document.activeElement === root
      ) {
        const domSelection = getDOMSelection(window);
        if (domSelection !== null) {
          domSelection.removeAllRanges();
        }
        root.blur();
        log.add('fix', 'root blurred on NodeSelection');
      }
    }),
  );
}

function useTick(log: ProbeLog): void {
  const [, setTick] = useState(0);
  useEffect(() => log.subscribe(() => setTick(t => t + 1)), [log]);
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 24, 0.94)',
  borderRadius: 12,
  bottom: 'calc(8px + env(safe-area-inset-bottom))',
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  color: '#f4f4f5',
  font: '12px/1.35 -apple-system, system-ui, sans-serif',
  left: 8,
  maxWidth: 560,
  position: 'fixed',
  right: 8,
  zIndex: 10000,
};

const buttonStyle: React.CSSProperties = {
  background: '#3f3f46',
  border: 0,
  borderRadius: 8,
  color: '#f4f4f5',
  font: 'inherit',
  minHeight: 32,
  padding: '6px 10px',
};

export default function IOSProbe9112Plugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const log = useProbeLog();
  useTick(log);
  const [mode, setModeState] = useState<ProbeMode>(initialMode);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [open, setOpen] = useState(
    () => readStorage(PANEL_STORAGE_KEY) === 'open',
  );
  const [showLog, setShowLog] = useState(false);
  const [copyState, setCopyState] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const getMode = () => modeRef.current;
    return mergeRegister(
      registerInstrumentation(editor, log, getMode),
      registerCandidateFixes(editor, log, getMode),
    );
  }, [editor, log]);

  const setMode = useCallback(
    (next: ProbeMode) => {
      setModeState(next);
      writeStorage(MODE_STORAGE_KEY, next);
      log.add('mode', next);
    },
    [log],
  );

  const toggleOpen = () => {
    setOpen(o => {
      writeStorage(PANEL_STORAGE_KEY, o ? 'closed' : 'open');
      return !o;
    });
  };

  const loadIssueDoc = useCallback(() => {
    editor.setEditorState(
      editorStateFromSerializedDocument(editor, ISSUE_9112_DOC),
    );
    log.add('doc', 'issue 9112 doc loaded');
  }, [editor, log]);

  // Start from the issue's document unless the URL carries its own.
  useEffect(() => {
    if (!window.location.hash.startsWith('#doc=')) {
      loadIssueDoc();
    }
  }, [loadIssueDoc]);

  const reset = () => {
    const root = editor.getRootElement();
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    if (root !== null) {
      root.blur();
    }
    const domSelection = getDOMSelection(window);
    if (domSelection !== null) {
      domSelection.removeAllRanges();
    }
    window.scrollTo(0, 0);
    log.add('reset', 'blurred, scrolled to top');
  };

  const copy = () => {
    const text = log.text();
    setShowLog(true);
    const done = (ok: boolean) => {
      setCopyState(ok ? 'Copied' : 'Select the text below and copy it');
      if (!ok && textareaRef.current !== null) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => done(true),
        () => done(false),
      );
    } else {
      done(false);
    }
  };

  const tap = log.tap;
  const jumped = tap !== null && Math.abs(tap.maxDelta) > JUMP_THRESHOLD_PX;
  const tapText =
    tap === null
      ? 'Tap an image'
      : `${tap.done ? 'Last tap' : 'Tap…'} Δ${tap.finalDelta}px (max ${tap.maxDelta}) in ${tap.mode}`;
  const modeInfo = MODES.find(m => m.mode === mode);

  return (
    <div style={panelStyle} data-probe-9112="true">
      <div style={{alignItems: 'center', display: 'flex', gap: 8, padding: 8}}>
        <span
          style={{
            background:
              tap === null ? '#52525b' : jumped ? '#dc2626' : '#16a34a',
            borderRadius: 6,
            flex: 1,
            fontVariantNumeric: 'tabular-nums',
            padding: '6px 8px',
          }}>
          {tapText}
        </span>
        <button type="button" style={buttonStyle} onClick={toggleOpen}>
          {open ? 'Hide' : 'Probe'}
        </button>
      </div>
      {open ? (
        <div style={{display: 'grid', gap: 8, padding: '0 8px 8px'}}>
          <label style={{display: 'grid', gap: 4}}>
            <span>Fix mode (applies immediately)</span>
            <select
              value={mode}
              onChange={e => setMode(e.target.value as ProbeMode)}
              style={{...buttonStyle, fontSize: 16}}>
              {MODES.map(m => (
                <option key={m.mode} value={m.mode}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          {modeInfo ? (
            <span style={{color: '#a1a1aa'}}>{modeInfo.detail}</span>
          ) : null}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            <button type="button" style={buttonStyle} onClick={loadIssueDoc}>
              Load issue doc
            </button>
            <button type="button" style={buttonStyle} onClick={reset}>
              Blur + top
            </button>
            <button type="button" style={buttonStyle} onClick={copy}>
              Copy log
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => setShowLog(s => !s)}>
              {showLog ? 'Hide log' : 'Show log'}
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                log.clear();
                setCopyState('');
              }}>
              Clear
            </button>
          </div>
          {copyState ? <span>{copyState}</span> : null}
          {showLog ? (
            <textarea
              ref={textareaRef}
              readOnly={true}
              value={log.text()}
              style={{
                background: '#09090b',
                border: 0,
                borderRadius: 8,
                color: '#e4e4e7',
                font: '11px/1.3 ui-monospace, Menlo, monospace',
                height: 160,
                padding: 6,
                whiteSpace: 'pre',
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
