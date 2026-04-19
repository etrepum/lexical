/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Replaces docusaurus-plugin-internaldocs-fb/module on the public site so that
// the open source build does not fetch https://staticdocs.thefacebook.com/ping
// or postMessage to window.parent. The plugin's preset is still required for
// shared remark/rehype behaviour; only the runtime client module is stubbed.
export default {
  onRouteDidUpdate() {},
  onRouteUpdate() {},
};
