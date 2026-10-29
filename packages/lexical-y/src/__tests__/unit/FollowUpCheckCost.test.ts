/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import {
  BlockIdExtension,
  blockIdState,
  buildEditorFromExtensions,
  configExtension,
  defineExtension,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getState,
  $setState,
  type ElementNode,
  type LexicalEditor,
} from 'lexical';
import {describe, expect, test} from 'vitest';

import {YBinding, YCollabExtension} from '../..';
import {Reader} from '../../internal/Read';

// The follow-up check (YBinding#$checkFollowUp) reads only the part of a
// container the follow-up changed: in a long document, a follow-up after
// each keystroke (BlockIdExtension's naming path) costs that part, not the
// document.

const BLOCKS = 10000;
const KEYS = 60;

type Check = (this: YBinding, ...args: unknown[]) => void;
const proto = YBinding.prototype as unknown as {$checkFollowUp: Check};
const original = proto.$checkFollowUp;

function build(): {editor: LexicalEditor; binding: YBinding} {
  const doc = new Y.Doc();
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YCollabExtension, {doc}),
        BlockIdExtension,
      ],
      name: '@lexical/y/test/follow-up-cost',
      namespace: 'follow-up-cost',
      onError: e => {
        throw e;
      },
    }),
  );
  const {binding} = getExtensionDependencyFromEditor(
    editor,
    YCollabExtension,
  ).output;
  editor.update(
    () => {
      const root = $getRoot().clear();
      for (let i = 0; i < BLOCKS; i++) {
        root.append(
          $createParagraphNode().append($createTextNode(`line ${i} of text`)),
        );
      }
    },
    {discrete: true},
  );
  binding.initialize();
  return {binding, editor};
}

/**
 * A keystroke (a character typed at the end of block `at`), then a
 * follow-up that renames that block, as BlockIdExtension's naming update
 * does: tagged as it, in an update of its own.
 */
function keystroke(editor: LexicalEditor, at: number, k: number): void {
  editor.update(
    () => {
      const line = $getRoot().getChildAtIndex(at) as ElementNode;
      line.selectEnd().insertText('x');
    },
    {discrete: true},
  );
  editor.update(
    () => {
      $setState($getRoot().getChildAtIndex(at)!, blockIdState, `renamed-${k}`);
    },
    {discrete: true, tag: 'block-id-repair'},
  );
}

function run(where: 'end' | 'middle') {
  const {editor} = build();
  let checks = 0;
  const readBlocks: number[] = [];
  const readRange = Reader.prototype.$readRange;
  let checking = false;
  Reader.prototype.$readRange = function (...args) {
    readRange.apply(this, args);
    if (checking) {
      readBlocks.push(args[1].getChildrenSize());
    }
  };
  proto.$checkFollowUp = function (this: YBinding, ...args: unknown[]) {
    checks++;
    checking = true;
    try {
      original.apply(this, args);
    } finally {
      checking = false;
    }
  };
  try {
    for (let k = 0; k < KEYS; k++) {
      const at = where === 'end' ? BLOCKS - 1 : BLOCKS / 2;
      keystroke(editor, at, k);
    }
  } finally {
    proto.$checkFollowUp = original;
    Reader.prototype.$readRange = readRange;
  }
  // Every rename was written (none read again).
  const stored = editor.read(() => {
    const at = where === 'end' ? BLOCKS - 1 : BLOCKS / 2;
    return $getState($getRoot().getChildAtIndex(at)!, blockIdState);
  });
  (editor as LexicalEditor & {dispose: () => void}).dispose();
  return {
    checks,
    readBlocks,
    stored,
  };
}

describe('the follow-up check in a long document', () => {
  for (const where of ['end', 'middle'] as const) {
    test(`${BLOCKS} blocks, ${KEYS} keystrokes at the ${where}, each followed by a naming update: the check costs the part it changed`, () => {
      const on = run(where);
      expect(on.checks).toBe(KEYS);
      expect(on.stored).toBe(`renamed-${KEYS - 1}`);
      // Each check reads the changed block and its immediate neighbours,
      // not the whole document. Count work rather than time on shared CI.
      expect(on.readBlocks).toHaveLength(KEYS);
      expect(new Set(on.readBlocks)).toEqual(
        new Set([where === 'end' ? 2 : 3]),
      );
    }, 120000);
  }
});
