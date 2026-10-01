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
  $setState,
  type BaseSelection,
  booleanValue,
  buildImportMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type EditorThemeClasses,
  type ElementDOMSlot,
  ElementNode,
  getCachedClassNameArray,
  getParentElement,
  getStyleObjectFromCSS,
  isHTMLElement,
  type LexicalEditor,
  type LexicalNode,
  type LexicalParseJSON,
  type NodeKey,
  nodeSchema,
  numberValue,
  optional,
  type ParagraphNode,
  type RangeSelection,
  type SerializedElementNode,
  type SerializedPartial,
  setDOMStyleFromCSS,
  setDOMUnmanaged,
  type Spread,
  withAccessors,
  withField,
} from 'lexical';

import {$createListNode, $isListNode, type ListNode, type ListType} from './';
import {
  $collapseWrapperPair,
  $handleIndent,
  $handleOutdent,
} from './formatList';
import {GENERATED_LISTITEM} from './LexicalListGeneratedJSON';
import {
  $isListSemanticNestingEnabled,
  $markNestedListsAsSemantic,
  $parkNestedListsInWrapper,
  getListEditorForConfig,
} from './semanticNesting';
import {
  $copyListForSplit,
  $getListItemOwnTextContent,
  $getNewListStart,
  $hasNestedListChild,
  $isCheckList,
  $isEmptiedHostRow,
  $isWrapperListItemNode,
  findCheckboxInputChild,
  isCheckboxInputElement,
  isLexicalCheckListElement,
  listItemPlainState,
} from './utils';

export type SerializedListItemNode = Spread<
  {
    checked: boolean | undefined;
    value: number;
  },
  SerializedElementNode
>;

/**
 * The deepest list nesting `setIndent` will walk to. Each level it steps
 * through nests or unwraps a whole list, so this bounds work an untrusted
 * `indent` could otherwise make unbounded.
 */
const MAX_LIST_ITEM_INDENT = 128;

const listItemNodeSchema = nodeSchema<ListItemNode>()({
  // getChecked computes from the parent list's type, so the getter stays a
  // method; setChecked is a bare field write.
  checked: withAccessors(optional(booleanValue()), {
    setter: {field: '__checked'},
  }),
  // Overrides the inherited ElementNode field to bound it. This indent is
  // structural — applying it nests or unwraps one whole list per level — so an
  // unbounded value out of untrusted JSON would build millions of nodes.
  // `clamp`, because the plain bounds fall back to the *default* for a value
  // outside them, which would read an over-deep item as indent 0 instead of as
  // deeply nested.
  indent: numberValue(0, {
    clamp: true,
    integer: true,
    max: MAX_LIST_ITEM_INDENT,
    min: 0,
  }),
  value: withField(numberValue(1), {
    field: '__value',
  }),
});

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface ListItemNode {
  exportJSON(compact?: false): SerializedListItemNode;
  exportJSON(compact: boolean): SerializedPartial<SerializedListItemNode>;
  updateFromJSON(
    serializedNode: LexicalParseJSON<SerializedListItemNode>,
  ): this;
}

