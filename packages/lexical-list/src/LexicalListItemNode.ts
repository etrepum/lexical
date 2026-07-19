/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from '@lexical/internal/invariant';
import {
  $applyNodeReplacement,
  $copyNode,
  $createParagraphNode,
  $getDocument,
  $getSelection,
  $getSiblingCaret,
  $getState,
  $insertNodeToNearestRootAtCaret,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $rewindSiblingCaret,
  $setDirectionFromDOM,
  $setFormatFromDOM,
  addClassNamesToElement,
  type BaseSelection,
  buildImportMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type EditorThemeClasses,
  type ElementDOMSlot,
  ElementNode,
  getStyleObjectFromCSS,
  isHTMLElement,
  type LexicalEditor,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  normalizeClassNames,
  type ParagraphNode,
  type RangeSelection,
  removeClassNamesFromElement,
  type SerializedElementNode,
  setDOMStyleFromCSS,
  setDOMUnmanaged,
  type Spread,
} from 'lexical';

import {$createListNode, $isListNode, type ListNode, type ListType} from './';
import {
  $collapseWrapperPair,
  $handleIndent,
  $handleOutdent,
} from './formatList';
import {
  $isListSemanticNestingEnabled,
  $markNestedListsAsSemantic,
  $parkNestedListsInWrapper,
} from './semanticNesting';
import {
  $copyListForSplit,
  $hasNestedListChild,
  $isCheckList,
  $isWrapperListItemNode,
  findCheckboxInputChild,
  listSemanticNestingState,
} from './utils';

export type SerializedListItemNode = Spread<
  {
    checked: boolean | undefined;
    value: number;
  },
  SerializedElementNode
>;

function applyMarkerStyles(
  dom: HTMLElement,
  node: ListItemNode,
  prevNode: ListItemNode | null,
): void {
  const nextTextStyle = node.__textStyle;
  const prevTextStyle = prevNode ? prevNode.__textStyle : '';

  if (prevNode !== null && prevTextStyle === nextTextStyle) {
    return;
  }

  const styles: Record<string, string> = getStyleObjectFromCSS(nextTextStyle);
  for (const k in styles) {
    dom.style.setProperty(`--listitem-marker-${k}`, styles[k]);
  }

  if (prevTextStyle !== '') {
    for (const k in getStyleObjectFromCSS(prevTextStyle)) {
      if (!(k in styles)) {
        dom.style.removeProperty(`--listitem-marker-${k}`);
      }
    }
  }
}

/** @noInheritDoc */
export class ListItemNode extends ElementNode {
  /** @internal */
  __value: number;
  /** @internal */
  __checked?: boolean;

  /** @internal */
  $config() {
    return this.config('listitem', {
      $transform: (node: ListItemNode): void => {
        const parent = node.getParent();
        if ($isListNode(parent)) {
          if (parent.getListType() !== 'check' && node.getChecked() != null) {
            node.setChecked(undefined);
          }
        } else if (parent) {
          const newParent = node.createParentElementNode();
          invariant(
            $isListNode(newParent),
            'ListItemNode.createParentElementNode() must return a ListNode',
          );
          // Insert an empty ListNode at the orphan's position, splitting
          // any enclosing non-shadow-root blocks so the ListNode lifts to
          // a valid container before we move the orphan in. The ListNode
          // $transform merges adjacent same-type lists, so neighbouring
          // orphans will coalesce once their own transforms run.
          const children = [node];
          for (const dir of ['previous', 'next'] as const) {
            children.reverse();
            for (const {origin} of $getSiblingCaret(node, dir)) {
              if (!$isListItemNode(origin)) {
                break;
              }
              children.push(origin);
            }
          }
          node.insertBefore(newParent);
          newParent.splice(0, 0, children);
          if (!$isRootOrShadowRoot(parent)) {
            $insertNodeToNearestRootAtCaret(
              newParent,
              $rewindSiblingCaret($getSiblingCaret(newParent, 'next')),
              {$shouldSplit: () => false, removeEmptyDestination: true},
            );
            if (parent.isEmpty() && parent.isAttached()) {
              parent.remove();
            }
          }
        }
      },
      extends: ElementNode,
      importDOM: buildImportMap({
        li: () => ({
          conversion: $convertListItemElement,
          priority: 0,
        }),
      }),
    });
  }

