/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import fs from 'node:fs';

import {test} from '../utils/index.mjs';

const LOG_PATH = '/tmp/lexical-pause-probe2.log';
const log = msg => {
  const line = `[+${Date.now() % 100000}ms] ${msg}`;
  fs.appendFileSync(LOG_PATH, line + '\n');
   
  console.warn(line);
};

test.describe.parallel('Probe', () => {
  test.beforeEach(({page}) => {
    fs.writeFileSync(LOG_PATH, `=== START ${new Date().toISOString()} ===\n`);
    log('beforeEach: about to goto about:blank');
    return page.goto('about:blank');
  });

  test('probe inside describe.parallel', async ({page}) => {
    log(`PWDEBUG = ${process.env.PWDEBUG}`);
    log('test body: --> page.pause #1');
    const t1 = Date.now();
    await page.pause();
    const e1 = Date.now() - t1;
    log(
      `<-- page.pause #1 returned in ${e1}ms ${e1 < 200 ? '***NO PAUSE***' : '(paused, resumed)'}`,
    );

    log('test body: --> page.pause #2');
    const t2 = Date.now();
    await page.pause();
    const e2 = Date.now() - t2;
    log(
      `<-- page.pause #2 returned in ${e2}ms ${e2 < 200 ? '***NO PAUSE***' : '(paused, resumed)'}`,
    );
    log('=== END ===');
  });
});
