import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { $t as $setSelection, Ci as isHTMLElement, Ft as $isTextNode, Ht as $onUpdate, Jr as getActiveElement, Pi as mergeRegister, Q as $getSelection, Tt as $isNodeSelection, _ as $createParagraphNode, ar as KEY_ENTER_COMMAND, br as SELECTION_CHANGE_COMMAND, gn as CLICK_COMMAND, or as KEY_ESCAPE_COMMAND, q as $getNodeByKey, r as useLexicalComposerContext, yt as $isElementNode } from "./LexicalComposerContext.dev-CmGTZccv.js";
import { t as LexicalErrorBoundary } from "./LexicalErrorBoundary.dev-CXVIAWe7.js";
import { $ as useLexicalEditable, Z as KatexRenderer, at as $isEquationNode, nt as useLexicalNodeSelection } from "./main-DHT2OJmi.js";
//#region src/ui/EquationEditor.css
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
//#endregion
//#region src/ui/EquationEditor.tsx
var import_jsx_runtime = require_jsx_runtime();
function EquationEditor({ equation, setEquation, inline, onDeleteEmpty }, forwardedRef) {
	const onChange = (event) => {
		setEquation(event.target.value);
	};
	const onKeyDown = (event) => {
		if (event.key === "Backspace" && equation === "" && onDeleteEmpty) {
			event.preventDefault();
			onDeleteEmpty();
		}
	};
	return inline && isHTMLElement(forwardedRef) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "EquationEditor_inputBackground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "EquationEditor_dollarSign",
				children: "$"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "EquationEditor_inlineEditor",
				value: equation,
				onChange,
				onKeyDown,
				autoFocus: true,
				ref: forwardedRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "EquationEditor_dollarSign",
				children: "$"
			})
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "EquationEditor_inputBackground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "EquationEditor_dollarSign",
				children: "$$\n"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "EquationEditor_blockEditor",
				value: equation,
				onChange,
				onKeyDown,
				ref: forwardedRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "EquationEditor_dollarSign",
				children: "\n$$"
			})
		]
	});
}
var EquationEditor_default = /*#__PURE__*/ (0, import_react.forwardRef)(EquationEditor);
//#endregion
//#region src/nodes/EquationComponent.tsx
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function EquationComponent({ equation, inline, nodeKey }) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
	const [equationValue, setEquationValue] = (0, import_react.useState)(equation);
	const [showEquationEditor, setShowEquationEditor] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const onClick = (0, import_react.useCallback)((event) => {
		const dom = editor.getElementByKey(nodeKey);
		if (dom === null || !dom.contains(event.target)) return false;
		if (event.shiftKey) setSelected(!isSelected);
		else {
			clearSelection();
			setSelected(true);
		}
		return true;
	}, [
		clearSelection,
		editor,
		isSelected,
		nodeKey,
		setSelected
	]);
	(0, import_react.useEffect)(() => {
		return editor.registerCommand(CLICK_COMMAND, onClick, 1);
	}, [editor, onClick]);
	const $onEnter = (0, import_react.useCallback)((event) => {
		const latestSelection = $getSelection();
		if (!($isNodeSelection(latestSelection) && latestSelection.has(nodeKey) && latestSelection.getNodes().length === 1)) return false;
		const node = $getNodeByKey(nodeKey);
		if (!$isEquationNode(node)) return false;
		if (node.isInline()) {
			const parent = node.getParent();
			if (!$isElementNode(parent)) return false;
			const paragraph = $createParagraphNode();
			parent.insertAfter(paragraph);
			paragraph.select();
		} else {
			const paragraph = $createParagraphNode();
			node.insertAfter(paragraph);
			paragraph.select();
		}
		event?.preventDefault();
		return true;
	}, [nodeKey]);
	(0, import_react.useEffect)(() => {
		if (!isEditable) return;
		return editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, 1);
	}, [
		editor,
		isEditable,
		$onEnter
	]);
	const onDeleteEmpty = (0, import_react.useCallback)(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if (!$isEquationNode(node)) return;
			if (node.isInline()) {
				$setSelection(null);
				node.remove(true);
				return;
			}
			const prevSibling = node.getPreviousSibling();
			if ($isElementNode(prevSibling) || $isTextNode(prevSibling)) {
				node.remove();
				prevSibling.selectEnd();
				return;
			}
			const paragraph = $createParagraphNode();
			node.replace(paragraph);
			paragraph.select();
		});
	}, [editor, nodeKey]);
	(0, import_react.useEffect)(() => {
		const dom = editor.getElementByKey(nodeKey);
		if (dom === null) return;
		if (isSelected && isEditable) dom.classList.add("focused");
		else dom.classList.remove("focused");
	}, [
		editor,
		nodeKey,
		isSelected,
		isEditable
	]);
	const onHide = (0, import_react.useCallback)((restoreSelection) => {
		setShowEquationEditor(false);
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isEquationNode(node)) {
				node.setEquation(equationValue);
				if (restoreSelection) node.selectNext(0, 0);
			}
		});
	}, [
		editor,
		equationValue,
		nodeKey
	]);
	(0, import_react.useEffect)(() => {
		if (!showEquationEditor && equationValue !== equation) setEquationValue(equation);
	}, [
		showEquationEditor,
		equation,
		equationValue
	]);
	(0, import_react.useEffect)(() => {
		if (!isEditable) return;
		if (showEquationEditor) return mergeRegister(editor.registerCommand(SELECTION_CHANGE_COMMAND, (payload) => {
			$onUpdate(() => {
				const inputElem = inputRef.current;
				if (inputElem !== (inputElem ? getActiveElement(inputElem) : null)) onHide();
			});
			return false;
		}, 3), editor.registerCommand(KEY_ESCAPE_COMMAND, (payload) => {
			const inputElem = inputRef.current;
			if (inputElem === (inputElem ? getActiveElement(inputElem) : null)) {
				onHide(true);
				return true;
			}
			return false;
		}, 3));
	}, [
		editor,
		nodeKey,
		onHide,
		showEquationEditor,
		isEditable
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: showEquationEditor && isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquationEditor_default, {
		equation: equationValue,
		setEquation: setEquationValue,
		inline,
		onDeleteEmpty,
		ref: inputRef
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LexicalErrorBoundary, {
		onError: (e) => editor._onError(e),
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KatexRenderer, {
			equation: equationValue,
			inline,
			onDoubleClick: () => {
				if (isEditable) setShowEquationEditor(true);
			}
		})
	}) });
}
//#endregion
export { EquationComponent as default };
