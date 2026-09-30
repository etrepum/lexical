/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * The `<br>` importers drop a block's sole or trailing `<br>` as a
 * placeholder. When a block imported no children at all, any direct `<br>`
 * child was such a placeholder, so the block is a blank line that must be
 * kept rather than hoisted away.
 */
export function hasPlaceholderLineBreak(node: Node): boolean {
  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    if (child.nodeName === 'BR') {
      return true;
    }
  }
  return false;
}
