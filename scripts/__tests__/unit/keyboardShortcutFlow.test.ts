/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, beforeAll, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const flowBinary: string = require('flow-bin');

let dir: string;
let errors: {
  error_codes: string[];
  message: {path: string}[];
}[];

beforeAll(() => {
  dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'lexical-keyboard-flow-')),
  );
  fs.copyFileSync(
    'packages/lexical/flow/Lexical.js.flow',
    path.join(dir, 'Lexical.js.flow'),
  );
  fs.cpSync('flow-typed', path.join(dir, 'flow-typed'), {recursive: true});
  fs.writeFileSync(
    path.join(dir, '.flowconfig'),
    `[declarations]\n.*/flow-typed/.*\n[libs]\n./flow-typed\n[options]\nmodule.name_mapper='^lexical$' -> '<PROJECT_ROOT>/Lexical.js.flow'\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'accepted.js'),
    `// @flow
      import type {CompiledKeyboardShortcuts, KeyboardShortcutMatch} from 'lexical';
      import {compileKeyboardShortcuts} from 'lexical';
      const shortcuts: CompiledKeyboardShortcuts<KeyboardShortcutMatch> = compileKeyboardShortcuts([{key: 'x'}]);
      shortcuts.add({key: 'y'});
    `,
  );
  fs.writeFileSync(
    path.join(dir, 'rejected.js'),
    `// @flow
      import {CompiledKeyboardShortcuts} from 'lexical';
      new CompiledKeyboardShortcuts();
    `,
  );
  // Check both consumers together so Flow loads its libraries only once.
  const result = spawnSync(flowBinary, ['full-check', '--json', dir], {
    encoding: 'utf8',
    timeout: 20_000,
  });
  expect(result.status, result.stdout + result.stderr).toBe(2);
  errors = JSON.parse(result.stdout).errors;
}, 25_000);

afterAll(() => fs.rmSync(dir, {force: true, recursive: true}));

it('keyboard shortcut Flow API accepts the type and runtime factory', () => {
  // Any diagnostic in the valid consumer or declaration libraries is a failure.
  expect(
    errors.filter(
      error =>
        path.resolve(error.message[0].path) !== path.join(dir, 'rejected.js'),
    ),
  ).toEqual([]);
});

it('keyboard shortcut Flow API rejects construction through a nonexistent runtime export', () => {
  expect(errors).toHaveLength(1);
  expect(errors[0].error_codes).toEqual(['import-type-as-value']);
});
