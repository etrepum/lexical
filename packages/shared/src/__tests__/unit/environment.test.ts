/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {afterEach, describe, expect, test, vi} from 'vitest';

type EnvFlags = {
  IS_ANDROID: boolean;
  IS_ANDROID_CHROME: boolean;
  IS_APPLE: boolean;
  IS_APPLE_WEBKIT: boolean;
  IS_CHROME: boolean;
  IS_FIREFOX: boolean;
  IS_IOS: boolean;
  IS_SAFARI: boolean;
};

type UaSample = {
  name: string;
  userAgent: string;
  platform: string;
  expected: EnvFlags;
};

const SAMPLES: UaSample[] = [
  {
    // Regression test for https://github.com/facebook/lexical/issues/7886.
    // Android WebView's UA contains "Version/X.X ... Safari/537.36", which
    // matches the Safari regex. Misclassifying it as Safari activated the
    // wrong composition code paths and made bold/italic text unusable.
    expected: {
      IS_ANDROID: true,
      IS_ANDROID_CHROME: true,
      IS_APPLE: false,
      IS_APPLE_WEBKIT: false,
      IS_CHROME: true,
      IS_FIREFOX: false,
      IS_IOS: false,
      IS_SAFARI: false,
    },
    name: 'Android 12 WebView (Chrome 114)',
    platform: 'Linux armv8l',
    userAgent:
      'Mozilla/5.0 (Linux; Android 12; HMA-L29; wv) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Version/4.0 Chrome/114.0.0.0 Mobile Safari/537.36',
  },
  {
    expected: {
      IS_ANDROID: true,
      IS_ANDROID_CHROME: true,
      IS_APPLE: false,
      IS_APPLE_WEBKIT: false,
      IS_CHROME: true,
      IS_FIREFOX: false,
      IS_IOS: false,
      IS_SAFARI: false,
    },
    name: 'Android Chrome (non-WebView)',
    platform: 'Linux armv8l',
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
  },
  {
    expected: {
      IS_ANDROID: false,
      IS_ANDROID_CHROME: false,
      IS_APPLE: true,
      IS_APPLE_WEBKIT: true,
      IS_CHROME: false,
      IS_FIREFOX: false,
      IS_IOS: true,
      IS_SAFARI: true,
    },
    name: 'iOS Safari',
    platform: 'iPhone',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 ' +
      'Mobile/15E148 Safari/604.1',
  },
  {
    expected: {
      IS_ANDROID: false,
      IS_ANDROID_CHROME: false,
      IS_APPLE: true,
      IS_APPLE_WEBKIT: true,
      IS_CHROME: false,
      IS_FIREFOX: false,
      IS_IOS: false,
      IS_SAFARI: true,
    },
    name: 'macOS Safari',
    platform: 'MacIntel',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  },
  {
    expected: {
      IS_ANDROID: false,
      IS_ANDROID_CHROME: false,
      IS_APPLE: false,
      IS_APPLE_WEBKIT: false,
      IS_CHROME: true,
      IS_FIREFOX: false,
      IS_IOS: false,
      IS_SAFARI: false,
    },
    name: 'Windows Chrome',
    platform: 'Win32',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  },
  {
    expected: {
      IS_ANDROID: false,
      IS_ANDROID_CHROME: false,
      IS_APPLE: false,
      IS_APPLE_WEBKIT: false,
      IS_CHROME: false,
      IS_FIREFOX: true,
      IS_IOS: false,
      IS_SAFARI: false,
    },
    name: 'Desktop Firefox',
    platform: 'Win32',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) ' +
      'Gecko/20100101 Firefox/122.0',
  },
];

describe('shared/environment browser detection', () => {
  const originalUserAgent = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    'userAgent',
  );
  const originalPlatform = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    'platform',
  );

  function setNavigatorFields(userAgent: string, platform: string): void {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get() {
        return userAgent;
      },
    });
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      get() {
        return platform;
      },
    });
  }

  function restoreNavigatorFields(): void {
    if (originalUserAgent) {
      Object.defineProperty(
        Navigator.prototype,
        'userAgent',
        originalUserAgent,
      );
    } else {
      delete (navigator as unknown as {userAgent?: string}).userAgent;
    }
    if (originalPlatform) {
      Object.defineProperty(Navigator.prototype, 'platform', originalPlatform);
    } else {
      delete (navigator as unknown as {platform?: string}).platform;
    }
  }

  afterEach(() => {
    restoreNavigatorFields();
    vi.resetModules();
  });

  for (const sample of SAMPLES) {
    test(sample.name, async () => {
      setNavigatorFields(sample.userAgent, sample.platform);
      vi.resetModules();
      const env = (await import('../../environment')) as unknown as EnvFlags;

      for (const key of Object.keys(sample.expected) as Array<keyof EnvFlags>) {
        expect(
          env[key],
          `${sample.name}: expected ${key}=${sample.expected[key]}`,
        ).toBe(sample.expected[key]);
      }
    });
  }
});