  constructor(
    value: number = 1,
    checked: undefined | boolean = undefined,
    key?: NodeKey,
  ) {
    super(key);
    this.__value = value === undefined ? 1 : value;
    this.__checked = checked;
  }

  afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode);
    this.__value = prevNode.__value;
    this.__checked = prevNode.__checked;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = $getDocument().createElement('li');
    this.updateListItemDOM(null, element, config);

    return element;
  }

  getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLElement> {
    // Managed children go after the native checkbox input that check-list
    // rows render in the semantic nesting mode. Only rows that actually
    // render one pay for the extra slot; every other reconcile (the common
    // case) returns the base slot without a second allocation.
    const slot = super.getDOMSlot(element);
    const checkbox = getListItemCheckboxDOM(element);
    return checkbox === null ? slot : slot.withAfter(checkbox);
  }

  updateListItemDOM(
    prevNode: ListItemNode | null,
    dom: HTMLLIElement,
    config: EditorConfig,
  ) {
    // Classified once per reconcile; both helpers below need it.
    const isWrapper = $isWrapperListItemNode(this);
    $updateListItemChecked(dom, this, isWrapper);

    dom.value = this.__value;
    $setListItemThemeClassNames(dom, config.theme, this, isWrapper);
    const prevStyle = prevNode ? prevNode.__style : '';
    const nextStyle = this.__style;

    if (prevStyle !== nextStyle) {
      setDOMStyleFromCSS(dom.style, nextStyle, prevStyle);
    }
    applyMarkerStyles(dom, this, prevNode);
  }

  updateDOM(
    prevNode: ListItemNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    // @ts-expect-error - this is always HTMLListItemElement
    const element: HTMLLIElement = dom;
    this.updateListItemDOM(prevNode, element, config);
    return false;
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedListItemNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
      .setValue(serializedNode.value)
      .setChecked(serializedNode.checked);
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = this.createDOM(editor._config);

    const formatType = this.getFormatType();
    if (formatType) {
      element.style.textAlign = formatType;
    }

    const direction = this.getDirection();
    if (direction) {
      element.dir = direction;
    }

    // Only dedicated wrapper items merge into the preceding <li> on export;
    // an item whose lists carry the semantic nesting mark is a row of its
    // own and exports its own <li> (the mark itself does not survive HTML).
    if ($isWrapperListItemNode(this)) {
      return {
        after(containerElement) {
          if (isHTMLElement(containerElement)) {
            const prevSibling = containerElement.previousElementSibling;
            if (isHTMLElement(prevSibling) && prevSibling.nodeName === 'LI') {
              while (containerElement.firstChild) {
                prevSibling.append(containerElement.firstChild);
              }
              containerElement.remove();
            }
          }
          return containerElement;
        },
        element,
      };
    }

    return {
      element,
    };
  }

  exportJSON(): SerializedListItemNode {
    return {
      ...super.exportJSON(),
      checked: this.getChecked(),
      value: this.getValue(),
    };
  }

  append(...nodes: LexicalNode[]): this {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if ($isElementNode(node) && this.canMergeWith(node)) {
        const children = node.getChildren();
        this.append(...children);
        node.remove();
      } else {
        super.append(node);
      }
    }

    return this;
  }

  replace<N extends LexicalNode>(
    replaceWithNode: N,
    includeChildren?: boolean,
  ): N {
    if ($isListItemNode(replaceWithNode)) {
      return super.replace(replaceWithNode);
    }
    this.setIndent(0);
    const list = this.getParentOrThrow();
    if (!$isListNode(list)) {
      return replaceWithNode;
    }
    // For element-anchored selection points on this li, the remap below
    // needs offsets relative to the children that actually transfer, so
    // record where the nested lists sat before they are parked away.
    const listChildIndexes: number[] = [];
    // Nested ListNode children of a host row (semantic representation) are
    // the following rows' content, not this row's inline content: park
    // them in a dedicated wrapper item so replacing the row — with or
    // without transferring its inline children — cannot swallow or delete
    // the rows below it (in the default representation they live in a
    // sibling wrapper li that replace() never touches). A dedicated
    // wrapper item itself keeps the pre-existing behavior: only the
    // includeChildren path parks, matching how its lists transfer.
    if (
      $hasNestedListChild(this) &&
      (includeChildren || !$isWrapperListItemNode(this))
    ) {
      if (includeChildren) {
        let childIndex = 0;
        for (const child of this.getChildren()) {
          if ($isListNode(child)) {
            listChildIndexes.push(childIndex);
          }
          childIndex++;
        }
      }
      $parkNestedListsInWrapper(this);
    }
    if (list.__first === this.getKey()) {
      list.insertBefore(replaceWithNode);
    } else if (list.__last === this.getKey()) {
      list.insertAfter(replaceWithNode);
    } else {
      // Split the list ($copyListForSplit carries the semantic nesting
      // mark, so a marked nested list's second half stays a row's content)
      const newList = $copyListForSplit(list);
      let nextSibling = this.getNextSibling();
      while (nextSibling) {
        const nodeToAppend = nextSibling;
        nextSibling = nextSibling.getNextSibling();
        newList.append(nodeToAppend);
      }
      list.insertAfter(replaceWithNode);
      replaceWithNode.insertAfter(newList);
    }
    const toReplaceKey = this.__key;
    let prevSizeBeforeChildrenTransfer = 0;
    if (includeChildren) {
      invariant(
        $isElementNode(replaceWithNode),
        'includeChildren should only be true for ElementNodes',
      );
      prevSizeBeforeChildrenTransfer = replaceWithNode.getChildrenSize();
      replaceWithNode.splice(
        prevSizeBeforeChildrenTransfer,
        0,
        this.getChildren(),
      );
    }
    // The base LexicalNode.replace remaps element-anchored selection points
    // from the replaced node to the replacement, but this override skips
    // super and the trailing this.remove() would otherwise drop selection
    // onto a sibling list item via moveSelectionPointToSibling. Mirror the
    // base behavior here for the element-anchored case.
    if (includeChildren && $isElementNode(replaceWithNode)) {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        for (const point of selection.getStartEndPoints()) {
          if (point.key === toReplaceKey && point.type === 'element') {
            // Offsets at or after a parked nested list shrink by the
            // number of parked lists before them — those children did not
            // transfer to the replacement.
            let parkedBefore = 0;
            for (const listIndex of listChildIndexes) {
              if (listIndex < point.offset) {
                parkedBefore++;
              }
            }
            point.set(
              replaceWithNode.getKey(),
              prevSizeBeforeChildrenTransfer + point.offset - parkedBefore,
              'element',
            );
          }
        }
      }
    }
    this.remove();
    if (list.getChildrenSize() === 0) {
      list.remove();
    }
    return replaceWithNode;
  }

  insertAfter(node: LexicalNode, restoreSelection = true): LexicalNode {
    const listNode = this.getParentOrThrow();

    if (!$isListNode(listNode)) {
      invariant(
        false,
        'insertAfter: list node is not parent of list item node',
      );
    }

    if ($isListItemNode(node)) {
      return super.insertAfter(node, restoreSelection);
    }

    const siblings = this.getNextSiblings();

    // Split the lists and insert the node in between them
    listNode.insertAfter(node, restoreSelection);

    if (siblings.length !== 0) {
      // $copyListForSplit carries the semantic nesting mark: both halves
      // of a marked nested list remain the same host row's content.
      const newListNode = $copyListForSplit(listNode);

      siblings.forEach(sibling => newListNode.append(sibling));

      node.insertAfter(newListNode, restoreSelection);
    }

    return node;
  }

  remove(preserveEmptyParent?: boolean): void {
    const prevSibling = this.getPreviousSibling();
    const nextSibling = this.getNextSibling();
    super.remove(preserveEmptyParent);

    // Only dedicated wrapper items collapse into each other; an adjacent
    // item whose lists carry the semantic nesting mark is a row of its own
    // and must not be merged away.
    if (
      $isWrapperListItemNode(prevSibling) &&
      $isWrapperListItemNode(nextSibling)
    ) {
      $collapseWrapperPair(prevSibling, nextSibling);
    }
  }

  resetOnCopyNodeFrom(original: this): void {
    super.resetOnCopyNodeFrom(original);
    if (original.getChecked()) {
      this.setChecked(false);
    }
  }

  insertNewAfter(
    _: RangeSelection,
    restoreSelection = true,
  ): ListItemNode | ParagraphNode {
    const newElement = $copyNode(this);

    this.insertAfter(newElement, restoreSelection);

    return newElement;
  }

  collapseAtStart(selection: RangeSelection): boolean {
    // Dedicated wrapper items render no row to collapse; items whose lists
    // carry the semantic nesting mark are real rows and collapse like any
    // other.
    if ($isWrapperListItemNode(this)) {
      return false;
    }

    const listNode = this.getParentOrThrow();
    const listNodeParent = listNode.getParentOrThrow();

    if ($isListItemNode(listNodeParent)) {
      $handleOutdent(this);
      return true;
    }

    // Nested lists (semantic representation) keep their depth: parked in a
    // dedicated wrapper item that lands at the head of the split-off list,
    // so their rows stay one level below the demoted row — matching what
    // the default representation produces for the equivalent document.
    $parkNestedListsInWrapper(this);
    const paragraph = $createParagraphNode().append(...this.getChildren());

    const nextSiblings = this.getNextSiblings();
    if (nextSiblings.length > 0) {
      const newList = $copyNode(listNode);
      newList.append(...nextSiblings);
      listNode.insertAfter(newList);
    }
    listNode.insertAfter(paragraph);
    this.remove();
    if (listNode.getChildrenSize() === 0) {
      listNode.remove();
    }
    paragraph.selectStart();

    return true;
  }

  getValue(): number {
    const self = this.getLatest();

    return self.__value;
  }

  setValue(value: number): this {
    const self = this.getWritable();
    self.__value = value;
    return self;
  }

  getChecked(): boolean | undefined {
    const self = this.getLatest();

    let listType: ListType | undefined;

    const parent = this.getParent();
    if ($isListNode(parent)) {
      listType = parent.getListType();
    }

    return listType === 'check' ? Boolean(self.__checked) : undefined;
  }

  setChecked(checked?: boolean): this {
    const self = this.getWritable();
    self.__checked = checked;
    return self;
  }

  toggleChecked(): this {
    const self = this.getWritable();
    return self.setChecked(!self.__checked);
  }

  getIndent(): number {
    // If we don't have a parent, we are likely serializing
    const parent = this.getParent();
    if (parent === null || !this.isAttached()) {
      return this.getLatest().__indent;
    }
    // ListItemNode should always have a ListNode for a parent.
    let listNodeParent = parent.getParentOrThrow();
    let indentLevel = 0;
    while ($isListItemNode(listNodeParent)) {
      listNodeParent = listNodeParent.getParentOrThrow().getParentOrThrow();
      indentLevel++;
    }

    return indentLevel;
  }

  setIndent(indent: number): this {
    invariant(typeof indent === 'number', 'Invalid indent value.');
    indent = Math.floor(indent);
    invariant(indent >= 0, 'Indent value must be non-negative.');
    let currentIndent = this.getIndent();
    while (currentIndent !== indent) {
      if (currentIndent < indent) {
        $handleIndent(this);
        currentIndent++;
      } else {
        $handleOutdent(this);
        currentIndent--;
      }
    }

    return this;
  }

  /** @deprecated @internal */
  canInsertAfter(node: LexicalNode): boolean {
    return $isListItemNode(node);
  }

  /** @deprecated @internal */
  canReplaceWith(replacement: LexicalNode): boolean {
    return $isListItemNode(replacement);
  }

  canMergeWith(node: LexicalNode): boolean {
    return $isListItemNode(node) || $isParagraphNode(node);
  }

  extractWithChild(child: LexicalNode, selection: BaseSelection): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      this.getTextContent().length === selection.getTextContent().length
    );
  }

  isParentRequired(): true {
    return true;
  }

  createParentElementNode(): ListNode {
    return $createListNode('bullet');
  }

  canMergeWhenEmpty(): true {
    return true;
  }

  isBlock(): boolean | null {
    // Classify in a single child-link walk (this runs on caret/selection
    // hot paths). An item with any inline (non-list) child — a plain
    // content item, or a host row whose nested list trails its content —
    // defers to the default first-child heuristic, which already resolves
    // it correctly; the same goes for a childless item and any transient
    // non-canonical layout. Only an item whose children are ALL nested
    // lists needs an answer of its own: a dedicated wrapper (all unmarked)
    // is a container, not a block; an emptied host row (at least one list
    // carries the semantic mark) still renders a row and must behave as a
    // block (selectable, convertible via $setBlocksType, splittable).
    let sawChild = false;
    let sawMarkedList = false;
    for (
      let child = this.getFirstChild();
      child !== null;
      child = child.getNextSibling()
    ) {
      if (!$isListNode(child)) {
        return null;
      }
      sawChild = true;
      if ($getState(child, listSemanticNestingState)) {
        sawMarkedList = true;
      }
    }
    return sawChild ? sawMarkedList : null;
  }
}