/** @noInheritDoc */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
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
          // Checkbox state is normalized against the parent list (read the
          // raw field / state directly — getChecked already reports
          // undefined off a check list, so it can't gate this):
          // - off a check list a row carries no checkbox state at all, so
          //   both the checked flag and the mixed-list "plain" mark go;
          // - in a check list the plain mark and a checked flag are mutually
          //   exclusive (setChecked / setListItemPlain each clear the
          //   other), but hand-authored JSON can carry both since the schema
          //   writes the field directly. The mark is what rendered
          //   (getChecked reads undefined), so the hidden flag goes, or a
          //   later toggle would flip a row the user saw as plain into an
          //   unchecked checkbox.
          const inCheckList = $isCheckList(parent);
          const plain = $getState(node, listItemPlainState);
          if (
            node.getLatest().__checked !== undefined &&
            (!inCheckList || plain)
          ) {
            node.setChecked(undefined);
          }
          if (!inCheckList && plain) {
            $setState(node, listItemPlainState, false);
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
      generated: GENERATED_LISTITEM,
      importDOM: buildImportMap({
        li: () => ({
          conversion: $convertListItemElement,
          priority: 0,
        }),
      }),
      json: listItemNodeSchema,
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

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const element = $getDocument().createElement('li');
    this.updateListItemDOM(null, element, config, editor);

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
    editor?: LexicalEditor,
  ) {
    // Classified once per reconcile; both helpers below need it. A check
    // row renders a real <input type=checkbox> — rather than the ARIA /
    // ::before emulation — in the semantic nesting representation; the
    // theme keys and DOM wiring differ, so resolve it once here. The owning
    // editor is the caller's when it has one (the reconciler and exportDOM
    // do), otherwise the one registered for the config object it passed —
    // found without an active editor, so a subclass keeping the
    // one-argument `createDOM(config)` still builds the right
    // representation inside a bare editorState.read().
    const isWrapper = $isWrapperListItemNode(this);
    const owner =
      editor !== undefined ? editor : getListEditorForConfig(config);
    const hasSemanticNesting =
      owner !== undefined && $isListSemanticNestingEnabled(owner);
    // Task-ness, not the list type, decides whether the row draws a checkbox:
    // a plain row in a check list (the GitHub mixed task-list case) reports
    // getChecked() === undefined and renders none, and getChecked already
    // folds in the parent being a check list; the explicit isWrapper guard
    // keeps a wrapper (whose getChecked would read false) out. Classified
    // once and passed down: the getChecked chain is a node-map lookup plus a
    // NodeState read, and both helpers below need the same answers.
    const checkedState = isWrapper ? undefined : this.getChecked();
    const isTaskItem = checkedState !== undefined;
    const checked = checkedState === true;
    const useNativeCheckbox = isTaskItem && hasSemanticNesting;
    updateListItemChecked(dom, isTaskItem, checked, useNativeCheckbox);

    // Theme classes: in the default representation a wrapper inside a check
    // list keeps the (emulated) checked/unchecked class it has always had —
    // themes and the playground's e2e expectations rely on
    // `listitemUnchecked nested` — even though it renders no checkbox
    // attributes. Only the semantic mode, where the items own the checkbox
    // styling, leaves its wrappers without one.
    const themeCheckedState =
      isWrapper && !hasSemanticNesting ? this.getChecked() : checkedState;
    dom.value = this.__value;
    $setListItemThemeClassNames(
      dom,
      config.theme,
      this,
      isWrapper,
      themeCheckedState !== undefined,
      themeCheckedState === true,
      useNativeCheckbox,
    );
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

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = this.createDOM(editor._config, editor);

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
      // The copy carries the original list's start, which would restart the
      // numbering at the split. The items moving into the new list keep the
      // numbers they were already rendered with, so the new list has to start
      // from the first of them (see issue #7032).
      const firstSibling = siblings[0];
      if (
        newListNode.getListType() === 'number' &&
        $isListItemNode(firstSibling)
      ) {
        newListNode.setStart($getNewListStart(listNode, firstSibling));
      }

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

    // A row explicitly marked plain (the GitHub mixed task-list case) reports
    // "not a task" even inside a check list, so it renders no checkbox.
    if (listType !== 'check' || $getState(self, listItemPlainState)) {
      return undefined;
    }
    return Boolean(self.__checked);
  }

  setChecked(checked?: boolean): this {
    const self = this.getWritable();
    self.__checked = checked;
    // Explicitly setting a checkbox state makes the row a task row: clear
    // the mixed-task-list plain mark so the change is visible (a hidden
    // __checked under a plain mark would diverge from the serialized state,
    // which round-trips through getChecked()). Clearing state (undefined)
    // carries no such intent — the $transform clears checked and plain
    // independently when a row leaves a check list.
    if (checked !== undefined && $getState(self, listItemPlainState)) {
      return $setState(self, listItemPlainState, false);
    }
    return self;
  }

  toggleChecked(): this {
    const self = this.getWritable();
    return self.setChecked(!self.__checked);
  }

  /**
   * Whether this row is explicitly a plain (non-checkbox) row inside a check
   * list — the GitHub mixed task-list case. A plain row reports
   * {@link getChecked} as `undefined`, so it renders no checkbox. Always
   * `false` outside a check list. See {@link listItemPlainState}.
   */
  getListItemPlain(): boolean {
    const self = this.getLatest();
    return (
      $isCheckList(self.getParent()) && $getState(self, listItemPlainState)
    );
  }

  /**
   * Mark (or unmark) this row as a plain, non-checkbox row within a check
   * list. Only meaningful inside a check list; the list item `$transform`
   * clears the mark when the row moves to any other list type.
   */
  setListItemPlain(plain: boolean): this {
    // Updater form so re-marking an already-plain row does not dirty it
    // (import reconciliation may visit a row more than once).
    const self = $setState(this, listItemPlainState, () => plain);
    // A plain row carries no checkbox state: clear any lingering __checked
    // so the in-memory row cannot diverge from its JSON round-trip (which
    // serializes through getChecked() and drops the hidden value).
    if (plain && self.getLatest().__checked !== undefined) {
      return self.setChecked(undefined);
    }
    return self;
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
    // Deliberately not clamped here: the bound belongs on the parse path (see
    // listItemNodeSchema), because clamping the target of a walk that starts
    // from the node's *current* indent would outdent an item that is already
    // nested deeper than the bound — making `item.setIndent(item.getIndent())`
    // destroy structure rather than do nothing.
    const target = indent;
    let currentIndent = this.getIndent();
    while (currentIndent !== target) {
      if (currentIndent < target) {
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

    if (!(this.isParentOf(anchorNode) && this.isParentOf(focusNode))) {
      return false;
    }
    if (this.getTextContent().length === selection.getTextContent().length) {
      return true;
    }
    // Semantic representation: the row's own inline content precedes its
    // nested lists, and getTextContent() folds the nested rows in, so the
    // length test above can never match a host row. The row is covered
    // when the selection starts at its own content's start and ends at (or
    // past) its own content's end — including inside the nested rows —
    // exactly the cases the wrapper representation extracts as a whole
    // <li> (copying a row must keep it a list item).
    if (!$hasNestedListChild(this)) {
      return false;
    }
    const [start, end] = selection.isBackward()
      ? [selection.focus, selection.anchor]
      : [selection.anchor, selection.focus];
    return (
      $isAtRowContentStart(this, start) && $isAtOrPastRowContentEnd(this, end)
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

  isBlockOverride(): boolean | null {
    // An item with any inline (non-list) child — or no children — defers to
    // the default first-child heuristic (null), which already resolves it
    // correctly. Only an item whose children are ALL nested lists needs an
    // answer of its own, and the two shared predicates are that split's
    // single encoding: a dedicated wrapper (all unmarked) is a container,
    // not a block; an emptied host row (some list marked) still renders a
    // row and must behave as a block. Both exit at the first inline child,
    // so the common content row costs one link read per predicate on the
    // caret/selection hot paths this serves.
    return $isWrapperListItemNode(this)
      ? false
      : $isEmptiedHostRow(this)
        ? true
        : null;
  }
}

/**
 * Whether `point` sits at the start of the item's own inline content: the
 * element point (item, 0), or offset 0 of its first inline descendant.
 */
function $isAtRowContentStart(
  listItemNode: ListItemNode,
  point: RangeSelection['anchor'],
): boolean {
  if (point.type === 'element') {
    return point.key === listItemNode.getKey() && point.offset === 0;
  }
  if (point.offset !== 0) {
    return false;
  }
  const firstChild = listItemNode.getFirstChild();
  if (firstChild === null || $isListNode(firstChild)) {
    return false;
  }
  const firstDescendant = $isElementNode(firstChild)
    ? firstChild.getFirstDescendant()
    : firstChild;
  return firstDescendant !== null && point.getNode().is(firstDescendant);
}

// The variable theme classes a list item may carry (checked/unchecked in
// both representations, nested, host), per theme object — see
// $setListItemThemeClassNames.
const listItemVariantClassNames = new WeakMap<
  EditorThemeClasses,
  readonly string[]
>();

/**
 * Whether `point` is at the end of the item's own inline content or beyond
 * it (inside one of the item's nested lists).
 */
function $isAtOrPastRowContentEnd(
  listItemNode: ListItemNode,
  point: RangeSelection['anchor'],
): boolean {
  // The last own (non-list) child and its index among the children.
  let lastOwnChild: LexicalNode | null = null;
  let lastOwnIndex = -1;
  let index = 0;
  for (
    let child = listItemNode.getFirstChild();
    child !== null;
    child = child.getNextSibling(), index++
  ) {
    if (!$isListNode(child)) {
      lastOwnChild = child;
      lastOwnIndex = index;
    }
  }
  if (point.type === 'element') {
    return point.key === listItemNode.getKey() && point.offset > lastOwnIndex;
  }
  const node = point.getNode();
  // Inside a nested list of this item: past the own content.
  for (
    let ancestor = node.getParent();
    ancestor !== null && !ancestor.is(listItemNode);
    ancestor = ancestor.getParent()
  ) {
    if ($isListNode(ancestor) && listItemNode.is(ancestor.getParent())) {
      return true;
    }
  }
  if (lastOwnChild === null) {
    return false;
  }
  const lastDescendant = $isElementNode(lastOwnChild)
    ? lastOwnChild.getLastDescendant()
    : lastOwnChild;
  return (
    lastDescendant !== null &&
    node.is(lastDescendant) &&
    point.offset === lastDescendant.getTextContentSize()
  );
}

function $setListItemThemeClassNames(
  dom: HTMLElement,
  editorThemeClasses: EditorThemeClasses,
  node: ListItemNode,
  isWrapper: boolean,
  // Task-ness (not the parent list type) gates the checked/unchecked theme
  // classes, so a plain row in a check list — the mixed task-list case —
  // gets neither; a wrapper never renders a row. Classified once by the
  // caller (updateListItemDOM) for both DOM and theme updates.
  isTaskItem: boolean,
  checked: boolean,
  useNativeCheckbox: boolean,
): void {
  const listTheme = editorThemeClasses.list;
  if (!listTheme) {
    return;
  }

  // Core's per-theme-object memoization of the tokenized class strings —
  // this runs on every reconcile of a dirty list item, and re-splitting
  // long (e.g. Tailwind) theme strings each time is measurable.
  const listItemClassNames = getCachedClassNameArray(listTheme, 'listitem');
  const nestedListItemClassNames = listTheme.nested
    ? // The nested sub-object is a narrower type than EditorThemeClasses
      // (no index signature), but the cache works on any theme sub-object.
      getCachedClassNameArray(
        listTheme.nested as EditorThemeClasses,
        'listitem',
      )
    : undefined;
  const hostListItemClassNames = getCachedClassNameArray(
    listTheme,
    'listitemHost',
  );
  const checkedClassNames = getCachedClassNameArray(
    listTheme,
    'listitemChecked',
  );
  const uncheckedClassNames = getCachedClassNameArray(
    listTheme,
    'listitemUnchecked',
  );
  const checkedNativeClassNames = getCachedClassNameArray(
    listTheme,
    'listitemCheckedNative',
  );
  const uncheckedNativeClassNames = getCachedClassNameArray(
    listTheme,
    'listitemUncheckedNative',
  );
  // Only the dedicated wrapper item (sole purpose is holding a nested list)
  // gets the nested theme class, which is typically styled to hide the list
  // marker. An item that renders its own row ahead of a trailing nested
  // list (semantic representation) keeps its marker and gets the host
  // class instead, so themes can style rows that contain a sublist (e.g.
  // scope a checked style away from the nested rows).
  // Only computed when the theme uses the class: this runs on every
  // reconcile of a dirty item.
  const isHost =
    hostListItemClassNames !== undefined &&
    !isWrapper &&
    $hasNestedListChild(node);

  // Always remove the variable theme classes first so that the className
  // string stays in a canonical order regardless of how the dom got here
  // (fresh create vs. cross-parent reuse) or which checkbox representation
  // the row used last (the emulated and native check classes must never
  // linger together). classList.remove on a missing class is a no-op, so
  // this is safe even on a freshly-created element. The set is a function
  // of the theme alone, memoized per theme object rather than rebuilt on
  // every reconcile of every dirty row.
  let classesToRemove = listItemVariantClassNames.get(listTheme);
  if (classesToRemove === undefined) {
    const variantClasses: string[] = [];
    for (const variantClassNames of [
      checkedClassNames,
      uncheckedClassNames,
      checkedNativeClassNames,
      uncheckedNativeClassNames,
      nestedListItemClassNames,
      hostListItemClassNames,
    ]) {
      if (variantClassNames !== undefined) {
        variantClasses.push(...variantClassNames);
      }
    }
    classesToRemove = variantClasses;
    listItemVariantClassNames.set(listTheme, classesToRemove);
  }
  if (classesToRemove.length > 0) {
    // The cached arrays hold normalized single tokens, so classList is
    // driven directly — removeClassNamesFromElement would re-tokenize
    // every string on each reconcile.
    dom.classList.remove(...classesToRemove);
  }

  const classesToAdd: string[] = [];
  if (listItemClassNames !== undefined) {
    classesToAdd.push(...listItemClassNames);
  }
  if (isTaskItem) {
    // A row rendering a native <input type=checkbox> (semantic nesting)
    // uses its own theme keys so it never draws the emulated ::before
    // checkbox on top of the real input; every other check row uses the
    // ARIA-emulation keys.
    const checkClassNames = useNativeCheckbox
      ? checked
        ? checkedNativeClassNames
        : uncheckedNativeClassNames
      : checked
        ? checkedClassNames
        : uncheckedClassNames;
    if (checkClassNames !== undefined) {
      classesToAdd.push(...checkClassNames);
    }
  }
  if (nestedListItemClassNames !== undefined && isWrapper) {
    classesToAdd.push(...nestedListItemClassNames);
  }
  if (hostListItemClassNames !== undefined && isHost) {
    classesToAdd.push(...hostListItemClassNames);
  }
  if (classesToAdd.length > 0) {
    dom.classList.add(...classesToAdd);
  }

  // Style the native checkbox input itself (semantic nesting), if the
  // theme provides a class for it. The input is the row's first child.
  const checkboxClassNames = getCachedClassNameArray(
    listTheme,
    'listitemCheckbox',
  );
  if (checkboxClassNames !== undefined) {
    const input = getListItemCheckboxDOM(dom);
    if (input !== null) {
      input.classList.add(...checkboxClassNames);
    }
  }
}

/**
 * Ownership stamp for the checkbox inputs this module creates. Membership —
 * not DOM shape — is what getListItemCheckboxDOM tests, so an application's
 * own unmanaged `<input type="checkbox">` prepended to a list item is never
 * claimed by the reconciler (removed/synced by updateListItemChecked) or
 * by checkList.ts's click/focus routing.
 */
const listItemCheckboxInputs = new WeakSet<Element>();

/** Prefix of the generated li ids that decorateListItemDOM writes and cleans up. */

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
  // Focus-mode wiring (tabIndex), the accessible name (aria-label) and the
  // editable state (disabled) are strictly render-time concerns, applied by
  // ListExtension's DOMRenderExtension override (decorateListItemDOM) so
  // that none of them leaks into exported HTML.
  setDOMUnmanaged(input);
  listItemCheckboxInputs.add(input);
  dom.insertBefore(input, dom.firstChild);
  return input;
}

/**
 * Render-time wiring for a check row's native checkbox input. Registered by
 * ListExtension as a DOMRenderExtension `$decorateDOM` override, which the
 * reconciler runs for every reconciled row — including one whose text just
 * changed — and never for exportDOM, so nothing here reaches exported HTML.
 *
 * - Accessible name: a bare input announces as a nameless checkbox, and a
 *   label spanning the whole `<li>` would read every nested row beneath a
 *   host row too. `aria-label` carries the row's own inline text instead.
 * - Tab order: focus-mode navigation (checkList.ts) moves focus between
 *   rows with the arrow keys; the inputs stay out of the tab order like the
 *   li[tabIndex=-1] focus target they replace.
 * - Editable state: a read-only editor renders its inputs disabled, so
 *   neither a click nor Space toggles one natively (ListExtension re-renders
 *   the rows when the editable state changes).
 *
 * @internal
 */
export function $decorateListItemDOM(
  node: ListItemNode,
  prevNode: null | ListItemNode,
  dom: HTMLElement,
  editor: LexicalEditor,
): void {
  const input = getListItemCheckboxDOM(dom);
  if (input === null) {
    return;
  }
  if (input.getAttribute('tabindex') !== '-1') {
    input.tabIndex = -1;
  }
  const label = $getListItemOwnTextContent(node);
  if (input.getAttribute('aria-label') !== label) {
    input.setAttribute('aria-label', label);
  }
  const disabled = !editor.isEditable();
  if (input.disabled !== disabled) {
    input.disabled = disabled;
  }
}
/** @deprecated renamed to {@link $decorateListItemDOM} by @lexical/eslint-plugin rules-of-lexical */
export const decorateListItemDOM = $decorateListItemDOM;

function updateListItemChecked(
  dom: HTMLElement,
  // Only list items that render content of their own are checkboxes, not
  // dedicated wrapper items that just hold a nested list; the caller
  // (updateListItemDOM) computes the classification once for both DOM and
  // theme updates. The semantic nesting mode renders a real (unmanaged)
  // input, which carries the role/checked/focus semantics natively.
  isCheckbox: boolean,
  checked: boolean,
  useNativeInput: boolean,
): void {
  const input = getListItemCheckboxDOM(dom);

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

  // The li carries role/tabIndex/aria-checked only for the ARIA emulation.
  // With a native input the input owns those semantics, and aria-checked
  // is not allowed on a plain list item (an `aria-allowed-attr` audit
  // failure); the input's `checked` attribute carries the state in HTML
  // captured from the live DOM, and both importers consume it.
  if (isCheckbox && !useNativeInput) {
    dom.setAttribute('role', 'checkbox');
    dom.setAttribute('tabIndex', '-1');
    dom.setAttribute('aria-checked', checked ? 'true' : 'false');
  } else {
    dom.removeAttribute('role');
    dom.removeAttribute('tabIndex');
    dom.removeAttribute('aria-checked');
  }
}

function $convertListItemElement(domNode: HTMLElement): DOMConversionOutput {
  // A direct checkbox-input child marks a task-list row. GitHub's
  // `li.task-list-item > input` is recognized everywhere (existing
  // behavior); class-less inputs — the semantic nesting mode's own export,
  // which renders the row's real checkbox first in the li — are consumed
  // when that mode is enabled or when the enclosing list is a Lexical
  // check list (its `__lexicallisttype` attribute), so that export keeps
  // its checked state when pasted into a default-mode editor, while
  // arbitrary `<li><input type=checkbox>…` HTML imports unchanged there.
  const hasSemanticNesting = $isListSemanticNestingEnabled();
  if (
    domNode.classList.contains('task-list-item') ||
    hasSemanticNesting ||
    isLexicalCheckListElement(getParentElement(domNode))
  ) {
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
  if (!isCheckboxInputElement(domNode)) {
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
