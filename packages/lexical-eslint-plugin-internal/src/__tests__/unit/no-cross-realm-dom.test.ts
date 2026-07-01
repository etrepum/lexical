/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {RuleTester} from 'eslint';
import {describe, expect, it} from 'vitest';

import plugin from '../../index.js';
import rule from '../../rules/no-cross-realm-dom.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    globals: {document: 'readonly', window: 'readonly'},
    sourceType: 'module',
  },
});

describe('no-cross-realm-dom', () => {
  it('is exported by the plugin', () => {
    expect(plugin.rules['no-cross-realm-dom']).toBe(rule);
  });

  it('passes RuleTester', () => {
    ruleTester.run('no-cross-realm-dom', rule, {
      invalid: [
        {
          code: `const r = selection.getRangeAt(0);`,
          errors: [{messageId: 'getRangeAt'}],
        },
        {
          code: `const s = window.getSelection();`,
          // window (global) + getSelection (property)
          errors: [{messageId: 'globalWindow'}, {messageId: 'getSelection'}],
        },
        {
          code: `const el = document.activeElement;`,
          errors: [{messageId: 'globalDocument'}, {messageId: 'activeElement'}],
        },
        {
          code: `const p = node.parentElement;`,
          errors: [{messageId: 'parentElement'}],
        },
        {
          code: `const n = selection.anchorNode;`,
          errors: [{messageId: 'selectionPoint'}],
        },
        {
          code: `const n = selection.focusNode;`,
          errors: [{messageId: 'selectionPoint'}],
        },
        {
          code: `const o = selection.anchorOffset;`,
          errors: [{messageId: 'selectionPoint'}],
        },
        {
          // Global window as a bare reference (not a member access).
          code: `const w = window;`,
          errors: [{messageId: 'globalWindow'}],
        },
        {
          // Undeclared global still resolves through the global scope.
          code: `foo(document);`,
          errors: [{messageId: 'globalDocument'}],
          languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
        },
      ],
      valid: [
        {
          // The realm-safe helpers themselves are fine.
          code: `const r = getDOMSelectionRange(selection, rootElement);`,
        },
        {
          code: `const el = getActiveElementDeep(root);`,
        },
        {
          // typeof feature-detect is realm-independent.
          code: `if (typeof window !== 'undefined') { init(); }`,
        },
        {
          // A local `window` binding does not resolve to the global.
          code: `function f(window) { return window.foo; }`,
        },
        {
          // Property keys named like globals are not references.
          code: `const config = {window: 1, document: 2};`,
        },
        {
          // Composed selection API is the safe one.
          code: `const ranges = selection.getComposedRanges(root);`,
        },
        {
          // Inherited Object.prototype members must not match the table.
          code: `const c = node.constructor; const h = obj.hasOwnProperty;`,
        },
        {
          // Reading the realm window off an ownerDocument is the correct
          // pattern (this is what getDefaultView does internally).
          code: `const w = node.ownerDocument.defaultView;`,
        },
        {
          // `allow` opts specific patterns out.
          code: `const p = node.parentElement;`,
          options: [{allow: ['parentElement']}],
        },
        {
          // checkGlobals: false disables the window/document identifier check.
          code: `const w = window;`,
          options: [{checkGlobals: false}],
        },
      ],
    });
  });
});