function $setListItemThemeClassNames(
  dom: HTMLElement,
  editorThemeClasses: EditorThemeClasses,
  node: ListItemNode,
  isWrapper: boolean,
): void {
  const listTheme = editorThemeClasses.list;
  if (!listTheme) {
    return;
  }

  const listItemClassName = listTheme.listitem;
  const nestedListItemClassName = listTheme.nested && listTheme.nested.listitem;
  const hostListItemClassName = listTheme.listitemHost;
  const parentNode = node.getParent();
  const isCheckList = $isCheckList(parentNode);
  const checked = node.getChecked();
  // Only the dedicated wrapper item (sole purpose is holding a nested list)
  // gets the nested theme class, which is typically styled to hide the list
  // marker. An item that renders its own row ahead of a trailing nested
  // list (semantic representation) keeps its marker and gets the host
  // class instead, so themes can style rows that contain a sublist (e.g.
  // scope a checked style away from the nested rows).
  // Only computed when the theme uses the class: this runs on every
  // reconcile of a dirty item.
  const isHost =
    hostListItemClassName !== undefined &&
    !isWrapper &&
    $hasNestedListChild(node);

  // Always remove the variable theme classes first so that the className
  // string stays in a canonical order regardless of how the dom got here
  // (fresh create vs. cross-parent reuse). classList.remove on a missing
  // class is a no-op, so this is safe even on a freshly-created element.
  const classesToRemove: string[] = [];
  if (listTheme.listitemChecked !== undefined) {
    classesToRemove.push(listTheme.listitemChecked);
  }
  if (listTheme.listitemUnchecked !== undefined) {
    classesToRemove.push(listTheme.listitemUnchecked);
  }
  if (nestedListItemClassName !== undefined) {
    classesToRemove.push(...normalizeClassNames(nestedListItemClassName));
  }
  if (hostListItemClassName !== undefined) {
    classesToRemove.push(...normalizeClassNames(hostListItemClassName));
  }
  if (classesToRemove.length > 0) {
    removeClassNamesFromElement(dom, ...classesToRemove);
  }

  const classesToAdd: string[] = [];
  if (listItemClassName !== undefined) {
    classesToAdd.push(...normalizeClassNames(listItemClassName));
  }
  if (isCheckList) {
    const checkClassName = checked
      ? listTheme.listitemChecked
      : listTheme.listitemUnchecked;
    if (checkClassName !== undefined) {
      classesToAdd.push(checkClassName);
    }
  }
  if (nestedListItemClassName !== undefined && isWrapper) {
    classesToAdd.push(...normalizeClassNames(nestedListItemClassName));
  }
  if (hostListItemClassName !== undefined && isHost) {
    classesToAdd.push(...normalizeClassNames(hostListItemClassName));
  }
  if (classesToAdd.length > 0) {
    addClassNamesToElement(dom, ...classesToAdd);
  }
}

