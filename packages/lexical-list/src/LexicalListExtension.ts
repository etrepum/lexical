/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {effect, namedSignals} from '@lexical/extension';
import {
  CoreImportExtension,
  DOMImportExtension,
  domOverride,
  DOMRenderExtension,
} from '@lexical/html';
import {
  configExtension,
  defineExtension,
  mergeRegister,
  safeCast,
} from 'lexical';

import {registerCheckList} from './checkList';
import {decorateListItemDOM, ListItemNode} from './LexicalListItemNode';
import {ListNode} from './LexicalListNode';
import {ListImportRules} from './ListImportExtension';
import {registerList, registerListStrictIndentTransform} from './registerList';
import {$normalizeSemanticListItem} from './semanticNesting';

export interface ListConfig {
  /**
   * When `true`, enforces strict indentation rules for list items, ensuring consistent structure.
   * When `false` (default), indentation is more flexible.
   */
  hasStrictIndent: boolean;
  shouldPreserveNumbering: boolean;
  /**
   * When `true`, nested lists use the semantic DOM representation where the
   * nested `<ul>`/`<ol>` lives inside the list item that precedes it
   * (`<ul><li>parent<ul><li>child</li></ul></li></ul>`). When `false`
   * (default), nesting requires a dedicated `<li>` with a sole `<ul>`/`<ol>`
   * child.
   *
   * Enabling registers a {@link ListItemNode} transform that continuously
   * merges dedicated wrapper items produced by editing operations (or
   * deserialized documents in the default representation) into their
   * preceding sibling, and switches the HTML import paths over to
   * preserving `<li>text<ul>…</ul></li>` structures instead of splitting
   * them. Nested lists that sit in a content-bearing item are marked with
   * NodeState so that an item whose inline content is later deleted is not
   * mistaken for a dedicated wrapper (the two are structurally identical);
   * the mark serializes with the document JSON (not with HTML). HTML
   * export produces the semantic representation in either mode.
   *
   * The flag only gates *producing* the semantic shape (this transform and
   * the HTML import paths). *Honoring* it — rendering, values, checkbox
   * roles, indent/outdent, export — is unconditional in every editor, so a
   * marked document keeps its row identities when opened where the flag is
   * off (or the extension is absent); no transform maintains or converts
   * the representation there. Disabling does not convert content back to
   * the default representation.
   *
   * @experimental
   */
  hasSemanticNesting: boolean;
}

/**
 * Configures {@link ListNode}, {@link ListItemNode} and registers
 * the strict indent transform if `hasStrictIndent` is true (default false).
 */
export const ListExtension = /* @__PURE__ */ defineExtension({
  build(editor, config, state) {
    return namedSignals(config);
  },
  config: /* @__PURE__ */ safeCast<ListConfig>({
    hasSemanticNesting: false,
    hasStrictIndent: false,
    shouldPreserveNumbering: false,
  }),
  dependencies: [
    // DOMImportExtension support for the nodes registered here. Inert
    // unless the editor routes HTML through the pipeline (e.g. via
    // ClipboardDOMImportExtension or $generateNodesFromDOMViaExtension).
    CoreImportExtension,
    /* @__PURE__ */ configExtension(DOMImportExtension, {
      rules: ListImportRules,
    }),
    // Render-time accessible-name wiring for the semantic mode's native
    // checkbox inputs (a generated li id + aria-labelledby). $decorateDOM
    // runs only in the reconciler, so the generated ids never leak into
    // exported HTML.
    /* @__PURE__ */ configExtension(DOMRenderExtension, {
      overrides: [
        /* @__PURE__ */ domOverride([ListItemNode], {
          $decorateDOM: decorateListItemDOM,
        }),
      ],
    }),
  ],
  name: '@lexical/list/List',
  nodes: () => [ListNode, ListItemNode],
  register(editor, config, state) {
    const stores = state.getOutput();
    let firstSemanticNestingRun = true;
    return mergeRegister(
      effect(() => {
        return registerList(editor, {
          restoreNumbering: stores.shouldPreserveNumbering.value,
        });
      }),
      effect(() =>
        stores.hasStrictIndent.value
          ? registerListStrictIndentTransform(editor)
          : undefined,
      ),
      effect(() => {
        const isFirstRun = firstSemanticNestingRun;
        firstSemanticNestingRun = false;
        if (stores.hasSemanticNesting.value) {
          return editor.registerNodeTransform(
            ListItemNode,
            $normalizeSemanticListItem,
          );
        }
        // Registering the transform marks all list items dirty (converting
        // the document forward); disabling must re-render them too, or
        // check rows keep their stale native checkbox inputs while the
        // ARIA emulation attributes are already gone. Registering a no-op
        // transform and immediately unregistering it leaves exactly that
        // side effect.
        if (!isFirstRun) {
          editor.registerNodeTransform(ListItemNode, () => {})();
        }
      }),
    );
  },
});

export interface CheckListConfig {
  disableTakeFocusOnClick: boolean;
}

/**
 * Registers checklist functionality for {@link ListNode} and
 * {@link ListItemNode} with a `INSERT_CHECK_LIST_COMMAND` listener and
 * the expected keyboard and mouse interactions for checkboxes.
 */
export const CheckListExtension = /* @__PURE__ */ defineExtension({
  build: (editor, config) => namedSignals(config),
  config: /* @__PURE__ */ safeCast<CheckListConfig>({
    disableTakeFocusOnClick: false,
  }),
  dependencies: [ListExtension],
  name: '@lexical/list/CheckList',
  register: (editor, config, state) =>
    registerCheckList(editor, state.getOutput()),
});

/**
 * Bundles {@link ListImportRules} together with the runtime
 * {@link ListExtension}.
 *
 * @experimental
 * @deprecated {@link ListExtension} now registers
 * {@link ListImportRules} (and `CoreImportExtension`) itself — depend on
 * it directly instead.
 */
export const ListImportExtension = /* @__PURE__ */ defineExtension({
  dependencies: [ListExtension],
  name: '@lexical/list/Import',
});
