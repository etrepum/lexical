import { t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { t as getExtensionDependencyFromEditor } from "./LexicalExtensionGetExtensionDependencyFromEditor.dev-CiIhv3wn.js";
import { a as ReactExtension } from "./ContentEditable-CVuJEycH.js";
//#region ../lexical-react/dist/LexicalExtensionEditorComposer.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* The equivalent of LexicalComposer for an editor that was already built for
* extensions, typically used with nested editors.
*
* Make sure that your initialEditor argument is stable (e.g. using module scope or useMemo) so
* that you are not re-creating the editor on every render! The editor should be built with
* ReactProviderExtension and ReactExtension dependencies.
*/
function LexicalExtensionEditorComposer({ initialEditor: editor, children }) {
	const { Component } = getExtensionDependencyFromEditor(editor, ReactExtension).output;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Component, { children });
}
//#endregion
export { LexicalExtensionEditorComposer as t };