/**
 * Ownership stamp for the checkbox inputs this module creates. Membership —
 * not DOM shape — is what getListItemCheckboxDOM tests, so an application's
 * own unmanaged `<input type="checkbox">` prepended to a list item is never
 * claimed by the reconciler (removed/synced by $updateListItemChecked) or
 * by checkList.ts's click/focus routing.
 */
const listItemCheckboxInputs = new WeakSet<Element>();

/** Prefix of the generated li ids that decorateListItemDOM writes and cleans up. */
const LISTITEM_ID_PREFIX = 'lexical-listitem-';

/**
 * The native `<input type="checkbox">` rendered as the first child of a
 * check-list row in the semantic nesting mode, or `null` when the row
 * renders none (default mode, wrapper items, non-check lists) or its
 * leading input was not created by this module. The input is unmanaged DOM
 * — the reconciler and mutation observer leave it alone — and display-only
 * from the browser's perspective: checkList.ts suppresses native toggling
 * and routes clicks through the editor state.
 *
 * @internal
 */
export function getListItemCheckboxDOM(
  dom: HTMLElement,
): HTMLInputElement | null {
  const firstChild = dom.firstElementChild;
  return firstChild !== null && listItemCheckboxInputs.has(firstChild)
    ? (firstChild as HTMLInputElement)
    : null;
}

