import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
//#region ../lexical-react/dist/LexicalErrorBoundary.dev.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var ErrorBoundary = class extends import_react.Component {
	state = { hasError: false };
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	componentDidCatch(error, info) {
		this.props.onError(error instanceof Error ? error : new Error(String(error), { cause: error }), info);
	}
	render() {
		return this.state.hasError ? this.props.fallback : this.props.children;
	}
};
/**
* An error boundary used by {@link RichTextPlugin} and {@link PlainTextPlugin}
* to isolate failures thrown while rendering decorator nodes. It renders
* `fallback` in place of the failed subtree and forwards the error (coerced to
* an `Error`) along with the React {@link ErrorInfo} to the `onError` callback.
* When `fallback` is omitted a small default message is shown; pass
* `fallback={null}` to render nothing.
*
* @returns The wrapped `children`, or the fallback if an error is caught.
*/
function LexicalErrorBoundary({ children, fallback, onError }) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ErrorBoundary, {
		fallback: fallback === void 0 ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
			style: {
				border: "1px solid #f00",
				color: "#f00",
				padding: "8px"
			},
			children: "An error was thrown."
		}) : fallback,
		onError,
		children
	});
}
//#endregion
export { LexicalErrorBoundary as t };
