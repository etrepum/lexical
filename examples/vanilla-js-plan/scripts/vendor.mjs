/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {exec} from 'child-process-promise';
import * as path from 'node:path';

async function main() {
  const cwd = process.cwd();
  const vendorDir = path.resolve(cwd, 'vendor');
  // eslint-disable-next-line no-console
  console.log('building a release to create @lexical/builder artifact');
  try {
    process.chdir('../..');
    await exec(`npm run build-prod -- --release`);
    await exec(`node ./scripts/npm/prepare-release.js`);
    process.chdir('packages/lexical-builder/npm');
    await exec(`npm pack --pack-destination '${vendorDir}'`);
  } finally {
    process.chdir(cwd);
  }
}

main();