/**
 * The element that carries focus mode for a check-list row: its native
 * checkbox input when it renders one (semantic nesting mode), otherwise the
 * `<li>` itself. `checkList.ts` moves focus between rows through this
 * target, so the "focus the input if present, else the li" rule lives in
 * one place.
 *
 * @internal
 */
export function getListItemFocusTarget(dom: HTMLElement): HTMLElement {
  return getListItemCheckboxDOM(dom) ?? dom;
}

function createListItemCheckboxDOM(dom: HTMLElement): HTMLInputElement {
  const input = dom.ownerDocument.createElement('input');
  input.type = 'checkbox';
  // Focus-mode wiring (tabIndex) and accessible-name wiring (a generated
  // li id + aria-labelledby on the input) are strictly render-time
  // concerns, applied by ListExtension's DOMRenderExtension override
  // (decorateListItemDOM) so that neither leaks into exported HTML.
  setDOMUnmanaged(input);
  listItemCheckboxInputs.add(input);
  dom.insertBefore(input, dom.firstChild);
  return input;
}

/**
 * Render-time accessible-name wiring for a check row's native checkbox
 * input: a bare input announces as a nameless checkbox, whereas the
 * role="checkbox" li it replaces exposed its text content as the
 * accessible name. The li gets a generated id (scoped by editor and node
 * key) for aria-labelledby to reference. Registered by ListExtension as a
 * DOMRenderExtension `$decorateDOM` override — reconciler-only, so
 * exported HTML never carries the generated ids.
 *
 * @internal
 */
