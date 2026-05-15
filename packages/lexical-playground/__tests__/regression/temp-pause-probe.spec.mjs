/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {test} from '@playwright/test';
import fs from 'node:fs';
import * as inspector from 'node:inspector';

const LOG_PATH = '/tmp/lexical-pause-probe.log';
const log = msg => {
  const line = `[+${Date.now() % 100000}ms] ${msg}`;
  fs.appendFileSync(LOG_PATH, line + '\n');
   
  console.warn(line);
};

test('probe page.pause behavior', async ({page, context, browser}) => {
  fs.writeFileSync(
    LOG_PATH,
    `=== PROBE START ${new Date().toISOString()} ===\n`,
  );
  log(`inspector.url(): ${inspector.url() ?? '(none)'}`);
  log(`process.env.PWDEBUG = ${process.env.PWDEBUG}`);
  log(`process.env.NODE_OPTIONS = ${process.env.NODE_OPTIONS}`);
  log(
    `process.env.PW_TEST_CONNECT_WS_ENDPOINT = ${process.env.PW_TEST_CONNECT_WS_ENDPOINT}`,
  );
  log(`browser.version() = ${browser.version()}`);
  log(`browser._channel._guid = ${browser._channel?._guid}`);
  log(`browser is connected = ${browser.isConnected()}`);

  log('--> page.goto about:blank');
  const t0 = Date.now();
  await page.goto('about:blank');
  log(`<-- page.goto returned in ${Date.now() - t0}ms`);

  log('--> page.pause #1 (you should see the Inspector "paused" state)');
  const t1 = Date.now();
  await page.pause();
  const e1 = Date.now() - t1;
  log(
    `<-- page.pause #1 returned in ${e1}ms ${e1 < 200 ? '***NO PAUSE***' : '(paused, then resumed)'}`,
  );

  log('--> page.pause #2');
  const t2 = Date.now();
  await page.pause();
  const e2 = Date.now() - t2;
  log(
    `<-- page.pause #2 returned in ${e2}ms ${e2 < 200 ? '***NO PAUSE***' : '(paused, then resumed)'}`,
  );

  log('=== PROBE END ===');
});
