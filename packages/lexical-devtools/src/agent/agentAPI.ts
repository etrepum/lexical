/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorState,
  LexicalEditor,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical';

import {generateContent} from '@lexical/devtools-core';
import {
  findAllLexicalElementsDeep,
  getActiveElementDeep,
  getEditorPropertyFromDOMNode,
  getParentElement,
} from 'lexical';

import {
  type CommandLogs,
  ensureCommandLogger,
} from '../utils/ensureCommandLogger';

/**
 * Name of the global the API is installed under, in the page's main world.
 */
export const AGENT_API_GLOBAL = '__LEXICAL_DEVTOOLS__';

/**
 * Which editor a call applies to:
 * - omitted: the focused editor, or else the first one in document order
 * - a number: an index into `editors()`
 * - a string: an editor key, or else a CSS selector for an element inside it
 * - an Element inside the editor, or the LexicalEditor itself
 */
export type EditorTarget = number | string | Element | LexicalEditor;

export interface EditorSummary {
  index: number;
  key: string;
  namespace: string;
  editable: boolean;
  focused: boolean;
  /** Version of the page's Lexical, when it reports one. */
  version: string | null;
  /** Key of the editor this one is nested in, if any. */
  parentEditorKey: string | null;
  nodeCount: number;
}

export interface PointSummary {
  key: NodeKey;
  offset: number;
  type: string;
}

export type SelectionSummary =
  | {
      type: 'range';
      anchor: PointSummary;
      focus: PointSummary;
      isCollapsed: boolean;
      format: number;
      style: string;
      text: string;
    }
  | {type: 'node'; nodes: NodeKey[]}
  | {type: 'table'; tableKey: NodeKey; anchor: NodeKey; focus: NodeKey}
  | {type: 'unknown'};

export interface NodeSummary {
  key: NodeKey;
  type: string;
  parent: NodeKey | null;
  children: NodeKey[];
  text: string;
  json: SerializedLexicalNode;
}

export interface CommandSummary {
  index: number;
  type: string;
  payload: unknown;
}

export interface UpdateSummary {
  tags: string[];
  dirtyElements: number;
  dirtyLeaves: number;
}

export interface LexicalDevtoolsAgentAPI {
  readonly apiVersion: 1;
  /** A plain-text description of every method. */
  help(): string;
  editors(): EditorSummary[];
  /** The tree view the DevTools panel shows, as text. */
  tree(target?: EditorTarget): string;
  /** `editorState.toJSON()` */
  json(target?: EditorTarget): SerializedEditorState;
  selection(target?: EditorTarget): SelectionSummary | null;
  node(key: NodeKey, target?: EditorTarget): NodeSummary | null;
  /** The editor's rendered DOM, pretty printed. */
  html(target?: EditorTarget): string;
  /** The most recent commands dispatched to the editor, oldest first. */
  commands(target?: EditorTarget): CommandSummary[];
  /**
   * Dispatch the registered command whose `type` is `type`. Returns what
   * `editor.dispatchCommand` returns.
   */
  dispatch(type: string, payload?: unknown, target?: EditorTarget): boolean;
  /** Replace the editor's state with serialized JSON (an object or string). */
  setEditorState(
    json: SerializedEditorState | string,
    target?: EditorTarget,
  ): void;
  /**
   * Resolves after the editor's next update, or with null after `timeout`
   * milliseconds (default 5000).
   */
  waitForUpdate(
    target?: EditorTarget,
    options?: {timeout?: number},
  ): Promise<UpdateSummary | null>;
}

export interface AgentAPIOptions {
  document: Document;
  /**
   * Run `fn` with `editorState` active for the copy of Lexical this module was
   * bundled with. The extension passes `readEditorState` from
   * `lexicalForExtension`; code sharing the page's copy can just call `fn`.
   */
  readEditorState: <V>(
    editor: LexicalEditor,
    editorState: EditorState,
    fn: () => V,
  ) => V;
  commandLogs?: CommandLogs;
}