export function decorateListItemDOM(
  node: ListItemNode,
  prevNode: null | ListItemNode,
  dom: HTMLElement,
  editor: LexicalEditor,
): void {
  const input = getListItemCheckboxDOM(dom);
  if (input === null) {
    if (dom.id.startsWith(LISTITEM_ID_PREFIX)) {
      dom.removeAttribute('id');
    }
    return;
  }
  // Focus-mode navigation (checkList.ts) moves focus between rows with
  // the arrow keys; keep the inputs out of the tab order like the
  // li[tabIndex=-1] focus target they replace. Applied here (not in
  // createDOM) so exported HTML keeps keyboard-focusable checkboxes.
  if (input.getAttribute('tabindex') !== '-1') {
    input.tabIndex = -1;
  }
  if (!dom.id) {
    dom.id = `${LISTITEM_ID_PREFIX}${editor.getKey()}-${node.getKey()}`;
  }
  if (input.getAttribute('aria-labelledby') !== dom.id) {
    input.setAttribute('aria-labelledby', dom.id);
  }
}

/** Requires an active editor (runs in reconcile and exportDOM contexts). */
function $updateListItemChecked(
  dom: HTMLElement,
  listItemNode: ListItemNode,
  isWrapper: boolean,
): void {
  const parent = listItemNode.getParent();
  const isCheckbox =
    $isCheckList(parent) &&
    // Only render a checkbox for list items that render content of their
    // own, not dedicated wrapper items that just hold a nested list
    !isWrapper;
  // The semantic nesting mode renders a real (unmanaged) checkbox input,
  // which carries the role/checked/focus semantics natively.
  const useNativeInput = isCheckbox && $isListSemanticNestingEnabled();
  const input = getListItemCheckboxDOM(dom);
  const checked = listItemNode.getChecked() === true;

  if (useNativeInput) {
    const checkboxInput =
      input !== null ? input : createListItemCheckboxDOM(dom);
    // Sync the property (live state) and the attribute (via defaultChecked;
    // what outerHTML / exportDOM serialize) together.
    checkboxInput.checked = checked;
    checkboxInput.defaultChecked = checked;
  } else if (input !== null) {
    input.remove();
  }

  // The li carries role/tabIndex only for the ARIA emulation (with a
  // native input, the input owns those semantics), but aria-checked on
  // every check row: without the role it is inert for assistive
  // technology, while HTML captured from the live DOM (drag, scrapers,
  // non-Lexical copy paths) keeps its checked state readable by importers
  // that do not consume checkbox inputs.
  if (isCheckbox && !useNativeInput) {
    dom.setAttribute('role', 'checkbox');
    dom.setAttribute('tabIndex', '-1');
  } else {
    dom.removeAttribute('role');
    dom.removeAttribute('tabIndex');
  }
  if (isCheckbox) {
    dom.setAttribute('aria-checked', checked ? 'true' : 'false');
  } else {
    dom.removeAttribute('aria-checked');
  }
}

