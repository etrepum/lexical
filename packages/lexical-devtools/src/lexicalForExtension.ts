/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Here we amend original Lexical API in order for the extension JS bundle to correctly work with
 * the Lexical from the page bundle. This solves for the following issues:
 * - Lexical relies on the module variable visibility scope for the "$" prefixed APIs to work correctly.
 *   And obviously code from the extension bundle does not share the same scope as the page.
 * - "instanceof" operator does not work correctly again due to the same issue.
 * So we hijack calls to the original Lexical APIs and implement extension specific workarounds
 */
import type * as lexical from 'lexicalOriginal';

export * from 'lexicalOriginal';

let activeEditorState: null | lexical.EditorState = null;
let activeEditor: null | lexical.LexicalEditor = null;
let isReadOnlyMode = false;

function getActiveEditorState(): lexical.EditorState {
  if (activeEditorState === null) {
    throw new Error(
      'Unable to find an active editor state. ' +
        'State helpers or node methods can only be used ' +
        'synchronously during the callback of ' +
        'editor.update() or editorState.read().',
    );
  }

  return activeEditorState;
}

function getActiveEditor(): lexical.LexicalEditor {
  if (activeEditor === null) {
    throw new Error(
      'Unable to find an active editor state. ' +
        'State helpers or node methods can only be used ' +
        'synchronously during the callback of ' +
        'editor.update() or editorState.read().',
    );
  }

  return activeEditor;
}

export function $getRoot(): lexical.RootNode {
  return getActiveEditorState()._nodeMap.get('root') as lexical.RootNode;
}

export function $getSelection(): null | lexical.BaseSelection {
  return getActiveEditorState()._selection;
}

export function $isElementNode(
  node: lexical.LexicalNode | null | undefined,
): node is lexical.ElementNode {
  if (node == null) {
    return false;
  }

  const editor = getActiveEditor();
  const ParagraphNode = editor._nodes.get('paragraph')!.klass;
  const ElementNode = Object.getPrototypeOf(ParagraphNode.prototype);

  // eslint-disable-next-line no-prototype-builtins
  return ElementNode.isPrototypeOf(node);
}

export function $isTextNode(
  node: lexical.LexicalNode | null | undefined,
): node is lexical.TextNode {
  if (node == null) {
    return false;
  }

  const editor = getActiveEditor();
  const TextNode = editor._nodes.get('text')!.klass;

  return node instanceof TextNode;
}

export function $isDecoratorNode<T>(
  node: lexical.LexicalNode | null | undefined,
): node is lexical.DecoratorNode<T> {
  // Duck typing: no node type is registered for DecoratorNode itself, and
  // neither ElementNode nor TextNode has a decorate method.
  return (
    node != null &&
    typeof (node as {decorate?: unknown}).decorate === 'function'
  );
}

export function $isParagraphNode(
  node: lexical.LexicalNode | null | undefined,
): node is lexical.ParagraphNode {
  if (node == null) {
    return false;
  }

  const ParagraphNode = getActiveEditor()._nodes.get('paragraph')!.klass;

  return node instanceof ParagraphNode;
}

// The slot accessors below read the page's slot fields directly. Lexical's own
// versions check the host with its private ElementNode/DecoratorNode classes
// (which no page node is an instance of) and look up keys through its own
// active editor state, so from here they would report no slots at all.

function getNodeByKey(key: lexical.NodeKey): lexical.LexicalNode | null {
  return getActiveEditorState()._nodeMap.get(key) ?? null;
}

function getSlotMap(
  node: lexical.LexicalNode,
): ReadonlyMap<string, lexical.NodeKey> {
  const latest = node.getLatest() as {
    __slots?: null | Map<string, lexical.NodeKey>;
  };
  return latest.__slots ?? new Map();
}

export function $getSlotNames(node: lexical.LexicalNode): string[] {
  return Array.from(getSlotMap(node).keys());
}

export function $getSlot(
  node: lexical.LexicalNode,
  name: string,
): lexical.LexicalNode | null {
  const key = getSlotMap(node).get(name);
  return key === undefined ? null : getNodeByKey(key);
}

export function $getSlotHost(
  node: lexical.LexicalNode,
): lexical.ElementNode | lexical.DecoratorNode<unknown> | null {
  const latest = node.getLatest() as {__slotHost?: null | lexical.NodeKey};
  const hostKey = latest.__slotHost;
  return hostKey == null
    ? null
    : (getNodeByKey(hostKey) as
        | lexical.ElementNode
        | lexical.DecoratorNode<unknown>
        | null);
}

export function $getSlotNameWithinHost(
  slotChild: lexical.LexicalNode,
): string | null {
  const host = $getSlotHost(slotChild);
  if (host === null) {
    return null;
  }
  const childKey = slotChild.getKey();
  for (const [name, key] of getSlotMap(host)) {
    if (key === childKey) {
      return name;
    }
  }
  return null;
}

export function $isRangeSelection(x: unknown): x is lexical.RangeSelection {
  // Duck typing :P (and not instanceof RangeSelection) because extension operates
  // from different JS bundle and has no reference to the RangeSelection used on the page
  return x != null && typeof x === 'object' && 'applyDOMRange' in x;
}

export function $isNodeSelection(x: unknown): x is lexical.NodeSelection {
  // Duck typing :P (and not instanceof NodeSelection) because extension operates
  // from different JS bundle and has no reference to the NodeSelection used on the page
  return x != null && typeof x === 'object' && '_nodes' in x;
}

export function readEditorState<V>(
  editor: lexical.LexicalEditor,
  editorState: lexical.EditorState,
  callbackFn: () => V,
): V {
  const previousActiveEditorState = activeEditorState;
  const previousReadOnlyMode = isReadOnlyMode;
  const previousActiveEditor = activeEditor;

  activeEditorState = editorState;
  isReadOnlyMode = true;
  activeEditor = editor;

  try {
    return callbackFn();
  } finally {
    activeEditorState = previousActiveEditorState;
    isReadOnlyMode = previousReadOnlyMode;
    activeEditor = previousActiveEditor;
  }
}
