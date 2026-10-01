/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {installLexicalDevtoolsAgentAPI} from '../agent/agentAPI';
import {readEditorState} from '../lexicalForExtension';

/**
 * The page API on its own, for browsers without the extension installed.
 * Load it into the page's main world, e.g. with Playwright's
 * `page.addInitScript({path})` or `page.addScriptTag({path})`. It is not
 * loaded by the extension, which installs the same API from its injected
 * script.
 */
export default defineUnlistedScript({
  main() {
    installLexicalDevtoolsAgentAPI(window, {readEditorState});
  },
});