const HELP = `Lexical DevTools page API (window.${AGENT_API_GLOBAL}).

Every method takes an optional editor target last: an index into editors(),
an editor key, a CSS selector or Element inside the editor, or the editor.
Without one it uses the focused editor, or else the first on the page.

  editors()                       list the editors on the page
  tree(target?)                   the DevTools tree view as text: nodes with
                                  keys, selection, recent commands
  json(target?)                   editorState.toJSON()
  selection(target?)              the selection as plain data
  node(key, target?)              one node: type, parent, children, text, JSON
  html(target?)                   the rendered DOM, pretty printed
  commands(target?)               recent commands, oldest first
  dispatch(type, payload?, target?)
                                  dispatch a registered command by its type,
                                  e.g. dispatch('FORMAT_TEXT_COMMAND', 'bold')
  setEditorState(json, target?)   replace the state with serialized JSON
  waitForUpdate(target?, {timeout?})
                                  resolve after the next update, or null on
                                  timeout (default 5000ms)

Commands are logged from the first call that touches an editor, or from page
load when the Lexical DevTools extension is installed.`;

function isEditor(value: unknown): value is LexicalEditor {
  // Duck typed: the page's editors are not instances of this bundle's class.
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LexicalEditor).getEditorState === 'function' &&
    typeof (value as LexicalEditor).getKey === 'function'
  );
}

function isElement(value: unknown): value is Element {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 /* ELEMENT_NODE */
  );
}

function summarizePayload(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object') {
    return typeof payload === 'function' ? '[function]' : payload;
  }
  if (typeof (payload as Event).preventDefault === 'function') {
    return `[${payload.constructor.name} ${(payload as Event).type}]`;
  }
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return String(payload);
  }
}

function prettyPrintHTML(element: Element, level = 0): Element {
  const doc = element.ownerDocument;
  const indentBefore = '  '.repeat(level + 1);
  const indentAfter = '  '.repeat(level);
  const children = Array.from(element.children);
  for (const child of children) {
    element.insertBefore(doc.createTextNode('\n' + indentBefore), child);
    prettyPrintHTML(child, level + 1);
  }
  if (children.length > 0) {
    element.appendChild(doc.createTextNode('\n' + indentAfter));
  }
  return element;
}

/**
 * The editor's rendered DOM, root element included, pretty printed.
 */
export function renderedHTML(editor: LexicalEditor): string {
  const rootElement = editor.getRootElement();
  if (rootElement === null) {
    return '';
  }
  return prettyPrintHTML(rootElement.cloneNode(true) as Element).outerHTML;
}

