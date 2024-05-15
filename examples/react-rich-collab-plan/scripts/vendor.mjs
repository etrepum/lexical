/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {exec} from 'child-process-promise';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function main() {
  const cwd = process.cwd();
  const vendorDir = path.resolve(cwd, 'vendor');
  const packFile = path.resolve(vendorDir, 'lexical-builder-0.15.0.tgz');
  if (fs.existsSync(packFile)) {
    // eslint-disable-next-line no-console
    console.log('using cached lexical-builder-0.15.0.tgz');
  } else {
    // eslint-disable-next-line no-console
    console.log('building a release to create @lexical/builder artifact');
    const rmDirs = [
      `./node_modules/@lexical/builder`,
      `./node_modules/.vite`,
    ].flatMap((fn) => (fs.existsSync(fn) ? [`'${fn}'`] : []));
    if (rmDirs.length > 0) {
      await exec(`rm -rf ${rmDirs.join(' ')}`);
    }
    try {
      process.chdir('../..');
      await exec(`npm run build-prod -- --release`);
      await exec(`node ./scripts/npm/prepare-release.js`);
      process.chdir('packages/lexical-builder/npm');
      await exec(
        `mkdir -p '${vendorDir}' && npm pack --pack-destination '${vendorDir}'`,
      );
      await exec(`npm i --ignore-scripts '${packFile}'`);
    } finally {
      process.chdir(cwd);
    }
  }
}

main();