function $convertListItemElement(domNode: HTMLElement): DOMConversionOutput {
  // A direct checkbox-input child marks a task-list row. GitHub's
  // `li.task-list-item > input` is recognized everywhere (existing
  // behavior); class-less inputs — including the semantic nesting mode's
  // own export, which renders the row's real checkbox first in the li —
  // are consumed only when that mode is enabled, so default-mode editors
  // keep importing arbitrary `<li><input type=checkbox>…` HTML unchanged.
  const hasSemanticNesting = $isListSemanticNestingEnabled();
  if (domNode.classList.contains('task-list-item') || hasSemanticNesting) {
    const input = findCheckboxInputChild(domNode);
    if (input !== null) {
      return $convertCheckboxInput(input, domNode, hasSemanticNesting);
    }
  }

  const isJoplinCheckList = domNode.classList.contains('joplin-checkbox');
  if (isJoplinCheckList) {
    for (const child of domNode.children) {
      if (
        child.classList.contains('checkbox-wrapper') &&
        child.children.length > 0 &&
        child.children[0].tagName === 'INPUT'
      ) {
        return $convertCheckboxInput(
          child.children[0],
          domNode,
          hasSemanticNesting,
        );
      }
    }
  }

  const ariaCheckedAttr = domNode.getAttribute('aria-checked');
  const checked =
    ariaCheckedAttr === 'true'
      ? true
      : ariaCheckedAttr === 'false'
        ? false
        : undefined;

  const node = $createListItemNode(checked);
  $setFormatFromDOM(node, domNode);

  return {
    after: $listItemConversionAfter(
      node,
      checked !== undefined && hasSemanticNesting,
    ),
    node: $setDirectionFromDOM(node, domNode),
  };
}

/**
 * Shared `after` for the li conversions: in the semantic mode, an li that
 * demonstrably renders a row (checkbox input or aria-checked) gets its
 * nested lists marked so an emptied row is not reclassified as a wrapper;
 * then Google-Docs-style sole-paragraph formats lift onto the item.
 */
function $listItemConversionAfter(
  node: ListItemNode,
  markNestedLists: boolean,
): (children: LexicalNode[]) => LexicalNode[] {
  return children => {
    if (markNestedLists) {
      $markNestedListsAsSemantic(children);
    }
    return setFormatFromChildren(node, children);
  };
}

function $convertCheckboxInput(
  domNode: Element,
  listItemElement: HTMLElement,
  markNestedLists: boolean,
): DOMConversionOutput {
  const isCheckboxInput = domNode.getAttribute('type') === 'checkbox';
  if (!isCheckboxInput) {
    return {node: null};
  }
  const checked = domNode.hasAttribute('checked');
  const node = $createListItemNode(checked);
  // Format and direction live on the <li>, exactly like the aria-checked
  // conversion path.
  $setFormatFromDOM(node, listItemElement);
  $setDirectionFromDOM(node, listItemElement);
  return {
    after: $listItemConversionAfter(node, markNestedLists),
    node,
  };
}

function setFormatFromChildren(
  listItemNode: ListItemNode,
  children: LexicalNode[],
): LexicalNode[] {
  const firstChild = children[0];
  // google doc sets the alignment of the <p> tag inside the <li>
  if (
    children.length === 1 &&
    $isParagraphNode(firstChild) &&
    !listItemNode.getFormatType() &&
    firstChild.getFormatType()
  ) {
    listItemNode.setFormat(firstChild.getFormatType());
    return firstChild.getChildren();
  }
  return children;
}

/**
 * Creates a new List Item node, passing true/false will convert it to a checkbox input.
 * @param checked - Is the List Item a checkbox and, if so, is it checked? undefined/null: not a checkbox, true/false is a checkbox and checked/unchecked, respectively.
 * @returns The new List Item.
 */
export function $createListItemNode(checked?: boolean): ListItemNode {
  return $applyNodeReplacement(new ListItemNode(undefined, checked));
}

/**
 * Checks to see if the node is a ListItemNode.
 * @param node - The node to be checked.
 * @returns true if the node is a ListItemNode, false otherwise.
 */
export function $isListItemNode(
  node: LexicalNode | null | undefined,
): node is ListItemNode {
  return node instanceof ListItemNode;
}