export function createLexicalDevtoolsAgentAPI({
  document,
  readEditorState,
  commandLogs = new WeakMap(),
}: AgentAPIOptions): LexicalDevtoolsAgentAPI {
  function findEditors(): LexicalEditor[] {
    const editors: LexicalEditor[] = [];
    for (const element of findAllLexicalElementsDeep(document)) {
      const editor = getEditorPropertyFromDOMNode(element);
      if (isEditor(editor) && !editors.includes(editor)) {
        editors.push(editor);
      }
    }
    return editors;
  }

  function editorContaining(element: Element | null): LexicalEditor | null {
    let current: Element | null = element;
    while (current !== null) {
      const editor = getEditorPropertyFromDOMNode(current);
      if (isEditor(editor)) {
        return editor;
      }
      current = getParentElement(current);
    }
    return null;
  }

  function resolve(target?: EditorTarget): LexicalEditor {
    let editor: LexicalEditor | null | undefined = null;
    if (target === undefined) {
      editor =
        editorContaining(getActiveElementDeep(document)) ?? findEditors()[0];
      if (editor == null) {
        throw new Error('No Lexical editor found on the page');
      }
    } else if (isEditor(target)) {
      editor = target;
    } else if (typeof target === 'number') {
      editor = findEditors()[target];
    } else if (typeof target === 'string') {
      editor =
        findEditors().find(e => e.getKey() === target) ??
        editorContaining(document.querySelector(target));
    } else if (isElement(target)) {
      editor = editorContaining(target);
    }
    if (editor == null) {
      throw new Error(`No Lexical editor matches ${String(target)}`);
    }
    ensureCommandLogger(editor, commandLogs);
    return editor;
  }

  function read<V>(editor: LexicalEditor, fn: () => V): V {
    const editorState = editor.getEditorState();
    return readEditorState(editor, editorState, () =>
      editorState.read(fn, {editor}),
    );
  }

  return {
    apiVersion: 1,

    commands(target) {
      const editor = resolve(target);
      return (commandLogs.get(editor) ?? []).map(({index, type, payload}) => ({
        index,
        payload: summarizePayload(payload),
        type: type ?? 'UNKNOWN',
      }));
    },

    dispatch(type, payload, target) {
      const editor = resolve(target);
      for (const command of editor._commands.keys()) {
        if (command.type === type) {
          return editor.dispatchCommand(command, payload);
        }
      }
      throw new Error(
        `No command of type ${type} is registered. Registered: ${Array.from(
          editor._commands.keys(),
          command => command.type,
        )
          .filter(Boolean)
          .sort()
          .join(', ')}`,
      );
    },

    editors() {
      const focused = editorContaining(getActiveElementDeep(document));
      return findEditors().map((editor, index) => {
        ensureCommandLogger(editor, commandLogs);
        const {version} = editor.constructor as {version?: string};
        return {
          editable: editor.isEditable(),
          focused: editor === focused,
          index,
          key: editor.getKey(),
          namespace: editor._config.namespace,
          nodeCount: editor.getEditorState()._nodeMap.size,
          parentEditorKey:
            editor._parentEditor === null
              ? null
              : editor._parentEditor.getKey(),
          version: typeof version === 'string' ? version : null,
        };
      });
    },

    help() {
      return HELP;
    },

    html(target) {
      return renderedHTML(resolve(target));
    },

    json(target) {
      return resolve(target).getEditorState().toJSON();
    },

    node(key, target) {
      const editor = resolve(target);
      return read(editor, () => {
        const node = editor.getEditorState()._nodeMap.get(key);
        if (node === undefined) {
          return null;
        }
        const {getChildrenKeys} = node as {getChildrenKeys?: () => NodeKey[]};
        const children =
          typeof getChildrenKeys === 'function'
            ? getChildrenKeys.call(node)
            : [];
        return {
          children,
          json: node.exportJSON(),
          key,
          parent: node.__parent,
          text: node.getTextContent(),
          type: node.getType(),
        };
      });
    },

    selection(target) {
      const editor = resolve(target);
      const selection = editor.getEditorState()._selection;
      if (selection === null) {
        return null;
      }
      const point = (p: {
        key: NodeKey;
        offset: number;
        type: string;
      }): PointSummary => ({key: p.key, offset: p.offset, type: p.type});
      if ('tableKey' in selection) {
        const {tableKey, anchor, focus} = selection as unknown as {
          tableKey: NodeKey;
          anchor: PointSummary;
          focus: PointSummary;
        };
        return {anchor: anchor.key, focus: focus.key, tableKey, type: 'table'};
      }
      if ('applyDOMRange' in selection) {
        const range = selection as unknown as {
          anchor: PointSummary;
          focus: PointSummary;
          format: number;
          style: string;
          isCollapsed(): boolean;
        };
        return {
          anchor: point(range.anchor),
          focus: point(range.focus),
          format: range.format,
          isCollapsed: range.isCollapsed(),
          style: range.style,
          text: read(editor, () => selection.getTextContent()),
          type: 'range',
        };
      }
      if ('_nodes' in selection) {
        return {
          nodes: Array.from((selection as {_nodes: Set<NodeKey>})._nodes),
          type: 'node',
        };
      }
      return {type: 'unknown'};
    },

    setEditorState(json, target) {
      const editor = resolve(target);
      editor.setEditorState(editor.parseEditorState(json));
    },

    tree(target) {
      const editor = resolve(target);
      return readEditorState(editor, editor.getEditorState(), () =>
        generateContent(editor, commandLogs.get(editor) ?? [], false),
      );
    },

    waitForUpdate(target, {timeout = 5000} = {}) {
      const editor = resolve(target);
      return new Promise(resolvePromise => {
        const timer = setTimeout(() => {
          unregister();
          resolvePromise(null);
        }, timeout);
        const unregister = editor.registerUpdateListener(
          ({tags, dirtyElements, dirtyLeaves}) => {
            clearTimeout(timer);
            unregister();
            resolvePromise({
              dirtyElements: dirtyElements.size,
              dirtyLeaves: dirtyLeaves.size,
              tags: Array.from(tags),
            });
          },
        );
      });
    },
  };
}

/**
 * Install the API on `window` unless something already has (the extension
 * and the standalone script can both be present). Returns the installed API.
 */
export function installLexicalDevtoolsAgentAPI(
  window: Window,
  options: Omit<AgentAPIOptions, 'document'>,
): LexicalDevtoolsAgentAPI {
  const existing = (window as unknown as Record<string, unknown>)[
    AGENT_API_GLOBAL
  ];
  if (existing !== undefined) {
    return existing as LexicalDevtoolsAgentAPI;
  }
  const api = createLexicalDevtoolsAgentAPI({
    ...options,
    document: window.document,
  });
  Object.defineProperty(window, AGENT_API_GLOBAL, {
    configurable: true,
    value: api,
  });
  return api;
}
