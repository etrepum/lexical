/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Realm-safe DOM access.
 *
 * When a Lexical editor is mounted inside a shadow tree or an iframe, the
 * global `window`/`document` and the un-composed Selection/Node reads no
 * longer describe the realm the editor actually lives in:
 *
 * - The global `window`/`document` belong to the top realm, not the
 *   iframe/shadow realm that owns `editor.getRootElement()`. Reads and DOM
 *   construction must go through the root element's `ownerDocument` /
 *   `defaultView`.
 * - Inside a shadow tree the browser retargets `Selection.getRangeAt`,
 *   `Selection.anchorNode`/`focusNode`, `document.activeElement` and
 *   `event.target` to the shadow host, hiding the real nodes Lexical needs.
 *   The composed-path/`getComposedRanges` helpers un-retarget them.
 *
 * Each dangerous pattern has a realm-safe helper in
 * `packages/lexical/src/LexicalUtils.ts`. This rule flags the raw pattern
 * and names the helper to use instead. See the "Shadow DOM & iframe realm
 * safety" section of AGENTS.md for the full guidance.
 */

/**
 * Property/method reads that are retargeted or realm-relative. Keyed by the
 * (non-computed) property name.
 *
 * @type {Record<string, {helper: string, messageId: string}>}
 */
const PROPERTY_PATTERNS = {
  activeElement: {
    helper: 'getActiveElementDeep',
    messageId: 'activeElement',
  },
  anchorNode: {helper: 'getDOMSelectionPoints', messageId: 'selectionPoint'},
  anchorOffset: {helper: 'getDOMSelectionPoints', messageId: 'selectionPoint'},
  focusNode: {helper: 'getDOMSelectionPoints', messageId: 'selectionPoint'},
  focusOffset: {helper: 'getDOMSelectionPoints', messageId: 'selectionPoint'},
  getRangeAt: {helper: 'getDOMSelectionRange', messageId: 'getRangeAt'},
  getSelection: {helper: 'getDOMSelection', messageId: 'getSelection'},
  parentElement: {helper: 'getParentElement', messageId: 'parentElement'},
};

/**
 * Global identifiers whose reference resolves to the top realm rather than
 * the editor's realm.
 *
 * @type {Record<string, {helper: string, messageId: string}>}
 */
const GLOBAL_PATTERNS = {
  document: {helper: 'getRootOwnerDocument', messageId: 'globalDocument'},
  window: {helper: 'getDefaultView', messageId: 'globalWindow'},
};

/**
 * True when the identifier is used purely as a feature-detect
 * (`typeof window !== 'undefined'`), which is realm-independent and safe.
 *
 * @param {import('eslint').Rule.Node} node
 * @returns {boolean}
 */
function isTypeofOperand(node) {
  const {parent} = node;
  return (
    !!parent &&
    parent.type === 'UnaryExpression' &&
    parent.operator === 'typeof'
  );
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  create(context) {
    const sourceCode = context.sourceCode;
    const [options] = context.options;
    const allow = new Set((options && options.allow) || []);
    const checkGlobals = !(options && options.checkGlobals === false);

    /**
     * Report every reference to a restricted global (e.g. `window`),
     * whether it is provided by the environment (declared in the global
     * scope) or left undeclared (`through`). Property keys, member
     * accesses like `foo.window`, and `typeof` operands are not references
     * to the global and are skipped.
     *
     * @param {import('eslint').Scope.Scope} globalScope
     */
    function reportGlobals(globalScope) {
      for (const name of Object.keys(GLOBAL_PATTERNS)) {
        if (allow.has(name)) {
          continue;
        }
        const {helper, messageId} = GLOBAL_PATTERNS[name];
        const variable = globalScope.set.get(name);
        const references = variable
          ? variable.references
          : globalScope.through.filter(ref => ref.identifier.name === name);
        for (const ref of references) {
          const id = ref.identifier;
          if (isTypeofOperand(id)) {
            continue;
          }
          context.report({
            data: {helper, name},
            messageId,
            node: id,
          });
        }
      }
    }

    return {
      MemberExpression(node) {
        if (node.computed || node.property.type !== 'Identifier') {
          return;
        }
        const name = node.property.name;
        // `Object.hasOwn` guard: without it `node.constructor` /
        // `obj.hasOwnProperty` etc. would match inherited Object.prototype
        // members of the lookup table.
        if (!Object.hasOwn(PROPERTY_PATTERNS, name) || allow.has(name)) {
          return;
        }
        const pattern = PROPERTY_PATTERNS[name];
        context.report({
          data: {helper: pattern.helper, name},
          messageId: pattern.messageId,
          node: node.property,
        });
      },
      'Program:exit'(node) {
        if (checkGlobals) {
          reportGlobals(sourceCode.getScope(node));
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'disallow raw DOM patterns that break across shadow DOM / iframe' +
        ' realm boundaries; use the realm-safe LexicalUtils helpers instead',
      recommended: false,
    },
    messages: {
      activeElement:
        'Reading `.activeElement` returns the shadow host inside a shadow' +
        ' tree — use `{{helper}}()` to walk into nested shadow roots.',
      getRangeAt:
        '`Selection.getRangeAt` is retargeted to the shadow host inside a' +
        ' shadow tree — use `{{helper}}(selection, rootElement)` to read the' +
        ' composed range.',
      getSelection:
        'Prefer `{{helper}}(targetWindow)` /' +
        ' `getDOMSelectionFromTarget(target)` so the selection is read from' +
        " the editor's realm instead of the calling realm.",
      globalDocument:
        'The global `document` belongs to the top realm, not the editor' +
        ' iframe/shadow realm — use `{{helper}}(rootElement)` (or the root' +
        " element's `ownerDocument`) instead.",
      globalWindow:
        'The global `window` belongs to the top realm, not the editor' +
        ' iframe/shadow realm — use `{{helper}}(node)`/`getWindow(editor)`' +
        ' to resolve the realm window instead.',
      parentElement:
        '`.parentElement` stops at the shadow boundary — use `{{helper}}' +
        '(node)` to cross open shadow roots.',
      selectionPoint:
        'Selection boundary fields (`.anchorNode`/`.focusNode`/offsets) are' +
        ' retargeted to the shadow host inside a shadow tree — use' +
        ' `{{helper}}(selection, rootElement)` to read the composed points.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: {type: 'string'},
            type: 'array',
          },
          checkGlobals: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
};

export default rule;
