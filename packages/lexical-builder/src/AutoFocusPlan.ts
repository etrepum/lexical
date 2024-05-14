/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalPlan} from './types';

export interface AutoFocusConfig {
  defaultSelection?: 'rootStart' | 'rootEnd';
}

export const AutoFocusPlan: LexicalPlan<AutoFocusConfig> = {
  config: {},
  name: '@lexical/builder/AutoFocusPlan',
  register(editor, {defaultSelection}) {
    return editor.registerRootListener((rootElement) => {
      editor.focus(
        () => {
          // If we try and move selection to the same point with setBaseAndExtent, it won't
          // trigger a re-focus on the element. So in the case this occurs, we'll need to correct it.
          // Normally this is fine, Selection API !== Focus API, but fore the intents of the naming
          // of this plugin, which should preserve focus too.
          const activeElement = document.activeElement;
          if (
            rootElement !== null &&
            (activeElement === null || !rootElement.contains(activeElement))
          ) {
            // Note: preventScroll won't work in Webkit.
            rootElement.focus({preventScroll: true});
          }
        },
        {defaultSelection},
      );
    });
  },
};
