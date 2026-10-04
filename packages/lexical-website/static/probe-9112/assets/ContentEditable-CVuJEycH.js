import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { t as require_react_dom } from "./react-dom-BJswbQSQ.js";
import { A as objectKlassEquals, G as watchedSignal, J as j, K as namedSignals, U as createDOMRange, V as $sliceSelectedTextNodeContent, W as createRectsFromDOMRange, X as y, Y as n, h as $insertNodeToNearestRoot, i as getKnownTypesAndNodes, n as LexicalBuilder, q as g, t as getExtensionDependencyFromEditor } from "./LexicalExtensionGetExtensionDependencyFromEditor.dev-CiIhv3wn.js";
import { $ as $getSelectionSlotFrame, $r as getDOMSelectionPoints, $t as $setSelection, Ai as isSelectionWithinEditor, Ar as TextNode, Br as createCommand, Bt as $normalizeCaret, C as $exportNodeJSON, Ci as isHTMLElement, Cn as COPY_COMMAND, Ct as $isLexicalNode, Di as isLexicalEditor, Dr as SKIP_SELECTION_FOCUS_TAG, Dt as $isRangeSelection, Ei as isLastChildInBlockNode, Er as SKIP_SCROLL_INTO_VIEW_TAG, Et as $isParagraphNode, F as $getChildCaret, Ft as $isTextNode, G as $getNearestNodeFromDOMNode, Gt as $removeSlot, H as $getDocument, I as $getChildCaretAtIndex, It as $isTextPointCaret, J as $getNodeByKeyOrThrow, Ji as setNodeIndentFromDOM, Jr as getActiveElement, Ki as setDOMStyleObject, Kr as findAllLexicalElementsDeep, Ln as HISTORIC_TAG, Mn as DecoratorNode, Mr as addClassNamesToElement, Mt as $isSiblingCaret, N as $getCaretRange, Nn as ElementNode, O as $fullReconcile, Or as TEXT_TYPE_TO_FORMAT, Ot as $isRootNode, P as $getCaretRangeInDirection, Pi as mergeRegister, Pn as FOCUS_COMMAND, Q as $getSelection, R as $getCollapsedCaretRange, Rn as HISTORY_MERGE_TAG, S as $createTextNode, Ti as isInlineDomNode, Tn as DEFAULT_EDITOR_DOM_CONFIG, Tt as $isNodeSelection, U as $getEditor, Ui as registerEventListeners, Ur as createState, Ut as $parseSerializedNode, Vr as createEditor, W as $getEditorDOMRenderConfig, Wi as removeClassNamesFromElement, Wt as $removeFromParent, X as $getPreviousSelection, Xt as $setDirectionFromDOM, Y as $getNodeFromDOMNode, Yr as getActiveElementDeep, Z as $getRoot, Zi as shallowMergeConfig, Zr as getDOMSelection, Zt as $setFormatFromDOM, _ as $createParagraphNode, _i as isDOMNode, _n as COLLABORATION_TAG, _r as REDO_COMMAND, _t as $isDecoratorNode, ai as getEditorPropertyFromDOMNode, at as $getSlotNames, bi as isDocumentFragment, br as SELECTION_CHANGE_COMMAND, c as $caretRangeFromSelection, ci as getRegisteredSubtypeMap, cn as ArtificialNode__DO_NOT_USE, ct as $getTextPointCaret, d as $comparePointCaretNext, dn as CAN_UNDO_COMMAND, en as $setSelectionFromCaretRange, et as $getSiblingCaret, g as $createNodeSelection, gi as isDOMDocumentNode, gn as CLICK_COMMAND, gt as $isChildCaret, h as $createLineBreakNode, hn as CLEAR_HISTORY_COMMAND, i as $addUpdateTag, ii as getDeclaredSlots, in as $splitAtPointCaretNext, ji as iterStaticNodeConfigChain, jr as UNDO_COMMAND, k as $generateNodesFromRawText, ki as isOnlyChildInBlockNode, kt as $isRootOrShadowRoot, li as getRootOwnerDocument, ln as BLUR_COMMAND, m as $createChildrenArray, mi as isBlockDomNode, mn as CLEAR_EDITOR_COMMAND, mt as $isBlockElementNode, ni as getDOMShadowRoots, o as $assumeActiveEditor, ot as $getState, p as $create, pn as CAN_USE_DOM, q as $getNodeByKey, qt as $rewindSiblingCaret, r as useLexicalComposerContext, s as $caretFromPoint, si as getParentElement, sn as $updateDOMSelection, t as LexicalComposerContext, ta as tokenizeRawText, tn as $setSlot, tt as $getSlot, un as CAN_REDO_COMMAND, ut as $getWritableNodeState, vi as isDOMShadowRoot, wr as SKIP_COLLAB_TAG, wt as $isLineBreakNode, x as $createTabNode, xr as SELECTION_INSERT_CLIPBOARD_NODES_COMMAND, yi as isDOMTextNode, yr as RootNode, yt as $isElementNode, zn as HISTORY_PUSH_TAG } from "./LexicalComposerContext.dev-D4J9Kczj.js";
import { r as useCollaborationContext } from "./LexicalCollaborationContextUtils.dev-ZncfwcJz.js";
import { t as LexicalErrorBoundary } from "./LexicalErrorBoundary.dev-CXVIAWe7.js";
//#region ../lexical-extension/dist/LexicalExtensionGetPeerDependencyFromEditor.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Get the finalized config and output of an Extension that was used to build the
* editor by name.
*
* This can be used from the implementation of a LexicalNode or in other
* situation where you have an editor reference but it's not easy to pass the
* config around. Use this version if you do not have a concrete reference to
* the Extension for some reason (e.g. it is an optional peer dependency, or you
* are avoiding a circular import).
*
* Both the explicit Extension type and the name are required.
*
* Inside an editor read/update, prefer {@link $getPeerDependency} — it
* resolves the editor via `$getEditor()` so you don't have to thread it
* through.
*
*  @example
* ```tsx
* import type { HistoryExtension } from "@lexical/history";
* getPeerDependencyFromEditor<typeof HistoryExtension>(editor, "@lexical/history/History");
* ```

* @param editor - The editor that may have been built using extension
* @param extensionName - The name of the Extension
* @returns The config and output of the Extension or undefined
*/
function getPeerDependencyFromEditor(editor, extensionName) {
	const builder = LexicalBuilder.maybeFromEditor(editor);
	if (!builder) return void 0;
	const peer = builder.extensionNameMap.get(extensionName);
	return peer ? peer.getExtensionDependency() : void 0;
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionEditorStateExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* An extension to provide the current EditorState as a signal
*/
var EditorStateExtension = {
	build(editor) {
		return watchedSignal(() => editor.getEditorState(), (editorStateSignal) => editor.registerUpdateListener((payload) => {
			editorStateSignal.value = payload.editorState;
		}));
	},
	name: "@lexical/extension/EditorState"
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionNodeSelectionExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var EMPTY_SET = /* @__PURE__ */ new Set();
/**
* An extension that provides a `watchNodeKey` output that
* returns a signal for the selection state of a node.
*
* Typically used for tracking whether a DecoratorNode is
* currently selected or not. A framework independent
* alternative to {@link useLexicalNodeSelection}.
*/
var NodeSelectionExtension = {
	build(editor, config, state) {
		const editorStateStore = state.getDependency(EditorStateExtension).output;
		const watchedNodeStore = y({ watchedNodeKeys: /* @__PURE__ */ new Map() });
		const selectedNodeKeys = watchedSignal(() => void 0, () => j(() => {
			const prevSelectedNodeKeys = selectedNodeKeys.peek();
			const { watchedNodeKeys } = watchedNodeStore.value;
			let nextSelectedNodeKeys;
			let didChange = false;
			editorStateStore.value.read(() => {
				if ($getSelection()) for (const [key, listeners] of watchedNodeKeys.entries()) {
					if (listeners.size === 0) {
						watchedNodeKeys.delete(key);
						continue;
					}
					const node = $getNodeByKey(key);
					const isSelected = node && node.isSelected() || false;
					didChange = didChange || isSelected !== (prevSelectedNodeKeys ? prevSelectedNodeKeys.has(key) : false);
					if (isSelected) {
						nextSelectedNodeKeys = nextSelectedNodeKeys || /* @__PURE__ */ new Set();
						nextSelectedNodeKeys.add(key);
					}
				}
			});
			if (!(!didChange && nextSelectedNodeKeys && prevSelectedNodeKeys && nextSelectedNodeKeys.size === prevSelectedNodeKeys.size)) selectedNodeKeys.value = nextSelectedNodeKeys;
		}));
		function watchNodeKey(key) {
			const watcher = g(() => (selectedNodeKeys.value || EMPTY_SET).has(key));
			const { watchedNodeKeys } = watchedNodeStore.peek();
			let listeners = watchedNodeKeys.get(key);
			const hadListener = listeners !== void 0;
			listeners = listeners || /* @__PURE__ */ new Set();
			listeners.add(watcher);
			if (!hadListener) {
				watchedNodeKeys.set(key, listeners);
				watchedNodeStore.value = { watchedNodeKeys };
			}
			return watcher;
		}
		return { watchNodeKey };
	},
	dependencies: [EditorStateExtension],
	name: "@lexical/extension/NodeSelection"
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionHorizontalRuleExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* The serialized form of a {@link HorizontalRuleNode}. It has no extra fields
* beyond the base serialized node.
*/
/**
* Command that inserts a {@link HorizontalRuleNode} at the current selection.
* Dispatch it with
* `editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND)`.
*/
var INSERT_HORIZONTAL_RULE_COMMAND = /* @__PURE__ */ createCommand("INSERT_HORIZONTAL_RULE_COMMAND");
var HorizontalRuleNode = class extends DecoratorNode {
	$config() {
		return this.config("horizontalrule", {
			extends: DecoratorNode,
			importDOM: { hr: () => ({
				conversion: $convertHorizontalRuleElement,
				priority: 0
			}) }
		});
	}
	exportDOM() {
		return { element: $getDocument().createElement("hr") };
	}
	createDOM(config) {
		const element = $getDocument().createElement("hr");
		addClassNamesToElement(element, config.theme.hr);
		return element;
	}
	getTextContent() {
		return "\n";
	}
	isInline() {
		return false;
	}
	updateDOM() {
		return false;
	}
};
function $convertHorizontalRuleElement() {
	return { node: $createHorizontalRuleNode() };
}
function $createHorizontalRuleNode() {
	return $create(HorizontalRuleNode);
}
/**
* @returns `true` if `node` is a {@link HorizontalRuleNode}, narrowing its type.
*/
function $isHorizontalRuleNode(node) {
	return node instanceof HorizontalRuleNode;
}
function $toggleNodeSelection(node, shiftKey = false) {
	const selection = $getSelection();
	const wasSelected = node.isSelected();
	const key = node.getKey();
	let nodeSelection;
	if (shiftKey && $isNodeSelection(selection)) nodeSelection = selection;
	else {
		nodeSelection = $createNodeSelection();
		$setSelection(nodeSelection);
	}
	if (wasSelected) nodeSelection.delete(key);
	else nodeSelection.add(key);
}
/**
* An extension for HorizontalRuleNode that provides an implementation that
* works without any React dependency.
*/
var HorizontalRuleExtension = {
	dependencies: [EditorStateExtension, NodeSelectionExtension],
	name: "@lexical/extension/HorizontalRule",
	nodes: () => [HorizontalRuleNode],
	register(editor, config, state) {
		const { watchNodeKey } = state.getDependency(NodeSelectionExtension).output;
		const nodeSelectionStore = y({ nodeSelections: /* @__PURE__ */ new Map() });
		const isSelectedClassName = editor._config.theme.hrSelected ?? "selected";
		return mergeRegister(editor.registerCommand(INSERT_HORIZONTAL_RULE_COMMAND, (type) => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) return false;
			if (selection.focus.getNode() !== null) {
				const horizontalRuleNode = $createHorizontalRuleNode();
				$insertNodeToNearestRoot(horizontalRuleNode);
			}
			return true;
		}, 0), editor.registerCommand(CLICK_COMMAND, (event) => {
			if (isDOMNode(event.target)) {
				const node = $getNodeFromDOMNode(event.target);
				if ($isHorizontalRuleNode(node)) {
					$toggleNodeSelection(node, event.shiftKey);
					return true;
				}
			}
			return false;
		}, 1), editor.registerMutationListener(HorizontalRuleNode, (nodes, payload) => {
			n(() => {
				let didChange = false;
				const { nodeSelections } = nodeSelectionStore.peek();
				for (const [k, v] of nodes.entries()) if (v === "destroyed") {
					nodeSelections.delete(k);
					didChange = true;
				} else {
					const prev = nodeSelections.get(k);
					const dom = editor.getElementByKey(k);
					if (prev) prev.domNode.value = dom;
					else {
						didChange = true;
						nodeSelections.set(k, {
							domNode: y(dom),
							selectedSignal: watchNodeKey(k)
						});
					}
				}
				if (didChange) nodeSelectionStore.value = { nodeSelections };
			});
		}), j(() => {
			const effects = [];
			for (const { domNode, selectedSignal } of nodeSelectionStore.value.nodeSelections.values()) effects.push(j(() => {
				const dom = domNode.value;
				if (dom) {
					if (selectedSignal.value) addClassNamesToElement(dom, isSelectedClassName);
					else removeClassNamesFromElement(dom, isSelectedClassName);
				}
			}));
			return mergeRegister(...effects);
		}));
	}
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionGetExtensionDependency.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Get the finalized config and output for `extension` from the editor
* currently in scope. A `$`-flavored shorthand for
* `getExtensionDependencyFromEditor($getEditor(), extension)`.
*
* Throws if the editor was not built with `extension` as a dependency.
*
* @example
* ```ts
* import {$getExtensionDependency} from '@lexical/extension';
* import {KeywordsExtension} from './KeywordsExtension';
*
* class KeywordNode extends TextNode {
*   createDOM(config: EditorConfig): HTMLElement {
*     const dom = super.createDOM(config);
*     dom.className =
*       $getExtensionDependency(KeywordsExtension).config.className;
*     return dom;
*   }
* }
* ```
*
* @see {@link getExtensionDependencyFromEditor} when you have an explicit
*   editor reference (e.g. outside a read/update).
*/
function $getExtensionDependency(extension) {
	return getExtensionDependencyFromEditor($getEditor(), extension);
}
/**
* Shorthand for `$getExtensionDependency(extension).output` — the most
* common reason to look up an extension dependency. Throws if the editor
* was not built with `extension` as a dependency.
*
* @example
* ```ts
* import {$getExtensionOutput} from '@lexical/extension';
* import {DOMImportExtension} from '@lexical/html';
*
* const nodes = $getExtensionOutput(DOMImportExtension).$generateNodesFromDOM(
*   dom,
* );
* ```
*
* @see {@link $getExtensionDependency} when you need both `.config` and
*   `.output` (or want to mirror the shape of
*   {@link getExtensionDependencyFromEditor}).
*/
function $getExtensionOutput(extension) {
	return $getExtensionDependency(extension).output;
}
/**
* Get the finalized config and output for an optional peer extension by
* name, from the editor currently in scope. A `$`-flavored shorthand for
* `getPeerDependencyFromEditor($getEditor(), extensionName)`.
*
* Returns `undefined` if the editor was not built with the named
* extension. Both the explicit `Extension` type and the name are
* required so the returned `config` / `output` types are correct.
*
* @example
* ```ts
* import {$getPeerDependency} from '@lexical/extension';
* import type {HistoryExtension} from '@lexical/history';
*
* const dep = $getPeerDependency<typeof HistoryExtension>(
*   '@lexical/history/History',
* );
* if (dep) {
*   // …read dep.config / dep.output…
* }
* ```
*
* @see {@link getPeerDependencyFromEditor} when you have an explicit
*   editor reference.
*/
function $getPeerDependency(extensionName) {
	return getPeerDependencyFromEditor($getEditor(), extensionName);
}
//#endregion
//#region ../lexical-html/dist/LexicalHtml.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function formatDevErrorMessage$4(message) {
	throw new Error(message);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var activeContext;
/**
* @experimental
*
* The LexicalEditor with context
*/
/**
* @experimental
*
* @param contextRecord The ContextRecord
* @param cfg The configuration
* @returns The value or defaultValue of cfg
*/
function getContextValue(contextRecord, cfg) {
	const { key } = cfg;
	return contextRecord && key in contextRecord ? contextRecord[key] : cfg.defaultValue;
}
function getEditorContext(editor) {
	return activeContext && activeContext.editor === editor ? activeContext : void 0;
}
/**
* @experimental
*
* @param sym The symbol for this ContextRecord (e.g. DOMRenderContextSymbol)
* @param editor The editor
* @returns The current context or undefined
*/
function getContextRecord(sym, editor) {
	const editorContext = getEditorContext(editor);
	return editorContext && editorContext[sym];
}
function toPair(contextRecord, pairOrUpdater) {
	if ("cfg" in pairOrUpdater) {
		const { cfg, updater } = pairOrUpdater;
		return [cfg, updater(getContextValue(contextRecord, cfg))];
	}
	return pairOrUpdater;
}
/**
* Construct a new context from a parent context and pairs
*
* @param pairs The pairs and updaters to build the context from
* @param parent The parent context
* @returns The new context
*/
function contextFromPairs(pairs, parent) {
	let rval = parent;
	for (const pairOrUpdater of pairs) {
		const [k, v] = toPair(rval, pairOrUpdater);
		const key = k.key;
		if (rval === parent && getContextValue(rval, k) === v) continue;
		const ctx = rval === parent || rval === void 0 ? createChildContext(parent) : rval;
		ctx[key] = v;
		rval = ctx;
	}
	return rval;
}
function createChildContext(parent) {
	return Object.create(parent || null);
}
/**
* Create a context config pair that sets a value in the render context.
* @experimental
*/
function contextValue(cfg, value) {
	return [cfg, value];
}
/**
* @internal
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function $withFullContext(sym, contextRecord, f, editor = $getEditor()) {
	const prevDOMContext = activeContext;
	const parentEditorContext = getEditorContext(editor);
	try {
		activeContext = {
			...parentEditorContext,
			editor,
			[sym]: contextRecord
		};
		return f();
	} finally {
		activeContext = prevDOMContext;
	}
}
/**
* @internal
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function $withContext(sym, $defaults = () => void 0) {
	return (cfg, editor = $getEditor()) => {
		return (f) => {
			const parentEditorContext = getEditorContext(editor);
			const parentContextRecord = parentEditorContext && parentEditorContext[sym];
			const contextRecord = contextFromPairs(cfg, parentContextRecord || $defaults(editor));
			if (!contextRecord || contextRecord === parentContextRecord) return f();
			return $withFullContext(sym, contextRecord, f, editor);
		};
	};
}
/**
* @experimental
* @internal
* @__NO_SIDE_EFFECTS__
*/
function createContextState(tag, name, getDefaultValue, isEqual) {
	return Object.assign(createState(Symbol(name), {
		isEqual,
		parse: getDefaultValue
	}), { [tag]: true });
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Inlines CSS rules from `<style>` tags onto matching elements as inline
* styles.
*
* Used by apps like Excel that generate HTML where styles live in
* class-based `<style>` rules (e.g. `.xl65 { background: #FFFF00; color:
* blue; }`) rather than inline styles. Since Lexical's import converters
* read inline styles, we resolve stylesheet rules into inline styles
* before conversion.
*
* Mutates the DOM in-place. Original inline styles always take
* precedence over stylesheet rules (matching CSS specificity behavior).
*
* No-op for {@link ParentNode}s that are not {@link Document}s — only a
* full document carries `styleSheets` we can iterate.
*
* @experimental
*/
var $inlineStylesFromStyleSheets = (dom, _ctx, $next) => {
	$inlineStylesFromStyleSheetsDOM(dom);
	$next();
};
function $inlineStylesFromStyleSheetsDOM(dom) {
	if (!isDOMDocumentNode(dom)) return;
	const doc = dom;
	if (doc.querySelector("style") === null) return;
	const originalInlineStyles = /* @__PURE__ */ new Map();
	function getOriginalInlineProps(el) {
		let props = originalInlineStyles.get(el);
		if (props === void 0) {
			props = /* @__PURE__ */ new Set();
			for (let i = 0; i < el.style.length; i++) props.add(el.style[i]);
			originalInlineStyles.set(el, props);
		}
		return props;
	}
	try {
		for (const sheet of Array.from(doc.styleSheets)) {
			let rules;
			try {
				rules = sheet.cssRules;
			} catch {
				continue;
			}
			for (const rule of Array.from(rules)) {
				if (!objectKlassEquals(rule, CSSStyleRule)) continue;
				let elements;
				try {
					elements = doc.querySelectorAll(rule.selectorText);
				} catch {
					continue;
				}
				for (const el of Array.from(elements)) {
					if (!isHTMLElement(el)) continue;
					const originalProps = getOriginalInlineProps(el);
					for (let i = 0; i < rule.style.length; i++) {
						const prop = rule.style[i];
						if (!originalProps.has(prop)) el.style.setProperty(prop, rule.style.getPropertyValue(prop), rule.style.getPropertyPriority(prop));
					}
				}
			}
		}
	} catch {}
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var DOMRenderExtensionName = "@lexical/html/DOM";
var DOMRenderContextSymbol = Symbol.for("@lexical/html/DOMExportContext");
var DOMImportExtensionName = "@lexical/html/DOMImport";
var DOMImportContextSymbol = Symbol.for("@lexical/html/DOMImportContext");
var ALWAYS_TRUE = () => true;
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Create a context state to be used during render.
*
* Note that to support the ValueOrUpdater pattern you can not use a
* function for V (but you may wrap it in an array or object).
*
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function createRenderState(name, getDefaultValue, isEqual) {
	return createContextState(DOMRenderContextSymbol, name, getDefaultValue, isEqual);
}
/**
* Render context state that is true if this is an export operation ($generateHtmlFromNodes).
* @experimental
*/
var RenderContextExport = /* @__PURE__ */ createRenderState("isExport", Boolean);
function getDefaultRenderContext(editor) {
	const dep = getPeerDependencyFromEditor(editor, DOMRenderExtensionName);
	return dep ? dep.output.defaults : void 0;
}
function getRuntime(editor) {
	const dep = getPeerDependencyFromEditor(editor, DOMRenderExtensionName);
	return dep ? dep.output.runtime : void 0;
}
/**
* Imperatively set a value in the persistent editor render context.
*
* Unlike {@link $withRenderContext} (which scopes values to a callback), this
* persists on the editor. If the change flips any override's
* `disabledForEditor` result, the resident render config is recompiled and the
* affected nodes are re-rendered. No-op if {@link DOMRenderExtension} is not
* installed.
*
* @experimental
*/
function $setRenderContextValue(cfg, value, editor = $getEditor()) {
	const runtime = getRuntime(editor);
	if (runtime) runtime.setContextValue(cfg, value);
}
/**
* Resolve the {@link EditorDOMRenderConfig} to use for the current
* export/generate session, applying any `disabledForSession` overrides against
* the active session context. Falls back to the editor's resident config when
* {@link DOMRenderExtension} is not installed.
*
* @experimental
*/
function $getSessionDOMRenderConfig(editor = $getEditor()) {
	const runtime = getRuntime(editor);
	return runtime ? runtime.getSessionConfig() : $getEditorDOMRenderConfig(editor);
}
/**
* Execute a callback within a render context with the given config pairs.
* @experimental
*/
var $withRenderContext = /* @__PURE__ */ $withContext(DOMRenderContextSymbol, getDefaultRenderContext);
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* A convenience function for type inference when constructing DOM overrides for
* use with {@link DOMRenderExtension}.
*
* The optional `options` argument controls *whether* the override is installed
* based only on render context — `disabledForEditor` gates residency in the
* editor's render pipeline (reconciliation), `disabledForSession` gates
* participation in a single export/generate session. See {@link DOMOverrideOptions}.
*
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function domOverride(nodes, config, options) {
	return {
		...config,
		...options,
		nodes
	};
}
function buildNodePredicate(klass) {
	return (node) => node instanceof klass;
}
function getPredicate(subtypeMap, { nodes }) {
	if (nodes === "*") return ALWAYS_TRUE;
	let types = {};
	const predicates = [];
	for (const klassOrPredicate of nodes) if ("getType" in klassOrPredicate) {
		const type = klassOrPredicate.getType();
		if (types) {
			const subtypes = subtypeMap.get(type);
			if (!(subtypes !== void 0)) formatDevErrorMessage$4(`Node class ${klassOrPredicate.name} with type ${type} not registered in editor`);
			for (const subtype of subtypes) types[subtype] = true;
		}
		predicates.push(buildNodePredicate(klassOrPredicate));
	} else {
		types = void 0;
		predicates.push(klassOrPredicate);
	}
	if (types) return types;
	else if (predicates.length === 1) return predicates[0];
	return (node) => {
		for (const predicate of predicates) if (predicate(node)) return true;
		return false;
	};
}
function makePrerender() {
	return {
		$createDOM: [],
		$decorateDOM: [],
		$exportDOM: [],
		$extractWithChild: [],
		$getDOMSlot: [],
		$getSlotTargetElement: [],
		$shouldExclude: [],
		$shouldInclude: [],
		$updateDOM: []
	};
}
function ignoreNext2(acc) {
	return (node, _$next, editor) => acc(node, editor);
}
function ignoreNext3(acc) {
	return (node, a, _$next, editor) => acc(node, a, editor);
}
function ignoreNext4(acc) {
	return (node, a, b, _$next, editor) => acc(node, a, b, editor);
}
function ignoreNext5(acc) {
	return (node, a, b, c, _$next, editor) => acc(node, a, b, c, editor);
}
function merge2($acc, $getOverride) {
	return (node, editor) => {
		const $next = () => $acc(node, editor);
		const $override = $getOverride(node);
		return $override ? $override(node, $next, editor) : $next();
	};
}
function merge3(acc, $getOverride) {
	return (node, a, editor) => {
		const $next = () => acc(node, a, editor);
		const $override = $getOverride(node);
		return $override ? $override(node, a, $next, editor) : $next();
	};
}
var merge3GetDOMSlot = merge3;
var ignoreNext3GetDOMSlot = ignoreNext3;
function merge4($acc, $getOverride) {
	return (node, a, b, editor) => {
		const $next = () => $acc(node, a, b, editor);
		const $override = $getOverride(node);
		return $override ? $override(node, a, b, $next, editor) : $next();
	};
}
function merge5(acc, $getOverride) {
	return (node, a, b, c, editor) => {
		const $next = () => acc(node, a, b, c, editor);
		const $override = $getOverride(node);
		return $override ? $override(node, a, b, c, $next, editor) : $next();
	};
}
function sequence4($acc, $getOverride) {
	return (node, a, b, editor) => {
		$acc(node, a, b, editor);
		const $override = $getOverride(node);
		if ($override) $override(node, a, b, editor);
	};
}
function compilePrerenderKey(prerender, k, defaults, mergeFunction, ignoreNextFunction) {
	let acc = defaults[k];
	for (const pair of prerender[k]) if (typeof pair[0] === "function") {
		const [$predicate, $override] = pair;
		acc = mergeFunction(acc, (node) => $predicate(node) && $override || void 0);
	} else {
		const typeOverrides = pair[1];
		const compiled = {};
		for (const type in typeOverrides) {
			const arr = typeOverrides[type];
			if (arr) compiled[type] = arr.reduce(($acc, $override) => mergeFunction($acc, () => $override), acc);
		}
		acc = mergeFunction(acc, (node) => {
			const f = compiled[node.getType()];
			return f && ignoreNextFunction(f);
		});
	}
	defaults[k] = acc;
}
function addOverride(prerender, k, predicateOrTypes, override) {
	if (!override) return;
	const arr = prerender[k];
	if (typeof predicateOrTypes === "function") arr.push([predicateOrTypes, override]);
	else {
		const last = arr[arr.length - 1];
		let types;
		if (last && last[0] === "types") types = last[1];
		else {
			types = {};
			arr.push(["types", types]);
		}
		for (const type in predicateOrTypes) {
			const typeArr = types[type] || [];
			types[type] = typeArr;
			typeArr.push(override);
		}
	}
}
function isWildcard(override) {
	return override.nodes === "*";
}
function sortedOverrides(overrides) {
	const byWildcard = [];
	const byPredicate = [];
	const byNode = [];
	for (const override of overrides) if (isWildcard(override)) byWildcard.push(override);
	else if (Array.isArray(override.nodes)) for (const klassOrPredicate of override.nodes) if ($isLexicalNode(klassOrPredicate.prototype)) byNode.push(override.nodes.length === 1 ? override : {
		...override,
		nodes: [klassOrPredicate]
	});
	else byPredicate.push(override.nodes.length === 1 ? override : {
		...override,
		nodes: [klassOrPredicate]
	});
	const depths = /* @__PURE__ */ new Map();
	const depthOf = (klass) => {
		let depth = depths.get(klass);
		if (depth === void 0) {
			depth = -1;
			for (const _ of iterStaticNodeConfigChain(klass)) depth++;
			depths.set(klass, depth);
		}
		return depth;
	};
	byNode.sort((a, b) => depthOf(a.nodes[0]) - depthOf(b.nodes[0]));
	return [
		...byNode,
		...byPredicate,
		...byWildcard
	];
}
function precompileDOMRenderConfigOverrides(editorConfig, overrides) {
	const subtypeMap = getRegisteredSubtypeMap(getKnownTypesAndNodes(editorConfig).nodes);
	const prerender = makePrerender();
	for (const override of sortedOverrides(overrides)) {
		const predicateOrTypes = getPredicate(subtypeMap, override);
		for (const k_ in prerender) {
			const k = k_;
			addOverride(prerender, k, predicateOrTypes, override[k]);
		}
	}
	return prerender;
}
function identity(v) {
	return v;
}
function compileDOMRenderConfigOverrides(editorConfig, { overrides }) {
	const prerender = precompileDOMRenderConfigOverrides(editorConfig, overrides);
	const dom = {
		...DEFAULT_EDITOR_DOM_CONFIG,
		...editorConfig.dom
	};
	compilePrerenderKey(prerender, "$createDOM", dom, merge2, ignoreNext2);
	compilePrerenderKey(prerender, "$exportDOM", dom, merge2, ignoreNext2);
	compilePrerenderKey(prerender, "$extractWithChild", dom, merge5, ignoreNext5);
	compilePrerenderKey(prerender, "$getDOMSlot", dom, merge3GetDOMSlot, ignoreNext3GetDOMSlot);
	compilePrerenderKey(prerender, "$shouldExclude", dom, merge3, ignoreNext3);
	compilePrerenderKey(prerender, "$shouldInclude", dom, merge3, ignoreNext3);
	compilePrerenderKey(prerender, "$getSlotTargetElement", dom, merge4, ignoreNext4);
	compilePrerenderKey(prerender, "$updateDOM", dom, merge4, ignoreNext4);
	compilePrerenderKey(prerender, "$decorateDOM", dom, sequence4, identity);
	return dom;
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function makeReader(record) {
	return { get(cfg) {
		return getContextValue(record, cfg);
	} };
}
/**
* The mutable, writable editor-level context record. Reads of a render state
* during reconciliation (and as the base layer of a session) fall through to
* this record, and it is the layer the `disabledForEditor` predicates read.
*
* @internal
*/
function createEditorContextRecord(contextDefaults) {
	const parent = Object.create(null);
	return contextFromPairs(contextDefaults, parent) || parent;
}
/**
* Filter the configured overrides down to those that are resident in the
* editor's render config, removing any whose `disabledForEditor` predicate
* returns `true` for the given editor context.
*
* @internal
*/
function filterEditorInstalled(overrides, record) {
	const reader = makeReader(record);
	return overrides.filter((o) => !(o.disabledForEditor && o.disabledForEditor(reader)));
}
function sameOverrides(a, b) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}
function symmetricDiff(prev, next) {
	const prevSet = new Set(prev);
	const nextSet = new Set(next);
	const changed = [];
	for (const o of prev) if (!nextSet.has(o)) changed.push(o);
	for (const o of next) if (!prevSet.has(o)) changed.push(o);
	return changed;
}
/**
* Build a predicate matching the nodes an override targets — `'*'` matches
* everything, a node class matches by `instanceof`, and a guard is used as-is.
*/
function nodeMatcher(o) {
	if (o.nodes === "*") return () => true;
	const matchers = o.nodes.map((match) => {
		const klass = match;
		return $isLexicalNode(klass.prototype) ? (node) => node instanceof klass : match;
	});
	return (node) => matchers.some((f) => f(node));
}
/**
* Build a predicate matching the nodes whose DOM must be recreated for the
* given override change, or `null` when no live re-render is needed.
*
* `$createDOM`/`$getDOMSlot` produce the element and slot, and `$decorateDOM`
* may add DOM that only a fresh `$createDOM` can revert — so toggling any of
* them recreates the affected nodes. `$updateDOM` is diff-driven and applies on
* the next node update, and export-only hooks ($exportDOM/$shouldInclude/…)
* don't touch the live DOM, so neither needs a re-render. Recreating every
* affected node is the simple, always-correct choice; toggles are rare, so the
* cost is acceptable and can be optimized later if needed.
*/
function recreatePredicate(changed) {
	const matchers = [];
	for (const o of changed) if (o.$createDOM || o.$getDOMSlot || o.$decorateDOM) matchers.push(nodeMatcher(o));
	return matchers.length === 0 ? null : (node) => matchers.some((f) => f(node));
}
/**
* Per-editor runtime backing {@link DOMRenderExtension}'s conditional
* overrides and imperative editor context. See {@link DOMRenderRuntime}.
*
* @internal
*/
var DOMRenderRuntimeImpl = class {
	editor;
	/**
	* The `nodes` and base `dom` captured at `init` (before `dom` was
	* overwritten with the compiled config) — the clean base for every recompile.
	*/
	initialEditorConfig;
	overrides;
	editorContext;
	hasSessionGates;
	installed;
	/** Memoized session configs keyed by the set of session-disabled overrides. */
	sessionCache = (() => /* @__PURE__ */ new Map())();
	constructor(editor, initialEditorConfig, overrides, editorContext) {
		this.editor = editor;
		this.initialEditorConfig = initialEditorConfig;
		this.overrides = overrides;
		this.editorContext = editorContext;
		this.installed = filterEditorInstalled(overrides, editorContext);
		this.hasSessionGates = overrides.some((o) => o.disabledForSession);
	}
	setContextValue(cfg, value) {
		const prev = this.installed;
		this.editorContext[cfg.key] = value;
		const next = filterEditorInstalled(this.overrides, this.editorContext);
		if (sameOverrides(prev, next)) return;
		const changed = symmetricDiff(prev, next);
		this.installed = next;
		this.sessionCache.clear();
		const dom = compileDOMRenderConfigOverrides(this.initialEditorConfig, { overrides: next });
		this.editor._config.dom = dom;
		const recreate = recreatePredicate(changed);
		if (!recreate) return;
		const base = dom.$updateDOM;
		dom.$updateDOM = (nextNode, prevNode, el, editor) => recreate(nextNode) ? true : base(nextNode, prevNode, el, editor);
		this.editor.update($fullReconcile, { discrete: true });
		dom.$updateDOM = base;
	}
	getSessionConfig() {
		const resident = this.editor._config.dom || DEFAULT_EDITOR_DOM_CONFIG;
		if (!this.hasSessionGates) return resident;
		const reader = makeReader(getContextRecord(DOMRenderContextSymbol, this.editor) || this.editorContext);
		const disabledKeys = [];
		const sessionSet = [];
		this.installed.forEach((o, i) => {
			if (o.disabledForSession && o.disabledForSession(reader)) disabledKeys.push(String(i));
			else sessionSet.push(o);
		});
		if (disabledKeys.length === 0) return resident;
		const key = disabledKeys.join(",");
		let cfg = this.sessionCache.get(key);
		if (!cfg) {
			cfg = compileDOMRenderConfigOverrides(this.initialEditorConfig, { overrides: sessionSet });
			this.sessionCache.set(key, cfg);
		}
		return cfg;
	}
};
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/** @internal The result returned from {@link DOMRenderExtension}'s `init`. */
/**
* @experimental
*
* An extension that allows overriding the render and export behavior for an
* editor. This is highly experimental and subject to change from one version
* to the next.
**/
var DOMRenderExtension = {
	build(editor, config, state) {
		const { initialEditorConfig } = state.getInitResult();
		const editorContext = createEditorContextRecord(config.contextDefaults);
		return {
			defaults: editorContext,
			runtime: new DOMRenderRuntimeImpl(editor, initialEditorConfig, config.overrides, editorContext)
		};
	},
	config: {
		contextDefaults: [],
		overrides: []
	},
	html: { export: /* @__PURE__ */ new Map([[RootNode, () => {
		const element = $getDocument().createElement("div");
		element.role = "textbox";
		return { element };
	}]]) },
	init(editorConfig, config) {
		const initialEditorConfig = {
			dom: editorConfig.dom,
			nodes: editorConfig.nodes
		};
		const editorContext = createEditorContextRecord(config.contextDefaults);
		editorConfig.dom = compileDOMRenderConfigOverrides(editorConfig, { overrides: filterEditorInstalled(config.overrides, editorContext) });
		return { initialEditorConfig };
	},
	mergeConfig(config, partial) {
		const merged = shallowMergeConfig(config, partial);
		for (const k of ["overrides", "contextDefaults"]) if (partial[k]) merged[k] = [...config[k], ...partial[k]];
		return merged;
	},
	name: DOMRenderExtensionName
};
/**
* @internal
*
* A predicate that may write into the per-invocation `captures` map. Returns
* `true` if the rule matches; `false` otherwise.
*/
/** @internal */
/** @internal The runtime shape of a {@link CompiledSelector}. */
var IMPL = Symbol.for("@lexical/html/SelectorImpl");
/** @internal */
function getSelectorImpl(sel) {
	const impl = sel[IMPL];
	if (!(impl !== void 0)) formatDevErrorMessage$4(`match must be a CompiledSelector produced by sel.* or sel.css(); received a raw object.`);
	return impl;
}
function combinePredicates(preds) {
	if (preds.length === 0) return isHTMLElement;
	if (preds.length === 1) return preds[0];
	return (node, captures) => {
		for (const p of preds) if (!p(node, captures)) return false;
		return true;
	};
}
/**
* @internal
*
* Build a selector value from a tag set and a predicate list. Used by the
* combinator API and the CSS parser.
*/
function buildSelector(tags, predicates) {
	const impl = {
		kind: "element",
		predicate: combinePredicates(predicates),
		tags
	};
	const refine = (additional) => buildSelector(tags, [...predicates, additional]);
	return {
		[IMPL]: impl,
		attr: (name, value, options) => refine(buildAttrPredicate(name, value, options)),
		classAll: (...classes) => refine(buildClassAllPredicate(classes)),
		classAny: (...classes) => refine(buildClassAnyPredicate(classes)),
		styleAny: (prop, value, options) => refine(buildStylePredicate(prop, value, options))
	};
}
function normalizeClassList(classes) {
	const out = [];
	for (const c of classes) if (c) out.push(c);
	return out;
}
/** @internal */
function buildClassAllPredicate(classes) {
	const ns = normalizeClassList(classes);
	if (ns.length === 0) return () => true;
	return (node) => {
		if (!isHTMLElement(node)) return false;
		const cl = node.classList;
		for (const c of ns) if (!cl.contains(c)) return false;
		return true;
	};
}
/** @internal */
function buildClassAnyPredicate(classes) {
	const ns = normalizeClassList(classes);
	if (ns.length === 0) return () => false;
	return (node) => {
		if (!isHTMLElement(node)) return false;
		const cl = node.classList;
		for (const c of ns) if (cl.contains(c)) return true;
		return false;
	};
}
/** @internal */
function buildAttrPredicate(name, value, options) {
	if (value === true) return (node) => isHTMLElement(node) && node.hasAttribute(name);
	if (typeof value === "string") return (node) => isHTMLElement(node) && node.getAttribute(name) === value;
	if (value instanceof RegExp) {
		const capture = options && options.capture;
		const re = value;
		return (node, captures) => {
			if (!isHTMLElement(node)) return false;
			const v = node.getAttribute(name);
			if (v == null) return false;
			const m = v.match(re);
			if (m === null) return false;
			if (capture !== void 0) captures[capture] = m;
			return true;
		};
	}
	formatDevErrorMessage$4(`sel.attr(${JSON.stringify(name)}, ...) requires true, a string, or a RegExp`);
}
function buildStylePredicate(prop, value, options) {
	if (typeof value === "string") return (node) => isHTMLElement(node) && node.style.getPropertyValue(prop) === value;
	if (value instanceof RegExp) {
		const capture = options && options.capture;
		const re = value;
		return (node, captures) => {
			if (!isHTMLElement(node)) return false;
			const v = node.style.getPropertyValue(prop);
			if (!v) return false;
			const m = v.match(re);
			if (m === null) return false;
			if (capture !== void 0) captures[capture] = m;
			return true;
		};
	}
	formatDevErrorMessage$4(`sel.styleAny(${JSON.stringify(prop)}, ...) requires a string or a RegExp`);
}
var TEXT_SELECTOR_IMPL = {
	kind: "text",
	predicate: isDOMTextNode,
	tags: /* @__PURE__ */ new Set()
};
/**
* Wrap a {@link SelectorImpl} as an opaque {@link CompiledSelector}. The `as`
* cast is needed because `CompiledSelector` is an opaque branded interface —
* neither the object literal nor a typed const can declare the internal
* `IMPL` symbol without exposing it. A function declared side-effect free (so
* the build annotates the calls) rather than an object literal at module
* scope: a computed `[IMPL]` key there is a side effect to bundlers, which
* would pin the selector into every bundle that imports this module.
*
* @__NO_SIDE_EFFECTS__
*/
function compiledSelector(impl) {
	return { [IMPL]: impl };
}
var TEXT_SELECTOR = /* @__PURE__ */ compiledSelector(TEXT_SELECTOR_IMPL);
var COMMENT_SELECTOR = /* @__PURE__ */ compiledSelector({
	kind: "comment",
	predicate: (node) => node.nodeType === 8,
	tags: /* @__PURE__ */ new Set()
});
/**
* Match any {@link HTMLElement}.
*
* @internal Use `sel.any()`.
*/
function selAny() {
	return buildSelector(/* @__PURE__ */ new Set(), []);
}
/**
* Match DOM {@link Comment} nodes.
*
* @internal Use `sel.comment()`.
*/
function selComment() {
	return COMMENT_SELECTOR;
}
/**
* Match by tag name(s). With one literal tag the element type is narrowed
* (e.g. `'a' → HTMLAnchorElement`); with multiple, it is the union of
* their `HTMLElementTagNameMap` entries.
*
* @internal Use `sel.tag()`.
*/
function selTag(...tags) {
	if (!(tags.length > 0)) formatDevErrorMessage$4(`sel.tag() requires at least one tag name`);
	const upper = /* @__PURE__ */ new Set();
	for (const t of tags) upper.add(t.toUpperCase());
	return buildSelector(upper, []);
}
/**
* Match DOM {@link Text} nodes.
*
* @internal Use `sel.text()`.
*/
function selText() {
	return TEXT_SELECTOR;
}
/**
* Combinator API for building {@link CompiledSelector}s. The public
* `sel` is augmented from this in `./index.ts` (where the CSS parser is
* available without a circular import); consumers outside `@lexical/html`
* should always import the public `sel` from the package root.
*
* Every method builds a selector and returns it; none of them touch anything
* outside their arguments, which is what the marker declares. The build
* annotates module-scope calls to them so an unused rule can be dropped.
*
* @internal
* @lexical-pure-namespace
*/
var selBase = {
	/** Match any {@link HTMLElement}. */
	any: selAny,
	/** Match DOM {@link Comment} nodes. */
	comment: selComment,
	/**
	* Match by tag name(s). With one literal tag the element type is narrowed
	* (e.g. `'a' → HTMLAnchorElement`); with multiple, it is the union of
	* their `HTMLElementTagNameMap` entries.
	*/
	tag: selTag,
	/** Match DOM {@link Text} nodes. */
	text: selText
};
/**
* Cross-frame-safe replacement for `node instanceof HTMLXxxElement`. Returns
* true when `node` is an HTMLElement whose `nodeName` equals `tag` (compared
* case-insensitively).
*
* @experimental
*/
function isElementOfTag(node, tag) {
	return isHTMLElement(node) && node.nodeName === tag.toUpperCase();
}
var IDENT_CHAR = /[A-Za-z0-9_-]/;
var Cursor = class {
	constructor(source, pos) {
		this.source = source;
		this.pos = pos;
	}
	peek(offset = 0) {
		return this.source[this.pos + offset] || "";
	}
	consume() {
		return this.source[this.pos++] || "";
	}
	eof() {
		return this.pos >= this.source.length;
	}
	skipWhitespace() {
		while (!this.eof() && /\s/.test(this.peek())) this.pos++;
	}
	readIdent() {
		const start = this.pos;
		while (!this.eof() && IDENT_CHAR.test(this.peek())) this.pos++;
		return this.source.slice(start, this.pos);
	}
	readQuoted() {
		const quote = this.consume();
		this.assert(quote === "\"" || quote === "'", "expected quote");
		const start = this.pos;
		while (!this.eof() && this.peek() !== quote) if (this.peek() === "\\") this.pos += 2;
		else this.pos++;
		this.assert(!this.eof(), "unterminated string");
		const value = this.source.slice(start, this.pos);
		this.pos++;
		return value.replace(/\\(.)/g, "$1");
	}
	/**
	* `invariant(cond, fmt, …)`-flavored assertion that also surfaces the
	* cursor's position context. Use for parse-time errors so a malformed
	* CSS selector gets a useful, position-annotated message.
	*/
	assert(cond, msg) {
		if (!cond) formatDevErrorMessage$4(`invalid CSS selector at col ${String(this.pos + 1)}: ${msg} in ${this.source}`);
	}
};
function parseSimpleSelector(c) {
	const tags = /* @__PURE__ */ new Set();
	const predicates = [];
	const classes = [];
	let isUniversal = false;
	c.skipWhitespace();
	if (c.peek() === "*") {
		c.consume();
		isUniversal = true;
	} else if (IDENT_CHAR.test(c.peek())) {
		const tag = c.readIdent();
		if (tag) tags.add(tag.toUpperCase());
	}
	while (!c.eof()) {
		const ch = c.peek();
		if (ch === ".") {
			c.consume();
			const cls = c.readIdent();
			c.assert(cls !== "", "expected class name after \".\"");
			classes.push(cls);
		} else if (ch === "#") {
			c.consume();
			const id = c.readIdent();
			c.assert(id !== "", "expected id after \"#\"");
			predicates.push(buildAttrPredicate("id", id));
		} else if (ch === "[") {
			c.consume();
			c.skipWhitespace();
			const name = c.readIdent();
			c.assert(name !== "", "expected attribute name after \"[\"");
			c.skipWhitespace();
			let value = true;
			if (c.peek() === "=") {
				c.consume();
				c.skipWhitespace();
				const next = c.peek();
				if (next === "\"" || next === "'") value = c.readQuoted();
				else {
					value = c.readIdent();
					c.assert(value !== "", "expected attribute value");
				}
				c.skipWhitespace();
			}
			c.assert(c.peek() === "]", "expected \"]\"");
			c.consume();
			predicates.push(buildAttrPredicate(name, value));
		} else break;
	}
	if (classes.length > 0) predicates.push(buildClassAllPredicate(classes));
	c.assert(isUniversal || tags.size > 0 || predicates.length > 0, "expected a selector");
	return {
		predicates,
		tags
	};
}
/**
* Parse a reduced CSS-selector subset and return a {@link CompiledSelector}.
* Supported:
* - Tag (`p`), wildcard (`*`).
* - Tag list (`h1, h2, h3`).
* - Class (`.foo`, `.foo.bar`).
* - ID (`#foo`).
* - Attribute presence (`[name]`).
* - Attribute equality (`[name="value"]`, `[name=value]`).
*
* Anything outside the subset (regex attribute, inline-style match,
* combinators, pseudo-classes) is intentionally rejected — chain combinator
* methods off the returned builder instead.
*
* @experimental
*/
function parseSelector(source) {
	const c = new Cursor(source, 0);
	const groups = [];
	while (true) {
		groups.push(parseSimpleSelector(c));
		c.skipWhitespace();
		if (c.eof()) break;
		c.assert(c.peek() === ",", "expected \",\" (selector lists are the only supported combinator)");
		c.consume();
		c.skipWhitespace();
	}
	if (groups.length === 1) return buildSelector(groups[0].tags, groups[0].predicates);
	const tags = /* @__PURE__ */ new Set();
	if (groups.every((g) => g.tags.size > 0)) for (const g of groups) for (const t of g.tags) tags.add(t);
	const orPredicate = (node, captures) => {
		for (const g of groups) {
			const upper = node.nodeName;
			if (g.tags.size > 0 && !g.tags.has(upper)) continue;
			let ok = true;
			for (const p of g.predicates) if (!p(node, captures)) {
				ok = false;
				break;
			}
			if (ok) return true;
		}
		return false;
	};
	return buildSelector(tags, [orPredicate]);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Create an import context state. The phantom symbol prevents accidental
* use of a render-context state in an import context (and vice versa).
*
* Note: to support the value-or-updater pattern, `V` cannot be a function
* type; wrap it in an array or object if needed.
*
* `getDefaultValue` is called **once at state creation** and the result is
* shared between every session that reads the state without first writing
* a value. Defaults must therefore be immutable (primitives, frozen
* objects, or read-only arrays / records). If your state needs mutable
* per-session storage, lazily initialize it inside your rule (e.g.
* `if (!ctx.session.has(cfg)) ctx.session.set(cfg, new …())`).
*
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function createImportState(name, getDefaultValue, isEqual) {
	return createContextState(DOMImportContextSymbol, name, getDefaultValue, isEqual);
}
/**
* The kind of operation that produced this import. Lets rules adapt
* their behavior (e.g. preserve more whitespace on `'paste'`).
* Defaults to `'unknown'`. Apps that need a different vocabulary can
* define their own {@link ImportStateConfig} with whatever value type
* they want.
*
* @experimental
*/
/**
* Built-in import-context state identifying how this import was initiated.
* Callers of `$generateNodesFromDOM` should set it via the `context` option.
*
* @experimental
*/
var ImportSource = /* @__PURE__ */ createImportState("importSource", () => "unknown");
/**
* Built-in import-context state holding the {@link DataTransfer} the
* import was sourced from, if any. `null` outside paste/drop flows.
*
* The clipboard import pipeline passes the original `DataTransfer`
* through to its per-MIME-type handler stack (see
* {@link ImportMimeTypeFunction}); handlers that route HTML through
* the {@link DOMImportExtension} pipeline should forward it into the
* walk via `context: [contextValue(ImportSourceDataTransfer,
* dataTransfer)]` so rules and preprocessors can call
* `ctx.get(ImportSourceDataTransfer)` to inspect companion MIME types
* (e.g. an `'application/rtf'` alternative or an attached
* `'application/x-officedrawing'` payload), the file list, or any
* custom drag-and-drop slot.
*
* Use sparingly: the safer pattern is to decide *which* MIME-type
* payload to walk in the clipboard handler stack and hand a finalized
* DOM to the rules; only fall back to peeking at `ImportSourceDataTransfer`
* when the source-detection signal genuinely lives in a companion
* slot.
*
* @experimental
*/
var ImportSourceDataTransfer = /* @__PURE__ */ createImportState("importSourceDataTransfer", () => null);
/**
* Built-in import-context state holding the bit-packed
* {@link TextFormatType} formats that should apply to {@link TextNode}s
* produced during the current subtree. Used by inline-format wrappers
* (`<b>`, `<i>`, `<u>`, …) to propagate formatting through the context
* record instead of via the legacy `forChild` chain.
*
* @experimental
*/
var ImportTextFormat = /* @__PURE__ */ createImportState("textFormat", () => 0);
/**
* Built-in import-context state holding a parsed CSS-style record
* (the {@link getStyleObjectFromCSS} shape) that should apply to
* {@link TextNode}s produced during the current subtree. Mirrors the
* format-bit propagation in {@link ImportTextFormat} for properties
* that don't fit into the format bit mask — `color`, `font-family`,
* `font-size`, etc.
*
* Ancestor rules that contribute a style branch the context with a
* merged record; the core `#text` rule materializes the non-empty
* record to a CSS string and calls `setStyle` on the new TextNode.
* Once TextNode adopts a parsed style record, the materialization
* step will go away.
*
* @experimental
*/
var ImportTextStyle = /* @__PURE__ */ createImportState("textStyle", () => ({}));
/**
* Determines whether a given DOM element should be treated as preserving
* whitespace (i.e. text content under it is not collapsed and is split on
* `\n` / `\t` into `LineBreakNode` / `TabNode`). The default matches the
* legacy behavior: the element itself is `<pre>` or its inline
* `white-space` style begins with `'pre'`.
*
* @experimental
*/
/**
* Determines whether a given DOM node sits on the same visual line as its
* adjacent text siblings, governing whether leading/trailing whitespace in
* a `#text` is collapsed against neighbors. The default consults
* {@link isInlineDomNode} from `lexical` (style.display or a fixed inline
* tag-name set) and additionally treats elements with an explicit
* non-inline `display` style as block.
*
* @experimental
*/
/**
* Configuration for the core text whitespace-collapse logic. Override via
* {@link ImportWhitespaceConfig} either as a `contextDefaults` entry on
* the {@link DOMImportExtension} or per-call on `$generateNodesFromDOM`'s
* `context` option.
*
* @experimental
*/
/**
* Default {@link WhitespaceImportConfig.preservesWhitespace}: matches
* `<pre>` and any element with `white-space: pre*`.
*
* @experimental
*/
function defaultPreservesWhitespace(node) {
	if (!isHTMLElement(node)) return false;
	if (node.nodeName === "PRE") return true;
	const ws = node.style.whiteSpace;
	return typeof ws === "string" && ws.startsWith("pre");
}
/**
* Default {@link WhitespaceImportConfig.isInline}: treats an element as
* inline iff its inline `display` style is `inline*` OR (no explicit
* non-inline display) its nodeName is a known inline tag (`isInlineDomNode`).
* Text nodes are always inline; comments and other non-elements are not.
*
* @experimental
*/
function defaultIsInline(node) {
	if (isDOMTextNode(node)) return true;
	if (!isHTMLElement(node)) return false;
	const display = node.style.display;
	if (display) return display.startsWith("inline");
	if (isBlockDomNode(node)) return false;
	return isInlineDomNode(node);
}
/**
* Built-in import-context state controlling text-node whitespace handling
* (collapse vs. preserve, what counts as an inline sibling). Override per
* editor via {@link DOMImportConfig.contextDefaults} or per call via
* {@link GenerateNodesFromDOMOptions.context}.
*
* @experimental
*/
var ImportWhitespaceConfig = /* @__PURE__ */ createImportState("whitespaceConfig", () => ({
	isInline: defaultIsInline,
	preservesWhitespace: defaultPreservesWhitespace
}));
/**
* Built-in session slot for runtime overlay rules that should be in
* effect for the entire walk. A preprocessor writes here when it wants
* to conditionally install handling for a particular paste source
* (e.g. "if the Microsoft Word generator meta tag is present, push the
* Word-paste overlay"). Each entry contributes an overlay dispatcher
* to the runtime's overlay stack; later array entries are higher
* priority. Use `ctx.session.update(ImportOverlays, prev => […])` to
* append.
*
* This is the walk-wide counterpart to
* `$importChildren({rules: …})` (which scopes an overlay to one
* subtree): write to {@link ImportOverlays} when the overlay should
* apply for the whole document; use `$importChildren`'s `rules` when
* the overlay should only apply for a deeper region.
*
* @experimental
*/
var ImportOverlays = /* @__PURE__ */ createImportState("importOverlays", () => []);
/**
* The session IS the root-layer {@link ContextRecord} of the walk. Reads
* fall through the prototype chain to the editor's `contextDefaults`,
* writes mutate the record's own properties, and any branch pushed by
* `$importChildren({context})` sits above this layer and can shadow
* (but does not overwrite) slots.
*
* @internal
*/
var ImportSessionImpl = class {
	constructor(record) {
		this.record = record;
	}
	get(cfg) {
		return getContextValue(this.record, cfg);
	}
	set(cfg, value) {
		this.record[cfg.key] = value;
	}
	update(cfg, updater) {
		this.record[cfg.key] = updater(getContextValue(this.record, cfg));
	}
	has(cfg) {
		return Object.prototype.hasOwnProperty.call(this.record, cfg.key);
	}
};
function getDefaultImportContext(editor) {
	const dep = getPeerDependencyFromEditor(editor, DOMImportExtensionName);
	return dep ? dep.output.defaults : void 0;
}
function getImportContext(editor) {
	return getContextRecord(DOMImportContextSymbol, editor) || getDefaultImportContext(editor);
}
/**
* Read an import context value during an import operation.
* @experimental
*/
function $getImportContextValue(cfg, editor = $getEditor()) {
	return getContextValue(getImportContext(editor), cfg);
}
/**
* Run `f` with the given context pairs applied on top of the editor's
* current import context.
*
* @experimental
*/
var $withImportContext = /* @__PURE__ */ $withContext(DOMImportContextSymbol, getDefaultImportContext);
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* True if the node fills a block slot at the root or inside another
* block — covers both ElementNode-style blocks (paragraph, heading,
* quote) and block-level DecoratorNodes (HorizontalRuleNode,
* ImageNode-as-block, etc.). Used by {@link BlockSchema},
* {@link RootSchema}, and {@link NestedBlockSchema}.
*
* @experimental
*/
function $isBlockLevel(node) {
	return $isBlockElementNode(node) || $isDecoratorNode(node) && !node.isInline();
}
/**
* Distribute an inline wrapper (`LinkNode`, `MarkNode`, …) across a
* heterogeneous run of children produced by `$importChildren`, lifting
* any block children to the top level while keeping the wrapper around
* the leaf inline content.
*
* Use from a rule whose DOM source is an inline element that the
* browser permitted to enclose block elements — the canonical case is
* `<a href="…"><h1>title</h1><div>body</div></a>`, which a link rule
* wants to surface as two block siblings (heading + paragraph), each
* with its own link wrapping the original inline content. Schemas
* can't express this because they reason about a parent's children
* only — they cannot lift the parent out of itself.
*
* For each top-level child:
* - **Inline children** are collected into runs; each run is wrapped
*   in a single fresh wrapper (from `$makeWrapper()`).
* - **Block children** are descended into: their own children are
*   recursively distributed with `$makeWrapper`, then re-attached so
*   the block keeps its position at the top level.
*
* The returned list will contain a mix of blocks and wrapped inline
* runs. The enclosing schema (typically {@link BlockSchema}) will
* then package those inline wrappers into paragraphs as usual.
*
* @experimental
*/
function $distributeInlineWrapper(children, $makeWrapper) {
	const out = [];
	let inlineRun = [];
	const flushInline = () => {
		if (inlineRun.length === 0) return;
		out.push($makeWrapper().splice(0, 0, inlineRun));
		inlineRun = [];
	};
	for (const child of children) if ($isBlockLevel(child)) {
		flushInline();
		if ($isElementNode(child)) {
			const wrapped = $distributeInlineWrapper(child.getChildren(), $makeWrapper);
			child.splice(0, child.getChildrenSize(), wrapped);
		}
		out.push(child);
	} else inlineRun.push(child);
	flushInline();
	return out;
}
/**
* Apply a {@link ChildSchema} to a flat list of children produced by
* `$importChildren`. Walks the list once, partitions into accepted vs.
* rejected runs, packages or drops rejected runs, then runs `$finalize`.
*
* @internal
*/
function $applySchema(schema, children, parent, domParent) {
	const out = [];
	let run = null;
	const flushRun = () => {
		if (run === null) return;
		const rejected = run;
		run = null;
		if (schema.$packageRun) {
			const packaged = schema.$packageRun(rejected, parent, domParent);
			if (packaged.length > 0) {
				for (const n of packaged) out.push(n);
				return;
			}
		}
		if (schema.onReject === "hoist") for (const n of rejected) out.push(n);
	};
	for (const child of children) if (schema.$accepts(child, parent)) {
		flushRun();
		out.push(child);
	} else {
		if (run === null) run = [];
		run.push(child);
	}
	flushRun();
	return schema.$finalize ? schema.$finalize(out, parent) : out;
}
/**
* Apply a parent DOM element's `text-align` (when set to one of the
* supported {@link ElementFormatType} values) to each block-level child
* Lexical node that does not yet have its own format.
*
* Mirrors the part of the legacy `wrapContinuousInlines` that wrote
* `node.setFormat(textAlign)` onto pre-existing block children when the
* DOM parent carried `style.textAlign`. Pair with
* {@link $paragraphPackageRun} (which carries the same propagation onto
* paragraphs synthesized around inline runs) to fully replicate the
* legacy behavior on a run of mixed children.
*
* @experimental
*/
function $propagateTextAlignToBlockChildren(children, domParent) {
	if (!isHTMLElement(domParent)) return children;
	const textAlign = domParent.style.textAlign;
	if (!isAlignmentValue(textAlign)) return children;
	for (const child of children) if ($isBlockElementNode(child) && child.getFormatType() === "") child.setFormat(textAlign);
	return children;
}
/**
* Wrap a run of inline lexical nodes in a fresh paragraph, propagating the
* `text-align` of `domParent` as the paragraph's format type (matching the
* legacy `wrapContinuousInlines` behavior).
*/
function $paragraphPackageRun(run, _parent, domParent) {
	if (run.length === 1 && $isLineBreakNode(run[0])) run = [];
	const paragraph = $createParagraphNode();
	if (isHTMLElement(domParent)) {
		const textAlign = domParent.style.textAlign;
		if (isAlignmentValue(textAlign)) paragraph.setFormat(textAlign);
	}
	return [paragraph.splice(0, 0, run)];
}
/**
* Default schema for block-level positions (root of the document, the body
* of a block element node). Accepts block lexical nodes; packages runs of
* inline children into fresh paragraph nodes.
*
* @experimental
*/
var BlockSchema = {
	$accepts: $isBlockLevel,
	$packageRun: $paragraphPackageRun,
	name: "BlockSchema"
};
/**
* Schema for the topmost level of `$generateNodesFromDOM`. Identical to
* {@link BlockSchema}; aliased for clarity at the entry point and so it can
* be overridden separately in the future (e.g. to synthesize a `ListNode`
* around runs of orphan `ListItemNode`s).
*
* @experimental
*/
var RootSchema = {
	$accepts: $isBlockLevel,
	$packageRun: $paragraphPackageRun,
	name: "RootSchema"
};
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var sel$1 = selBase;
var ALIGNMENT_VALUES = /* @__PURE__ */ new Set([
	"center",
	"end",
	"justify",
	"left",
	"right",
	"start"
]);
/**
* True if `value` is a non-empty {@link ElementFormatType} (matches one of
* the supported `text-align` / legacy `align`-attribute values).
*
* @internal
*/
function isAlignmentValue(value) {
	return ALIGNMENT_VALUES.has(value);
}
/**
* A pair of bitmasks describing which {@link TextFormatType} bits to set
* and which to clear when descending into an element. The clear pass
* matters for cases the legacy OR-merge mishandled, e.g. `<b
* style="font-weight: normal">` clearing an inherited bold, or `<sub>` /
* `<sup>` clearing each other.
*/
/**
* The small subset of inline-style properties that affect text formatting
* during import. Modeled as a plain object so tag-implicit defaults and
* the element's own inline `style` can be merged with `{...defaults,
* ...override-if-set}` semantics rather than relying on CSSStyleDeclaration.
*/
/**
* Default style implied by each inline format tag. `<b>`/`<strong>` set
* font-weight, `<sub>` sets vertical-align, etc. Any of these can be
* overridden by the element's own inline `style` (so `<b
* style="font-weight: normal">` ends up with `fontWeight: 'normal'` in
* the effective style).
*/
var TAG_DEFAULT_STYLE = {
	B: { fontWeight: "bold" },
	EM: { fontStyle: "italic" },
	I: { fontStyle: "italic" },
	S: { textDecoration: "line-through" },
	STRONG: { fontWeight: "bold" },
	SUB: { verticalAlign: "sub" },
	SUP: { verticalAlign: "super" },
	U: { textDecoration: "underline" }
};
/**
* Tags whose effect on TextFormat has no CSS analog (so the style-merge
* path can't reach them). Applied as a pure "set" override.
*/
var TAG_ONLY_SET = {
	CODE: 16,
	MARK: 128
};
function readElementFormatStyle(el) {
	return {
		fontStyle: el.style.fontStyle,
		fontWeight: el.style.fontWeight,
		textDecoration: el.style.textDecoration,
		textTransform: el.style.textTransform,
		verticalAlign: el.style.verticalAlign
	};
}
function mergeStyles(defaults, override) {
	return {
		fontStyle: override.fontStyle || defaults.fontStyle,
		fontWeight: override.fontWeight || defaults.fontWeight,
		textDecoration: override.textDecoration || defaults.textDecoration,
		textTransform: override.textTransform || defaults.textTransform,
		verticalAlign: override.verticalAlign || defaults.verticalAlign
	};
}
/**
* The CSS property names {@link styleFormatOverride} reads — these are
* "owned" by {@link ImportTextFormat} (the bit mask). When the
* {@link ImportTextStyle} record is materialized onto a TextNode's
* inline style by {@link styleObjectToCSS}, these are skipped so the
* bit-mask side is the single source of truth and the same property
* doesn't end up in both places (where the inline-style version would
* shadow the format's themed CSS).
*/
var FORMAT_BIT_STYLE_PROPS = /* @__PURE__ */ new Set([
	"font-weight",
	"font-style",
	"text-decoration",
	"text-transform",
	"vertical-align"
]);
/**
* Translate a {@link FormatStyle} into a {@link FormatOverride}. Explicit
* "non-decorating" values (`font-weight: normal`, `text-decoration: none`,
* `vertical-align: baseline`) produce `clear` bits, so an inner element
* can remove a format inherited from its ancestors.
*/
function styleFormatOverride(style) {
	let set = 0;
	let clear = 0;
	const { fontWeight, fontStyle, textDecoration, textTransform, verticalAlign } = style;
	if (fontWeight === "700" || fontWeight === "bold") set |= 1;
	else if (fontWeight === "normal" || fontWeight === "400") clear |= 1;
	if (fontStyle === "italic") set |= 2;
	else if (fontStyle === "normal") clear |= 2;
	if (textDecoration) {
		const parts = textDecoration.split(" ");
		if (parts.includes("underline")) set |= 8;
		if (parts.includes("line-through")) set |= 4;
		if (parts.includes("none")) clear |= 12;
	}
	if (textTransform === "lowercase") {
		set |= TEXT_TYPE_TO_FORMAT.lowercase;
		clear |= TEXT_TYPE_TO_FORMAT.uppercase | TEXT_TYPE_TO_FORMAT.capitalize;
	} else if (textTransform === "uppercase") {
		set |= TEXT_TYPE_TO_FORMAT.uppercase;
		clear |= TEXT_TYPE_TO_FORMAT.lowercase | TEXT_TYPE_TO_FORMAT.capitalize;
	} else if (textTransform === "capitalize") {
		set |= TEXT_TYPE_TO_FORMAT.capitalize;
		clear |= TEXT_TYPE_TO_FORMAT.lowercase | TEXT_TYPE_TO_FORMAT.uppercase;
	} else if (textTransform === "none") clear |= TEXT_TYPE_TO_FORMAT.lowercase | TEXT_TYPE_TO_FORMAT.uppercase | TEXT_TYPE_TO_FORMAT.capitalize;
	if (verticalAlign === "sub") {
		set |= 32;
		clear |= 64;
	} else if (verticalAlign === "super") {
		set |= 64;
		clear |= 32;
	} else if (verticalAlign === "baseline") clear |= 96;
	return {
		clear,
		set
	};
}
function applyFormatOverride(format, ov) {
	return format & ~ov.clear | ov.set;
}
/**
* Unified rule for inline-format-bearing tags and `<span>`. The element's
* effective style is its tag's {@link TAG_DEFAULT_STYLE} merged with its
* inline `style` (element's own style wins for any property it sets), and
* the resulting style is translated into a {@link FormatOverride}. Tags
* with no CSS analog (`<code>`, `<mark>`) contribute their bit as a pure
* `set` override.
*
* This shape lets:
* - `<b style="font-weight: normal">` clear an inherited IS_BOLD.
* - `<sub><sup>x</sup></sub>` resolve to IS_SUPERSCRIPT only (sub/sup
*   mutex via the vertical-align clear logic).
* - `<span style="text-decoration: none">` strip inherited underline /
*   line-through.
*/
var InlineFormatRule = {
	$import: (ctx, el) => {
		const inherited = ctx.get(ImportTextFormat);
		const tagDefault = TAG_DEFAULT_STYLE[el.nodeName];
		const elStyle = readElementFormatStyle(el);
		let merged = applyFormatOverride(inherited, styleFormatOverride(tagDefault ? mergeStyles(tagDefault, elStyle) : elStyle));
		const tagOnly = TAG_ONLY_SET[el.nodeName];
		if (tagOnly) merged |= tagOnly;
		if (merged === inherited) return ctx.$importChildren(el);
		return ctx.$importChildren(el, { context: [contextValue(ImportTextFormat, merged)] });
	},
	match: /* @__PURE__ */ sel$1.tag("b", "strong", "em", "i", "code", "mark", "s", "sub", "sup", "u", "span"),
	name: "@lexical/html/inline-format"
};
/**
* Walk up the DOM ancestor chain to determine whether `node` is inside an
* element whose whitespace should be preserved, per the supplied
* {@link WhitespaceImportConfig.preservesWhitespace} predicate. Pure
* ancestor walk, no caching.
*/
function isInsidePreserveWhitespace(node, wsConfig) {
	let current = node.parentNode;
	while (current !== null) {
		if (wsConfig.preservesWhitespace(current)) return true;
		current = current.parentNode;
	}
	return false;
}
function findAdjacentTextOnLine(text, forward, wsConfig) {
	let node = text;
	while (true) {
		let sibling = null;
		while ((sibling = forward ? node.nextSibling : node.previousSibling) === null) {
			const parent = node.parentNode;
			if (parent === null) return null;
			node = parent;
		}
		node = sibling;
		if (!wsConfig.isInline(node)) return null;
		let descendant = node;
		while ((descendant = forward ? node.firstChild : node.lastChild) !== null) node = descendant;
		if (isDOMTextNode(node)) return node;
		if (node.nodeName === "BR") return null;
	}
}
function collapseWhitespace(textNode, wsConfig) {
	let textContent = (textNode.textContent || "").replace(/\r/g, "").replace(/[ \t\n]+/g, " ");
	if (textContent.length === 0) return "";
	if (textContent[0] === " ") {
		let neighbor = textNode;
		let isStartOfLine = true;
		while (neighbor !== null && (neighbor = findAdjacentTextOnLine(neighbor, false, wsConfig)) !== null) {
			const neighborContent = neighbor.textContent || "";
			if (neighborContent.length > 0) {
				if (/[ \t\n]$/.test(neighborContent)) textContent = textContent.slice(1);
				isStartOfLine = false;
				break;
			}
		}
		if (isStartOfLine) textContent = textContent.slice(1);
	}
	if (textContent.length > 0 && textContent[textContent.length - 1] === " ") {
		let neighbor = textNode;
		let isEndOfLine = true;
		while (neighbor !== null && (neighbor = findAdjacentTextOnLine(neighbor, true, wsConfig)) !== null) if ((neighbor.textContent || "").replace(/^( |\t|\r?\n)+/, "").length > 0) {
			isEndOfLine = false;
			break;
		}
		if (isEndOfLine) textContent = textContent.slice(0, -1);
	}
	return textContent;
}
function $applyFormat(node, format) {
	return format !== 0 && $isTextNode(node) ? node.setFormat(format) : node;
}
/**
* Inverse of {@link getStyleObjectFromCSS}: serialize a parsed style
* record back into a CSS declaration string suitable for
* `TextNode.setStyle`. Returns the empty string for an empty record.
*/
function styleObjectToCSS(style) {
	let css = "";
	for (const prop in style) {
		if (FORMAT_BIT_STYLE_PROPS.has(prop)) continue;
		css += `${prop}: ${style[prop]}; `;
	}
	return css.trimEnd();
}
function $applyTextStyle(node, style) {
	if ($isTextNode(node)) {
		const css = styleObjectToCSS(style);
		if (css !== "") node.setStyle(css);
	}
	return node;
}
/**
* `#text` rule. Inside a `<pre>` ancestor, preserve whitespace and split
* on `\n` and `\t` into `LineBreakNode`/`TabNode` siblings. Otherwise
* collapse whitespace using the same neighbor-aware rules as the legacy
* `$convertTextDOMNode`.
*/
var TextRule = {
	$import: (ctx, el) => {
		const format = ctx.get(ImportTextFormat);
		const style = ctx.get(ImportTextStyle);
		const wsConfig = ctx.get(ImportWhitespaceConfig);
		if (isInsidePreserveWhitespace(el, wsConfig)) {
			const out = $generateNodesFromRawText(el.textContent || "");
			for (const node of out) {
				$applyFormat(node, format);
				$applyTextStyle(node, style);
			}
			return out;
		}
		const collapsed = collapseWhitespace(el, wsConfig);
		if (collapsed === "") return [];
		const text = $createTextNode(collapsed);
		$applyFormat(text, format);
		$applyTextStyle(text, style);
		return [text];
	},
	match: /* @__PURE__ */ sel$1.text(),
	name: "@lexical/html/#text"
};
/**
* Drop `<style>` and `<script>` and skip descending into them — matches
* the legacy `IGNORE_TAGS` set, but as a regular rule so apps can register
* a higher-priority `<style>` rule to capture stylesheet text into the
* import session for later use.
*/
var IgnoreScriptStyleRule = {
	$import: () => [],
	match: /* @__PURE__ */ sel$1.tag("script", "style"),
	name: "@lexical/html/script-style-ignore"
};
var LineBreakRule = {
	$import: (_ctx, el) => isOnlyChildInBlockNode(el) || isLastChildInBlockNode(el) ? [] : [$createLineBreakNode()],
	match: /* @__PURE__ */ sel$1.tag("br"),
	name: "@lexical/html/br"
};
/**
* Rules covering the {@link ParagraphNode}, {@link TextNode},
* {@link LineBreakNode}, and {@link TabNode} cases that the legacy
* `importDOM` machinery in `@lexical/lexical` handled, plus the
* registration-gated `<hr>` rule for {@link HorizontalRuleNode} (see
* {@link HorizontalRuleRule}). Intended to be registered as a dependency
* of every editor that uses {@link DOMImportExtension}.
*
* @experimental
*/
var CoreImportRules = [
	IgnoreScriptStyleRule,
	{
		$import: (ctx, el) => {
			const p = $createParagraphNode();
			$setFormatFromDOM(p, el);
			setNodeIndentFromDOM(el, p);
			if (p.getFormatType() === "") {
				const align = el.getAttribute("align");
				if (align && isAlignmentValue(align)) p.setFormat(align);
			}
			$setDirectionFromDOM(p, el);
			return [p.splice(0, 0, ctx.$importChildren(el))];
		},
		match: /* @__PURE__ */ sel$1.tag("p"),
		name: "@lexical/html/p"
	},
	{
		$import: (_ctx, _el, $next) => $getEditor().hasNode(HorizontalRuleNode) ? [$createHorizontalRuleNode()] : $next(),
		match: /* @__PURE__ */ sel$1.tag("hr"),
		name: "@lexical/html/hr"
	},
	{
		$import: (ctx, el, $next) => {
			if (!isBlockDomNode(el)) return $next();
			return $propagateTextAlignToBlockChildren(ctx.$importChildren(el, { schema: BlockSchema }), el);
		},
		match: /* @__PURE__ */ sel$1.any(),
		name: "@lexical/html/transparent-block"
	},
	TextRule,
	LineBreakRule,
	InlineFormatRule
];
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/** @internal */
/** @internal */
function mergeSortedAsc(a, b) {
	const out = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) if (a[i] <= b[j]) out.push(a[i++]);
	else out.push(b[j++]);
	while (i < a.length) out.push(a[i++]);
	while (j < b.length) out.push(b[j++]);
	return out;
}
/**
* Compile an ordered list of {@link DOMImportRule}s into the dispatch tables
* used by the import runtime. Dispatch reads the list front to back, so the
* rule at index 0 is the highest-priority one. `DOMImportExtension.mergeConfig`
* prepends each contribution to the list, so the rules of the most dependent
* contributor occupy the lowest indices.
*
* @internal
*/
function compileImportRules(rules) {
	const compiled = [];
	const byTag = /* @__PURE__ */ new Map();
	const wildcardIndices = [];
	const textIndices = [];
	const commentIndices = [];
	const seenNames = /* @__PURE__ */ new Set();
	rules.forEach((rule, i) => {
		const sel = getSelectorImpl(rule.match);
		const name = rule.name || defaultRuleName(sel, i);
		if (typeof rule.name === "string" && seenNames.has(rule.name)) console.warn(`[lexical] duplicate DOMImportRule name "${rule.name}" — keep names unique to aid debugging.`);
		if (rule.name) seenNames.add(rule.name);
		compiled.push({
			$import: rule.$import,
			name,
			predicate: sel.predicate
		});
		if (sel.kind === "text") textIndices.push(i);
		else if (sel.kind === "comment") commentIndices.push(i);
		else if (sel.tags.size === 0) wildcardIndices.push(i);
		else for (const tag of sel.tags) {
			let list = byTag.get(tag);
			if (!list) {
				list = [];
				byTag.set(tag, list);
			}
			list.push(i);
		}
	});
	const finalByTag = /* @__PURE__ */ new Map();
	if (wildcardIndices.length === 0) for (const [tag, list] of byTag) finalByTag.set(tag, list);
	else for (const [tag, list] of byTag) finalByTag.set(tag, mergeSortedAsc(list, wildcardIndices));
	return {
		byTag: finalByTag,
		commentIndices,
		rules: compiled,
		textIndices,
		wildcardIndices
	};
}
function defaultRuleName(sel, index) {
	if (sel.kind === "text") return `#text@${index}`;
	if (sel.kind === "comment") return `#comment@${index}`;
	if (sel.tags.size === 0) return `*@${index}`;
	return `${Array.from(sel.tags).join(",").toLowerCase()}@${index}`;
}
/**
* Look up the (already interleaved) rule indices relevant to `node`. Element
* nodes hit `byTag` (with wildcards merged in) or fall back to the wildcard
* bucket if no tag-specific rules exist; text and comment nodes use their
* own buckets.
*
* @internal
*/
function getDispatchIndices(dispatch, node) {
	if (isDOMTextNode(node)) return dispatch.textIndices;
	if (node.nodeType === 8) return dispatch.commentIndices;
	if (isHTMLElement(node)) return dispatch.byTag.get(node.nodeName) || dispatch.wildcardIndices;
	return EMPTY_INDICES;
}
var EMPTY_INDICES = /* @__PURE__ */ Object.freeze([]);
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Opaque handle for a pre-compiled set of overlay rules. Produce one with
* {@link defineOverlayRules} and pass it to
* {@link DOMImportContext.$importChildren} via
* {@link ImportChildrenOpts.rules}.
*
* To merge two or more overlays into a single one, pass them (alongside
* raw {@link DOMImportRule}s if desired) to a fresh
* {@link defineOverlayRules} — the entries are flattened into a single
* ordered list that is dispatched front to back, so earlier entries are
* higher priority. (Unlike {@link DOMImportConfig.rules}, nothing
* prepends here: what you write is the evaluation order.)
*
* The internal shape is intentionally not part of the public API: it's a
* compiled dispatch table tagged with `__type` so callers cannot pass a
* raw rule array where a compiled overlay is expected.
*
* @experimental
*/
/**
* An entry accepted everywhere rules are configured (overlay
* definitions, {@link DOMImportConfig.rules}). Either a single
* {@link DOMImportRule} or a {@link CompiledOverlayRules} produced by
* a previous {@link defineOverlayRules} call — passing the latter
* inlines the overlay's rules at this position in priority order.
*
* @experimental
*/
/** @internal */
function flattenRuleEntries(entries) {
	const out = [];
	for (const entry of entries) if (isCompiledOverlayRules(entry)) for (const r of entry.rules) out.push(r);
	else out.push(entry);
	return out;
}
function isCompiledOverlayRules(entry) {
	return typeof entry === "object" && entry !== null && "__type" in entry && entry.__type === "CompiledOverlayRules";
}
/**
* Pre-compile a set of {@link DOMImportRuleEntry}s into a
* {@link CompiledOverlayRules} handle that can be installed via
* `ctx.$importChildren(el, {rules: …})`.
*
* Entries can be raw {@link DOMImportRule}s or other
* {@link CompiledOverlayRules} (the latter are inlined at their
* position in the list, so the same call composes any number of
* overlays). The resulting list is dispatched front to back: earlier
* entries are higher priority, and a rule defers to the next matching
* entry by calling `$next()`. When the overlay is installed via
* `$importChildren({rules})` its whole list is tried before the rules
* from {@link DOMImportConfig.rules}.
*
* Overlay rules installed as a raw array would be re-compiled on every
* `$importChildren` call. For overlays that are reused (e.g. a GitHub
* code-table rule that wraps every matching table), call this once at
* module scope so the dispatch table is built up front.
*
* @experimental
* @__NO_SIDE_EFFECTS__
*/
function defineOverlayRules(entries) {
	const rules = flattenRuleEntries(entries);
	return {
		__type: "CompiledOverlayRules",
		dispatch: compileImportRules(rules),
		rules
	};
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var NO_CAPTURES = /* @__PURE__ */ Object.freeze({});
function makeContext(runtime, captures) {
	return {
		$importChildren: (parent, opts) => $importChildrenInternal(runtime, parent, opts),
		$importOne: (node, opts) => $importOneInternal(runtime, node, opts),
		captures,
		get(cfg) {
			return $getImportContextValue(cfg, runtime.editor);
		},
		session: runtime.session
	};
}
function $importChildrenInternal(runtime, parent, opts) {
	const overlay = opts && opts.rules ? opts.rules.dispatch : void 0;
	if (overlay) runtime.overlays.push(overlay);
	try {
		const run = () => $importChildrenRun(runtime, parent, opts);
		return opts && opts.context ? $withImportContext(opts.context, runtime.editor)(run) : run();
	} finally {
		if (overlay) runtime.overlays.pop();
	}
}
function $importChildrenRun(runtime, parent, opts) {
	const onChild = opts && opts.$onChild;
	const collected = [];
	for (const child of Array.from(parent.childNodes)) {
		const produced = $importOneInternal(runtime, child, void 0);
		for (const lex of produced) {
			const result = onChild ? onChild(lex) : lex;
			if (result != null) collected.push(result);
		}
	}
	const afterApplied = opts && opts.$after ? opts.$after(collected) : collected;
	const schema = opts && opts.schema;
	if (!schema) return afterApplied;
	return $applySchema(schema, afterApplied, null, parent);
}
function $importOneInternal(runtime, node, opts) {
	const run = () => $dispatch(runtime, node);
	return opts && opts.context ? $withImportContext(opts.context, runtime.editor)(run) : run();
}
/**
* Build the candidate (dispatch, indices) list for `node`. Overlays are
* tried first in top-of-stack order; the main dispatcher comes last. The
* `$next()` chain walks through all of them in sequence — an overlay rule
* can defer to a lower overlay rule, or all the way through to a main
* rule, just by calling `$next()`.
*/
function getCandidates(runtime, node) {
	const candidates = [];
	for (let i = runtime.overlays.length - 1; i >= 0; i--) {
		const d = runtime.overlays[i];
		const idx = getDispatchIndices(d, node);
		if (idx.length > 0) candidates.push({
			dispatch: d,
			indices: idx
		});
	}
	const mainIdx = getDispatchIndices(runtime.dispatch, node);
	if (mainIdx.length > 0) candidates.push({
		dispatch: runtime.dispatch,
		indices: mainIdx
	});
	return candidates;
}
function $dispatch(runtime, node) {
	const candidates = getCandidates(runtime, node);
	if (candidates.length === 0) return $hoistChildrenOf(runtime, node);
	let groupCursor = 0;
	let ruleCursor = 0;
	const $next = () => {
		while (groupCursor < candidates.length) {
			const { dispatch, indices } = candidates[groupCursor];
			while (ruleCursor < indices.length) {
				const idx = indices[ruleCursor++];
				const rule = dispatch.rules[idx];
				const captures = {};
				if (rule.predicate(node, captures)) {
					const ctx = makeContext(runtime, Object.keys(captures).length === 0 ? NO_CAPTURES : captures);
					try {
						return rule.$import(ctx, node, $next);
					} catch (e) {
						console.error(`[lexical] DOM import rule "${rule.name}" threw on node`, node, e);
						throw e;
					}
				}
			}
			groupCursor++;
			ruleCursor = 0;
		}
		return $hoistChildrenOf(runtime, node);
	};
	return $next();
}
/**
* Fallback when no rule matched and `$next()` was called past the end of the
* chain: hoist the element's children to take its place, recursively. Pure
* elements with no rule become invisible, matching the legacy
* `$createNodesFromDOM` hoisting behavior.
*/
function $hoistChildrenOf(runtime, node) {
	if (node.childNodes.length === 0) return [];
	const collected = [];
	for (const child of Array.from(node.childNodes)) {
		const produced = $importOneInternal(runtime, child, void 0);
		for (const lex of produced) collected.push(lex);
	}
	return collected;
}
/**
* Top-level walker for a compiled dispatcher. Iterates the DOM children of
* `dom` (using the document body if a {@link Document} is passed) and
* applies `RootSchema` to the produced lexical nodes so runs of inlines are
* wrapped in paragraphs — same shape as the legacy `$generateNodesFromDOM`.
*
* @internal
*/
function $runImport$1(dispatch, editor, dom, session) {
	return $importChildrenRun({
		dispatch,
		editor,
		overlays: session.get(ImportOverlays).map((o) => o.dispatch),
		session
	}, isDOMDocumentNode(dom) ? dom.body : dom, { schema: RootSchema });
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Configuration for {@link DOMImportExtension}.
*
* @experimental
*/
/**
* Drive a stack of {@link DOMPreprocessFn}s top-to-bottom: the highest-
* index fn runs first and may call `$next()` to defer to the next-lower
* one. Matches the export-side `callExportMimeTypeFunctionStack` shape.
*/
function $runPreprocessStack(stack, dom, ctx) {
	let i = stack.length - 1;
	const $next = () => {
		while (i >= 0) {
			const cur = stack[i--];
			cur(dom, ctx, $next);
			return;
		}
	};
	$next();
}
/**
* @experimental
*
* Extension-based replacement for the legacy `importDOM` / `DOMConversion`
* machinery. Rules are contributed via configuration (see
* {@link DOMImportConfig.rules}), compiled into a tag-bucketed dispatcher at
* editor build time, and consumed via the extension's
* {@link DOMImportExtensionOutput.$generateNodesFromDOM} output.
*
* There is no numeric priority: rules are tried in the order they appear
* in `config.rules`, and that list is assembled so that an extension's
* own rules come ahead of the rules its dependencies contributed. See
* {@link DOMImportConfig.rules} for the exact composition order.
*
* The legacy `$generateNodesFromDOM` continues to work in parallel; the
* intent is to migrate node packages over to this extension incrementally.
*/
var DOMImportExtension = {
	build(editor, config) {
		const dispatch = compileImportRules(flattenRuleEntries(config.rules));
		const defaults = contextFromPairs(config.contextDefaults, void 0);
		const configPreprocess = config.preprocess;
		return {
			$generateNodesFromDOM: (dom, options) => {
				const parentRecord = getContextRecord(DOMImportContextSymbol, editor) || defaults;
				const fromOpts = options && options.context ? contextFromPairs(options.context, parentRecord) : parentRecord;
				const sessionRecord = fromOpts !== void 0 && fromOpts !== parentRecord ? fromOpts : Object.create(parentRecord || null);
				const session = new ImportSessionImpl(sessionRecord);
				const preprocessCtx = { session };
				$runPreprocessStack(options && options.preprocess ? [...configPreprocess, ...options.preprocess] : configPreprocess, dom, preprocessCtx);
				return $withFullContext(DOMImportContextSymbol, sessionRecord, () => $runImport$1(dispatch, editor, dom, session), editor);
			},
			defaults
		};
	},
	config: {
		contextDefaults: [],
		preprocess: [$inlineStylesFromStyleSheets],
		rules: [{
			$import: (ctx, el) => ctx.$importChildren(el),
			match: /* @__PURE__ */ selBase.any(),
			name: "@lexical/html/default-hoist"
		}]
	},
	mergeConfig(config, partial) {
		return shallowMergeConfig(config, {
			...partial,
			...partial.contextDefaults && { contextDefaults: [...config.contextDefaults, ...partial.contextDefaults] },
			...partial.preprocess && { preprocess: [...config.preprocess, ...partial.preprocess] },
			...partial.rules && { rules: [...partial.rules, ...config.rules] }
		});
	},
	name: DOMImportExtensionName
};
/**
* Look up the editor's {@link DOMImportExtension} and run its
* `$generateNodesFromDOM`. Designed as a drop-in replacement for the
* legacy `$generateNodesFromDOM(editor, dom)` signature so it can be
* supplied to `ClipboardImportExtension.$generateNodesFromDOM` (or any
* other consumer that wants to route through the extension pipeline).
*
* Throws if the editor was not built with {@link DOMImportExtension} as a
* dependency.
*
* @experimental
*/
function $generateNodesFromDOMViaExtension(dom, options) {
	return $getExtensionOutput(DOMImportExtension).$generateNodesFromDOM(dom, options);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Bundles {@link CoreImportRules} into a {@link DOMImportExtension}-aware
* extension. Node-providing extensions that contribute import rules
* (`RichTextExtension`, `ListExtension`, `LinkExtension`,
* `TableExtension`, `CodeExtension`, …) depend on this themselves, so
* most editors get it implicitly; depend on it directly to get the
* equivalent of the legacy core `importDOM` behavior for `<p>`,
* `<span>`, `<b>`, `<strong>`, `<em>`, `<i>`, `<code>`, `<mark>`,
* `<s>`, `<sub>`, `<sup>`, `<u>`, `<br>`, and `#text` (plus `<hr>`
* when `HorizontalRuleNode` is registered).
*
* @experimental
*/
var CoreImportExtension = {
	dependencies: [[DOMImportExtension, { rules: CoreImportRules }]],
	name: "@lexical/html/CoreImport"
};
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Combinator-and-parser-based builder for {@link CompiledSelector}s. The
* runtime shape returned by these factory methods is opaque; consumers
* should never inspect or construct selector objects directly.
*
* @experimental
* @lexical-pure-namespace
*/
var sel = {
	/** Match any {@link HTMLElement}. */
	any: selAny,
	/** Match DOM {@link Comment} nodes. */
	comment: selComment,
	/**
	* Parse a reduced CSS-selector subset and return a builder you can chain
	* combinator methods off of.
	*/
	css: parseSelector,
	/**
	* Match by tag name(s). With one literal tag the element type is narrowed
	* (e.g. `'a' → HTMLAnchorElement`); with multiple, it is the union of
	* their `HTMLElementTagNameMap` entries.
	*/
	tag: selTag,
	/** Match DOM {@link Text} nodes. */
	text: selText
};
var IGNORE_TAGS = /* @__PURE__ */ new Set(["STYLE", "SCRIPT"]);
/**
* How you parse your html string to get a document is left up to you. In the browser you can use the native
* DOMParser API to generate a document (see clipboard.ts), but to use in a headless environment you can use JSDom
* or an equivalent library and pass in the document here.
*/
function $generateNodesFromDOM(editor, dom) {
	$inlineStylesFromStyleSheetsDOM(dom);
	const elements = isDOMDocumentNode(dom) ? dom.body.childNodes : dom.childNodes;
	const lexicalNodes = [];
	const allArtificialNodes = [];
	for (const element of elements) if (!IGNORE_TAGS.has(element.nodeName)) {
		const lexicalNode = $createNodesFromDOM(element, editor, allArtificialNodes, false);
		if (lexicalNode !== null) for (const node of lexicalNode) lexicalNodes.push(node);
	}
	$unwrapArtificialNodes(allArtificialNodes);
	return lexicalNodes;
}
/**
* Generate DOM nodes from the editor state into the given container element,
* using the editor's {@link EditorDOMRenderConfig}.
* @experimental
*/
function $generateDOMFromNodes(container, selection = null, editor = $getEditor()) {
	return $withRenderContext([contextValue(RenderContextExport, true)], editor)(() => {
		const root = $getRoot();
		const domConfig = $getSessionDOMRenderConfig(editor);
		const slotFrame = $getSelectionSlotFrame(selection);
		const parentElementAppend = container.append.bind(container);
		for (const topLevelNode of ($isElementNode(slotFrame) ? slotFrame : root).getChildren()) $appendNodesToHTML(editor, topLevelNode, parentElementAppend, selection, domConfig);
		return container;
	});
}
/**
* Generate an HTML string from the editor's current state (or `selection`
* if provided).
*
* Must be called inside an active editor scope — i.e. `editor.update(...)`,
* `editor.read(...)`, or `editor.getEditorState().read(callback, {editor})`.
* The legacy `editor.getEditorState().read(callback)` call (without the
* `{editor}` option) does not set an active editor and is not supported;
* `editor.read(...)` is the drop-in replacement.
*/
function $generateHtmlFromNodes(editor, selection = null) {
	if (typeof document === "undefined" || typeof window === "undefined" && typeof global.window === "undefined") formatDevErrorMessage$4(`To use $generateHtmlFromNodes in headless mode please initialize a headless browser implementation such as JSDom or use withDOM from @lexical/headless/dom before calling this function.`);
	$assumeActiveEditor(editor);
	return $generateDOMFromNodes($getDocument().createElement("div"), selection, editor).innerHTML;
}
/**
* A `<br>` that is the last (or only) child of a block element is not rendered
* by browsers, so both HTML importers drop it — see `isLastChildInBlockNode`
* and `isOnlyChildInBlockNode`. The reconciler works around that in the live
* DOM by appending a managed terminator `<br>` after a trailing LineBreakNode
* (`ElementDOMSlot.insertManagedLineBreak`); exported HTML had no equivalent,
* so `<p>a<br></p>` rendered as a single line and re-imported without the
* LineBreakNode at all.
*
* Emit the same terminator here, marked with the same
* `data-lexical-managed-linebreak` attribute the reconciler uses, so exported
* HTML and a scrape of the live DOM describe a trailing break identically and
* a consumer can tell the terminator apart from authored content. The
* importers drop it and keep the authored break, which makes the export/import
* round trip lossless without relaxing the rendering-faithful import rules —
* they match on position, so the marker is metadata rather than load-bearing
* and a sanitizer that strips it changes nothing.
*/
function $appendTerminatingLineBreak(element, lastIncludedChild) {
	const lastChild = element.lastChild;
	if ($isLineBreakNode(lastIncludedChild) && isHTMLElement(element) && isBlockDomNode(element) && lastChild !== null && lastChild.nodeName === "BR") {
		const br = $getDocument().createElement("br");
		br.setAttribute("data-lexical-managed-linebreak", "true");
		element.append(br);
	}
}
function $appendNodesToHTML(editor, currentNode, parentElementAppend, selection = null, domConfig = $getEditorDOMRenderConfig(editor)) {
	let shouldInclude = domConfig.$shouldInclude(currentNode, selection, editor);
	const shouldExclude = domConfig.$shouldExclude(currentNode, selection, editor);
	let target = currentNode;
	if (selection !== null && $isTextNode(currentNode)) target = $sliceSelectedTextNodeContent(selection, currentNode, "clone");
	const { element, after, append, $getChildNodes } = domConfig.$exportDOM(target, editor);
	if (!element) return false;
	const fragment = $getDocument().createDocumentFragment();
	const children = $getChildNodes ? $getChildNodes() : $isElementNode(target) ? target.getChildren() : [];
	const childSelection = shouldInclude && $isNodeSelection(selection) && $isElementNode(currentNode) ? null : selection;
	const fragmentAppend = fragment.append.bind(fragment);
	let lastIncludedChild = null;
	for (const childNode of children) {
		const shouldIncludeChild = $appendNodesToHTML(editor, childNode, fragmentAppend, childSelection, domConfig);
		if (shouldIncludeChild) lastIncludedChild = childNode;
		if (!shouldInclude && shouldIncludeChild && domConfig.$extractWithChild(currentNode, childNode, selection, "html", editor)) shouldInclude = true;
	}
	if (shouldInclude && !shouldExclude) {
		if (isHTMLElement(element) || isDocumentFragment(element)) {
			if (append) append(fragment);
			else element.append(fragment);
			$appendTerminatingLineBreak(element, lastIncludedChild);
		}
		if (isDocumentFragment(element)) {
			if (after) {
				const newElement = after.call(target, element);
				if (newElement) element.replaceChildren(newElement);
			}
			parentElementAppend(element);
		} else {
			parentElementAppend(element);
			if (after) {
				const newElement = after.call(target, element);
				if (newElement) element.replaceWith(newElement);
			}
		}
	} else parentElementAppend(fragment);
	return shouldInclude;
}
/**
* Serialize a single node (and its subtree) into `parentElement`, the same way
* the top-level HTML exporter serializes the nodes it walks. Slots are not part
* of any node's child list and — like {@link LexicalNode.exportJSON} vs
* `exportDOM` for NodeState — are intentionally NOT auto-serialized to HTML;
* a host node opts in by calling this from its own `exportDOM`, e.g. to render
* each slot value into a `data-lexical-slot` wrapper.
*
* @experimental
*/
function $appendNodeToHTML(editor, node, parentElement, selection = null) {
	return $appendNodesToHTML(editor, node, parentElement.append.bind(parentElement), selection, $getSessionDOMRenderConfig(editor));
}
function getConversionFunction(domNode, editor) {
	const { nodeName } = domNode;
	const cachedConversions = editor._htmlConversions.get(nodeName.toLowerCase());
	let currentConversion = null;
	if (cachedConversions !== void 0) for (const cachedConversion of cachedConversions) {
		const domConversion = cachedConversion(domNode);
		if (domConversion !== null && (currentConversion === null || (currentConversion.priority || 0) <= (domConversion.priority || 0))) currentConversion = domConversion;
	}
	return currentConversion !== null ? currentConversion.conversion : null;
}
function $createNodesFromDOM(node, editor, allArtificialNodes, hasBlockAncestorLexicalNode, forChildMap = /* @__PURE__ */ new Map(), parentLexicalNode) {
	const lexicalNodes = [];
	if (IGNORE_TAGS.has(node.nodeName)) return lexicalNodes;
	let currentLexicalNode = null;
	const transformFunction = getConversionFunction(node, editor);
	const transformOutput = transformFunction ? transformFunction(node) : null;
	let postTransform = null;
	if (transformOutput !== null) {
		postTransform = transformOutput.after;
		const transformNodes = transformOutput.node;
		currentLexicalNode = Array.isArray(transformNodes) ? transformNodes[transformNodes.length - 1] : transformNodes;
		if (currentLexicalNode !== null) {
			for (const [, forChildFunction] of forChildMap) {
				currentLexicalNode = forChildFunction(currentLexicalNode, parentLexicalNode);
				if (!currentLexicalNode) break;
			}
			if (currentLexicalNode) lexicalNodes.push(...Array.isArray(transformNodes) ? transformNodes : [currentLexicalNode]);
		}
		if (transformOutput.forChild != null) forChildMap.set(node.nodeName, transformOutput.forChild);
	}
	const children = node.childNodes;
	let childLexicalNodes = [];
	const hasBlockAncestorLexicalNodeForChildren = currentLexicalNode != null && $isRootOrShadowRoot(currentLexicalNode) ? false : currentLexicalNode != null && $isBlockElementNode(currentLexicalNode) || hasBlockAncestorLexicalNode;
	for (let i = 0; i < children.length; i++) childLexicalNodes.push(...$createNodesFromDOM(children[i], editor, allArtificialNodes, hasBlockAncestorLexicalNodeForChildren, new Map(forChildMap), currentLexicalNode));
	if (postTransform != null) childLexicalNodes = postTransform(childLexicalNodes);
	if (isBlockDomNode(node)) {
		if (!hasBlockAncestorLexicalNodeForChildren) childLexicalNodes = wrapContinuousInlines(node, childLexicalNodes, $createParagraphNode);
		else childLexicalNodes = wrapContinuousInlines(node, childLexicalNodes, () => {
			const artificialNode = new ArtificialNode__DO_NOT_USE();
			allArtificialNodes.push(artificialNode);
			return artificialNode;
		});
	}
	if (currentLexicalNode == null) {
		if (childLexicalNodes.length > 0) for (const childNode of childLexicalNodes) lexicalNodes.push(childNode);
		else if (isBlockDomNode(node) && isDomNodeBetweenTwoInlineNodes(node)) lexicalNodes.push($createLineBreakNode());
	} else if ($isElementNode(currentLexicalNode)) currentLexicalNode.append(...childLexicalNodes);
	return lexicalNodes;
}
function wrapContinuousInlines(domNode, nodes, createWrapperFn) {
	const textAlign = domNode.style.textAlign;
	const out = [];
	let continuousInlines = [];
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if ($isBlockElementNode(node)) {
			if (textAlign && !node.getFormat()) node.setFormat(textAlign);
			out.push(node);
		} else {
			continuousInlines.push(node);
			if (i === nodes.length - 1 || i < nodes.length - 1 && $isBlockElementNode(nodes[i + 1])) {
				const wrapper = createWrapperFn();
				wrapper.setFormat(textAlign);
				wrapper.append(...continuousInlines);
				out.push(wrapper);
				continuousInlines = [];
			}
		}
	}
	return out;
}
function $unwrapArtificialNodes(allArtificialNodes) {
	for (const node of allArtificialNodes) if (node.getParent() && node.getNextSibling() instanceof ArtificialNode__DO_NOT_USE) node.insertAfter($createLineBreakNode());
	for (const node of allArtificialNodes) {
		const parent = node.getParent();
		if (parent) parent.splice(node.getIndexWithinParent(), 1, node.getChildren());
	}
}
function isDomNodeBetweenTwoInlineNodes(node) {
	if (node.nextSibling == null || node.previousSibling == null) return false;
	return isInlineDomNode(node.nextSibling) && isInlineDomNode(node.previousSibling);
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionNestedEditorExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function $defaultGetParentEditor() {
	const editor = $getEditor();
	LexicalBuilder.fromEditor(editor);
	return editor;
}
var NestedEditorExtension = {
	build: (editor, config) => namedSignals({ inheritEditableFromParent: config.inheritEditableFromParent }),
	config: {
		$getParentEditor: $defaultGetParentEditor,
		inheritEditableFromParent: false
	},
	init: (editorConfig, config, state) => {
		const parentEditor = config.$getParentEditor();
		editorConfig.parentEditor = parentEditor;
		editorConfig.theme = editorConfig.theme || parentEditor._config.theme;
	},
	name: "@lexical/extension/NestedEditor",
	register: (editor, config, state) => j(() => {
		const parentEditor = editor._parentEditor;
		if (parentEditor) {
			if (state.getOutput().inheritEditableFromParent.value) {
				editor.setEditable(parentEditor.isEditable());
				return parentEditor.registerEditableListener(editor.setEditable.bind(editor));
			}
		}
	})
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionNormalizeInlineElementsExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function deleteEmptyInline(node) {
	if ($isElementNode(node) && node.isInline() && node.isEmpty()) {
		node.remove();
		if (node.canBeEmpty()) console.warn(`Empty inline elements are removed from the EditorState, so returning 'true' from ${node.constructor.name}.canBeEmpty() is not allowed`);
	}
}
/**
* This extension removes empty inline nodes from the EditorState.
* This extension is designed to facilitate a smooth migration from
* the plugin API with the option to disable it, but it may be removed
* in the future and integrated into the core
*/
var NormalizeInlineElementsExtension = {
	build: (editor, config, state) => namedSignals(config),
	config: { disabled: false },
	name: "@lexical/NormalizeInlineElements",
	register: (editor, config, state) => {
		const stores = state.getOutput();
		return j(() => {
			if (!stores.disabled.value) {
				const disposeTransformers = [];
				for (const { klass, transforms } of editor._nodes.values()) if (klass.prototype instanceof ElementNode && klass.prototype.isInline !== ElementNode.prototype.isInline) {
					transforms.add(deleteEmptyInline);
					disposeTransformers.push(() => transforms.delete(deleteEmptyInline));
				}
				return () => disposeTransformers.forEach((fn) => fn());
			}
		});
	}
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionNormalizeTripleClickSelectionExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var SKIP_TAGS = /* @__PURE__ */ new Set([SKIP_SELECTION_FOCUS_TAG, SKIP_SCROLL_INTO_VIEW_TAG]);
function $fixFocusOverselection() {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return;
	if (!selection.isCollapsed()) {
		const range = $getCaretRangeInDirection($caretRangeFromSelection(selection), "next");
		let focusCaret = range.focus;
		if ($isTextPointCaret(focusCaret) && range.anchor.origin !== focusCaret.origin && focusCaret.offset === 0) focusCaret = $rewindSiblingCaret(focusCaret.getSiblingCaret());
		if ($isSiblingCaret(focusCaret) && range.anchor.origin !== focusCaret.origin && $isLineBreakNode(focusCaret.origin)) focusCaret = $rewindSiblingCaret(focusCaret);
		while ($isChildCaret(focusCaret) && range.anchor.origin !== focusCaret.origin) focusCaret = $rewindSiblingCaret($getSiblingCaret(focusCaret.origin, "next"));
		if ($isSiblingCaret(focusCaret) && $isElementNode(focusCaret.origin)) focusCaret = $normalizeCaret($getChildCaret(focusCaret.origin, "previous")).getFlipped();
		focusCaret = $normalizeCaret(focusCaret);
		if (!focusCaret.isSamePointCaret(range.focus)) {
			const sel = $setSelectionFromCaretRange($getCaretRange(range.anchor, focusCaret));
			const rootElement = $getEditor().getRootElement();
			const domSelection = rootElement && getDOMSelection(rootElement.ownerDocument.defaultView);
			if (domSelection) $updateDOMSelection($getPreviousSelection(), sel, $getEditor(), domSelection, SKIP_TAGS, rootElement);
		}
	}
}
/**
* This extension handles triple-click events and will move the focus
* towards the anchor in certain conditions to meet expectations.
* Simply speaking, the focus should prefer to land at the end of a node
* rather than the beginning of its next sibling, and it should not skip
* over a LineBreakNode.
*
* In order to fix the result visually and avoid a flash of over-selection
* it will also eagerly manipulate the DOM selection directly.
*
* It is conservative in that it only fires this
* `$fixFocusOverselection` callback when it has detected a triple click,
* but it provides the function as an output signal so that it can both
* be called from other places and it can be replaced or wrapped with
* different functionality.
*/
var NormalizeTripleClickSelectionExtension = {
	build: (editor, config, state) => namedSignals(config),
	config: {
		$fixFocusOverselection,
		dateNow: () => Date.now(),
		disabled: false,
		thresholdMsec: 100
	},
	name: "@lexical/NormalizeTripleClickSelection",
	register: (editor, config, state) => j(() => {
		const stores = state.getOutput();
		if (stores.disabled.value) return;
		return editor.registerRootListener((rootElement) => {
			if (!rootElement) return;
			let lastTripleClick = 0;
			const refreshTripleClick = (event) => {
				if (event ? event.detail > 2 : lastTripleClick > 0) {
					const now = stores.dateNow.peek()();
					lastTripleClick = event && event.type === "mousedown" || now - lastTripleClick <= stores.thresholdMsec.peek() ? now : 0;
				}
				return lastTripleClick;
			};
			return mergeRegister(editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
				if (refreshTripleClick(null)) {
					lastTripleClick = 0;
					stores.$fixFocusOverselection.peek()();
				}
				return false;
			}, -4), registerEventListeners(rootElement, {
				mousedown: refreshTripleClick,
				mouseup: refreshTripleClick
			}, true));
		});
	})
};
//#endregion
//#region ../lexical-text/dist/LexicalText.dev.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Returns the root's text content.
* @returns The root's text content.
*/
function $rootTextContent() {
	return $getRoot().getTextContent();
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Determines if the root has any text content and can trim any whitespace if it does.
* @param isEditorComposing - Is the editor in composition mode due to an active Input Method Editor?
* @param trim - Should the root text have its whitespaced trimmed? Defaults to true.
* @returns true if text content is empty, false if there is text or isEditorComposing is true.
*/
function $isRootTextContentEmpty(isEditorComposing, trim = true) {
	if (isEditorComposing) return false;
	let text = $rootTextContent();
	if (trim) text = text.trim();
	return text === "";
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Determines if the input should show the placeholder. If anything is in
* in the root the placeholder should not be shown.
* @param isComposing - Is the editor in composition mode due to an active Input Method Editor?
* @returns true if the input should show the placeholder, false otherwise.
*/
function $canShowPlaceholder(isComposing) {
	if (!$isRootTextContentEmpty(isComposing, false)) return false;
	const children = $getRoot().getChildren();
	const childrenLength = children.length;
	if (childrenLength > 1) return false;
	for (let i = 0; i < childrenLength; i++) {
		const topBlock = children[i];
		if ($isDecoratorNode(topBlock)) return false;
		if ($isElementNode(topBlock)) {
			if (!$isParagraphNode(topBlock)) return false;
			if (topBlock.__indent !== 0) return false;
			const topBlockChildren = topBlock.getChildren();
			const topBlockChildrenLength = topBlockChildren.length;
			for (let s = 0; s < topBlockChildrenLength; s++) {
				const child = topBlockChildren[s];
				if (!$isTextNode(child)) return false;
			}
		}
	}
	return true;
}
/**
* Returns a function that executes {@link $canShowPlaceholder}
* @param isEditorComposing - Is the editor in composition mode due to an active Input Method Editor?
* @returns A function that executes $canShowPlaceholder with arguments.
*/
function $canShowPlaceholderCurry(isEditorComposing) {
	return () => $canShowPlaceholder(isEditorComposing);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function formatDevErrorMessage$3(message) {
	throw new Error(message);
}
/**
* Returns a tuple that can be rested (...) into mergeRegister to clean up
* node transforms listeners that transforms text into another node, eg. a HashtagNode.
* @example
* ```ts
*   useEffect(() => {
return mergeRegister(
...registerLexicalTextEntity(editor, getMatch, targetNode, createNode),
);
}, [createNode, editor, getMatch, targetNode]);
* ```
* Where targetNode is the type of node containing the text you want to transform (like a text input),
* then getMatch uses a regex to find a matching text and creates the proper node to include the matching text.
* @param editor - The lexical editor.
* @param getMatch - Finds a matching string that satisfies a regex expression.
* @param targetNode - The node type that contains text to match with. eg. HashtagNode
* @param createNode - A function that creates a new node to contain the matched text. eg createHashtagNode
* @returns An array containing the plain text and reverse node transform listeners.
*/
function registerLexicalTextEntity(editor, getMatch, targetNode, createNode) {
	const isTargetNode = (node) => {
		return node instanceof targetNode;
	};
	const $replaceWithSimpleText = (node) => {
		const textNode = $createTextNode(node.getTextContent()).setFormat(node.getFormat()).setStyle(node.getStyle()).setDetail(node.getDetail());
		node.replace(textNode);
	};
	const getMode = (node) => {
		return node.getLatest().__mode;
	};
	const $textNodeTransform = (node) => {
		if (!node.isSimpleText()) return;
		let prevSibling = node.getPreviousSibling();
		let text = node.getTextContent();
		let currentNode = node;
		let match;
		if ($isTextNode(prevSibling)) {
			const previousText = prevSibling.getTextContent();
			const prevMatch = getMatch(previousText + text);
			if (isTargetNode(prevSibling)) {
				if (prevMatch === null || getMode(prevSibling) !== 0) {
					$replaceWithSimpleText(prevSibling);
					return;
				} else {
					const diff = prevMatch.end - previousText.length;
					if (diff > 0) {
						const newTextContent = previousText + text.slice(0, diff);
						prevSibling.select();
						prevSibling.setTextContent(newTextContent);
						if (diff === text.length) node.remove();
						else {
							const remainingText = text.slice(diff);
							node.setTextContent(remainingText);
						}
						return;
					}
				}
			} else if (prevMatch === null || prevMatch.start < previousText.length) return;
		}
		let prevMatchLengthToSkip = 0;
		while (true) {
			const remainingText = text;
			match = getMatch(remainingText);
			const nextText = match === null ? "" : remainingText.slice(match.end);
			text = nextText;
			if (nextText === "") {
				const nextSibling = currentNode.getNextSibling();
				if ($isTextNode(nextSibling)) {
					const nextMatch = getMatch(remainingText + nextSibling.getTextContent());
					if (nextMatch === null) {
						if (isTargetNode(nextSibling)) $replaceWithSimpleText(nextSibling);
						else nextSibling.markDirty();
						return;
					} else if (match === null || nextMatch.start !== match.start) return;
				}
			}
			if (match === null) return;
			if (match.start === 0 && $isTextNode(prevSibling) && prevSibling.isTextEntity()) {
				prevMatchLengthToSkip += match.end;
				continue;
			}
			let nodeToReplace;
			if (match.start === 0) [nodeToReplace, currentNode] = currentNode.splitText(match.end);
			else [, nodeToReplace, currentNode] = currentNode.splitText(match.start + prevMatchLengthToSkip, match.end + prevMatchLengthToSkip);
			if (!(nodeToReplace !== void 0)) formatDevErrorMessage$3(`nodeToReplace should not be undefined. You may want to check splitOffsets passed to the splitText.`);
			const replacementNode = createNode(nodeToReplace);
			replacementNode.setFormat(nodeToReplace.getFormat()).setStyle(nodeToReplace.getStyle()).setDetail(nodeToReplace.getDetail());
			nodeToReplace.replace(replacementNode);
			if (currentNode == null) return;
			prevMatchLengthToSkip = 0;
			prevSibling = replacementNode;
		}
	};
	const $reverseNodeTransform = (node) => {
		const text = node.getTextContent();
		const match = getMatch(text);
		if (match === null || match.start !== 0) {
			$replaceWithSimpleText(node);
			return;
		}
		if (text.length > match.end) {
			node.splitText(match.end);
			return;
		}
		const prevSibling = node.getPreviousSibling();
		if ($isTextNode(prevSibling) && prevSibling.isTextEntity()) {
			$replaceWithSimpleText(prevSibling);
			$replaceWithSimpleText(node);
		}
		const nextSibling = node.getNextSibling();
		if ($isTextNode(nextSibling) && nextSibling.isTextEntity()) {
			$replaceWithSimpleText(nextSibling);
			if (isTargetNode(node)) $replaceWithSimpleText(node);
		}
	};
	return [editor.registerNodeTransform(TextNode, $textNodeTransform), editor.registerNodeTransform(targetNode, $reverseNodeTransform)];
}
//#endregion
//#region ../lexical-history/dist/LexicalHistory.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var HISTORY_MERGE = 0;
var HISTORY_PUSH = 1;
var DISCARD_HISTORY_CANDIDATE = 2;
var OTHER = 0;
var COMPOSING_CHARACTER = 1;
var INSERT_CHARACTER_AFTER_SELECTION = 2;
var DELETE_CHARACTER_BEFORE_SELECTION = 3;
var DELETE_CHARACTER_AFTER_SELECTION = 4;
/**
* The undo/redo history maintained by the history plugin: the `current` entry
* plus the `undoStack` and `redoStack` of previous and future
* {@link HistoryStateEntry}s. Create an empty one with
* {@link createEmptyHistoryState} and pass it to the history plugin to share
* history across editors.
*/
function getDirtyNodes(editorState, dirtyLeaves, dirtyElements) {
	const nodeMap = editorState._nodeMap;
	const nodes = [];
	for (const dirtyLeafKey of dirtyLeaves) {
		const dirtyLeaf = nodeMap.get(dirtyLeafKey);
		if (dirtyLeaf !== void 0) nodes.push(dirtyLeaf);
	}
	for (const [dirtyElementKey, intentionallyMarkedAsDirty] of dirtyElements) {
		if (!intentionallyMarkedAsDirty) continue;
		const dirtyElement = nodeMap.get(dirtyElementKey);
		if (dirtyElement !== void 0 && !$isRootNode(dirtyElement)) nodes.push(dirtyElement);
	}
	return nodes;
}
function getChangeType(prevEditorState, nextEditorState, dirtyLeavesSet, dirtyElementsSet, isComposing) {
	if (prevEditorState === null || dirtyLeavesSet.size === 0 && dirtyElementsSet.size === 0 && !isComposing) return OTHER;
	const nextSelection = nextEditorState._selection;
	const prevSelection = prevEditorState._selection;
	if (isComposing) return COMPOSING_CHARACTER;
	if (!$isRangeSelection(nextSelection) || !$isRangeSelection(prevSelection) || !prevSelection.isCollapsed() || !nextSelection.isCollapsed()) return OTHER;
	const dirtyNodes = getDirtyNodes(nextEditorState, dirtyLeavesSet, dirtyElementsSet);
	if (dirtyNodes.length === 0) return OTHER;
	if (dirtyNodes.length > 1) {
		const nextNodeMap = nextEditorState._nodeMap;
		const nextAnchorNode = nextNodeMap.get(nextSelection.anchor.key);
		const prevAnchorNode = nextNodeMap.get(prevSelection.anchor.key);
		if (nextAnchorNode && prevAnchorNode && !prevEditorState._nodeMap.has(nextAnchorNode.__key) && $isTextNode(nextAnchorNode) && nextAnchorNode.__text.length === 1 && nextSelection.anchor.offset === 1) return INSERT_CHARACTER_AFTER_SELECTION;
		return OTHER;
	}
	const nextDirtyNode = dirtyNodes[0];
	const prevDirtyNode = prevEditorState._nodeMap.get(nextDirtyNode.__key);
	if (!$isTextNode(prevDirtyNode) || !$isTextNode(nextDirtyNode) || prevDirtyNode.__mode !== nextDirtyNode.__mode) return OTHER;
	const prevText = prevDirtyNode.__text;
	const nextText = nextDirtyNode.__text;
	if (prevText === nextText) return OTHER;
	const nextAnchor = nextSelection.anchor;
	const prevAnchor = prevSelection.anchor;
	if (nextAnchor.key !== prevAnchor.key || nextAnchor.type !== "text") return OTHER;
	const nextAnchorOffset = nextAnchor.offset;
	const prevAnchorOffset = prevAnchor.offset;
	const textDiff = nextText.length - prevText.length;
	if (textDiff === 1 && prevAnchorOffset === nextAnchorOffset - 1) return INSERT_CHARACTER_AFTER_SELECTION;
	if (textDiff === -1 && prevAnchorOffset === nextAnchorOffset + 1) return DELETE_CHARACTER_BEFORE_SELECTION;
	if (textDiff === -1 && prevAnchorOffset === nextAnchorOffset) return DELETE_CHARACTER_AFTER_SELECTION;
	return OTHER;
}
function isTextNodeUnchanged(key, prevEditorState, nextEditorState) {
	const prevNode = prevEditorState._nodeMap.get(key);
	const nextNode = nextEditorState._nodeMap.get(key);
	const prevSelection = prevEditorState._selection;
	const nextSelection = nextEditorState._selection;
	if (!($isRangeSelection(prevSelection) && $isRangeSelection(nextSelection) && prevSelection.anchor.type === "element" && prevSelection.focus.type === "element" && nextSelection.anchor.type === "text" && nextSelection.focus.type === "text") && $isTextNode(prevNode) && $isTextNode(nextNode) && prevNode.__parent === nextNode.__parent) return JSON.stringify(prevEditorState.read(() => prevNode.exportJSON())) === JSON.stringify(nextEditorState.read(() => nextNode.exportJSON()));
	return false;
}
function createMergeActionGetter(editor, delayOrStore, dateNow) {
	let prevChangeTime = dateNow();
	let prevChangeType = OTHER;
	let compositionStartTime = prevChangeTime;
	let compositionStartChangeType = OTHER;
	let compositionStartState = null;
	return (prevEditorState, nextEditorState, currentHistoryEntry, dirtyLeaves, dirtyElements, tags) => {
		const changeTime = dateNow();
		if (tags.has("composition-start")) {
			compositionStartTime = prevChangeTime;
			compositionStartChangeType = prevChangeType;
			compositionStartState = prevEditorState;
		}
		if (tags.has("historic")) {
			prevChangeType = OTHER;
			prevChangeTime = changeTime;
			return DISCARD_HISTORY_CANDIDATE;
		}
		if (tags.has("composition-end") && compositionStartState) {
			prevChangeTime = compositionStartTime;
			prevChangeType = compositionStartChangeType;
			prevEditorState = compositionStartState;
		}
		const changeType = tags.has("paste") || tags.has("cut") ? OTHER : getChangeType(prevEditorState, nextEditorState, dirtyLeaves, dirtyElements, editor.isComposing());
		const mergeAction = (() => {
			const isSameEditor = currentHistoryEntry === null || currentHistoryEntry.editor === editor;
			const shouldPushHistory = tags.has(HISTORY_PUSH_TAG);
			if (!shouldPushHistory && isSameEditor && tags.has("history-merge")) return HISTORY_MERGE;
			if (changeType === COMPOSING_CHARACTER) return DISCARD_HISTORY_CANDIDATE;
			if (prevEditorState === null) return HISTORY_PUSH;
			const selection = nextEditorState._selection;
			if (!(dirtyLeaves.size > 0 || dirtyElements.size > 0)) {
				if (selection !== null) return HISTORY_MERGE;
				return DISCARD_HISTORY_CANDIDATE;
			}
			const delay = typeof delayOrStore === "number" ? delayOrStore : delayOrStore.peek();
			if (shouldPushHistory === false && changeType !== OTHER && changeType === prevChangeType && changeTime < prevChangeTime + delay && isSameEditor) return HISTORY_MERGE;
			if (dirtyLeaves.size === 1) {
				const dirtyLeafKey = Array.from(dirtyLeaves)[0];
				if (isTextNodeUnchanged(dirtyLeafKey, prevEditorState, nextEditorState)) return HISTORY_MERGE;
			}
			return HISTORY_PUSH;
		})();
		prevChangeTime = changeTime;
		prevChangeType = changeType;
		return mergeAction;
	};
}
/**
* Build the entry that reverses `historyStateEntry` and belongs on the
* opposite stack.
*
* With a single editor this is always `current`, since `current` tracks the
* live state of that editor. With a shared {@link HistoryState} the stacks
* interleave entries from several editors, so `current` may belong to an
* editor that is *not* about to change — pushing it would record a no-op and
* lose the state we are about to overwrite. In that case read the live state
* off the entry's own editor instead.
*/
function getInverseEntry(historyStateEntry, current) {
	if (current !== null && current.editor === historyStateEntry.editor) return current;
	const { editor } = historyStateEntry;
	const editorState = editor.getEditorState();
	return editorState.isEmpty() ? null : {
		editor,
		editorState
	};
}
/**
* Build the entry that an update from `editor` pushes onto the undo stack.
*
* `current` is the state to restore when this update is undone, but with a
* shared {@link HistoryState} it may belong to a different editor — one that
* is not changing here, so restoring it would be a no-op and the state that is
* about to be overwritten would never make it onto the stack. Record this
* editor's own pre-update state in that case.
*/
function getUndoEntry(editor, prevEditorState, current) {
	if (current === null) return null;
	if (current.editor === editor) return { ...current };
	return prevEditorState.isEmpty() ? null : {
		editor,
		editorState: prevEditorState
	};
}
function redo(editor, historyState, onChange) {
	const redoStack = historyState.redoStack;
	const undoStack = historyState.undoStack;
	if (redoStack.length !== 0) {
		const current = historyState.current;
		const historyStateEntry = redoStack.pop();
		if (historyStateEntry) {
			const inverseEntry = getInverseEntry(historyStateEntry, current);
			if (inverseEntry !== null) {
				undoStack.push(inverseEntry);
				editor.dispatchCommand(CAN_UNDO_COMMAND, true);
			}
		}
		if (redoStack.length === 0) editor.dispatchCommand(CAN_REDO_COMMAND, false);
		historyState.current = historyStateEntry || null;
		if (onChange) onChange(historyState);
		if (historyStateEntry) historyStateEntry.editor.setEditorState(historyStateEntry.editorState, { tag: HISTORIC_TAG });
	}
}
function undo(editor, historyState, onChange) {
	const redoStack = historyState.redoStack;
	const undoStack = historyState.undoStack;
	if (undoStack.length !== 0) {
		const current = historyState.current;
		const historyStateEntry = undoStack.pop();
		if (historyStateEntry) {
			const inverseEntry = getInverseEntry(historyStateEntry, current);
			if (inverseEntry !== null) {
				redoStack.push(inverseEntry);
				editor.dispatchCommand(CAN_REDO_COMMAND, true);
			}
		}
		if (undoStack.length === 0) editor.dispatchCommand(CAN_UNDO_COMMAND, false);
		historyState.current = historyStateEntry || null;
		if (onChange) onChange(historyState);
		if (historyStateEntry) historyStateEntry.editor.setEditorState(historyStateEntry.editorState, { tag: HISTORIC_TAG });
	}
}
function clearHistory(historyState, onChange) {
	historyState.undoStack = [];
	historyState.redoStack = [];
	historyState.current = null;
	if (onChange) onChange(historyState);
}
/**
* Registers necessary listeners to manage undo/redo history stack and related editor commands.
* It returns `unregister` callback that cleans up all listeners and should be called on editor unmount.
* @param editor - The lexical editor.
* @param historyState - The history state, containing the current state and the undo/redo stack.
* @param delay - The time (in milliseconds) the editor should delay generating a new history stack,
* instead of merging the current changes with the current stack.
* @param dateNow - The clock function used for delay-based merging.
* @param onHistoryStateChange - Optional callback invoked once on registration
* and again any time `historyState` is mutated (push, pop, clear, etc.). It is
* NOT invoked when a candidate update is discarded without changing the
* stacks. Useful for keeping derived values (e.g. signals) in sync with the
* current `HistoryState`.
* @param maxDepth - The maximum number of entries the undo stack may hold.
* When the cap is exceeded a new history event has been pushed the oldest
* entries are dropped from the front of the stack until the stack length is
* `maxDepth`. Pass `null` (the default) to keep the stack unbounded — the
* historical behavior. May be a plain number or a `ReadonlySignal<number | null>`
* for reactive reconfiguration.
* @returns The listeners cleanup callback function.
*/
function registerHistory(editor, historyState, delay, dateNow = Date.now, onHistoryStateChange, maxDepth = null) {
	const getMergeAction = createMergeActionGetter(editor, delay, dateNow);
	const readMaxDepth = () => typeof maxDepth === "number" || maxDepth === null ? maxDepth : maxDepth.peek();
	const notifyChange = () => {
		if (onHistoryStateChange) onHistoryStateChange(historyState);
	};
	const applyChange = ({ editorState, prevEditorState, dirtyLeaves, dirtyElements, tags }) => {
		const current = historyState.current;
		const redoStack = historyState.redoStack;
		const undoStack = historyState.undoStack;
		const currentEditorState = current === null ? null : current.editorState;
		if (current !== null && editorState === currentEditorState) return;
		const mergeAction = getMergeAction(prevEditorState, editorState, current, dirtyLeaves, dirtyElements, tags);
		if (mergeAction === HISTORY_PUSH) {
			if (redoStack.length !== 0) {
				historyState.redoStack = [];
				editor.dispatchCommand(CAN_REDO_COMMAND, false);
			}
			const undoEntry = getUndoEntry(editor, prevEditorState, current);
			if (undoEntry !== null) {
				undoStack.push(undoEntry);
				const cap = readMaxDepth();
				if (cap !== null && undoStack.length > cap) undoStack.splice(0, undoStack.length - cap);
				editor.dispatchCommand(CAN_UNDO_COMMAND, true);
			}
		} else if (mergeAction === DISCARD_HISTORY_CANDIDATE) return;
		historyState.current = {
			editor,
			editorState
		};
		notifyChange();
	};
	notifyChange();
	return mergeRegister(editor.registerCommand(UNDO_COMMAND, () => {
		undo(editor, historyState, onHistoryStateChange);
		return true;
	}, 0), editor.registerCommand(REDO_COMMAND, () => {
		redo(editor, historyState, onHistoryStateChange);
		return true;
	}, 0), editor.registerCommand(CLEAR_EDITOR_COMMAND, () => {
		clearHistory(historyState, onHistoryStateChange);
		return false;
	}, 0), editor.registerCommand(CLEAR_HISTORY_COMMAND, () => {
		clearHistory(historyState, onHistoryStateChange);
		editor.dispatchCommand(CAN_REDO_COMMAND, false);
		editor.dispatchCommand(CAN_UNDO_COMMAND, false);
		return true;
	}, 0), editor.registerUpdateListener(applyChange));
}
/**
* Creates an empty history state.
* @returns - The empty history state, as an object.
*/
function createEmptyHistoryState() {
	return {
		current: null,
		redoStack: [],
		undoStack: []
	};
}
/** Internal writable signals created during the init phase. */
/**
* The output signals exposed by {@link HistoryExtension}.
*
* Config-derived signals (`delay`, `disabled`, `historyState`, `maxDepth`,
* `now`) are writable so that peer extensions such as
* {@link SharedHistoryExtension} can redirect them at runtime.
* The `canUndo` / `canRedo` signals are **readonly** for
* consumers — they are derived from the current
* {@link HistoryState} and kept in sync automatically.
*/
/**
* Registers necessary listeners to manage undo/redo history stack and related
* editor commands, via the \@lexical/history module.
*/
var HistoryExtension = {
	build: (editor, { delay, createInitialHistoryState, disabled, maxDepth, now }, state) => {
		return {
			...namedSignals({
				delay,
				disabled,
				historyState: createInitialHistoryState(editor),
				maxDepth,
				now
			}),
			...state.getInitResult()
		};
	},
	config: {
		createInitialHistoryState: createEmptyHistoryState,
		delay: 300,
		disabled: typeof window === "undefined",
		maxDepth: null,
		now: () => Date.now()
	},
	init: () => ({
		canRedo: y(false),
		canUndo: y(false)
	}),
	name: "@lexical/history/History",
	register: (editor, config, state) => {
		const { canUndo, canRedo } = state.getInitResult();
		const stores = state.getOutput();
		const syncFromHistoryState = (historyState) => n(() => {
			canUndo.value = historyState != null && historyState.undoStack.length > 0;
			canRedo.value = historyState != null && historyState.redoStack.length > 0;
		});
		return j(() => {
			if (stores.disabled.value) {
				syncFromHistoryState(null);
				return;
			}
			return registerHistory(editor, stores.historyState.value, stores.delay, () => stores.now.peek()(), syncFromHistoryState, stores.maxDepth);
		});
	}
};
var HMR_EXTENSION_NAME = "@lexical/extension/HMR";
function getHistoryPeer(editor) {
	return editor ? getPeerDependencyFromEditor(editor, HistoryExtension.name) : null;
}
/**
* Reads `editor`'s HMR restore counter, subscribing the calling effect to it.
*
* `HMRExtension` restores an editor's `HistoryState` by assigning a rebuilt
* one to that editor's signal, which for a shared history would leave this
* editor and its parent holding two different histories — this editor's own
* restore replacing the shared object, or the parent's leaving this one
* pointing at the object the parent no longer uses. Depending on the counter
* re-runs the sync below after either, which re-links them.
*
* A peer lookup by name rather than a dependency: HMRExtension is a
* development-time extension that most editors do not have.
*/
function hmrRestoreCount(editor) {
	const peer = editor ? getPeerDependencyFromEditor(editor, HMR_EXTENSION_NAME) : void 0;
	return peer ? peer.output.restoreCount.value : 0;
}
/**
* Registers necessary listeners to manage undo/redo history stack and related
* editor commands, via the \@lexical/history module, only if the parent editor
* has a history plugin implementation.
*/
var SharedHistoryExtension = {
	build: (editor, { disabled, parentEditor }) => namedSignals({
		disabled,
		parentEditor: parentEditor || editor._parentEditor
	}),
	config: {
		disabled: false,
		parentEditor: null
	},
	dependencies: [[HistoryExtension, { disabled: true }]],
	name: "@lexical/history/SharedHistory",
	register(editor, _config, state) {
		return j(() => {
			const { disabled, parentEditor } = state.getOutput();
			if (!disabled.value) {
				const { output } = state.getDependency(HistoryExtension);
				hmrRestoreCount(editor);
				hmrRestoreCount(parentEditor.value);
				const parentPeer = getHistoryPeer(parentEditor.value);
				if (!parentPeer) return;
				const parentOutput = parentPeer.output;
				n(() => {
					output.delay.value = parentOutput.delay.value;
					output.historyState.value = parentOutput.historyState.value;
					output.now.value = parentOutput.now.value;
					output.maxDepth.value = parentOutput.maxDepth.value;
					output.disabled.value = parentOutput.disabled.value;
				});
			}
		});
	}
};
//#endregion
//#region ../lexical-clipboard/dist/LexicalClipboard.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function isWithinComposedTree(node, rootElement) {
	for (let current = node; current !== null;) {
		if (current === rootElement) return true;
		current = getParentElement(current);
	}
	return false;
}
function findTextOffsetAtPoint(x, y, container, doc) {
	const range = doc.createRange();
	const vDist = (r) => y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
	const hDist = (r) => x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
	const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	let bestNode = null;
	let bestV = Infinity;
	let bestH = Infinity;
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		range.selectNodeContents(n);
		for (const r of range.getClientRects()) {
			const v = vDist(r);
			const h = hDist(r);
			if (v < bestV || v === bestV && h < bestH) {
				bestV = v;
				bestH = h;
				bestNode = n;
			}
		}
	}
	if (bestNode === null) return null;
	let bestOffset = 0;
	let offV = Infinity;
	let offH = Infinity;
	for (let i = 0; i <= bestNode.length; i++) {
		range.setStart(bestNode, i);
		range.collapse(true);
		const r = range.getBoundingClientRect();
		const v = vDist(r);
		const h = Math.abs(x - r.left);
		if (v < offV || v === offV && h < offH) {
			offV = v;
			offH = h;
			bestOffset = i;
		}
	}
	return {
		node: bestNode,
		offset: bestOffset
	};
}
/** @internal */
function caretFromPoint(x, y, rootElement = null) {
	const doc = getRootOwnerDocument(rootElement);
	const shadowRoots = rootElement ? getDOMShadowRoots(rootElement) : [];
	const hasShadow = rootElement !== null && shadowRoots.length > 0;
	if (hasShadow && typeof doc.caretPositionFromPoint === "function") {
		const caretPosition = doc.caretPositionFromPoint(x, y, { shadowRoots });
		if (caretPosition !== null && isWithinComposedTree(caretPosition.offsetNode, rootElement)) return {
			node: caretPosition.offsetNode,
			offset: caretPosition.offset
		};
	}
	if (hasShadow) {
		const rootNode = rootElement.getRootNode();
		if (isDOMShadowRoot(rootNode)) {
			const element = rootNode.elementFromPoint(x, y);
			if (element !== null && rootElement.contains(element)) {
				const result = findTextOffsetAtPoint(x, y, element, doc);
				if (result !== null) return result;
			}
		}
	}
	if (typeof doc.caretRangeFromPoint === "function") {
		const range = doc.caretRangeFromPoint(x, y);
		if (range === null) return null;
		return {
			node: range.startContainer,
			offset: range.startOffset
		};
	} else if (typeof doc.caretPositionFromPoint === "function") {
		const caretPosition = doc.caretPositionFromPoint(x, y);
		if (caretPosition === null) return null;
		return {
			node: caretPosition.offsetNode,
			offset: caretPosition.offset
		};
	}
	return null;
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function formatDevErrorMessage$2(message) {
	throw new Error(message);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* A middleware function in a per-MIME-type clipboard-import stack.
*
* - `data` is initially the non-empty string returned by
*   `DataTransfer.getData(mime)` for this MIME type. Earlier middleware may
*   replace it, including with an empty string.
* - `selection` is the selection at the insertion point, which earlier
*   middleware may replace. It must reference nodes in the active editor state.
* - `$next` defers to the next-lower handler in the stack (i.e. the handler
*   that was registered earlier). Pass optional `data` and `selection`
*   arguments to replace what the remaining handlers receive. Omitted
*   arguments default to this handler's arguments, so `$next()`
*   is equivalent to `$next(data, selection)`. Returns `true` if that
*   handler claimed the data; `false` if no handler accepted it.
* - `dataTransfer` is the full {@link DataTransfer} the paste/drop came
*   from, so a handler can inspect companion MIME types or attached
*   files in addition to the slot it was invoked for (e.g. peek at
*   `'application/x-vscode-source'` while handling `'text/html'`). When
*   threading through the new pipeline, pass this into
*   `$generateNodesFromDOMViaExtension(dom, {
*     context: [contextValue(ImportSourceDataTransfer, dataTransfer)],
*   })` so rules and preprocessors can read it via
*   `ctx.get(ImportSourceDataTransfer)`.
*
* The function should return `true` if it consumed the data (the caller
* stops trying further handlers for this MIME type and does not move on to
* the next MIME type). Return `$next()` to delegate. Return `false` if the
* function decided not to handle the data after inspecting it (e.g. the
* JSON namespace didn't match) so the next MIME type gets a chance.
*
* @experimental
*/
/**
* A mapping from MIME type to a stack of {@link ImportMimeTypeFunction}.
*
* Each entry is an ordered array; the function at the highest index runs
* first and may call `next()` to fall through to the function below it.
* The default config provides one handler each for
* `'application/x-lexical-editor'`, `'text/html'`, and `'text/plain'` that
* matches the legacy {@link $insertDataTransferForRichText} behavior.
*
* When {@link ClipboardImportExtension} merges a partial config, new
* functions are appended to the existing array for each MIME type, so
* later-registered handlers run before earlier ones (including the
* defaults) and may delegate to them via `next()`.
* To transform HTML before {@link ClipboardDOMImportExtension} handles it,
* declare it as a dependency or optional peer dependency of the extension
* providing the transform, so its configuration is merged first.
*
* @experimental
*/
/**
* Per-MIME-type ordering weights. Lower numbers run first.
*
* Composable across extensions: each extension contributes weights for
* its MIME types without needing to coordinate. A partial config that
* sets `{'application/vnd.myapp+json': 5}` slots its type between the
* built-in `application/x-lexical-editor` (0) and `text/html` (10) — no
* need to enumerate the full ordering. mergeConfig spreads pairs (later
* keys override earlier ones for the same MIME type, so an extension
* can also re-rank a built-in by repeating its key with a new weight).
*
* Iteration: every MIME type that has a handler stack and is present in
* the dataTransfer (regardless of whether it has an explicit weight) is
* tried; MIME types with no explicit weight sort to the end, behind all
* weighted ones, in lexical order.
*
* @experimental
*/
/**
* Configuration for {@link ClipboardImportExtension}.
*
* @experimental
*/
/**
* Default per-MIME-type weights reproducing the legacy
* `$insertDataTransferForRichText` ordering:
*
* `application/x-lexical-editor` (0) → `text/html` (10) →
* `text/plain` (20) → `text/uri-list` (30).
*
* Gaps between weights let third-party MIME types slot in (e.g. weight
* 5 to run between lexical and html). Apps can also override built-in
* weights to demote them.
*
* @experimental
*/
var DEFAULT_IMPORT_MIME_TYPE_PRIORITY = {
	"application/x-lexical-editor": 0,
	"text/html": 10,
	"text/plain": 20,
	"text/uri-list": 30
};
function trustHTML(html) {
	if (window.trustedTypes && window.trustedTypes.createPolicy) return window.trustedTypes.createPolicy("lexical", { createHTML: (input) => input }).createHTML(html);
	return html;
}
/**
* Default handler for `'application/x-lexical-editor'`: parse the JSON,
* verify the namespace, and insert the serialized nodes.
*/
var $defaultLexicalEditorImporter = (data, selection, $next) => {
	try {
		const editor = $getEditor();
		const payload = JSON.parse(data);
		if (payload && payload.namespace === editor._config.namespace && Array.isArray(payload.nodes)) {
			$insertGeneratedNodes(editor, $generateNodesFromSerializedNodes(payload.nodes), selection);
			return true;
		}
	} catch (error) {
		console.error(error);
	}
	return $next();
};
/**
* Default handler for `'text/html'`: parse the HTML and run the legacy
* `$generateNodesFromDOM`. Override (or stack a higher-priority handler
* on top) to route HTML pastes through {@link DOMImportExtension} or any
* custom pipeline. See {@link $generateNodesFromDOMViaExtension} for the
* built-in `DOMImportExtension` adapter.
*/
var $defaultHtmlImporter = (data, selection, $next) => {
	try {
		const editor = $getEditor();
		$insertGeneratedNodes(editor, $generateNodesFromDOM(editor, new DOMParser().parseFromString(trustHTML(data), "text/html")), selection);
		return true;
	} catch (error) {
		console.error(error);
		return $next();
	}
};
/**
* Default handler for `'text/plain'`. On a RangeSelection, drive the
* insertion off {@link tokenizeRawText} so each `\n` becomes a real
* paragraph break via `insertParagraph` (preserving current text
* format / style on the surrounding `insertText` calls). For other
* selection types, defer to the selection's own `insertRawText`.
*/
var $defaultPlainTextImporter = (data, selection) => {
	if (!$isRangeSelection(selection)) {
		selection.insertRawText(data);
		return true;
	}
	if (selection !== $getSelection()) $setSelection(selection);
	const withCurrentRange = (fn) => {
		const cur = $getSelection();
		if ($isRangeSelection(cur)) fn(cur);
	};
	tokenizeRawText(data, {
		linebreak: () => withCurrentRange((cur) => cur.insertParagraph()),
		tab: () => withCurrentRange((cur) => cur.insertNodes([$createTabNode()])),
		text: (part) => withCurrentRange((cur) => cur.insertText(part))
	});
	return true;
};
/**
* The default per-MIME-type handler stacks reproducing the legacy
* {@link $insertDataTransferForRichText} behavior exactly. Stacked
* extensions append on top of these.
*
* @experimental
*/
var DEFAULT_IMPORT_MIME_TYPE = {
	"application/x-lexical-editor": [$defaultLexicalEditorImporter],
	"text/html": [$defaultHtmlImporter],
	"text/plain": [$defaultPlainTextImporter],
	"text/uri-list": [$defaultPlainTextImporter]
};
/**
* Output of {@link ClipboardImportExtension}: the merged configuration
* plus a self-contained {@link $insertDataTransfer} function that owns
* the entire paste-side iteration over the priority list. Apps look this
* up via peer-dependency and call it directly; {@link
* $insertDataTransferForRichText} delegates to it.
*
* @experimental
*/
function $callImportMimeTypeFunctionStack(fns, data, selection, dataTransfer) {
	if (!fns) return false;
	const callAt = (i, currentData, currentSelection) => fns[i] ? fns[i](currentData, currentSelection, (nextData = currentData, nextSelection = currentSelection) => callAt(i - 1, nextData, nextSelection), dataTransfer) : false;
	return callAt(fns.length - 1, data, selection);
}
/**
* Sort the MIME types that have a registered handler stack by their
* configured priority weight (ascending). Types with no explicit weight
* sort after all weighted types, in lexical order, so unknown types
* remain reachable but never preempt a known one.
*/
function orderedMimeTypes(config) {
	return Object.keys(config.$importMimeType).filter((k) => config.$importMimeType[k] !== void 0).sort((a, b) => {
		const wa = config.priority[a];
		const wb = config.priority[b];
		if (wa === void 0 && wb === void 0) return a < b ? -1 : a > b ? 1 : 0;
		if (wa === void 0) return 1;
		if (wb === void 0) return -1;
		return wa - wb;
	});
}
function $runImport(config, dataTransfer, selection) {
	const plainString = dataTransfer.getData("text/plain");
	for (const mime of orderedMimeTypes(config)) {
		const data = dataTransfer.getData(mime);
		if (!data) continue;
		if (mime === "text/html" && data === plainString) continue;
		if ($callImportMimeTypeFunctionStack(config.$importMimeType[mime], data, selection, dataTransfer)) return true;
	}
	return false;
}
var DEFAULT_OUTPUT = {
	$importMimeType: DEFAULT_IMPORT_MIME_TYPE,
	$insertDataTransfer: (dataTransfer, selection) => $runImport({
		$importMimeType: DEFAULT_IMPORT_MIME_TYPE,
		priority: DEFAULT_IMPORT_MIME_TYPE_PRIORITY
	}, dataTransfer, selection),
	priority: DEFAULT_IMPORT_MIME_TYPE_PRIORITY
};
/**
* @internal
*
* Look up the {@link ClipboardImportOutput} on the active editor. Returns
* a static default-backed output when no {@link ClipboardImportExtension}
* is configured, so callers can always invoke `output.$insertDataTransfer`
* regardless of whether the editor opted in.
*/
function $getImportOutput() {
	const dep = $getPeerDependency(ClipboardImportExtension.name);
	return dep ? dep.output : DEFAULT_OUTPUT;
}
/**
* @experimental
*
* Mirror of {@link GetClipboardDataExtension} for the import direction.
* Holds a per-MIME-type stack of {@link ImportMimeTypeFunction}s.
*
* @example
* Route `text/html` pastes through {@link DOMImportExtension}, leaving the
* defaults for other MIME types untouched:
* ```ts
* import {configExtension, defineExtension, $getEditor} from 'lexical';
* import {
*   ClipboardImportExtension,
*   $insertGeneratedNodes,
* } from '@lexical/clipboard';
* import {
*   contextValue,
*   DOMImportExtension,
*   ImportSource,
*   ImportSourceDataTransfer,
*   $generateNodesFromDOMViaExtension,
* } from '@lexical/html';
*
* defineExtension({
*   name: 'app',
*   dependencies: [
*     DOMImportExtension,
*     configExtension(ClipboardImportExtension, {
*       $importMimeType: {
*         'text/html': [
*           (html, selection, _$next, dataTransfer) => {
*             const parser = new DOMParser();
*             const dom = parser.parseFromString(html, 'text/html');
*             const nodes = $generateNodesFromDOMViaExtension(dom, {
*               context: [
*                 contextValue(ImportSource, 'paste'),
*                 contextValue(ImportSourceDataTransfer, dataTransfer),
*               ],
*             });
*             $insertGeneratedNodes($getEditor(), nodes, selection);
*             return true;
*           },
*         ],
*       },
*     }),
*   ],
* });
* ```
*/
var ClipboardImportExtension = {
	build: (_editor, config) => ({
		$importMimeType: config.$importMimeType,
		$insertDataTransfer: (dataTransfer, selection) => $runImport(config, dataTransfer, selection),
		priority: config.priority
	}),
	config: {
		$importMimeType: DEFAULT_IMPORT_MIME_TYPE,
		priority: DEFAULT_IMPORT_MIME_TYPE_PRIORITY
	},
	mergeConfig(config, partial) {
		const merged = shallowMergeConfig(config, partial);
		if (partial.$importMimeType) {
			const $importMimeType = { ...config.$importMimeType };
			for (const [k, v] of Object.entries(partial.$importMimeType)) if (v) {
				const prev = $importMimeType[k];
				$importMimeType[k] = prev ? [...prev, ...v] : v;
			}
			merged.$importMimeType = $importMimeType;
		}
		if (partial.priority) merged.priority = {
			...config.priority,
			...partial.priority
		};
		return merged;
	},
	name: "@lexical/clipboard/Import"
};
/**
* @experimental
*
* Drop-in extension that routes `text/html` clipboard pastes and drops
* through the {@link DOMImportExtension} pipeline (rules, schemas,
* preprocessors, overlays) instead of the legacy
* {@link $generateNodesFromDOM}. Node-providing extensions
* (`RichTextExtension`, `ListExtension`, `LinkExtension`,
* `TableExtension`, `CodeExtension`, …) register their own import rules,
* so adding this extension to an editor built from them is all it takes
* to activate the pipeline for pastes. {@link CoreImportExtension} (the
* paragraph/text/inline-format baseline) is a dependency of this
* extension, so even an editor with no rule-contributing node extensions
* gets sensible text handling.
*
* The original {@link DataTransfer} and `'paste'` source kind are forwarded
* into the import context so rules and preprocessors can read them via
* `ctx.get(ImportSourceDataTransfer)` / `ctx.get(ImportSource)`.
*
* Equivalent to stacking this `text/html` handler manually via
* `configExtension(ClipboardImportExtension, {...})`.
*
* @example
* ```ts
* import {defineExtension} from 'lexical';
* import {ClipboardDOMImportExtension} from '@lexical/clipboard';
* import {RichTextExtension} from '@lexical/rich-text';
*
* defineExtension({
*   name: 'app',
*   dependencies: [
*     RichTextExtension,
*     ClipboardDOMImportExtension,
*   ],
* });
* ```
*/
var ClipboardDOMImportExtension = {
	dependencies: [CoreImportExtension, [ClipboardImportExtension, { $importMimeType: { "text/html": [(html, selection, _$next, dataTransfer) => {
		const nodes = $generateNodesFromDOMViaExtension(new DOMParser().parseFromString(trustHTML(html), "text/html"), { context: [contextValue(ImportSource, "paste"), contextValue(ImportSourceDataTransfer, dataTransfer)] });
		$insertGeneratedNodes($getEditor(), nodes, selection);
		return true;
	}] } }]],
	name: "@lexical/clipboard/DOMImport"
};
/**
* Returns the *currently selected* Lexical content as an HTML string, relying on the
* logic defined in the exportDOM methods on the LexicalNode classes. Note that
* this will not return the HTML content of the entire editor (unless all the content is included
* in the current selection).
*
* @param editor - LexicalEditor instance to get HTML content from
* @param selection - The selection to use (default is $getSelection())
* @returns a string of HTML content
*/
function $getHtmlContent(editor, selection = $getSelection()) {
	if (selection == null) formatDevErrorMessage$2(`Expected valid LexicalSelection`);
	if ($isRangeSelection(selection) && selection.isCollapsed() || selection.getNodes().length === 0) return "";
	return $generateHtmlFromNodes(editor, selection);
}
/**
* Returns the *currently selected* Lexical content as a JSON string, relying on the
* logic defined in the exportJSON methods on the LexicalNode classes. Note that
* this will not return the JSON content of the entire editor (unless all the content is included
* in the current selection).
*
* @param editor  - LexicalEditor instance to get the JSON content from
* @param selection - The selection to use (default is $getSelection())
* @returns
*/
function $getLexicalContent(editor, selection = $getSelection()) {
	if (selection == null) formatDevErrorMessage$2(`Expected valid LexicalSelection`);
	if ($isRangeSelection(selection) && selection.isCollapsed() || selection.getNodes().length === 0) return null;
	return JSON.stringify($generateJSONFromSelectedNodes(editor, selection));
}
/**
* Attempts to insert content of the mime-types text/plain or text/uri-list from
* the provided DataTransfer object into the editor at the provided selection.
* text/uri-list is only used if text/plain is not also provided.
*
* @param dataTransfer an object conforming to the [DataTransfer interface] (https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface)
* @param selection the selection to use as the insertion point for the content in the DataTransfer object
*/
function $insertDataTransferForPlainText(dataTransfer, selection) {
	const text = dataTransfer.getData("text/plain") || dataTransfer.getData("text/uri-list");
	if (text != null) selection.insertRawText(text);
}
/**
* Insert the contents of `dataTransfer` at `selection` using the rich-text
* import pipeline (`application/x-lexical-editor` → `text/html` → `text/plain`
* → `text/uri-list`, in descending order of priority).
*
* Every payload type leaves the editor's selection after the inserted content,
* so `selection` must be a live selection this update may write to — the one
* from `$getSelection()`, or one built with `$createRangeSelection()`. Passing
* a selection read out of an already-committed EditorState is not supported and
* raises an invariant in development builds.
*
* @param dataTransfer an object conforming to the [DataTransfer interface] (https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface)
* @param selection the selection to use as the insertion point for the content in the DataTransfer object
* @param _editor unused; retained for backwards compatibility. Safe to
*   omit on new call sites.
*/
function $insertDataTransferForRichText(dataTransfer, selection, _editor) {
	$getImportOutput().$insertDataTransfer(dataTransfer, selection);
}
var LEXICAL_DRAG_MIME_TYPE = "application/x-lexical-drag";
/**
* Populate `dataTransfer` with a marker identifying the current editor as a
* drag source. Pair this with {@link $handleRichTextDrop} or
* {@link $handlePlainTextDrop} on the drop side to get cut-and-paste semantics
* for drags that end in a different editor.
*
* Only the source editor's key needs to round-trip — the source's
* RangeSelection itself is preserved on the source editor between drag start
* and drop (Lexical suppresses selectionchange during drag), so the drop
* handler reads it directly via `$getSelection()` on the resolved source
* editor.
*
* Callers typically invoke this from a DRAGSTART_COMMAND handler alongside
* {@link setLexicalClipboardDataTransfer} (so that the dragged content itself
* round-trips with full node fidelity).
*/
function $writeDragSourceToDataTransfer(dataTransfer, editor) {
	const marker = { editorKey: editor.getKey() };
	dataTransfer.setData(LEXICAL_DRAG_MIME_TYPE, JSON.stringify(marker));
}
function isLexicalDragMarker(value) {
	return value !== null && typeof value === "object" && "editorKey" in value && typeof value.editorKey === "string";
}
function readDragMarker(dataTransfer) {
	const raw = dataTransfer.getData(LEXICAL_DRAG_MIME_TYPE);
	if (!raw) return null;
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	return isLexicalDragMarker(parsed) ? parsed : null;
}
function findEditorRootByKey(key, doc) {
	for (const el of findAllLexicalElementsDeep(doc)) {
		const editor = getEditorPropertyFromDOMNode(el);
		if (isLexicalEditor(editor) && editor.getKey() === key && isHTMLElement(el)) return el;
	}
	return null;
}
function $resolveDropPointCaret(event, editor) {
	const hit = caretFromPoint(event.clientX, event.clientY, editor.getRootElement());
	if (hit === null) return null;
	const node = $getNearestNodeFromDOMNode(hit.node);
	if (node === null) return null;
	if ($isTextNode(node)) return $getTextPointCaret(node, "next", hit.offset);
	if ($isElementNode(node)) return $getChildCaretAtIndex(node, hit.offset, "next");
	const parent = node.getParent();
	if (parent === null) return null;
	return $getChildCaretAtIndex(parent, node.getIndexWithinParent() + 1, "next");
}
function $normalizeDropBoundary(point) {
	let caret = point;
	if ($isTextPointCaret(caret)) {
		if (caret.offset === 0) caret = $rewindSiblingCaret(caret.getSiblingCaret());
		else if (caret.offset === caret.origin.getTextContentSize()) caret = caret.getSiblingCaret();
		else return caret;
	}
	for (;;) {
		const parent = caret.getParentAtCaret();
		if (parent === null || !parent.isInline() || parent.isShadowRoot()) return caret;
		if ($isChildCaret(caret)) caret = $rewindSiblingCaret($getSiblingCaret(parent, "next"));
		else if (caret.getNodeAtCaret() === null) caret = $getSiblingCaret(parent, "next");
		else return caret;
	}
}
function $isDropCaretInsideSelection(dropCaret, selection) {
	const { anchor: start, focus: end } = $getCaretRangeInDirection($caretRangeFromSelection(selection), "next");
	const drop = $normalizeDropBoundary(dropCaret);
	return $comparePointCaretNext($normalizeDropBoundary(start), drop) <= 0 && $comparePointCaretNext(drop, $normalizeDropBoundary(end)) <= 0;
}
function $doDrop(event, editor, $insertDataTransfer) {
	const dataTransfer = event.dataTransfer;
	if (dataTransfer === null) return false;
	const marker = readDragMarker(dataTransfer);
	if (marker === null) return false;
	const dropCaret = $resolveDropPointCaret(event, editor);
	if (dropCaret === null) return false;
	const isSameEditorDrag = marker.editorKey === editor.getKey();
	const currentSelection = $getSelection();
	if (isSameEditorDrag) {
		if (!$isRangeSelection(currentSelection) || currentSelection.isCollapsed()) return false;
		if ($isDropCaretInsideSelection(dropCaret, currentSelection)) {
			event.preventDefault();
			return true;
		}
	}
	const normalizedDropCaret = $normalizeCaret(dropCaret);
	const stableDropCaret = $isTextPointCaret(normalizedDropCaret) ? $splitAtPointCaretNext(normalizedDropCaret) : normalizedDropCaret;
	if (stableDropCaret === null) return false;
	const oppositeDropCaret = stableDropCaret.getFlipped();
	if (isSameEditorDrag && $isRangeSelection(currentSelection)) currentSelection.removeText();
	const insertCaret = stableDropCaret.origin.isAttached() ? stableDropCaret : oppositeDropCaret;
	if (!insertCaret.origin.isAttached()) formatDevErrorMessage$2(`$doDrop: drop position was removed by source deletion`);
	$insertDataTransfer(dataTransfer, $setSelectionFromCaretRange($getCollapsedCaretRange(insertCaret)), editor);
	if (!isSameEditorDrag) {
		const rootElement = editor.getRootElement();
		const doc = rootElement ? rootElement.ownerDocument : null;
		const sourceRoot = doc ? findEditorRootByKey(marker.editorKey, doc) : null;
		if (sourceRoot !== null) sourceRoot.dispatchEvent(new InputEvent("beforeinput", {
			bubbles: true,
			cancelable: true,
			inputType: "deleteByDrag"
		}));
	}
	event.preventDefault();
	return true;
}
/**
* Drop handler for rich-text editors. Inserts the DataTransfer payload via
* {@link $insertDataTransferForRichText} at the drop caret and, when the drag
* originated from a Lexical editor (marked via
* {@link $writeDragSourceToDataTransfer} on DRAGSTART), removes the source
* range — producing cut-and-paste semantics whether the drop is in the same
* editor or a different one on the same page.
*/
function $handleRichTextDrop(event, editor) {
	return $doDrop(event, editor, $insertDataTransferForRichText);
}
/**
* Drop handler for plain-text editors. Same semantics as
* {@link $handleRichTextDrop} but inserts via
* {@link $insertDataTransferForPlainText}.
*/
function $handlePlainTextDrop(event, editor) {
	return $doDrop(event, editor, (dataTransfer, selection) => $insertDataTransferForPlainText(dataTransfer, selection));
}
/**
* Inserts Lexical nodes into the editor using different strategies depending on
* some simple selection-based heuristics. If you're looking for a generic way to
* to insert nodes into the editor at a specific selection point, you probably want
* {@link lexical.$insertNodes}
*
* @param editor LexicalEditor instance to insert the nodes into.
* @param nodes The nodes to insert.
* @param selection The selection to insert the nodes into.
*/
function $insertGeneratedNodes(editor, nodes, selection) {
	if (!editor.dispatchCommand(SELECTION_INSERT_CLIPBOARD_NODES_COMMAND, {
		nodes,
		selection
	})) {
		selection.insertNodes(nodes);
		$updateSelectionOnInsert(selection);
	}
}
function $updateSelectionOnInsert(selection) {
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		const anchor = selection.anchor;
		let nodeToInspect = null;
		const anchorCaret = $caretFromPoint(anchor, "previous");
		if (anchorCaret) {
			if ($isTextPointCaret(anchorCaret)) nodeToInspect = anchorCaret.origin;
			else {
				const range = $getCaretRange(anchorCaret, $getChildCaret($getRoot(), "next").getFlipped());
				for (const caret of range) if ($isTextNode(caret.origin)) {
					nodeToInspect = caret.origin;
					break;
				} else if ($isElementNode(caret.origin) && !caret.origin.isInline()) break;
			}
		}
		if (nodeToInspect && $isTextNode(nodeToInspect)) {
			const newFormat = nodeToInspect.getFormat();
			const newStyle = nodeToInspect.getStyle();
			if (selection.format !== newFormat || selection.style !== newStyle) {
				selection.format = newFormat;
				selection.style = newStyle;
				selection.dirty = true;
			}
		}
	}
}
/**
* A node of a clipboard payload, read without knowing its type.
*
* Structurally `SerializedPartialNode` minus its index signature, and declared
* separately rather than aliased to it for that reason: this is the bound of
* the exported `$generateJSONFromSelectedNodes<SerializedNode>` and the
* parameter of `$generateNodesFromSerializedNodes`, and TypeScript grants an
* `interface` no implicit index signature — so aliasing made every consumer
* whose serialized type is a declared interface stop compiling against both.
*/
function $appendNodesToJSON(editor, selection, currentNode, targetArray = []) {
	let shouldInclude = selection !== null ? currentNode.isSelected(selection) : true;
	const shouldExclude = $isElementNode(currentNode) && currentNode.excludeFromCopy("clone");
	let target = currentNode;
	if (selection !== null && $isTextNode(target)) target = $sliceSelectedTextNodeContent(selection, target, "clone");
	const serializedNode = $exportNodeJSON(target);
	const children = $isElementNode(target) ? target.getChildren() : [];
	const childTarget = serializedNode.children || [];
	if ($isTextNode(target) && target.getTextContentSize() === 0) shouldInclude = false;
	const childSelection = shouldInclude && $isNodeSelection(selection) && $isElementNode(currentNode) ? null : selection;
	for (let i = 0; i < children.length; i++) {
		const childNode = children[i];
		const shouldIncludeChild = $appendNodesToJSON(editor, childSelection, childNode, childTarget);
		if (!shouldInclude && $isElementNode(currentNode) && shouldIncludeChild && currentNode.extractWithChild(childNode, selection, "clone")) shouldInclude = true;
	}
	if (shouldInclude && !shouldExclude) {
		const slotNames = $getSlotNames(target);
		if (slotNames.length > 0) {
			const serializedSlots = {};
			for (const name of slotNames) {
				const slotNode = $getSlot(target, name);
				if (!(slotNode !== null)) formatDevErrorMessage$2(`LexicalNode: Node ${target.constructor.name} has slot "${name}" but it resolved to no node during export.`);
				const slotArray = [];
				$appendNodesToJSON(editor, null, slotNode, slotArray);
				if (!(slotArray.length === 1 && !($isElementNode(slotNode) && slotNode.excludeFromCopy("clone")))) formatDevErrorMessage$2(`LexicalNode: slot "${name}" on ${target.constructor.name} did not serialize to exactly the slot value node (got ${String(slotArray.length)} nodes); a slot value must not be excluded from copy.`);
				serializedSlots[name] = slotArray[0];
			}
			serializedNode.$slots = serializedSlots;
		}
	}
	if (shouldInclude && !shouldExclude) targetArray.push(serializedNode);
	else for (let i = 0; i < childTarget.length; i++) targetArray.push(childTarget[i]);
	return shouldInclude;
}
/**
* Gets the Lexical JSON of the nodes inside the provided Selection.
*
* @param editor LexicalEditor to get the JSON content from.
* @param selection Selection to get the JSON content from.
* @returns an object with the editor namespace and a list of serializable nodes as JavaScript objects.
*/
function $generateJSONFromSelectedNodes(editor, selection) {
	const nodes = [];
	const root = $getRoot();
	const slotFrame = $getSelectionSlotFrame(selection);
	const topLevelChildren = ($isElementNode(slotFrame) ? slotFrame : root).getChildren();
	for (let i = 0; i < topLevelChildren.length; i++) {
		const topLevelNode = topLevelChildren[i];
		$appendNodesToJSON(editor, selection, topLevelNode, nodes);
	}
	return {
		namespace: editor._config.namespace,
		nodes
	};
}
/**
* This method takes an array of objects conforming to the BaseSerializedNode interface and returns
* an Array containing instances of the corresponding LexicalNode classes registered on the editor.
* Normally, you'd get an Array of BaseSerialized nodes from {@link $generateJSONFromSelectedNodes}
*
* @param serializedNodes an Array of objects conforming to the BaseSerializedNode interface.
* @returns an Array of Lexical Node objects.
*/
function $generateNodesFromSerializedNodes(serializedNodes) {
	const nodes = [];
	for (const serializedNode of serializedNodes) nodes.push($parseSerializedNode(serializedNode));
	return nodes;
}
var EVENT_LATENCY = 50;
var clipboardEventTimeout = null;
/**
* Copies the content of the current selection to the clipboard in
* text/plain, text/html, and application/x-lexical-editor (Lexical JSON)
* formats.
*
* @param editor the LexicalEditor instance to copy content from
* @param event the native browser ClipboardEvent to add the content to.
* @returns
*/
async function copyToClipboard(editor, event, data) {
	if (clipboardEventTimeout !== null) return false;
	if (event !== null) return new Promise((resolve, reject) => {
		editor.update(() => {
			resolve($copyToClipboardEvent(editor, event, data));
		});
	});
	const rootElement = editor.getRootElement();
	const editorWindow = editor._window || window;
	const windowDocument = editorWindow.document;
	const domSelection = getDOMSelection(editorWindow);
	if (rootElement === null || domSelection === null) return false;
	const element = windowDocument.createElement("span");
	element.style.position = "fixed";
	element.style.top = "-1000px";
	element.append(windowDocument.createTextNode("#"));
	rootElement.append(element);
	const range = windowDocument.createRange();
	range.setStart(element, 0);
	range.setEnd(element, 1);
	domSelection.removeAllRanges();
	domSelection.addRange(range);
	return new Promise((resolve, reject) => {
		const removeListener = editor.registerCommand(COPY_COMMAND, (secondEvent) => {
			if (objectKlassEquals(secondEvent, ClipboardEvent)) {
				removeListener();
				if (clipboardEventTimeout !== null) {
					editorWindow.clearTimeout(clipboardEventTimeout);
					clipboardEventTimeout = null;
				}
				resolve($copyToClipboardEvent(editor, secondEvent, data));
			}
			return true;
		}, 4);
		clipboardEventTimeout = editorWindow.setTimeout(() => {
			removeListener();
			clipboardEventTimeout = null;
			resolve(false);
		}, EVENT_LATENCY);
		windowDocument.execCommand("copy");
		element.remove();
	});
}
function $copyToClipboardEvent(editor, event, data) {
	if (data === void 0) {
		const domSelection = getDOMSelection(editor._window);
		const selection = $getSelection();
		if (!selection || selection.isCollapsed()) return false;
		if (!domSelection) return false;
		const points = getDOMSelectionPoints(domSelection, editor.getRootElement());
		const anchorDOM = points.anchorNode;
		const focusDOM = points.focusNode;
		if (anchorDOM !== null && focusDOM !== null && !isSelectionWithinEditor(editor, anchorDOM, focusDOM)) return false;
		data = $getClipboardDataFromSelection(selection);
	}
	event.preventDefault();
	const clipboardData = event.clipboardData;
	if (clipboardData === null) return false;
	setLexicalClipboardDataTransfer(clipboardData, data);
	return true;
}
var clipboardDataFunctions = [["text/html", $getHtmlContent], ["application/x-lexical-editor", $getLexicalContent]];
/**
* Serialize the content of the current selection to strings in
* text/plain, text/html, and application/x-lexical-editor (Lexical JSON)
* formats (as available).
*
* @param selection the selection to serialize (defaults to $getSelection())
* @returns LexicalClipboardData
*/
function $getClipboardDataFromSelection(selection = $getSelection()) {
	return $getClipboardDataWithConfigFromSelection($getExportConfig(), selection);
}
/**
* Call setData on the given clipboardData for each MIME type present
* in the given data (from {@link $getClipboardDataFromSelection})
*
* @param clipboardData the event.clipboardData to populate from data
* @param data The lexical data
*/
function setLexicalClipboardDataTransfer(clipboardData, data) {
	for (const [k] of clipboardDataFunctions) if (data[k] === void 0) clipboardData.setData(k, "");
	for (const k in data) {
		const v = data[k];
		if (v !== void 0) clipboardData.setData(k, v);
	}
}
/**
* A function that produces the serialized representation of a selection for
* a single MIME type. Functions are arranged in a stack per MIME type (see
* {@link ExportMimeTypeConfig}); the function at the top of the stack is
* invoked first and may call `next()` to delegate to the previous function
* in the stack (typically the default Lexical serializer).
*
* Returning `null` from the top-most function omits that MIME type from the
* resulting {@link LexicalClipboardData}.
*
* @param selection - The selection to serialize, or `null` if there is none.
* @param next - Calls the previous handler in the stack and returns its
*   result, or `null` if there is no previous handler.
* @returns The serialized string for this MIME type, or `null` to omit it.
*/
/**
* Configuration for {@link GetClipboardDataExtension}.
*/
/**
* A mapping from MIME type to a stack of {@link ExportMimeTypeFunction}.
*
* Each entry is an ordered array; the function at the highest index runs
* first and may call `next()` to fall through to the function below it.
* The default config provides a single fallback handler for
* `'application/x-lexical-editor'`, `'text/html'`, and `'text/plain'`.
*
* When {@link GetClipboardDataExtension} merges a partial config, new
* functions are appended to the existing array for each MIME type, so
* later-registered handlers run before earlier ones (including the
* defaults) and may delegate to them via `next()`. To register a brand new
* MIME type, supply a key not present in the default config; arbitrary
* string keys are accepted in addition to the keys of
* {@link LexicalClipboardData}.
*/
function $getExportConfig(editor = $getEditor()) {
	const dep = getPeerDependencyFromEditor(editor, GetClipboardDataExtension.name);
	return dep ? dep.output : DEFAULT_EXPORT_MIME_TYPE;
}
var DEFAULT_EXPORT_MIME_TYPE = {
	"application/x-lexical-editor": [(sel, next) => sel ? $getLexicalContent($getEditor(), sel) : next()],
	"text/html": [(sel, next) => sel ? $getHtmlContent($getEditor(), sel) : next()],
	"text/plain": [(sel, next) => sel ? sel.getTextContent() : next()]
};
function $getClipboardDataWithConfigFromSelection($exportMimeType, selection) {
	const clipboardData = { "text/plain": "" };
	for (const [k, fns] of Object.entries($exportMimeType)) if (fns) {
		const v = callExportMimeTypeFunctionStack(fns, selection);
		if (v !== null) clipboardData[k] = v;
	}
	return clipboardData;
}
function callExportMimeTypeFunctionStack(fns, selection) {
	const callAt = (i) => fns[i] ? fns[i](selection, callAt.bind(null, i - 1)) : null;
	return callAt(fns.length - 1);
}
/**
* Lexical extension that controls how the current selection is serialized
* into clipboard MIME types when copying or dragging out of the editor.
*
* The extension's config holds an {@link ExportMimeTypeConfig} — a stack of
* {@link ExportMimeTypeFunction} per MIME type. Out of the box it provides
* fallback serializers for `'application/x-lexical-editor'`, `'text/html'`,
* and `'text/plain'` that defer to {@link $getLexicalContent},
* {@link $getHtmlContent}, and `selection.getTextContent()` respectively.
*
* Apps can layer additional handlers on top to customize an existing
* payload (delegating to the default via `next()`) or to register an
* entirely new MIME type. Functions provided through `mergeConfig` are
* appended to the existing stack for each MIME type, so a newly registered
* handler runs first and may fall through to the previously registered
* handlers via its `next` argument.
*
* The extension's `output` is the resolved {@link ExportMimeTypeConfig},
* which {@link $getClipboardDataFromSelection} and
* {@link $exportMimeTypeFromSelection} read via the editor's peer
* dependency lookup.
*
* @example
* ```ts
* import {configExtension, defineExtension} from '@lexical/extension';
* import {GetClipboardDataExtension} from '@lexical/clipboard';
*
* const MyClipboardExtension = defineExtension({
*   name: 'my-app/clipboard',
*   dependencies: [
*     configExtension(GetClipboardDataExtension, {
*       $exportMimeType: {
*         // Wrap the default HTML output with an app-specific marker.
*         'text/html': [
*           (selection, next) => {
*             const html = next();
*             return html ? wrapWithMyAppMarker(html) : html;
*           },
*         ],
*         // Add a brand-new MIME type.
*         'application/vnd.myapp+json': [
*           (selection) =>
*             selection ? exportMyAppFormat(selection) : null,
*         ],
*       },
*     }),
*   ],
* });
* ```
*/
var GetClipboardDataExtension = {
	build(editor, config, state) {
		return config.$exportMimeType;
	},
	config: { $exportMimeType: DEFAULT_EXPORT_MIME_TYPE },
	mergeConfig(config, partial) {
		const merged = shallowMergeConfig(config, partial);
		if (partial.$exportMimeType) {
			const $exportMimeType = { ...config.$exportMimeType };
			for (const [k, v] of Object.entries(partial.$exportMimeType)) if (v) {
				const prev = $exportMimeType[k];
				$exportMimeType[k] = prev ? [...prev, ...v] : v;
			}
			merged.$exportMimeType = $exportMimeType;
		}
		return merged;
	},
	name: "@lexical/clipboard/GetClipboardData"
};
//#endregion
//#region ../lexical-dragon/dist/LexicalDragon.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var TEXT_FORMAT_BY_EXEC_COMMAND = {
	bold: "bold",
	italic: "italic",
	strikeThrough: "strikethrough",
	subscript: "subscript",
	superscript: "superscript",
	underline: "underline"
};
var WINDOW_STATE_KEY = Symbol.for("@lexical/dragon/WindowState");
function getOrCreateWindowState(targetWindow) {
	let state = targetWindow[WINDOW_STATE_KEY];
	if (state === void 0) {
		state = {
			dispose: () => {},
			editors: /* @__PURE__ */ new Map(),
			installs: /* @__PURE__ */ new Set()
		};
		targetWindow[WINDOW_STATE_KEY] = state;
	}
	return state;
}
function addInstall(targetWindow, installKey, editor) {
	const state = getOrCreateWindowState(targetWindow);
	if (state.installs.size === 0) {
		const boundHandleMessage = handleMessage.bind(targetWindow);
		targetWindow.addEventListener("message", boundHandleMessage, true);
		state.dispose = () => {
			targetWindow.removeEventListener("message", boundHandleMessage, true);
		};
	}
	state.installs.add(installKey);
	if (editor) {
		const installSet = state.editors.get(editor) || /* @__PURE__ */ new Set();
		installSet.add(installKey);
		state.editors.set(editor, installSet);
	}
	return removeInstall.bind(null, targetWindow, state, installKey, editor);
}
function removeInstall(targetWindow, state, installKey, editor) {
	if (editor) {
		const installSet = state.editors.get(editor);
		if (installSet && installSet.delete(installKey) && installSet.size === 0) state.editors.delete(editor);
	}
	if (state.installs.delete(installKey) && state.installs.size === 0) {
		state.dispose();
		delete targetWindow[WINDOW_STATE_KEY];
	}
}
function getDefaultView(el) {
	return el && el.ownerDocument.defaultView;
}
function registerDragonSupport(editor) {
	const windowSignal = watchedSignal(() => getDefaultView(editor.getRootElement()), (self) => editor.registerRootListener((rootElement) => {
		self.value = getDefaultView(rootElement);
	}));
	return j(() => {
		const targetWindow = windowSignal.value;
		if (targetWindow) return addInstall(targetWindow, Symbol("@lexical/dragon/editorInstall"), editor);
	});
}
function getFocusedEditor(targetWindow) {
	const state = targetWindow[WINDOW_STATE_KEY];
	if (state === void 0) return null;
	const activeEditor = getEditorPropertyFromDOMNode(getActiveElementDeep(targetWindow.document));
	return isLexicalEditor(activeEditor) && state.editors.has(activeEditor) ? activeEditor : null;
}
function handleMessage(event) {
	const targetWindow = this;
	if (event.origin !== targetWindow.location.origin) return;
	const editor = getFocusedEditor(targetWindow);
	if (editor === null) return;
	const data = event.data;
	if (typeof data === "string") {
		let parsedData;
		try {
			parsedData = JSON.parse(data);
		} catch (_e) {
			return;
		}
		if (parsedData && parsedData.protocol === "nuanria_messaging" && parsedData.type === "request") {
			const payload = parsedData.payload;
			if (payload && payload.functionId === "makeChanges") {
				const args = payload.args;
				if (Array.isArray(args)) {
					const [elementStart, elementLength, text, selStart, selLength, formatCommand] = args;
					if (![
						elementStart,
						elementLength,
						selStart,
						selLength
					].every(Number.isFinite) || typeof text !== "string" && text !== -1) return;
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							const anchor = selection.anchor;
							let anchorNode = anchor.getNode();
							let setSelStart = 0;
							let setSelEnd = 0;
							if ($isTextNode(anchorNode)) {
								if (elementStart >= 0 && elementLength >= 0) {
									setSelStart = elementStart;
									setSelEnd = elementStart + elementLength;
									selection.setTextNodeRange(anchorNode, setSelStart, anchorNode, setSelEnd);
								}
							}
							if (typeof text === "string" && (setSelStart !== setSelEnd || text !== "")) {
								selection.insertRawText(text);
								anchorNode = anchor.getNode();
							}
							if ($isTextNode(anchorNode)) {
								const anchorNodeTextLength = anchorNode.getTextContentSize();
								setSelStart = Math.min(Math.max(selStart, 0), anchorNodeTextLength);
								setSelEnd = selStart < 0 || selLength < 0 ? setSelStart : Math.min(selStart + selLength, anchorNodeTextLength);
								selection.setTextNodeRange(anchorNode, setSelStart, anchorNode, setSelEnd);
							}
							if (typeof formatCommand === "string" && selLength > 0 && !selection.isCollapsed()) {
								const format = TEXT_FORMAT_BY_EXEC_COMMAND[formatCommand];
								if (format !== void 0) selection.formatText(format);
							}
							event.stopImmediatePropagation();
						}
					});
				}
			}
		}
	}
}
/**
* Add Dragon speech to text input support to the editor, via the
* \@lexical/dragon module.
*/
var DragonExtension = {
	build: (editor, config, state) => namedSignals(config),
	config: { disabled: typeof window === "undefined" },
	name: "@lexical/dragon",
	register: (editor, config, state) => j(() => state.getOutput().disabled.value ? void 0 : registerDragonSupport(editor))
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/map.js
/**
* Utility module to work with key-value stores.
*
* @module map
*/
/**
* @template K
* @template V
* @typedef {Map<K,V>} GlobalMap
*/
/**
* Creates a new Map instance.
*
* @function
* @return {Map<any, any>}
*
* @function
*/
var create$5 = () => /* @__PURE__ */ new Map();
/**
* Copy a Map object into a fresh Map object.
*
* @function
* @template K,V
* @param {Map<K,V>} m
* @return {Map<K,V>}
*/
var copy = (m) => {
	const r = create$5();
	m.forEach((v, k) => {
		r.set(k, v);
	});
	return r;
};
/**
* Get map property. Create T if property is undefined and set T on map.
*
* ```js
* const listeners = map.setIfUndefined(events, 'eventName', set.create)
* listeners.add(listener)
* ```
*
* @function
* @template {Map<any, any>} MAP
* @template {MAP extends Map<any,infer V> ? function():V : unknown} CF
* @param {MAP} map
* @param {MAP extends Map<infer K,any> ? K : unknown} key
* @param {CF} createT
* @return {ReturnType<CF>}
*/
var setIfUndefined = (map, key, createT) => {
	let set = map.get(key);
	if (set === void 0) map.set(key, set = createT());
	return set;
};
/**
* Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
*
* @function
* @template K
* @template V
* @template R
* @param {Map<K,V>} m
* @param {function(V,K):R} f
* @return {Array<R>}
*/
var map$1 = (m, f) => {
	const res = [];
	for (const [key, value] of m) res.push(f(value, key));
	return res;
};
/**
* Tests whether any key-value pairs pass the test implemented by `f(value, key)`.
*
* @todo should rename to some - similarly to Array.some
*
* @function
* @template K
* @template V
* @param {Map<K,V>} m
* @param {function(V,K):boolean} f
* @return {boolean}
*/
var any = (m, f) => {
	for (const [key, value] of m) if (f(value, key)) return true;
	return false;
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/set.js
/**
* Utility module to work with sets.
*
* @module set
*/
var create$4 = () => /* @__PURE__ */ new Set();
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/array.js
/**
* Return the last element of an array. The element must exist
*
* @template L
* @param {ArrayLike<L>} arr
* @return {L}
*/
var last = (arr) => arr[arr.length - 1];
/**
* Append elements from src to dest
*
* @template M
* @param {Array<M>} dest
* @param {Array<M>} src
*/
var appendTo = (dest, src) => {
	for (let i = 0; i < src.length; i++) dest.push(src[i]);
};
/**
* Transforms something array-like to an actual Array.
*
* @function
* @template T
* @param {ArrayLike<T>|Iterable<T>} arraylike
* @return {T}
*/
var from = Array.from;
/**
* True iff condition holds on every element in the Array.
*
* @function
* @template {ArrayLike<any>} ARR
*
* @param {ARR} arr
* @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : any} f
* @return {boolean}
*/
var every$1 = (arr, f) => {
	for (let i = 0; i < arr.length; i++) if (!f(arr[i], i, arr)) return false;
	return true;
};
/**
* True iff condition holds on some element in the Array.
*
* @function
* @template {ArrayLike<any>} ARR
*
* @param {ARR} arr
* @param {ARR extends ArrayLike<infer S> ? ((value:S, index:number, arr:ARR) => boolean) : never} f
* @return {boolean}
*/
var some = (arr, f) => {
	for (let i = 0; i < arr.length; i++) if (f(arr[i], i, arr)) return true;
	return false;
};
/**
* @template T
* @param {number} len
* @param {function(number, Array<T>):T} f
* @return {Array<T>}
*/
var unfold = (len, f) => {
	const array = new Array(len);
	for (let i = 0; i < len; i++) array[i] = f(i, array);
	return array;
};
var isArray = Array.isArray;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/observable.js
/**
* Observable class prototype.
*
* @module observable
*/
/**
* Handles named events.
* @experimental
*
* This is basically a (better typed) duplicate of Observable, which will replace Observable in the
* next release.
*
* @template {{[key in keyof EVENTS]: function(...any):void}} EVENTS
*/
var ObservableV2 = class {
	constructor() {
		/**
		* Some desc.
		* @type {Map<string, Set<any>>}
		*/
		this._observers = create$5();
	}
	/**
	* @template {keyof EVENTS & string} NAME
	* @param {NAME} name
	* @param {EVENTS[NAME]} f
	*/
	on(name, f) {
		setIfUndefined(this._observers, name, create$4).add(f);
		return f;
	}
	/**
	* @template {keyof EVENTS & string} NAME
	* @param {NAME} name
	* @param {EVENTS[NAME]} f
	*/
	once(name, f) {
		/**
		* @param  {...any} args
		*/
		const _f = (...args) => {
			this.off(name, _f);
			f(...args);
		};
		this.on(name, _f);
	}
	/**
	* @template {keyof EVENTS & string} NAME
	* @param {NAME} name
	* @param {EVENTS[NAME]} f
	*/
	off(name, f) {
		const observers = this._observers.get(name);
		if (observers !== void 0) {
			observers.delete(f);
			if (observers.size === 0) this._observers.delete(name);
		}
	}
	/**
	* Emit a named event. All registered event listeners that listen to the
	* specified name will receive the event.
	*
	* @todo This should catch exceptions
	*
	* @template {keyof EVENTS & string} NAME
	* @param {NAME} name The event name.
	* @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
	*/
	emit(name, args) {
		return from((this._observers.get(name) || create$5()).values()).forEach((f) => f(...args));
	}
	destroy() {
		this._observers = create$5();
	}
};
/* c8 ignore start */
/**
* Handles named events.
*
* @deprecated
* @template N
*/
var Observable = class {
	constructor() {
		/**
		* Some desc.
		* @type {Map<N, any>}
		*/
		this._observers = create$5();
	}
	/**
	* @param {N} name
	* @param {function} f
	*/
	on(name, f) {
		setIfUndefined(this._observers, name, create$4).add(f);
	}
	/**
	* @param {N} name
	* @param {function} f
	*/
	once(name, f) {
		/**
		* @param  {...any} args
		*/
		const _f = (...args) => {
			this.off(name, _f);
			f(...args);
		};
		this.on(name, _f);
	}
	/**
	* @param {N} name
	* @param {function} f
	*/
	off(name, f) {
		const observers = this._observers.get(name);
		if (observers !== void 0) {
			observers.delete(f);
			if (observers.size === 0) this._observers.delete(name);
		}
	}
	/**
	* Emit a named event. All registered event listeners that listen to the
	* specified name will receive the event.
	*
	* @todo This should catch exceptions
	*
	* @param {N} name The event name.
	* @param {Array<any>} args The arguments that are applied to the event listener.
	*/
	emit(name, args) {
		return from((this._observers.get(name) || create$5()).values()).forEach((f) => f(...args));
	}
	destroy() {
		this._observers = create$5();
	}
};
/* c8 ignore end */
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/math.js
/**
* Common Math expressions.
*
* @module math
*/
var floor = Math.floor;
var abs = Math.abs;
/**
* @function
* @param {number} a
* @param {number} b
* @return {number} The smaller element of a and b
*/
var min = (a, b) => a < b ? a : b;
/**
* @function
* @param {number} a
* @param {number} b
* @return {number} The bigger element of a and b
*/
var max = (a, b) => a > b ? a : b;
Number.isNaN;
var pow = Math.pow;
/**
* Check whether n is negative, while considering the -0 edge case. While `-0 < 0` is false, this
* function returns true for -0,-1,,.. and returns false for 0,1,2,...
* @param {number} n
* @return {boolean} Wether n is negative. This function also distinguishes between -0 and +0
*/
var isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/number.js
/**
* Utility helpers for working with numbers.
*
* @module number
*/
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
/* c8 ignore next */
var isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
Number.isNaN;
Number.parseInt;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/string.js
/**
* Utility module to work with strings.
*
* @module string
*/
var fromCharCode = String.fromCharCode;
String.fromCodePoint;
fromCharCode(65535);
/**
* @param {string} s
* @return {string}
*/
var toLowerCase = (s) => s.toLowerCase();
var trimLeftRegex = /^\s*/g;
/**
* @param {string} s
* @return {string}
*/
var trimLeft = (s) => s.replace(trimLeftRegex, "");
var fromCamelCaseRegex = /([A-Z])/g;
/**
* @param {string} s
* @param {string} separator
* @return {string}
*/
var fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match) => `${separator}${toLowerCase(match)}`));
/**
* @param {string} str
* @return {Uint8Array<ArrayBuffer>}
*/
var _encodeUtf8Polyfill = (str) => {
	const encodedString = unescape(encodeURIComponent(str));
	const len = encodedString.length;
	const buf = new Uint8Array(len);
	for (let i = 0; i < len; i++) buf[i] = encodedString.codePointAt(i);
	return buf;
};
/* c8 ignore next */
var utf8TextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
/**
* @param {string} str
* @return {Uint8Array<ArrayBuffer>}
*/
var _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
/**
* @param {string} str
* @return {Uint8Array}
*/
/* c8 ignore next */
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
/* c8 ignore next */
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", {
	fatal: true,
	ignoreBOM: true
});
/* c8 ignore start */
if (utf8TextDecoder && utf8TextDecoder.decode(/* @__PURE__ */ new Uint8Array()).length === 1)
 /* c8 ignore next */
utf8TextDecoder = null;
/**
* @param {string} source
* @param {number} n
*/
var repeat = (source, n) => unfold(n, () => source).join("");
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/encoding.js
/**
* Efficient schema-less binary encoding with support for variable length encoding.
*
* Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
*
* Encodes numbers in little-endian order (least to most significant byte order)
* and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
* which is also used in Protocol Buffers.
*
* ```js
* // encoding step
* const encoder = encoding.createEncoder()
* encoding.writeVarUint(encoder, 256)
* encoding.writeVarString(encoder, 'Hello world!')
* const buf = encoding.toUint8Array(encoder)
* ```
*
* ```js
* // decoding step
* const decoder = decoding.createDecoder(buf)
* decoding.readVarUint(decoder) // => 256
* decoding.readVarString(decoder) // => 'Hello world!'
* decoding.hasContent(decoder) // => false - all data is read
* ```
*
* @module encoding
*/
/**
* A BinaryEncoder handles the encoding to an Uint8Array.
*/
var Encoder = class {
	constructor() {
		this.cpos = 0;
		this.cbuf = /* @__PURE__ */ new Uint8Array(100);
		/**
		* @type {Array<Uint8Array>}
		*/
		this.bufs = [];
	}
};
/**
* @function
* @return {Encoder}
*/
var createEncoder = () => new Encoder();
/**
* The current length of the encoded data.
*
* @function
* @param {Encoder} encoder
* @return {number}
*/
var length = (encoder) => {
	let len = encoder.cpos;
	for (let i = 0; i < encoder.bufs.length; i++) len += encoder.bufs[i].length;
	return len;
};
/**
* Transform to Uint8Array.
*
* @function
* @param {Encoder} encoder
* @return {Uint8Array<ArrayBuffer>} The created ArrayBuffer.
*/
var toUint8Array = (encoder) => {
	const uint8arr = new Uint8Array(length(encoder));
	let curPos = 0;
	for (let i = 0; i < encoder.bufs.length; i++) {
		const d = encoder.bufs[i];
		uint8arr.set(d, curPos);
		curPos += d.length;
	}
	uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
	return uint8arr;
};
/**
* Verify that it is possible to write `len` bytes wtihout checking. If
* necessary, a new Buffer with the required length is attached.
*
* @param {Encoder} encoder
* @param {number} len
*/
var verifyLen = (encoder, len) => {
	const bufferLen = encoder.cbuf.length;
	if (bufferLen - encoder.cpos < len) {
		encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
		encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
		encoder.cpos = 0;
	}
};
/**
* Write one byte to the encoder.
*
* @function
* @param {Encoder} encoder
* @param {number} num The byte that is to be encoded.
*/
var write = (encoder, num) => {
	const bufferLen = encoder.cbuf.length;
	if (encoder.cpos === bufferLen) {
		encoder.bufs.push(encoder.cbuf);
		encoder.cbuf = new Uint8Array(bufferLen * 2);
		encoder.cpos = 0;
	}
	encoder.cbuf[encoder.cpos++] = num;
};
/**
* Write one byte as an unsigned integer.
*
* @function
* @param {Encoder} encoder
* @param {number} num The number that is to be encoded.
*/
var writeUint8 = write;
/**
* Write a variable length unsigned integer. Max encodable integer is 2^53.
*
* @function
* @param {Encoder} encoder
* @param {number} num The number that is to be encoded.
*/
var writeVarUint = (encoder, num) => {
	while (num > 127) {
		write(encoder, 128 | 127 & num);
		num = floor(num / 128);
	}
	write(encoder, 127 & num);
};
/**
* Write a variable length integer.
*
* We use the 7th bit instead for signaling that this is a negative number.
*
* @function
* @param {Encoder} encoder
* @param {number} num The number that is to be encoded.
*/
var writeVarInt = (encoder, num) => {
	const isNegative = isNegativeZero(num);
	if (isNegative) num = -num;
	write(encoder, (num > 63 ? 128 : 0) | (isNegative ? 64 : 0) | 63 & num);
	num = floor(num / 64);
	while (num > 0) {
		write(encoder, (num > 127 ? 128 : 0) | 127 & num);
		num = floor(num / 128);
	}
};
/**
* A cache to store strings temporarily
*/
var _strBuffer = /* @__PURE__ */ new Uint8Array(3e4);
var _maxStrBSize = _strBuffer.length / 3;
/**
* Write a variable length string.
*
* @function
* @param {Encoder} encoder
* @param {String} str The string that is to be encoded.
*/
var _writeVarStringNative = (encoder, str) => {
	if (str.length < _maxStrBSize) {
		/* c8 ignore next */
		const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
		writeVarUint(encoder, written);
		for (let i = 0; i < written; i++) write(encoder, _strBuffer[i]);
	} else writeVarUint8Array(encoder, encodeUtf8(str));
};
/**
* Write a variable length string.
*
* @function
* @param {Encoder} encoder
* @param {String} str The string that is to be encoded.
*/
var _writeVarStringPolyfill = (encoder, str) => {
	const encodedString = unescape(encodeURIComponent(str));
	const len = encodedString.length;
	writeVarUint(encoder, len);
	for (let i = 0; i < len; i++) write(encoder, encodedString.codePointAt(i));
};
/**
* Write a variable length string.
*
* @function
* @param {Encoder} encoder
* @param {String} str The string that is to be encoded.
*/
/* c8 ignore next */
var writeVarString = utf8TextEncoder && utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
/**
* Append fixed-length Uint8Array to the encoder.
*
* @function
* @param {Encoder} encoder
* @param {Uint8Array} uint8Array
*/
var writeUint8Array = (encoder, uint8Array) => {
	const bufferLen = encoder.cbuf.length;
	const cpos = encoder.cpos;
	const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
	const rightCopyLen = uint8Array.length - leftCopyLen;
	encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
	encoder.cpos += leftCopyLen;
	if (rightCopyLen > 0) {
		encoder.bufs.push(encoder.cbuf);
		encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
		encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
		encoder.cpos = rightCopyLen;
	}
};
/**
* Append an Uint8Array to Encoder.
*
* @function
* @param {Encoder} encoder
* @param {Uint8Array} uint8Array
*/
var writeVarUint8Array = (encoder, uint8Array) => {
	writeVarUint(encoder, uint8Array.byteLength);
	writeUint8Array(encoder, uint8Array);
};
/**
* Create an DataView of the next `len` bytes. Use it to write data after
* calling this function.
*
* ```js
* // write float32 using DataView
* const dv = writeOnDataView(encoder, 4)
* dv.setFloat32(0, 1.1)
* // read float32 using DataView
* const dv = readFromDataView(encoder, 4)
* dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
* ```
*
* @param {Encoder} encoder
* @param {number} len
* @return {DataView}
*/
var writeOnDataView = (encoder, len) => {
	verifyLen(encoder, len);
	const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
	encoder.cpos += len;
	return dview;
};
/**
* @param {Encoder} encoder
* @param {number} num
*/
var writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
/**
* @param {Encoder} encoder
* @param {number} num
*/
var writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
/**
* @param {Encoder} encoder
* @param {bigint} num
*/
var writeBigInt64 = (encoder, num) => writeOnDataView(encoder, 8).setBigInt64(0, num, false);
var floatTestBed = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(4));
/**
* Check if a number can be encoded as a 32 bit float.
*
* @param {number} num
* @return {boolean}
*/
var isFloat32 = (num) => {
	floatTestBed.setFloat32(0, num);
	return floatTestBed.getFloat32(0) === num;
};
/**
* @typedef {Array<AnyEncodable>} AnyEncodableArray
*/
/**
* @typedef {undefined|null|number|bigint|boolean|string|{[k:string]:AnyEncodable}|AnyEncodableArray|Uint8Array} AnyEncodable
*/
/**
* Encode data with efficient binary format.
*
* Differences to JSON:
* • Transforms data to a binary format (not to a string)
* • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
* • Numbers are efficiently encoded either as a variable length integer, as a
*   32 bit float, as a 64 bit float, or as a 64 bit bigint.
*
* Encoding table:
*
* | Data Type           | Prefix   | Encoding Method    | Comment |
* | ------------------- | -------- | ------------------ | ------- |
* | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
* | null                | 126      |                    | |
* | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
* | float32             | 124      | writeFloat32       | |
* | float64             | 123      | writeFloat64       | |
* | bigint              | 122      | writeBigInt64      | |
* | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
* | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
* | string              | 119      | writeVarString     | |
* | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
* | array<any>          | 117      | custom             | Writes {length} then {length} json values |
* | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
*
* Reasons for the decreasing prefix:
* We need the first bit for extendability (later we may want to encode the
* prefix with writeVarUint). The remaining 7 bits are divided as follows:
* [0-30]   the beginning of the data range is used for custom purposes
*          (defined by the function that uses this library)
* [31-127] the end of the data range is used for data encoding by
*          lib0/encoding.js
*
* @param {Encoder} encoder
* @param {AnyEncodable} data
*/
var writeAny = (encoder, data) => {
	switch (typeof data) {
		case "string":
			write(encoder, 119);
			writeVarString(encoder, data);
			break;
		case "number":
			if (isInteger(data) && abs(data) <= 2147483647) {
				write(encoder, 125);
				writeVarInt(encoder, data);
			} else if (isFloat32(data)) {
				write(encoder, 124);
				writeFloat32(encoder, data);
			} else {
				write(encoder, 123);
				writeFloat64(encoder, data);
			}
			break;
		case "bigint":
			write(encoder, 122);
			writeBigInt64(encoder, data);
			break;
		case "object":
			if (data === null) write(encoder, 126);
			else if (isArray(data)) {
				write(encoder, 117);
				writeVarUint(encoder, data.length);
				for (let i = 0; i < data.length; i++) writeAny(encoder, data[i]);
			} else if (data instanceof Uint8Array) {
				write(encoder, 116);
				writeVarUint8Array(encoder, data);
			} else {
				write(encoder, 118);
				const keys = Object.keys(data);
				writeVarUint(encoder, keys.length);
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					writeVarString(encoder, key);
					writeAny(encoder, data[key]);
				}
			}
			break;
		case "boolean":
			write(encoder, data ? 120 : 121);
			break;
		default: write(encoder, 127);
	}
};
/**
* Now come a few stateful encoder that have their own classes.
*/
/**
* Basic Run Length Encoder - a basic compression implementation.
*
* Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
*
* It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
*
* @note T must not be null!
*
* @template T
*/
var RleEncoder = class extends Encoder {
	/**
	* @param {function(Encoder, T):void} writer
	*/
	constructor(writer) {
		super();
		/**
		* The writer
		*/
		this.w = writer;
		/**
		* Current state
		* @type {T|null}
		*/
		this.s = null;
		this.count = 0;
	}
	/**
	* @param {T} v
	*/
	write(v) {
		if (this.s === v) this.count++;
		else {
			if (this.count > 0) writeVarUint(this, this.count - 1);
			this.count = 1;
			this.w(this, v);
			this.s = v;
		}
	}
};
/**
* @param {UintOptRleEncoder} encoder
*/
var flushUintOptRleEncoder = (encoder) => {
	if (encoder.count > 0) {
		writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
		if (encoder.count > 1) writeVarUint(encoder.encoder, encoder.count - 2);
	}
};
/**
* Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
*
* Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
* write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
*
* Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
*/
var UintOptRleEncoder = class {
	constructor() {
		this.encoder = new Encoder();
		/**
		* @type {number}
		*/
		this.s = 0;
		this.count = 0;
	}
	/**
	* @param {number} v
	*/
	write(v) {
		if (this.s === v) this.count++;
		else {
			flushUintOptRleEncoder(this);
			this.count = 1;
			this.s = v;
		}
	}
	/**
	* Flush the encoded state and transform this to a Uint8Array.
	*
	* Note that this should only be called once.
	*/
	toUint8Array() {
		flushUintOptRleEncoder(this);
		return toUint8Array(this.encoder);
	}
};
/**
* @param {IntDiffOptRleEncoder} encoder
*/
var flushIntDiffOptRleEncoder = (encoder) => {
	if (encoder.count > 0) {
		const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
		writeVarInt(encoder.encoder, encodedDiff);
		if (encoder.count > 1) writeVarUint(encoder.encoder, encoder.count - 2);
	}
};
/**
* A combination of the IntDiffEncoder and the UintOptRleEncoder.
*
* The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
* in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
*
* Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
*
* Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
* * 1 bit that denotes whether the next value is a count (LSB)
* * 1 bit that denotes whether this value is negative (MSB - 1)
* * 1 bit that denotes whether to continue reading the variable length integer (MSB)
*
* Therefore, only five bits remain to encode diff ranges.
*
* Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
*/
var IntDiffOptRleEncoder = class {
	constructor() {
		this.encoder = new Encoder();
		/**
		* @type {number}
		*/
		this.s = 0;
		this.count = 0;
		this.diff = 0;
	}
	/**
	* @param {number} v
	*/
	write(v) {
		if (this.diff === v - this.s) {
			this.s = v;
			this.count++;
		} else {
			flushIntDiffOptRleEncoder(this);
			this.count = 1;
			this.diff = v - this.s;
			this.s = v;
		}
	}
	/**
	* Flush the encoded state and transform this to a Uint8Array.
	*
	* Note that this should only be called once.
	*/
	toUint8Array() {
		flushIntDiffOptRleEncoder(this);
		return toUint8Array(this.encoder);
	}
};
/**
* Optimized String Encoder.
*
* Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
* In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
*
* This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
*
* The lengths are encoded using a UintOptRleEncoder.
*/
var StringEncoder = class {
	constructor() {
		/**
		* @type {Array<string>}
		*/
		this.sarr = [];
		this.s = "";
		this.lensE = new UintOptRleEncoder();
	}
	/**
	* @param {string} string
	*/
	write(string) {
		this.s += string;
		if (this.s.length > 19) {
			this.sarr.push(this.s);
			this.s = "";
		}
		this.lensE.write(string.length);
	}
	toUint8Array() {
		const encoder = new Encoder();
		this.sarr.push(this.s);
		this.s = "";
		writeVarString(encoder, this.sarr.join(""));
		writeUint8Array(encoder, this.lensE.toUint8Array());
		return toUint8Array(encoder);
	}
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/error.js
/**
* Error helpers.
*
* @module error
*/
/**
* @param {string} s
* @return {Error}
*/
/* c8 ignore next */
var create$3 = (s) => new Error(s);
/**
* @throws {Error}
* @return {never}
*/
/* c8 ignore next 3 */
var methodUnimplemented = () => {
	throw create$3("Method unimplemented");
};
/**
* @throws {Error}
* @return {never}
*/
/* c8 ignore next 3 */
var unexpectedCase = () => {
	throw create$3("Unexpected case");
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/decoding.js
/**
* Efficient schema-less binary decoding with support for variable length encoding.
*
* Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
*
* Encodes numbers in little-endian order (least to most significant byte order)
* and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
* which is also used in Protocol Buffers.
*
* ```js
* // encoding step
* const encoder = encoding.createEncoder()
* encoding.writeVarUint(encoder, 256)
* encoding.writeVarString(encoder, 'Hello world!')
* const buf = encoding.toUint8Array(encoder)
* ```
*
* ```js
* // decoding step
* const decoder = decoding.createDecoder(buf)
* decoding.readVarUint(decoder) // => 256
* decoding.readVarString(decoder) // => 'Hello world!'
* decoding.hasContent(decoder) // => false - all data is read
* ```
*
* @module decoding
*/
var errorUnexpectedEndOfArray = create$3("Unexpected end of array");
var errorIntegerOutOfRange = create$3("Integer out of Range");
/**
* A Decoder handles the decoding of an Uint8Array.
* @template {ArrayBufferLike} [Buf=ArrayBufferLike]
*/
var Decoder = class {
	/**
	* @param {Uint8Array<Buf>} uint8Array Binary data to decode
	*/
	constructor(uint8Array) {
		/**
		* Decoding target.
		*
		* @type {Uint8Array<Buf>}
		*/
		this.arr = uint8Array;
		/**
		* Current decoding position.
		*
		* @type {number}
		*/
		this.pos = 0;
	}
};
/**
* @function
* @template {ArrayBufferLike} Buf
* @param {Uint8Array<Buf>} uint8Array
* @return {Decoder<Buf>}
*/
var createDecoder = (uint8Array) => new Decoder(uint8Array);
/**
* @function
* @param {Decoder} decoder
* @return {boolean}
*/
var hasContent = (decoder) => decoder.pos !== decoder.arr.length;
/**
* Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
*
* Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
*            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
*
* @function
* @template {ArrayBufferLike} Buf
* @param {Decoder<Buf>} decoder The decoder instance
* @param {number} len The length of bytes to read
* @return {Uint8Array<Buf>}
*/
var readUint8Array = (decoder, len) => {
	const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
	decoder.pos += len;
	return view;
};
/**
* Read variable length Uint8Array.
*
* Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
*            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
*
* @function
* @template {ArrayBufferLike} Buf
* @param {Decoder<Buf>} decoder
* @return {Uint8Array<Buf>}
*/
var readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
/**
* Read one byte as unsigned integer.
* @function
* @param {Decoder} decoder The decoder instance
* @return {number} Unsigned 8-bit integer
*/
var readUint8 = (decoder) => decoder.arr[decoder.pos++];
/**
* Read unsigned integer (32bit) with variable length.
* 1/8th of the storage is used as encoding overhead.
*  * numbers < 2^7 is stored in one bytlength
*  * numbers < 2^14 is stored in two bylength
*
* @function
* @param {Decoder} decoder
* @return {number} An unsigned integer.length
*/
var readVarUint = (decoder) => {
	let num = 0;
	let mult = 1;
	const len = decoder.arr.length;
	while (decoder.pos < len) {
		const r = decoder.arr[decoder.pos++];
		num = num + (r & 127) * mult;
		mult *= 128;
		if (r < 128) return num;
		/* c8 ignore start */
		if (num > MAX_SAFE_INTEGER) throw errorIntegerOutOfRange;
	}
	throw errorUnexpectedEndOfArray;
};
/**
* Read signed integer (32bit) with variable length.
* 1/8th of the storage is used as encoding overhead.
*  * numbers < 2^7 is stored in one bytlength
*  * numbers < 2^14 is stored in two bylength
* @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
*
* @function
* @param {Decoder} decoder
* @return {number} An unsigned integer.length
*/
var readVarInt = (decoder) => {
	let r = decoder.arr[decoder.pos++];
	let num = r & 63;
	let mult = 64;
	const sign = (r & 64) > 0 ? -1 : 1;
	if ((r & 128) === 0) return sign * num;
	const len = decoder.arr.length;
	while (decoder.pos < len) {
		r = decoder.arr[decoder.pos++];
		num = num + (r & 127) * mult;
		mult *= 128;
		if (r < 128) return sign * num;
		/* c8 ignore start */
		if (num > MAX_SAFE_INTEGER) throw errorIntegerOutOfRange;
	}
	throw errorUnexpectedEndOfArray;
};
/**
* We don't test this function anymore as we use native decoding/encoding by default now.
* Better not modify this anymore..
*
* Transforming utf8 to a string is pretty expensive. The code performs 10x better
* when String.fromCodePoint is fed with all characters as arguments.
* But most environments have a maximum number of arguments per functions.
* For effiency reasons we apply a maximum of 10000 characters at once.
*
* @function
* @param {Decoder} decoder
* @return {String} The read String.
*/
/* c8 ignore start */
var _readVarStringPolyfill = (decoder) => {
	let remainingLen = readVarUint(decoder);
	if (remainingLen === 0) return "";
	else {
		let encodedString = String.fromCodePoint(readUint8(decoder));
		if (--remainingLen < 100) while (remainingLen--) encodedString += String.fromCodePoint(readUint8(decoder));
		else while (remainingLen > 0) {
			const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
			const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
			decoder.pos += nextLen;
			encodedString += String.fromCodePoint.apply(null, bytes);
			remainingLen -= nextLen;
		}
		return decodeURIComponent(escape(encodedString));
	}
};
/* c8 ignore stop */
/**
* @function
* @param {Decoder} decoder
* @return {String} The read String
*/
var _readVarStringNative = (decoder) => utf8TextDecoder.decode(readVarUint8Array(decoder));
/**
* Read string of variable length
* * varUint is used to store the length of the string
*
* @function
* @param {Decoder} decoder
* @return {String} The read String
*
*/
/* c8 ignore next */
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
/**
* @param {Decoder} decoder
* @param {number} len
* @return {DataView}
*/
var readFromDataView = (decoder, len) => {
	const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
	decoder.pos += len;
	return dv;
};
/**
* @param {Decoder} decoder
*/
var readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
/**
* @param {Decoder} decoder
*/
var readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
/**
* @param {Decoder} decoder
*/
var readBigInt64 = (decoder) => readFromDataView(decoder, 8).getBigInt64(0, false);
/**
* @type {Array<function(Decoder):any>}
*/
var readAnyLookupTable = [
	(decoder) => void 0,
	(decoder) => null,
	readVarInt,
	readFloat32,
	readFloat64,
	readBigInt64,
	(decoder) => false,
	(decoder) => true,
	readVarString,
	(decoder) => {
		const len = readVarUint(decoder);
		/**
		* @type {Object<string,any>}
		*/
		const obj = {};
		for (let i = 0; i < len; i++) {
			const key = readVarString(decoder);
			obj[key] = readAny(decoder);
		}
		return obj;
	},
	(decoder) => {
		const len = readVarUint(decoder);
		const arr = [];
		for (let i = 0; i < len; i++) arr.push(readAny(decoder));
		return arr;
	},
	readVarUint8Array
];
/**
* @param {Decoder} decoder
*/
var readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);
/**
* T must not be null.
*
* @template T
*/
var RleDecoder = class extends Decoder {
	/**
	* @param {Uint8Array} uint8Array
	* @param {function(Decoder):T} reader
	*/
	constructor(uint8Array, reader) {
		super(uint8Array);
		/**
		* The reader
		*/
		this.reader = reader;
		/**
		* Current state
		* @type {T|null}
		*/
		this.s = null;
		this.count = 0;
	}
	read() {
		if (this.count === 0) {
			this.s = this.reader(this);
			if (hasContent(this)) this.count = readVarUint(this) + 1;
			else this.count = -1;
		}
		this.count--;
		return this.s;
	}
};
var UintOptRleDecoder = class extends Decoder {
	/**
	* @param {Uint8Array} uint8Array
	*/
	constructor(uint8Array) {
		super(uint8Array);
		/**
		* @type {number}
		*/
		this.s = 0;
		this.count = 0;
	}
	read() {
		if (this.count === 0) {
			this.s = readVarInt(this);
			const isNegative = isNegativeZero(this.s);
			this.count = 1;
			if (isNegative) {
				this.s = -this.s;
				this.count = readVarUint(this) + 2;
			}
		}
		this.count--;
		return this.s;
	}
};
var IntDiffOptRleDecoder = class extends Decoder {
	/**
	* @param {Uint8Array} uint8Array
	*/
	constructor(uint8Array) {
		super(uint8Array);
		/**
		* @type {number}
		*/
		this.s = 0;
		this.count = 0;
		this.diff = 0;
	}
	/**
	* @return {number}
	*/
	read() {
		if (this.count === 0) {
			const diff = readVarInt(this);
			const hasCount = diff & 1;
			this.diff = floor(diff / 2);
			this.count = 1;
			if (hasCount) this.count = readVarUint(this) + 2;
		}
		this.s += this.diff;
		this.count--;
		return this.s;
	}
};
var StringDecoder = class {
	/**
	* @param {Uint8Array} uint8Array
	*/
	constructor(uint8Array) {
		this.decoder = new UintOptRleDecoder(uint8Array);
		this.str = readVarString(this.decoder);
		/**
		* @type {number}
		*/
		this.spos = 0;
	}
	/**
	* @return {string}
	*/
	read() {
		const end = this.spos + this.decoder.read();
		const res = this.str.slice(this.spos, end);
		this.spos = end;
		return res;
	}
};
crypto.subtle;
var getRandomValues = crypto.getRandomValues.bind(crypto);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/random.js
var uint32 = () => getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0];
var uuidv4Template = "10000000-1000-4000-8000-100000000000";
/**
* @return {string}
*/
var uuidv4 = () => uuidv4Template.replace(
	/[018]/g,
	/** @param {number} c */
	(c) => (c ^ uint32() & 15 >> c / 4).toString(16)
);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/time.js
/**
* Return current unix time.
*
* @return {number}
*/
var getUnixTime = Date.now;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/promise.js
/**
* @template T
* @callback PromiseResolve
* @param {T|PromiseLike<T>} [result]
*/
/**
* @template T
* @param {function(PromiseResolve<T>,function(Error):void):any} f
* @return {Promise<T>}
*/
var create$2 = (f) => new Promise(f);
Promise.all.bind(Promise);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/conditions.js
/**
* Often used conditions.
*
* @module conditions
*/
/**
* @template T
* @param {T|null|undefined} v
* @return {T|null}
*/
/* c8 ignore next */
var undefinedToNull = (v) => v === void 0 ? null : v;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/storage.js
/**
* Isomorphic variable storage.
*
* Uses LocalStorage in the browser and falls back to in-memory storage.
*
* @module storage
*/
/* c8 ignore start */
var VarStoragePolyfill = class {
	constructor() {
		this.map = /* @__PURE__ */ new Map();
	}
	/**
	* @param {string} key
	* @param {any} newValue
	*/
	setItem(key, newValue) {
		this.map.set(key, newValue);
	}
	/**
	* @param {string} key
	*/
	getItem(key) {
		return this.map.get(key);
	}
};
/* c8 ignore stop */
/**
* @type {any}
*/
var _localStorage = new VarStoragePolyfill();
var usePolyfill = true;
/* c8 ignore start */
try {
	if (typeof localStorage !== "undefined" && localStorage) {
		_localStorage = localStorage;
		usePolyfill = false;
	}
} catch (e) {}
/* c8 ignore stop */
/**
* This is basically localStorage in browser, or a polyfill in nodejs
*/
/* c8 ignore next */
var varStorage = _localStorage;
/**
* A polyfill for `addEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
*
* @param {function({ key: string, newValue: string, oldValue: string }): void} eventHandler
* @function
*/
/* c8 ignore next */
var onChange = (eventHandler) => usePolyfill || addEventListener("storage", eventHandler);
/**
* A polyfill for `removeEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
*
* @param {function({ key: string, newValue: string, oldValue: string }): void} eventHandler
* @function
*/
/* c8 ignore next */
var offChange = (eventHandler) => usePolyfill || removeEventListener("storage", eventHandler);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/trait/equality.js
var EqualityTraitSymbol = Symbol("Equality");
/**
* @typedef {{ [EqualityTraitSymbol]:(other:EqualityTrait)=>boolean }} EqualityTrait
*/
/**
*
* Utility function to compare any two objects.
*
* Note that it is expected that the first parameter is more specific than the latter one.
*
* @example js
*     class X { [traits.EqualityTraitSymbol] (other) { return other === this }  }
*     class X2 { [traits.EqualityTraitSymbol] (other) { return other === this }, x2 () { return 2 }  }
*     // this is fine
*     traits.equals(new X2(), new X())
*     // this is not, because the left type is less specific than the right one
*     traits.equals(new X(), new X2())
*
* @template {EqualityTrait} T
* @param {NoInfer<T>} a
* @param {T} b
* @return {boolean}
*/
var equals = (a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/object.js
/**
* @param {any} o
* @return {o is { [k:string]:any }}
*/
var isObject$1 = (o) => typeof o === "object";
/**
* Object.assign
*/
var assign = Object.assign;
/**
* @param {Object<string,any>} obj
*/
var keys = Object.keys;
/**
* @template V
* @param {{[k:string]:V}} obj
* @param {function(V,string):any} f
*/
var forEach = (obj, f) => {
	for (const key in obj) f(obj[key], key);
};
/**
* @todo implement mapToArray & map
*
* @template R
* @param {Object<string,any>} obj
* @param {function(any,string):R} f
* @return {Array<R>}
*/
var map = (obj, f) => {
	const results = [];
	for (const key in obj) results.push(f(obj[key], key));
	return results;
};
/**
* @param {Object<string,any>} obj
* @return {number}
*/
var size = (obj) => keys(obj).length;
/**
* @param {Object|null|undefined} obj
*/
var isEmpty = (obj) => {
	for (const _k in obj) return false;
	return true;
};
/**
* @template {{ [key:string|number|symbol]: any }} T
* @param {T} obj
* @param {(v:T[keyof T],k:keyof T)=>boolean} f
* @return {boolean}
*/
var every = (obj, f) => {
	for (const key in obj) if (!f(obj[key], key)) return false;
	return true;
};
/**
* Calls `Object.prototype.hasOwnProperty`.
*
* @param {any} obj
* @param {string|number|symbol} key
* @return {boolean}
*/
var hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
/**
* @param {Object<string,any>} a
* @param {Object<string,any>} b
* @return {boolean}
*/
var equalFlat = (a, b) => a === b || size(a) === size(b) && every(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val));
/**
* Make an object immutable. This hurts performance and is usually not needed if you perform good
* coding practices.
*/
var freeze = Object.freeze;
/**
* Make an object and all its children immutable.
* This *really* hurts performance and is usually not needed if you perform good coding practices.
*
* @template {any} T
* @param {T} o
* @return {Readonly<T>}
*/
var deepFreeze = (o) => {
	for (const key in o) {
		const c = o[key];
		if (typeof c === "object" || typeof c === "function") deepFreeze(o[key]);
	}
	return freeze(o);
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/function.js
/**
* Calls all functions in `fs` with args. Only throws after all functions were called.
*
* @param {Array<function>} fs
* @param {Array<any>} args
*/
var callAll = (fs, args, i = 0) => {
	try {
		for (; i < fs.length; i++) fs[i](...args);
	} finally {
		if (i < fs.length) callAll(fs, args, i + 1);
	}
};
/**
* @template A
*
* @param {A} a
* @return {A}
*/
var id = (a) => a;
/* c8 ignore start */
/**
* @param {any} a
* @param {any} b
* @return {boolean}
*/
var equalityDeep = (a, b) => {
	if (a === b) return true;
	if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) return false;
	if (a[EqualityTraitSymbol] != null) return a[EqualityTraitSymbol](b);
	switch (a.constructor) {
		case ArrayBuffer:
			a = new Uint8Array(a);
			b = new Uint8Array(b);
		case Uint8Array:
			if (a.byteLength !== b.byteLength) return false;
			for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
			break;
		case Set:
			if (a.size !== b.size) return false;
			for (const value of a) if (!b.has(value)) return false;
			break;
		case Map:
			if (a.size !== b.size) return false;
			for (const key of a.keys()) if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) return false;
			break;
		case void 0:
		case Object:
			if (size(a) !== size(b)) return false;
			for (const key in a) if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) return false;
			break;
		case Array:
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) if (!equalityDeep(a[i], b[i])) return false;
			break;
		default: return false;
	}
	return true;
};
/**
* @template V
* @template {V} OPTS
*
* @param {V} value
* @param {Array<OPTS>} options
*/
var isOneOf = (value, options) => options.includes(value);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/environment.js
/**
* Isomorphic module to work access the environment (query params, env variables).
*
* @module environment
*/
/* c8 ignore next 2 */
var isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
/* c8 ignore next */
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && !isNode;
typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
/**
* @type {Map<string,string>}
*/
var params$1;
var args = [];
/* c8 ignore start */
var computeParams = () => {
	if (params$1 === void 0) {
		if (isNode) {
			params$1 = create$5();
			const pargs = process.argv;
			let currParamName = null;
			for (let i = 0; i < pargs.length; i++) {
				const parg = pargs[i];
				if (parg[0] === "-") {
					if (currParamName !== null) params$1.set(currParamName, "");
					currParamName = parg;
				} else if (currParamName !== null) {
					params$1.set(currParamName, parg);
					currParamName = null;
				} else args.push(parg);
			}
			if (currParamName !== null) params$1.set(currParamName, "");
		} else if (typeof location === "object") {
			params$1 = create$5();
			(location.search || "?").slice(1).split("&").forEach((kv) => {
				if (kv.length !== 0) {
					const [key, value] = kv.split("=");
					params$1.set(`--${fromCamelCase(key, "-")}`, value);
					params$1.set(`-${fromCamelCase(key, "-")}`, value);
				}
			});
		} else params$1 = create$5();
	}
	return params$1;
};
/* c8 ignore stop */
/**
* @param {string} name
* @return {boolean}
*/
/* c8 ignore next */
var hasParam = (name) => computeParams().has(name);
/**
* @param {string} name
* @return {string|null}
*/
/* c8 ignore next 4 */
var getVariable = (name) => isNode ? undefinedToNull({}[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
/**
* @param {string} name
* @return {boolean}
*/
/* c8 ignore next 2 */
var hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
/* c8 ignore next */
var production = hasConf("production");
/* c8 ignore start */
/**
* Color is enabled by default if the terminal supports it.
*
* Explicitly enable color using `--color` parameter
* Disable color using `--no-color` parameter or using `NO_COLOR=1` environment variable.
* `FORCE_COLOR=1` enables color and takes precedence over all.
*/
var supportsColor = isNode && isOneOf({}.FORCE_COLOR, [
	"true",
	"1",
	"2"
]) || !hasParam("--no-colors") && !hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/buffer.js
/**
* Utility functions to work with buffers (Uint8Array).
*
* @module buffer
*/
/**
* @param {number} len
*/
var createUint8ArrayFromLen = (len) => new Uint8Array(len);
/**
* Create Uint8Array with initial content from buffer
*
* @param {ArrayBuffer} buffer
* @param {number} byteOffset
* @param {number} length
*/
var createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);
/**
* Create Uint8Array with initial content from buffer
*
* @param {ArrayBuffer} buffer
*/
var createUint8ArrayFromArrayBuffer = (buffer) => new Uint8Array(buffer);
/* c8 ignore start */
/**
* @param {Uint8Array} bytes
* @return {string}
*/
var toBase64Browser = (bytes) => {
	let s = "";
	for (let i = 0; i < bytes.byteLength; i++) s += fromCharCode(bytes[i]);
	return btoa(s);
};
/* c8 ignore stop */
/**
* @param {Uint8Array} bytes
* @return {string}
*/
var toBase64Node = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
/* c8 ignore start */
/**
* @param {string} s
* @return {Uint8Array<ArrayBuffer>}
*/
var fromBase64Browser = (s) => {
	const a = atob(s);
	const bytes = createUint8ArrayFromLen(a.length);
	for (let i = 0; i < a.length; i++) bytes[i] = a.charCodeAt(i);
	return bytes;
};
/* c8 ignore stop */
/**
* @param {string} s
*/
var fromBase64Node = (s) => {
	const buf = Buffer.from(s, "base64");
	return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength);
};
/* c8 ignore next */
var toBase64 = isBrowser ? toBase64Browser : toBase64Node;
/* c8 ignore next */
var fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;
/**
* Copy the content of an Uint8Array view to a new ArrayBuffer.
*
* @param {Uint8Array} uint8Array
* @return {Uint8Array}
*/
var copyUint8Array = (uint8Array) => {
	const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
	newBuf.set(uint8Array);
	return newBuf;
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/pair.js
/**
* Working with value pairs.
*
* @module pair
*/
/**
* @template L,R
*/
var Pair = class {
	/**
	* @param {L} left
	* @param {R} right
	*/
	constructor(left, right) {
		this.left = left;
		this.right = right;
	}
};
/**
* @template L,R
* @param {L} left
* @param {R} right
* @return {Pair<L,R>}
*/
var create$1 = (left, right) => new Pair(left, right);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/prng.js
/**
* Generates a single random bool.
*
* @param {PRNG} gen A random number generator.
* @return {Boolean} A random boolean
*/
var bool = (gen) => gen.next() >= .5;
/**
* Generates a random integer with 53 bit resolution.
*
* @param {PRNG} gen A random number generator.
* @param {Number} min The lower bound of the allowed return values (inclusive).
* @param {Number} max The upper bound of the allowed return values (inclusive).
* @return {Number} A random integer on [min, max]
*/
var int53 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);
/**
* Generates a random integer with 32 bit resolution.
*
* @param {PRNG} gen A random number generator.
* @param {Number} min The lower bound of the allowed return values (inclusive).
* @param {Number} max The upper bound of the allowed return values (inclusive).
* @return {Number} A random integer on [min, max]
*/
var int32 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);
/**
* @deprecated
* Optimized version of prng.int32. It has the same precision as prng.int32, but should be preferred when
* openaring on smaller ranges.
*
* @param {PRNG} gen A random number generator.
* @param {Number} min The lower bound of the allowed return values (inclusive).
* @param {Number} max The upper bound of the allowed return values (inclusive). The max inclusive number is `binary.BITS31-1`
* @return {Number} A random integer on [min, max]
*/
var int31 = (gen, min, max) => int32(gen, min, max);
/**
* @param {PRNG} gen
* @return {string} A single letter (a-z)
*/
var letter = (gen) => fromCharCode(int31(gen, 97, 122));
/**
* @param {PRNG} gen
* @param {number} [minLen=0]
* @param {number} [maxLen=20]
* @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
*/
var word = (gen, minLen = 0, maxLen = 20) => {
	const len = int31(gen, minLen, maxLen);
	let str = "";
	for (let i = 0; i < len; i++) str += letter(gen);
	return str;
};
/**
* Returns one element of a given array.
*
* @param {PRNG} gen A random number generator.
* @param {Array<T>} array Non empty Array of possible values.
* @return {T} One of the values of the supplied Array.
* @template T
*/
var oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/schema.js
/**
* @experimental WIP
*
* Simple & efficient schemas for your data.
*/
/**
* @typedef {string|number|bigint|boolean|null|undefined|symbol} Primitive
*/
/**
* @typedef {{ [k:string|number|symbol]: any }} AnyObject
*/
/**
* @template T
* @typedef {T extends Schema<infer X> ? X : T} Unwrap
*/
/**
* @template T
* @typedef {T extends Schema<infer X> ? X : T} TypeOf
*/
/**
* @template {readonly unknown[]} T
* @typedef {T extends readonly [Schema<infer First>, ...infer Rest] ? [First, ...UnwrapArray<Rest>] : [] } UnwrapArray
*/
/**
* @template T
* @typedef {T extends Schema<infer S> ? Schema<S> : never} CastToSchema
*/
/**
* @template {unknown[]} Arr
* @typedef {Arr extends [...unknown[], infer L] ? L : never} TupleLast
*/
/**
* @template {unknown[]} Arr
* @typedef {Arr extends [...infer Fs, unknown] ? Fs : never} TuplePop
*/
/**
* @template {readonly unknown[]} T
* @typedef {T extends []
*   ? {}
*   : T extends [infer First]
*   ? First
*   : T extends [infer First, ...infer Rest]
*   ? First & Intersect<Rest>
*   : never
* } Intersect
*/
var schemaSymbol = Symbol("0schema");
var ValidationError = class {
	constructor() {
		/**
		* Reverse errors
		* @type {Array<{ path: string?, expected: string, has: string, message: string? }>}
		*/
		this._rerrs = [];
	}
	/**
	* @param {string?} path
	* @param {string} expected
	* @param {string} has
	* @param {string?} message
	*/
	extend(path, expected, has, message = null) {
		this._rerrs.push({
			path,
			expected,
			has,
			message
		});
	}
	toString() {
		const s = [];
		for (let i = this._rerrs.length - 1; i > 0; i--) {
			const r = this._rerrs[i];
			/* c8 ignore next */
			s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
		}
		return s.join("\n");
	}
};
/**
* @param {any} a
* @param {any} b
* @return {boolean}
*/
var shapeExtends = (a, b) => {
	if (a === b) return true;
	if (a == null || b == null || a.constructor !== b.constructor) return false;
	if (a[EqualityTraitSymbol]) return equals(a, b);
	if (isArray(a)) return every$1(a, (aitem) => some(b, (bitem) => shapeExtends(aitem, bitem)));
	else if (isObject$1(a)) return every(a, (aitem, akey) => shapeExtends(aitem, b[akey]));
	/* c8 ignore next */
	return false;
};
/**
* @template T
* @implements {equalityTraits.EqualityTrait}
*/
var Schema = class {
	/**
	* If true, the more things are added to the shape the more objects this schema will accept (e.g.
	* union). By default, the more objects are added, the the fewer objects this schema will accept.
	* @protected
	*/
	static _dilutes = false;
	/**
	* @param {Schema<any>} other
	*/
	extends(other) {
		let [a, b] = [this.shape, other.shape];
		if (this.constructor._dilutes) [b, a] = [a, b];
		return shapeExtends(a, b);
	}
	/**
	* Overwrite this when necessary. By default, we only check the `shape` property which every shape
	* should have.
	* @param {Schema<any>} other
	*/
	equals(other) {
		return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
	}
	[schemaSymbol]() {
		return true;
	}
	/**
	* @param {object} other
	*/
	[EqualityTraitSymbol](other) {
		return this.equals(other);
	}
	/**
	* Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
	* Schema. Validate will check the structure of the parameter and return true iff the instance
	* really is an instance of Schema.
	*
	* @param {T} o
	* @return {boolean}
	*/
	validate(o) {
		return this.check(o);
	}
	/* c8 ignore start */
	/**
	* Similar to validate, but this method accepts untyped parameters.
	*
	* @param {any} _o
	* @param {ValidationError} [_err]
	* @return {_o is T}
	*/
	check(_o, _err) {
		methodUnimplemented();
	}
	/* c8 ignore stop */
	/**
	* @type {Schema<T?>}
	*/
	get nullable() {
		return $union(this, $null);
	}
	/**
	* @type {$Optional<Schema<T>>}
	*/
	get optional() {
		return new $Optional(this);
	}
	/**
	* Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
	* Use this if you know that the type is of a specific type and you just want to convince the type
	* system.
	*
	* **Do not rely on these error messages!**
	* Performs an assertion check only if not in a production environment.
	*
	* @template OO
	* @param {OO} o
	* @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
	*/
	cast(o) {
		assert(o, this);
		return o;
	}
	/**
	* EXPECTO PATRONUM!! 🪄
	* This function protects against type errors. Though it may not work in the real world.
	*
	* "After all this time?"
	* "Always." - Snape, talking about type safety
	*
	* Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
	* Use this if you know that the type is of a specific type and you just want to convince the type
	* system.
	*
	* Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
	*
	* **Do not rely on these error messages!**
	* Performs an assertion check if not in a production environment.
	*
	* @param {T} o
	* @return {o extends T ? T : never}
	*/
	expect(o) {
		assert(o, this);
		return o;
	}
};
/**
* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} Constr
* @typedef {Constr extends ((...args:any[]) => infer T) ? T : (Constr extends (new (...args:any[]) => any) ? InstanceType<Constr> : never)} Instance
*/
/**
* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} C
* @extends {Schema<Instance<C>>}
*/
var $ConstructedBy = class extends Schema {
	/**
	* @param {C} c
	* @param {((o:Instance<C>)=>boolean)|null} check
	*/
	constructor(c, check) {
		super();
		this.shape = c;
		this._c = check;
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
	*/
	check(o, err = void 0) {
		const c = o?.constructor === this.shape && (this._c == null || this._c(o));
		/* c8 ignore next */
		!c && err?.extend(null, this.shape.name, o?.constructor.name, o?.constructor !== this.shape ? "Constructor match failed" : "Check failed");
		return c;
	}
};
/**
* @template {(new (...args:any[]) => any) | ((...args:any[]) => any)} C
* @param {C} c
* @param {((o:Instance<C>) => boolean)|null} check
* @return {CastToSchema<$ConstructedBy<C>>}
*/
var $constructedBy = (c, check = null) => new $ConstructedBy(c, check);
$constructedBy($ConstructedBy);
/**
* Check custom properties on any object. You may want to overwrite the generated Schema<any>.
*
* @extends {Schema<any>}
*/
var $Custom = class extends Schema {
	/**
	* @param {(o:any) => boolean} check
	*/
	constructor(check) {
		super();
		/**
		* @type {(o:any) => boolean}
		*/
		this.shape = check;
	}
	/**
	* @param {any} o
	* @param {ValidationError} err
	* @return {o is any}
	*/
	check(o, err) {
		const c = this.shape(o);
		/* c8 ignore next */
		!c && err?.extend(null, "custom prop", o?.constructor.name, "failed to check custom prop");
		return c;
	}
};
/**
* @param {(o:any) => boolean} check
* @return {Schema<any>}
*/
var $custom = (check) => new $Custom(check);
$constructedBy($Custom);
/**
* @template {Primitive} T
* @extends {Schema<T>}
*/
var $Literal = class extends Schema {
	/**
	* @param {Array<T>} literals
	*/
	constructor(literals) {
		super();
		this.shape = literals;
	}
	/**
	*
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is T}
	*/
	check(o, err) {
		const c = this.shape.some((a) => a === o);
		/* c8 ignore next */
		!c && err?.extend(null, this.shape.join(" | "), o.toString());
		return c;
	}
};
/**
* @template {Primitive[]} T
* @param {T} literals
* @return {CastToSchema<$Literal<T[number]>>}
*/
var $literal = (...literals) => new $Literal(literals);
var $$literal = $constructedBy($Literal);
/**
* @template {Array<string|Schema<string|number>>} Ts
* @typedef {Ts extends [] ? `` : (Ts extends [infer T] ? (Unwrap<T> extends (string|number) ? Unwrap<T> : never) : (Ts extends [infer T1, ...infer Rest] ? `${Unwrap<T1> extends (string|number) ? Unwrap<T1> : never}${Rest extends Array<string|Schema<string|number>> ? CastStringTemplateArgsToTemplate<Rest> : never}` : never))} CastStringTemplateArgsToTemplate
*/
/**
* @param {string} str
* @return {string}
*/
var _regexEscape = RegExp.escape || ((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s));
/**
* @param {string|Schema<any>} s
* @return {string[]}
*/
var _schemaStringTemplateToRegex = (s) => {
	if ($string.check(s)) return [_regexEscape(s)];
	if ($$literal.check(s)) return s.shape.map((v) => v + "");
	if ($$number.check(s)) return ["[+-]?\\d+.?\\d*"];
	if ($$string.check(s)) return [".*"];
	if ($$union.check(s)) return s.shape.map(_schemaStringTemplateToRegex).flat(1);
	/* c8 ignore next 2 */
	unexpectedCase();
};
/**
* @template {Array<string|Schema<string|number>>} T
* @extends {Schema<CastStringTemplateArgsToTemplate<T>>}
*/
var $StringTemplate = class extends Schema {
	/**
	* @param {T} shape
	*/
	constructor(shape) {
		super();
		this.shape = shape;
		this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is CastStringTemplateArgsToTemplate<T>}
	*/
	check(o, err) {
		const c = this._r.exec(o) != null;
		/* c8 ignore next */
		!c && err?.extend(null, this._r.toString(), o.toString(), "String doesn't match string template.");
		return c;
	}
};
$constructedBy($StringTemplate);
var isOptionalSymbol = Symbol("optional");
/**
* @template {Schema<any>} S
* @extends Schema<Unwrap<S>|undefined>
*/
var $Optional = class extends Schema {
	/**
	* @param {S} shape
	*/
	constructor(shape) {
		super();
		this.shape = shape;
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is (Unwrap<S>|undefined)}
	*/
	check(o, err) {
		const c = o === void 0 || this.shape.check(o);
		/* c8 ignore next */
		!c && err?.extend(null, "undefined (optional)", "()");
		return c;
	}
	get [isOptionalSymbol]() {
		return true;
	}
};
var $$optional = $constructedBy($Optional);
/**
* @extends Schema<never>
*/
var $Never = class extends Schema {
	/**
	* @param {any} _o
	* @param {ValidationError} [err]
	* @return {_o is never}
	*/
	check(_o, err) {
		/* c8 ignore next */
		err?.extend(null, "never", typeof _o);
		return false;
	}
};
new $Never();
$constructedBy($Never);
/**
* @template {{ [key: string|symbol|number]: Schema<any> }} S
* @typedef {{ [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? Key : never]?: S[Key] extends $Optional<Schema<infer Type>> ? Type : never } & { [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? never : Key]: S[Key] extends Schema<infer Type> ? Type : never }} $ObjectToType
*/
/**
* @template {{[key:string|symbol|number]: Schema<any>}} S
* @extends {Schema<$ObjectToType<S>>}
*/
var $Object = class $Object extends Schema {
	/**
	* @param {S} shape
	* @param {boolean} partial
	*/
	constructor(shape, partial = false) {
		super();
		/**
		* @type {S}
		*/
		this.shape = shape;
		this._isPartial = partial;
	}
	static _dilutes = true;
	/**
	* @type {Schema<Partial<$ObjectToType<S>>>}
	*/
	get partial() {
		return new $Object(this.shape, true);
	}
	/**
	* @param {any} o
	* @param {ValidationError} err
	* @return {o is $ObjectToType<S>}
	*/
	check(o, err) {
		if (o == null) {
			/* c8 ignore next */
			err?.extend(null, "object", "null");
			return false;
		}
		return every(this.shape, (vv, vk) => {
			const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
			!c && err?.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match");
			return c;
		});
	}
};
/**
* @template S
* @typedef {Schema<{ [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? Key : never]?: S[Key] extends $Optional<Schema<infer Type>> ? Type : never } & { [Key in keyof S as S[Key] extends $Optional<Schema<any>> ? never : Key]: S[Key] extends Schema<infer Type> ? Type : never }>} _ObjectDefToSchema
*/
/**
* @template {{ [key:string|symbol|number]: Schema<any> }} S
* @param {S} def
* @return {_ObjectDefToSchema<S> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never}
*/
var $object = (def) => new $Object(def);
var $$object = $constructedBy($Object);
/**
* @type {Schema<{[key:string]: any}>}
*/
var $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
/**
* @template {Schema<string|number|symbol>} Keys
* @template {Schema<any>} Values
* @extends {Schema<{ [key in Unwrap<Keys>]: Unwrap<Values> }>}
*/
var $Record = class extends Schema {
	/**
	* @param {Keys} keys
	* @param {Values} values
	*/
	constructor(keys, values) {
		super();
		this.shape = {
			keys,
			values
		};
	}
	/**
	* @param {any} o
	* @param {ValidationError} err
	* @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
	*/
	check(o, err) {
		return o != null && every(o, (vv, vk) => {
			const ck = this.shape.keys.check(vk, err);
			/* c8 ignore next */
			!ck && err?.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value");
			return ck && this.shape.values.check(vv, err);
		});
	}
};
/**
* @template {Schema<string|number|symbol>} Keys
* @template {Schema<any>} Values
* @param {Keys} keys
* @param {Values} values
* @return {CastToSchema<$Record<Keys,Values>>}
*/
var $record = (keys, values) => new $Record(keys, values);
var $$record = $constructedBy($Record);
/**
* @template {Schema<any>[]} S
* @extends {Schema<{ [Key in keyof S]: S[Key] extends Schema<infer Type> ? Type : never }>}
*/
var $Tuple = class extends Schema {
	/**
	* @param {S} shape
	*/
	constructor(shape) {
		super();
		this.shape = shape;
	}
	/**
	* @param {any} o
	* @param {ValidationError} err
	* @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
	*/
	check(o, err) {
		return o != null && every(this.shape, (vv, vk) => {
			const c = vv.check(o[vk], err);
			/* c8 ignore next */
			!c && err?.extend(vk.toString(), "Tuple", typeof vv);
			return c;
		});
	}
};
/**
* @template {Array<Schema<any>>} T
* @param {T} def
* @return {CastToSchema<$Tuple<T>>}
*/
var $tuple = (...def) => new $Tuple(def);
$constructedBy($Tuple);
/**
* @template {Schema<any>} S
* @extends {Schema<Array<S extends Schema<infer T> ? T : never>>}
*/
var $Array = class extends Schema {
	/**
	* @param {Array<S>} v
	*/
	constructor(v) {
		super();
		/**
		* @type {Schema<S extends Schema<infer T> ? T : never>}
		*/
		this.shape = v.length === 1 ? v[0] : new $Union(v);
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is Array<S extends Schema<infer T> ? T : never>} o
	*/
	check(o, err) {
		const c = isArray(o) && every$1(o, (oi) => this.shape.check(oi));
		/* c8 ignore next */
		!c && err?.extend(null, "Array", "");
		return c;
	}
};
/**
* @template {Array<Schema<any>>} T
* @param {T} def
* @return {Schema<Array<T extends Array<Schema<infer S>> ? S : never>>}
*/
var $array = (...def) => new $Array(def);
var $$array = $constructedBy($Array);
/**
* @type {Schema<Array<any>>}
*/
var $arrayAny = $custom((o) => isArray(o));
/**
* @template T
* @extends {Schema<T>}
*/
var $InstanceOf = class extends Schema {
	/**
	* @param {new (...args:any) => T} constructor
	* @param {((o:T) => boolean)|null} check
	*/
	constructor(constructor, check) {
		super();
		this.shape = constructor;
		this._c = check;
	}
	/**
	* @param {any} o
	* @param {ValidationError} err
	* @return {o is T}
	*/
	check(o, err) {
		const c = o instanceof this.shape && (this._c == null || this._c(o));
		/* c8 ignore next */
		!c && err?.extend(null, this.shape.name, o?.constructor.name);
		return c;
	}
};
/**
* @template T
* @param {new (...args:any) => T} c
* @param {((o:T) => boolean)|null} check
* @return {Schema<T>}
*/
var $instanceOf = (c, check = null) => new $InstanceOf(c, check);
$constructedBy($InstanceOf);
var $$schema = $instanceOf(Schema);
/**
* @template {Schema<any>[]} Args
* @typedef {(...args:UnwrapArray<TuplePop<Args>>)=>Unwrap<TupleLast<Args>>} _LArgsToLambdaDef
*/
/**
* @template {Array<Schema<any>>} Args
* @extends {Schema<_LArgsToLambdaDef<Args>>}
*/
var $Lambda = class extends Schema {
	/**
	* @param {Args} args
	*/
	constructor(args) {
		super();
		this.len = args.length - 1;
		this.args = $tuple(...args.slice(-1));
		this.res = args[this.len];
	}
	/**
	* @param {any} f
	* @param {ValidationError} err
	* @return {f is _LArgsToLambdaDef<Args>}
	*/
	check(f, err) {
		const c = f.constructor === Function && f.length <= this.len;
		/* c8 ignore next */
		!c && err?.extend(null, "function", typeof f);
		return c;
	}
};
var $$lambda = $constructedBy($Lambda);
/**
* @type {Schema<Function>}
*/
var $function = $custom((o) => typeof o === "function");
/**
* @template {Array<Schema<any>>} T
* @extends {Schema<Intersect<UnwrapArray<T>>>}
*/
var $Intersection = class extends Schema {
	/**
	* @param {T} v
	*/
	constructor(v) {
		super();
		/**
		* @type {T}
		*/
		this.shape = v;
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is Intersect<UnwrapArray<T>>}
	*/
	check(o, err) {
		const c = every$1(this.shape, (check) => check.check(o, err));
		/* c8 ignore next */
		!c && err?.extend(null, "Intersectinon", typeof o);
		return c;
	}
};
$constructedBy($Intersection, (o) => o.shape.length > 0);
/**
* @template S
* @extends {Schema<S>}
*/
var $Union = class extends Schema {
	static _dilutes = true;
	/**
	* @param {Array<Schema<S>>} v
	*/
	constructor(v) {
		super();
		this.shape = v;
	}
	/**
	* @param {any} o
	* @param {ValidationError} [err]
	* @return {o is S}
	*/
	check(o, err) {
		const c = some(this.shape, (vv) => vv.check(o, err));
		err?.extend(null, "Union", typeof o);
		return c;
	}
};
/**
* @template {Array<any>} T
* @param {T} schemas
* @return {CastToSchema<$Union<Unwrap<ReadSchema<T>>>>}
*/
var $union = (...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas);
var $$union = $constructedBy($Union);
var _t = () => true;
/**
* @type {Schema<any>}
*/
var $any = $custom(_t);
var $$any = $constructedBy($Custom, (o) => o.shape === _t);
/**
* @type {Schema<bigint>}
*/
var $bigint = $custom((o) => typeof o === "bigint");
var $$bigint = $custom((o) => o === $bigint);
/**
* @type {Schema<symbol>}
*/
var $symbol = $custom((o) => typeof o === "symbol");
$custom((o) => o === $symbol);
/**
* @type {Schema<number>}
*/
var $number = $custom((o) => typeof o === "number");
var $$number = $custom((o) => o === $number);
/**
* @type {Schema<string>}
*/
var $string = $custom((o) => typeof o === "string");
var $$string = $custom((o) => o === $string);
/**
* @type {Schema<boolean>}
*/
var $boolean = $custom((o) => typeof o === "boolean");
var $$boolean = $custom((o) => o === $boolean);
/**
* @type {Schema<undefined>}
*/
var $undefined = $literal(void 0);
$constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0);
$literal(void 0);
var $null = $literal(null);
var $$null = $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null);
$constructedBy(Uint8Array);
$constructedBy($ConstructedBy, (o) => o.shape === Uint8Array);
/**
* @type {Schema<Primitive>}
*/
var $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
(() => {
	const $jsonArr = $array($any);
	const $jsonRecord = $record($string, $any);
	const $json = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
	$jsonArr.shape = $json;
	$jsonRecord.shape.values = $json;
	return $json;
})();
/**
* @template {any} IN
* @typedef {IN extends Schema<any> ? IN
*   : (IN extends string|number|boolean|null ? Schema<IN>
*     : (IN extends new (...args:any[])=>any ? Schema<InstanceType<IN>>
*       : (IN extends any[] ? Schema<{ [K in keyof IN]: Unwrap<ReadSchema<IN[K]>> }[number]>
*       : (IN extends object ? (_ObjectDefToSchema<{[K in keyof IN]:ReadSchema<IN[K]>}> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never)
*         : never)
*         )
*       )
*     )
* } ReadSchemaOld
*/
/**
* @template {any} IN
* @typedef {[Extract<IN,Schema<any>>,Extract<IN,string|number|boolean|null>,Extract<IN,new (...args:any[])=>any>,Extract<IN,any[]>,Extract<Exclude<IN,Schema<any>|string|number|boolean|null|(new (...args:any[])=>any)|any[]>,object>] extends [infer Schemas, infer Primitives, infer Constructors, infer Arrs, infer Obj]
*   ? Schema<
*       (Schemas extends Schema<infer S> ? S : never)
*     | Primitives
*     | (Constructors extends new (...args:any[])=>any ? InstanceType<Constructors> : never)
*     | (Arrs extends any[] ? { [K in keyof Arrs]: Unwrap<ReadSchema<Arrs[K]>> }[number] : never)
*     | (Obj extends object ? Unwrap<(_ObjectDefToSchema<{[K in keyof Obj]:ReadSchema<Obj[K]>}> extends Schema<infer S> ? Schema<{ [K in keyof S]: S[K] }> : never)> : never)>
*   : never
* } ReadSchema
*/
/**
* @typedef {ReadSchema<{x:42}|{y:99}|Schema<string>|[1,2,{}]>} Q
*/
/**
* @template IN
* @param {IN} o
* @return {ReadSchema<IN>}
*/
var $ = (o) => {
	if ($$schema.check(o)) return o;
	else if ($objectAny.check(o)) {
		/**
		* @type {any}
		*/
		const o2 = {};
		for (const k in o) o2[k] = $(o[k]);
		return $object(o2);
	} else if ($arrayAny.check(o)) return $union(...o.map($));
	else if ($primitive.check(o)) return $literal(o);
	else if ($function.check(o)) return $constructedBy(o);
	/* c8 ignore next */
	unexpectedCase();
};
/* c8 ignore start */
/**
* Assert that a variable is of this specific type.
* The assertion check is only performed in non-production environments.
*
* @type {<T>(o:any,schema:Schema<T>) => asserts o is T}
*/
var assert = production ? () => {} : (o, schema) => {
	const err = new ValidationError();
	if (!schema.check(o, err)) throw create$3(`Expected value to be of type ${schema.constructor.name}.\n${err.toString()}`);
};
/* c8 ignore end */
/**
* @template In
* @template Out
* @typedef {{ if: Schema<In>, h: (o:In,state?:any)=>Out }} Pattern
*/
/**
* @template {Pattern<any,any>} P
* @template In
* @typedef {ReturnType<Extract<P,Pattern<In extends number ? number : (In extends string ? string : In),any>>['h']>} PatternMatchResult
*/
/**
* @todo move this to separate library
* @template {any} [State=undefined]
* @template {Pattern<any,any>} [Patterns=never]
*/
var PatternMatcher = class {
	/**
	* @param {Schema<State>} [$state]
	*/
	constructor($state) {
		/**
		* @type {Array<Patterns>}
		*/
		this.patterns = [];
		this.$state = $state;
	}
	/**
	* @template P
	* @template R
	* @param {P} pattern
	* @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
	* @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
	*/
	if(pattern, handler) {
		this.patterns.push({
			if: $(pattern),
			h: handler
		});
		return this;
	}
	/**
	* @template R
	* @param {(o:any,s:State)=>R} h
	*/
	else(h) {
		return this.if($any, h);
	}
	/**
	* @return {State extends undefined
	*   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
	*   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
	*/
	done() {
		return (o, s) => {
			for (let i = 0; i < this.patterns.length; i++) {
				const p = this.patterns[i];
				if (p.if.check(o)) return p.h(o, s);
			}
			throw create$3("Unhandled pattern");
		};
	}
};
/**
* @template [State=undefined]
* @param {State} [state]
* @return {PatternMatcher<State extends undefined ? undefined : Unwrap<ReadSchema<State>>>}
*/
var match = (state) => new PatternMatcher(state);
/**
* Helper function to generate a (non-exhaustive) sample set from a gives schema.
*
* @type {<T>(o:T,gen:prng.PRNG)=>T}
*/
var _random = match($any).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
	/**
	* @type {any}
	*/
	const res = {};
	for (const k in o.shape) {
		let prop = o.shape[k];
		if ($$optional.check(prop)) {
			if (bool(gen)) continue;
			prop = prop.shape;
		}
		res[k] = _random(prop, gen);
	}
	return res;
}).if($$array, (o, gen) => {
	const arr = [];
	const n = int32(gen, 0, 42);
	for (let i = 0; i < n; i++) arr.push(random(gen, o.shape));
	return arr;
}).if($$literal, (o, gen) => {
	return oneOf(gen, o.shape);
}).if($$null, (o, gen) => {
	return null;
}).if($$lambda, (o, gen) => {
	const res = random(gen, o.res);
	return () => res;
}).if($$any, (o, gen) => random(gen, oneOf(gen, [
	$number,
	$string,
	$null,
	$undefined,
	$bigint,
	$boolean,
	$array($number),
	$record($union("a", "b", "c"), $number)
]))).if($$record, (o, gen) => {
	/**
	* @type {any}
	*/
	const res = {};
	const keysN = int53(gen, 0, 3);
	for (let i = 0; i < keysN; i++) {
		const key = random(gen, o.shape.keys);
		res[key] = random(gen, o.shape.values);
	}
	return res;
}).done();
/**
* @template S
* @param {prng.PRNG} gen
* @param {S} schema
* @return {Unwrap<ReadSchema<S>>}
*/
var random = (gen, schema) => _random($(schema), gen);
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/dom.js
/* c8 ignore start */
/**
* @type {Document}
*/
var doc = typeof document !== "undefined" ? document : {};
$custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
typeof DOMParser !== "undefined" && new DOMParser();
$custom((el) => el.nodeType === ELEMENT_NODE);
$custom((el) => el.nodeType === TEXT_NODE);
/**
* @param {Map<string,string>} m
* @return {string}
*/
var mapToStyleString = (m) => map$1(m, (value, key) => `${key}:${value};`).join("");
var ELEMENT_NODE = doc.ELEMENT_NODE;
var TEXT_NODE = doc.TEXT_NODE;
doc.CDATA_SECTION_NODE;
doc.COMMENT_NODE;
var DOCUMENT_NODE = doc.DOCUMENT_NODE;
doc.DOCUMENT_TYPE_NODE;
var DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
$custom((el) => el.nodeType === DOCUMENT_NODE);
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/symbol.js
/**
* Utility module to work with EcmaScript Symbols.
*
* @module symbol
*/
/**
* Return fresh symbol.
*/
var create = Symbol;
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.common.js
var BOLD = create();
var UNBOLD = create();
var BLUE = create();
var GREY = create();
var GREEN = create();
var RED = create();
var PURPLE = create();
var ORANGE = create();
var UNCOLOR = create();
/* c8 ignore start */
/**
* @param {Array<undefined|string|Symbol|Object|number|function():any>} args
* @return {Array<string|object|number|undefined>}
*/
var computeNoColorLoggingArgs = (args) => {
	if (args.length === 1 && args[0]?.constructor === Function) args = args[0]();
	const strBuilder = [];
	const logArgs = [];
	let i = 0;
	for (; i < args.length; i++) {
		const arg = args[i];
		if (arg === void 0) break;
		else if (arg.constructor === String || arg.constructor === Number) strBuilder.push(arg);
		else if (arg.constructor === Object) break;
	}
	if (i > 0) logArgs.push(strBuilder.join(""));
	for (; i < args.length; i++) {
		const arg = args[i];
		if (!(arg instanceof Symbol)) logArgs.push(arg);
	}
	return logArgs;
};
getUnixTime();
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.js
/**
* Isomorphic logging module with support for colors!
*
* @module logging
*/
/**
* @type {Object<Symbol,pair.Pair<string,string>>}
*/
var _browserStyleMap = {
	[BOLD]: create$1("font-weight", "bold"),
	[UNBOLD]: create$1("font-weight", "normal"),
	[BLUE]: create$1("color", "blue"),
	[GREEN]: create$1("color", "green"),
	[GREY]: create$1("color", "grey"),
	[RED]: create$1("color", "red"),
	[PURPLE]: create$1("color", "purple"),
	[ORANGE]: create$1("color", "orange"),
	[UNCOLOR]: create$1("color", "black")
};
/**
* @param {Array<string|Symbol|Object|number|function():any>} args
* @return {Array<string|object|number>}
*/
/* c8 ignore start */
var computeBrowserLoggingArgs = (args) => {
	if (args.length === 1 && args[0]?.constructor === Function) args = args[0]();
	const strBuilder = [];
	const styles = [];
	const currentStyle = create$5();
	/**
	* @type {Array<string|Object|number>}
	*/
	let logArgs = [];
	let i = 0;
	for (; i < args.length; i++) {
		const arg = args[i];
		const style = _browserStyleMap[arg];
		if (style !== void 0) currentStyle.set(style.left, style.right);
		else {
			if (arg === void 0) break;
			if (arg.constructor === String || arg.constructor === Number) {
				const style = mapToStyleString(currentStyle);
				if (i > 0 || style.length > 0) {
					strBuilder.push("%c" + arg);
					styles.push(style);
				} else strBuilder.push(arg);
			} else break;
		}
	}
	if (i > 0) {
		logArgs = styles;
		logArgs.unshift(strBuilder.join(""));
	}
	for (; i < args.length; i++) {
		const arg = args[i];
		if (!(arg instanceof Symbol)) logArgs.push(arg);
	}
	return logArgs;
};
/* c8 ignore stop */
/* c8 ignore start */
var computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
/* c8 ignore stop */
/**
* @param {Array<string|Symbol|Object|number>} args
*/
var print = (...args) => {
	console.log(...computeLoggingArgs(args));
	/* c8 ignore next */
	vconsoles.forEach((vc) => vc.print(args));
};
/* c8 ignore start */
/**
* @param {Array<string|Symbol|Object|number>} args
*/
var warn = (...args) => {
	console.warn(...computeLoggingArgs(args));
	args.unshift(ORANGE);
	vconsoles.forEach((vc) => vc.print(args));
};
var vconsoles = create$4();
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/iterator.js
/**
* @template T
* @param {function():IteratorResult<T>} next
* @return {IterableIterator<T>}
*/
var createIterator = (next) => ({
	/**
	* @return {IterableIterator<T>}
	*/
	[Symbol.iterator]() {
		return this;
	},
	next
});
/**
* @template T
* @param {Iterator<T>} iterator
* @param {function(T):boolean} filter
*/
var iteratorFilter = (iterator, filter) => createIterator(() => {
	let res;
	do
		res = iterator.next();
	while (!res.done && !filter(res.value));
	return res;
});
/**
* @template T,M
* @param {Iterator<T>} iterator
* @param {function(T):M} fmap
*/
var iteratorMap = (iterator, fmap) => createIterator(() => {
	const { done, value } = iterator.next();
	return {
		done,
		value: done ? void 0 : fmap(value)
	};
});
//#endregion
//#region ../../node_modules/.pnpm/yjs@13.6.31/node_modules/yjs/dist/yjs.mjs
var DeleteItem = class {
	/**
	* @param {number} clock
	* @param {number} len
	*/
	constructor(clock, len) {
		/**
		* @type {number}
		*/
		this.clock = clock;
		/**
		* @type {number}
		*/
		this.len = len;
	}
};
/**
* We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
* - When created in a transaction, it must only be accessed after sorting, and merging
*   - This DeleteSet is send to other clients
* - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
* - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
*/
var DeleteSet = class {
	constructor() {
		/**
		* @type {Map<number,Array<DeleteItem>>}
		*/
		this.clients = /* @__PURE__ */ new Map();
	}
};
/**
* Iterate over all structs that the DeleteSet gc's.
*
* @param {Transaction} transaction
* @param {DeleteSet} ds
* @param {function(GC|Item):void} f
*
* @function
*/
var iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
	const structs = transaction.doc.store.clients.get(clientid);
	if (structs != null) {
		const lastStruct = structs[structs.length - 1];
		const clockState = lastStruct.id.clock + lastStruct.length;
		for (let i = 0, del = deletes[i]; i < deletes.length && del.clock < clockState; del = deletes[++i]) iterateStructs(transaction, structs, del.clock, del.len, f);
	}
});
/**
* @param {Array<DeleteItem>} dis
* @param {number} clock
* @return {number|null}
*
* @private
* @function
*/
var findIndexDS = (dis, clock) => {
	let left = 0;
	let right = dis.length - 1;
	while (left <= right) {
		const midindex = floor((left + right) / 2);
		const mid = dis[midindex];
		const midclock = mid.clock;
		if (midclock <= clock) {
			if (clock < midclock + mid.len) return midindex;
			left = midindex + 1;
		} else right = midindex - 1;
	}
	return null;
};
/**
* @param {DeleteSet} ds
* @param {ID} id
* @return {boolean}
*
* @private
* @function
*/
var isDeleted = (ds, id) => {
	const dis = ds.clients.get(id.client);
	return dis !== void 0 && findIndexDS(dis, id.clock) !== null;
};
/**
* @param {DeleteSet} ds
*
* @private
* @function
*/
var sortAndMergeDeleteSet = (ds) => {
	ds.clients.forEach((dels) => {
		dels.sort((a, b) => a.clock - b.clock);
		let i, j;
		for (i = 1, j = 1; i < dels.length; i++) {
			const left = dels[j - 1];
			const right = dels[i];
			if (left.clock + left.len >= right.clock) dels[j - 1] = new DeleteItem(left.clock, max(left.len, right.clock + right.len - left.clock));
			else {
				if (j < i) dels[j] = right;
				j++;
			}
		}
		dels.length = j;
	});
};
/**
* @param {Array<DeleteSet>} dss
* @return {DeleteSet} A fresh DeleteSet
*/
var mergeDeleteSets = (dss) => {
	const merged = new DeleteSet();
	for (let dssI = 0; dssI < dss.length; dssI++) dss[dssI].clients.forEach((delsLeft, client) => {
		if (!merged.clients.has(client)) {
			/**
			* @type {Array<DeleteItem>}
			*/
			const dels = delsLeft.slice();
			for (let i = dssI + 1; i < dss.length; i++) appendTo(dels, dss[i].clients.get(client) || []);
			merged.clients.set(client, dels);
		}
	});
	sortAndMergeDeleteSet(merged);
	return merged;
};
/**
* @param {DeleteSet} ds
* @param {number} client
* @param {number} clock
* @param {number} length
*
* @private
* @function
*/
var addToDeleteSet = (ds, client, clock, length) => {
	setIfUndefined(ds.clients, client, () => []).push(new DeleteItem(clock, length));
};
var createDeleteSet = () => new DeleteSet();
/**
* @param {StructStore} ss
* @return {DeleteSet} Merged and sorted DeleteSet
*
* @private
* @function
*/
var createDeleteSetFromStructStore = (ss) => {
	const ds = createDeleteSet();
	ss.clients.forEach((structs, client) => {
		/**
		* @type {Array<DeleteItem>}
		*/
		const dsitems = [];
		for (let i = 0; i < structs.length; i++) {
			const struct = structs[i];
			if (struct.deleted) {
				const clock = struct.id.clock;
				let len = struct.length;
				if (i + 1 < structs.length) for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) len += next.length;
				dsitems.push(new DeleteItem(clock, len));
			}
		}
		if (dsitems.length > 0) ds.clients.set(client, dsitems);
	});
	return ds;
};
/**
* @param {DSEncoderV1 | DSEncoderV2} encoder
* @param {DeleteSet} ds
*
* @private
* @function
*/
var writeDeleteSet = (encoder, ds) => {
	writeVarUint(encoder.restEncoder, ds.clients.size);
	from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
		encoder.resetDsCurVal();
		writeVarUint(encoder.restEncoder, client);
		const len = dsitems.length;
		writeVarUint(encoder.restEncoder, len);
		for (let i = 0; i < len; i++) {
			const item = dsitems[i];
			encoder.writeDsClock(item.clock);
			encoder.writeDsLen(item.len);
		}
	});
};
/**
* @param {DSDecoderV1 | DSDecoderV2} decoder
* @return {DeleteSet}
*
* @private
* @function
*/
var readDeleteSet = (decoder) => {
	const ds = new DeleteSet();
	const numClients = readVarUint(decoder.restDecoder);
	for (let i = 0; i < numClients; i++) {
		decoder.resetDsCurVal();
		const client = readVarUint(decoder.restDecoder);
		const numberOfDeletes = readVarUint(decoder.restDecoder);
		if (numberOfDeletes > 0) {
			const dsField = setIfUndefined(ds.clients, client, () => []);
			for (let i = 0; i < numberOfDeletes; i++) dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
		}
	}
	return ds;
};
/**
* @todo YDecoder also contains references to String and other Decoders. Would make sense to exchange YDecoder.toUint8Array for YDecoder.DsToUint8Array()..
*/
/**
* @param {DSDecoderV1 | DSDecoderV2} decoder
* @param {Transaction} transaction
* @param {StructStore} store
* @return {Uint8Array|null} Returns a v2 update containing all deletes that couldn't be applied yet; or null if all deletes were applied successfully.
*
* @private
* @function
*/
var readAndApplyDeleteSet = (decoder, transaction, store) => {
	const unappliedDS = new DeleteSet();
	const numClients = readVarUint(decoder.restDecoder);
	for (let i = 0; i < numClients; i++) {
		decoder.resetDsCurVal();
		const client = readVarUint(decoder.restDecoder);
		const numberOfDeletes = readVarUint(decoder.restDecoder);
		const structs = store.clients.get(client) || [];
		const state = getState(store, client);
		for (let i = 0; i < numberOfDeletes; i++) {
			const clock = decoder.readDsClock();
			const clockEnd = clock + decoder.readDsLen();
			if (clock < state) {
				if (state < clockEnd) addToDeleteSet(unappliedDS, client, state, clockEnd - state);
				let index = findIndexSS(structs, clock);
				/**
				* We can ignore the case of GC and Delete structs, because we are going to skip them
				* @type {Item}
				*/
				let struct = structs[index];
				if (!struct.deleted && struct.id.clock < clock) {
					structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
					index++;
				}
				while (index < structs.length) {
					struct = structs[index++];
					if (struct.id.clock < clockEnd) {
						if (!struct.deleted) {
							if (clockEnd < struct.id.clock + struct.length) structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
							struct.delete(transaction);
						}
					} else break;
				}
			} else addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
		}
	}
	if (unappliedDS.clients.size > 0) {
		const ds = new UpdateEncoderV2();
		writeVarUint(ds.restEncoder, 0);
		writeDeleteSet(ds, unappliedDS);
		return ds.toUint8Array();
	}
	return null;
};
/**
* @module Y
*/
var generateNewClientId = uint32;
/**
* @typedef {Object} DocOpts
* @property {boolean} [DocOpts.gc=true] Disable garbage collection (default: gc=true)
* @property {function(Item):boolean} [DocOpts.gcFilter] Will be called before an Item is garbage collected. Return false to keep the Item.
* @property {string} [DocOpts.guid] Define a globally unique identifier for this document
* @property {string | null} [DocOpts.collectionid] Associate this document with a collection. This only plays a role if your provider has a concept of collection.
* @property {any} [DocOpts.meta] Any kind of meta information you want to associate with this document. If this is a subdocument, remote peers will store the meta information as well.
* @property {boolean} [DocOpts.autoLoad] If a subdocument, automatically load document. If this is a subdocument, remote peers will load the document as well automatically.
* @property {boolean} [DocOpts.shouldLoad] Whether the document should be synced by the provider now. This is toggled to true when you call ydoc.load()
*/
/**
* @typedef {Object} DocEvents
* @property {function(Doc):void} DocEvents.destroy
* @property {function(Doc):void} DocEvents.load
* @property {function(boolean, Doc):void} DocEvents.sync
* @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.update
* @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.updateV2
* @property {function(Doc):void} DocEvents.beforeAllTransactions
* @property {function(Transaction, Doc):void} DocEvents.beforeTransaction
* @property {function(Transaction, Doc):void} DocEvents.beforeObserverCalls
* @property {function(Transaction, Doc):void} DocEvents.afterTransaction
* @property {function(Transaction, Doc):void} DocEvents.afterTransactionCleanup
* @property {function(Doc, Array<Transaction>):void} DocEvents.afterAllTransactions
* @property {function({ loaded: Set<Doc>, added: Set<Doc>, removed: Set<Doc> }, Doc, Transaction):void} DocEvents.subdocs
*/
/**
* A Yjs instance handles the state of shared data.
* @extends ObservableV2<DocEvents>
*/
var Doc = class Doc extends ObservableV2 {
	/**
	* @param {DocOpts} opts configuration
	*/
	constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
		super();
		this.gc = gc;
		this.gcFilter = gcFilter;
		this.clientID = generateNewClientId();
		this.guid = guid;
		this.collectionid = collectionid;
		/**
		* @type {Map<string, AbstractType<YEvent<any>>>}
		*/
		this.share = /* @__PURE__ */ new Map();
		this.store = new StructStore();
		/**
		* @type {Transaction | null}
		*/
		this._transaction = null;
		/**
		* @type {Array<Transaction>}
		*/
		this._transactionCleanups = [];
		/**
		* @type {Set<Doc>}
		*/
		this.subdocs = /* @__PURE__ */ new Set();
		/**
		* If this document is a subdocument - a document integrated into another document - then _item is defined.
		* @type {Item?}
		*/
		this._item = null;
		this.shouldLoad = shouldLoad;
		this.autoLoad = autoLoad;
		this.meta = meta;
		/**
		* This is set to true when the persistence provider loaded the document from the database or when the `sync` event fires.
		* Note that not all providers implement this feature. Provider authors are encouraged to fire the `load` event when the doc content is loaded from the database.
		*
		* @type {boolean}
		*/
		this.isLoaded = false;
		/**
		* This is set to true when the connection provider has successfully synced with a backend.
		* Note that when using peer-to-peer providers this event may not provide very useful.
		* Also note that not all providers implement this feature. Provider authors are encouraged to fire
		* the `sync` event when the doc has been synced (with `true` as a parameter) or if connection is
		* lost (with false as a parameter).
		*/
		this.isSynced = false;
		this.isDestroyed = false;
		/**
		* Promise that resolves once the document has been loaded from a persistence provider.
		*/
		this.whenLoaded = create$2((resolve) => {
			this.on("load", () => {
				this.isLoaded = true;
				resolve(this);
			});
		});
		const provideSyncedPromise = () => create$2((resolve) => {
			/**
			* @param {boolean} isSynced
			*/
			const eventHandler = (isSynced) => {
				if (isSynced === void 0 || isSynced === true) {
					this.off("sync", eventHandler);
					resolve();
				}
			};
			this.on("sync", eventHandler);
		});
		this.on("sync", (isSynced) => {
			if (isSynced === false && this.isSynced) this.whenSynced = provideSyncedPromise();
			this.isSynced = isSynced === void 0 || isSynced === true;
			if (this.isSynced && !this.isLoaded) this.emit("load", [this]);
		});
		/**
		* Promise that resolves once the document has been synced with a backend.
		* This promise is recreated when the connection is lost.
		* Note the documentation about the `isSynced` property.
		*/
		this.whenSynced = provideSyncedPromise();
	}
	/**
	* Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
	*
	* `load()` might be used in the future to request any provider to load the most current data.
	*
	* It is safe to call `load()` multiple times.
	*/
	load() {
		const item = this._item;
		if (item !== null && !this.shouldLoad) transact(
			/** @type {any} */
			item.parent.doc,
			(transaction) => {
				transaction.subdocsLoaded.add(this);
			},
			null,
			true
		);
		this.shouldLoad = true;
	}
	getSubdocs() {
		return this.subdocs;
	}
	getSubdocGuids() {
		return new Set(from(this.subdocs).map((doc) => doc.guid));
	}
	/**
	* Changes that happen inside of a transaction are bundled. This means that
	* the observer fires _after_ the transaction is finished and that all changes
	* that happened inside of the transaction are sent as one message to the
	* other peers.
	*
	* @template T
	* @param {function(Transaction):T} f The function that should be executed as a transaction
	* @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
	* @return T
	*
	* @public
	*/
	transact(f, origin = null) {
		return transact(this, f, origin);
	}
	/**
	* Define a shared data type.
	*
	* Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
	* and do not overwrite each other. I.e.
	* `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
	*
	* After this method is called, the type is also available on `ydoc.share.get(name)`.
	*
	* *Best Practices:*
	* Define all types right after the Y.Doc instance is created and store them in a separate object.
	* Also use the typed methods `getText(name)`, `getArray(name)`, ..
	*
	* @template {typeof AbstractType<any>} Type
	* @example
	*   const ydoc = new Y.Doc(..)
	*   const appState = {
	*     document: ydoc.getText('document')
	*     comments: ydoc.getArray('comments')
	*   }
	*
	* @param {string} name
	* @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
	* @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
	*
	* @public
	*/
	get(name, TypeConstructor = AbstractType) {
		const type = setIfUndefined(this.share, name, () => {
			const t = new TypeConstructor();
			t._integrate(this, null);
			return t;
		});
		const Constr = type.constructor;
		if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
			if (Constr === AbstractType) {
				const t = new TypeConstructor();
				t._map = type._map;
				type._map.forEach(
					/** @param {Item?} n */
					(n) => {
						for (; n !== null; n = n.left) n.parent = t;
					}
				);
				t._start = type._start;
				for (let n = t._start; n !== null; n = n.right) n.parent = t;
				t._length = type._length;
				this.share.set(name, t);
				t._integrate(this, null);
				return t;
			} else throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
		}
		return type;
	}
	/**
	* @template T
	* @param {string} [name]
	* @return {YArray<T>}
	*
	* @public
	*/
	getArray(name = "") {
		return this.get(name, YArray);
	}
	/**
	* @param {string} [name]
	* @return {YText}
	*
	* @public
	*/
	getText(name = "") {
		return this.get(name, YText);
	}
	/**
	* @template T
	* @param {string} [name]
	* @return {YMap<T>}
	*
	* @public
	*/
	getMap(name = "") {
		return this.get(name, YMap);
	}
	/**
	* @param {string} [name]
	* @return {YXmlElement}
	*
	* @public
	*/
	getXmlElement(name = "") {
		return this.get(name, YXmlElement);
	}
	/**
	* @param {string} [name]
	* @return {YXmlFragment}
	*
	* @public
	*/
	getXmlFragment(name = "") {
		return this.get(name, YXmlFragment);
	}
	/**
	* Converts the entire document into a js object, recursively traversing each yjs type
	* Doesn't log types that have not been defined (using ydoc.getType(..)).
	*
	* @deprecated Do not use this method and rather call toJSON directly on the shared types.
	*
	* @return {Object<string, any>}
	*/
	toJSON() {
		/**
		* @type {Object<string, any>}
		*/
		const doc = {};
		this.share.forEach((value, key) => {
			doc[key] = value.toJSON();
		});
		return doc;
	}
	/**
	* Emit `destroy` event and unregister all event handlers.
	*/
	destroy() {
		this.isDestroyed = true;
		from(this.subdocs).forEach((subdoc) => subdoc.destroy());
		const item = this._item;
		if (item !== null) {
			this._item = null;
			const content = item.content;
			content.doc = new Doc({
				guid: this.guid,
				...content.opts,
				shouldLoad: false
			});
			content.doc._item = item;
			transact(
				/** @type {any} */
				item.parent.doc,
				(transaction) => {
					const doc = content.doc;
					if (!item.deleted) transaction.subdocsAdded.add(doc);
					transaction.subdocsRemoved.add(this);
				},
				null,
				true
			);
		}
		this.emit("destroyed", [true]);
		this.emit("destroy", [this]);
		super.destroy();
	}
};
var DSDecoderV1 = class {
	/**
	* @param {decoding.Decoder} decoder
	*/
	constructor(decoder) {
		this.restDecoder = decoder;
	}
	resetDsCurVal() {}
	/**
	* @return {number}
	*/
	readDsClock() {
		return readVarUint(this.restDecoder);
	}
	/**
	* @return {number}
	*/
	readDsLen() {
		return readVarUint(this.restDecoder);
	}
};
var UpdateDecoderV1 = class extends DSDecoderV1 {
	/**
	* @return {ID}
	*/
	readLeftID() {
		return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
	}
	/**
	* @return {ID}
	*/
	readRightID() {
		return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
	}
	/**
	* Read the next client id.
	* Use this in favor of readID whenever possible to reduce the number of objects created.
	*/
	readClient() {
		return readVarUint(this.restDecoder);
	}
	/**
	* @return {number} info An unsigned 8-bit integer
	*/
	readInfo() {
		return readUint8(this.restDecoder);
	}
	/**
	* @return {string}
	*/
	readString() {
		return readVarString(this.restDecoder);
	}
	/**
	* @return {boolean} isKey
	*/
	readParentInfo() {
		return readVarUint(this.restDecoder) === 1;
	}
	/**
	* @return {number} info An unsigned 8-bit integer
	*/
	readTypeRef() {
		return readVarUint(this.restDecoder);
	}
	/**
	* Write len of a struct - well suited for Opt RLE encoder.
	*
	* @return {number} len
	*/
	readLen() {
		return readVarUint(this.restDecoder);
	}
	/**
	* @return {any}
	*/
	readAny() {
		return readAny(this.restDecoder);
	}
	/**
	* @return {Uint8Array}
	*/
	readBuf() {
		return copyUint8Array(readVarUint8Array(this.restDecoder));
	}
	/**
	* Legacy implementation uses JSON parse. We use any-decoding in v2.
	*
	* @return {any}
	*/
	readJSON() {
		return JSON.parse(readVarString(this.restDecoder));
	}
	/**
	* @return {string}
	*/
	readKey() {
		return readVarString(this.restDecoder);
	}
};
var DSDecoderV2 = class {
	/**
	* @param {decoding.Decoder} decoder
	*/
	constructor(decoder) {
		/**
		* @private
		*/
		this.dsCurrVal = 0;
		this.restDecoder = decoder;
	}
	resetDsCurVal() {
		this.dsCurrVal = 0;
	}
	/**
	* @return {number}
	*/
	readDsClock() {
		this.dsCurrVal += readVarUint(this.restDecoder);
		return this.dsCurrVal;
	}
	/**
	* @return {number}
	*/
	readDsLen() {
		const diff = readVarUint(this.restDecoder) + 1;
		this.dsCurrVal += diff;
		return diff;
	}
};
var UpdateDecoderV2 = class extends DSDecoderV2 {
	/**
	* @param {decoding.Decoder} decoder
	*/
	constructor(decoder) {
		super(decoder);
		/**
		* List of cached keys. If the keys[id] does not exist, we read a new key
		* from stringEncoder and push it to keys.
		*
		* @type {Array<string>}
		*/
		this.keys = [];
		readVarUint(decoder);
		this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
		this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
		this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
		this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
		this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
		this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
		this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
		this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
		this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
	}
	/**
	* @return {ID}
	*/
	readLeftID() {
		return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
	}
	/**
	* @return {ID}
	*/
	readRightID() {
		return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
	}
	/**
	* Read the next client id.
	* Use this in favor of readID whenever possible to reduce the number of objects created.
	*/
	readClient() {
		return this.clientDecoder.read();
	}
	/**
	* @return {number} info An unsigned 8-bit integer
	*/
	readInfo() {
		return this.infoDecoder.read();
	}
	/**
	* @return {string}
	*/
	readString() {
		return this.stringDecoder.read();
	}
	/**
	* @return {boolean}
	*/
	readParentInfo() {
		return this.parentInfoDecoder.read() === 1;
	}
	/**
	* @return {number} An unsigned 8-bit integer
	*/
	readTypeRef() {
		return this.typeRefDecoder.read();
	}
	/**
	* Write len of a struct - well suited for Opt RLE encoder.
	*
	* @return {number}
	*/
	readLen() {
		return this.lenDecoder.read();
	}
	/**
	* @return {any}
	*/
	readAny() {
		return readAny(this.restDecoder);
	}
	/**
	* @return {Uint8Array}
	*/
	readBuf() {
		return readVarUint8Array(this.restDecoder);
	}
	/**
	* This is mainly here for legacy purposes.
	*
	* Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
	*
	* @return {any}
	*/
	readJSON() {
		return readAny(this.restDecoder);
	}
	/**
	* @return {string}
	*/
	readKey() {
		const keyClock = this.keyClockDecoder.read();
		if (keyClock < this.keys.length) return this.keys[keyClock];
		else {
			const key = this.stringDecoder.read();
			this.keys.push(key);
			return key;
		}
	}
};
var DSEncoderV1 = class {
	constructor() {
		this.restEncoder = createEncoder();
	}
	toUint8Array() {
		return toUint8Array(this.restEncoder);
	}
	resetDsCurVal() {}
	/**
	* @param {number} clock
	*/
	writeDsClock(clock) {
		writeVarUint(this.restEncoder, clock);
	}
	/**
	* @param {number} len
	*/
	writeDsLen(len) {
		writeVarUint(this.restEncoder, len);
	}
};
var UpdateEncoderV1 = class extends DSEncoderV1 {
	/**
	* @param {ID} id
	*/
	writeLeftID(id) {
		writeVarUint(this.restEncoder, id.client);
		writeVarUint(this.restEncoder, id.clock);
	}
	/**
	* @param {ID} id
	*/
	writeRightID(id) {
		writeVarUint(this.restEncoder, id.client);
		writeVarUint(this.restEncoder, id.clock);
	}
	/**
	* Use writeClient and writeClock instead of writeID if possible.
	* @param {number} client
	*/
	writeClient(client) {
		writeVarUint(this.restEncoder, client);
	}
	/**
	* @param {number} info An unsigned 8-bit integer
	*/
	writeInfo(info) {
		writeUint8(this.restEncoder, info);
	}
	/**
	* @param {string} s
	*/
	writeString(s) {
		writeVarString(this.restEncoder, s);
	}
	/**
	* @param {boolean} isYKey
	*/
	writeParentInfo(isYKey) {
		writeVarUint(this.restEncoder, isYKey ? 1 : 0);
	}
	/**
	* @param {number} info An unsigned 8-bit integer
	*/
	writeTypeRef(info) {
		writeVarUint(this.restEncoder, info);
	}
	/**
	* Write len of a struct - well suited for Opt RLE encoder.
	*
	* @param {number} len
	*/
	writeLen(len) {
		writeVarUint(this.restEncoder, len);
	}
	/**
	* @param {any} any
	*/
	writeAny(any) {
		writeAny(this.restEncoder, any);
	}
	/**
	* @param {Uint8Array} buf
	*/
	writeBuf(buf) {
		writeVarUint8Array(this.restEncoder, buf);
	}
	/**
	* @param {any} embed
	*/
	writeJSON(embed) {
		writeVarString(this.restEncoder, JSON.stringify(embed));
	}
	/**
	* @param {string} key
	*/
	writeKey(key) {
		writeVarString(this.restEncoder, key);
	}
};
var DSEncoderV2 = class {
	constructor() {
		this.restEncoder = createEncoder();
		this.dsCurrVal = 0;
	}
	toUint8Array() {
		return toUint8Array(this.restEncoder);
	}
	resetDsCurVal() {
		this.dsCurrVal = 0;
	}
	/**
	* @param {number} clock
	*/
	writeDsClock(clock) {
		const diff = clock - this.dsCurrVal;
		this.dsCurrVal = clock;
		writeVarUint(this.restEncoder, diff);
	}
	/**
	* @param {number} len
	*/
	writeDsLen(len) {
		if (len === 0) unexpectedCase();
		writeVarUint(this.restEncoder, len - 1);
		this.dsCurrVal += len;
	}
};
var UpdateEncoderV2 = class extends DSEncoderV2 {
	constructor() {
		super();
		/**
		* @type {Map<string,number>}
		*/
		this.keyMap = /* @__PURE__ */ new Map();
		/**
		* Refers to the next unique key-identifier to me used.
		* See writeKey method for more information.
		*
		* @type {number}
		*/
		this.keyClock = 0;
		this.keyClockEncoder = new IntDiffOptRleEncoder();
		this.clientEncoder = new UintOptRleEncoder();
		this.leftClockEncoder = new IntDiffOptRleEncoder();
		this.rightClockEncoder = new IntDiffOptRleEncoder();
		this.infoEncoder = new RleEncoder(writeUint8);
		this.stringEncoder = new StringEncoder();
		this.parentInfoEncoder = new RleEncoder(writeUint8);
		this.typeRefEncoder = new UintOptRleEncoder();
		this.lenEncoder = new UintOptRleEncoder();
	}
	toUint8Array() {
		const encoder = createEncoder();
		writeVarUint(encoder, 0);
		writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
		writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
		writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
		writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
		writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
		writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
		writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
		writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
		writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
		writeUint8Array(encoder, toUint8Array(this.restEncoder));
		return toUint8Array(encoder);
	}
	/**
	* @param {ID} id
	*/
	writeLeftID(id) {
		this.clientEncoder.write(id.client);
		this.leftClockEncoder.write(id.clock);
	}
	/**
	* @param {ID} id
	*/
	writeRightID(id) {
		this.clientEncoder.write(id.client);
		this.rightClockEncoder.write(id.clock);
	}
	/**
	* @param {number} client
	*/
	writeClient(client) {
		this.clientEncoder.write(client);
	}
	/**
	* @param {number} info An unsigned 8-bit integer
	*/
	writeInfo(info) {
		this.infoEncoder.write(info);
	}
	/**
	* @param {string} s
	*/
	writeString(s) {
		this.stringEncoder.write(s);
	}
	/**
	* @param {boolean} isYKey
	*/
	writeParentInfo(isYKey) {
		this.parentInfoEncoder.write(isYKey ? 1 : 0);
	}
	/**
	* @param {number} info An unsigned 8-bit integer
	*/
	writeTypeRef(info) {
		this.typeRefEncoder.write(info);
	}
	/**
	* Write len of a struct - well suited for Opt RLE encoder.
	*
	* @param {number} len
	*/
	writeLen(len) {
		this.lenEncoder.write(len);
	}
	/**
	* @param {any} any
	*/
	writeAny(any) {
		writeAny(this.restEncoder, any);
	}
	/**
	* @param {Uint8Array} buf
	*/
	writeBuf(buf) {
		writeVarUint8Array(this.restEncoder, buf);
	}
	/**
	* This is mainly here for legacy purposes.
	*
	* Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
	*
	* @param {any} embed
	*/
	writeJSON(embed) {
		writeAny(this.restEncoder, embed);
	}
	/**
	* Property keys are often reused. For example, in y-prosemirror the key `bold` might
	* occur very often. For a 3d application, the key `position` might occur very often.
	*
	* We cache these keys in a Map and refer to them via a unique number.
	*
	* @param {string} key
	*/
	writeKey(key) {
		const clock = this.keyMap.get(key);
		if (clock === void 0) {
			/**
			* @todo uncomment to introduce this feature finally
			*
			* Background. The ContentFormat object was always encoded using writeKey, but the decoder used to use readString.
			* Furthermore, I forgot to set the keyclock. So everything was working fine.
			*
			* However, this feature here is basically useless as it is not being used (it actually only consumes extra memory).
			*
			* I don't know yet how to reintroduce this feature..
			*
			* Older clients won't be able to read updates when we reintroduce this feature. So this should probably be done using a flag.
			*
			*/
			this.keyClockEncoder.write(this.keyClock++);
			this.stringEncoder.write(key);
		} else this.keyClockEncoder.write(clock);
	}
};
/**
* @module encoding
*/
/**
* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
* @param {Array<GC|Item>} structs All structs by `client`
* @param {number} client
* @param {number} clock write structs starting with `ID(client,clock)`
*
* @function
*/
var writeStructs = (encoder, structs, client, clock) => {
	clock = max(clock, structs[0].id.clock);
	const startNewStructs = findIndexSS(structs, clock);
	writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
	encoder.writeClient(client);
	writeVarUint(encoder.restEncoder, clock);
	const firstStruct = structs[startNewStructs];
	firstStruct.write(encoder, clock - firstStruct.id.clock);
	for (let i = startNewStructs + 1; i < structs.length; i++) structs[i].write(encoder, 0);
};
/**
* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
* @param {StructStore} store
* @param {Map<number,number>} _sm
*
* @private
* @function
*/
var writeClientsStructs = (encoder, store, _sm) => {
	const sm = /* @__PURE__ */ new Map();
	_sm.forEach((clock, client) => {
		if (getState(store, client) > clock) sm.set(client, clock);
	});
	getStateVector(store).forEach((_clock, client) => {
		if (!_sm.has(client)) sm.set(client, 0);
	});
	writeVarUint(encoder.restEncoder, sm.size);
	from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
		writeStructs(encoder, store.clients.get(client), client, clock);
	});
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder The decoder object to read data from.
* @param {Doc} doc
* @return {Map<number, { i: number, refs: Array<Item | GC> }>}
*
* @private
* @function
*/
var readClientsStructRefs = (decoder, doc) => {
	/**
	* @type {Map<number, { i: number, refs: Array<Item | GC> }>}
	*/
	const clientRefs = create$5();
	const numOfStateUpdates = readVarUint(decoder.restDecoder);
	for (let i = 0; i < numOfStateUpdates; i++) {
		const numberOfStructs = readVarUint(decoder.restDecoder);
		/**
		* @type {Array<GC|Item>}
		*/
		const refs = new Array(numberOfStructs);
		const client = decoder.readClient();
		let clock = readVarUint(decoder.restDecoder);
		clientRefs.set(client, {
			i: 0,
			refs
		});
		for (let i = 0; i < numberOfStructs; i++) {
			const info = decoder.readInfo();
			switch (31 & info) {
				case 0: {
					const len = decoder.readLen();
					refs[i] = new GC(createID(client, clock), len);
					clock += len;
					break;
				}
				case 10: {
					const len = readVarUint(decoder.restDecoder);
					refs[i] = new Skip(createID(client, clock), len);
					clock += len;
					break;
				}
				default: {
					/**
					* The optimized implementation doesn't use any variables because inlining variables is faster.
					* Below a non-optimized version is shown that implements the basic algorithm with
					* a few comments
					*/
					const cantCopyParentInfo = (info & 192) === 0;
					const struct = new Item(createID(client, clock), null, (info & 128) === 128 ? decoder.readLeftID() : null, null, (info & 64) === 64 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID() : null, cantCopyParentInfo && (info & 32) === 32 ? decoder.readString() : null, readItemContent(decoder, info));
					refs[i] = struct;
					clock += struct.length;
				}
			}
		}
	}
	return clientRefs;
};
/**
* Resume computing structs generated by struct readers.
*
* While there is something to do, we integrate structs in this order
* 1. top element on stack, if stack is not empty
* 2. next element from current struct reader (if empty, use next struct reader)
*
* If struct causally depends on another struct (ref.missing), we put next reader of
* `ref.id.client` on top of stack.
*
* At some point we find a struct that has no causal dependencies,
* then we start emptying the stack.
*
* It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
* depends on struct3 (from client1). Therefore the max stack size is equal to `structReaders.length`.
*
* This method is implemented in a way so that we can resume computation if this update
* causally depends on another update.
*
* @param {Transaction} transaction
* @param {StructStore} store
* @param {Map<number, { i: number, refs: (GC | Item)[] }>} clientsStructRefs
* @return { null | { update: Uint8Array, missing: Map<number,number> } }
*
* @private
* @function
*/
var integrateStructs = (transaction, store, clientsStructRefs) => {
	/**
	* @type {Array<Item | GC>}
	*/
	const stack = [];
	let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
	if (clientsStructRefsIds.length === 0) return null;
	const getNextStructTarget = () => {
		if (clientsStructRefsIds.length === 0) return null;
		let nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
		while (nextStructsTarget.refs.length === nextStructsTarget.i) {
			clientsStructRefsIds.pop();
			if (clientsStructRefsIds.length > 0) nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
			else return null;
		}
		return nextStructsTarget;
	};
	let curStructsTarget = getNextStructTarget();
	if (curStructsTarget === null) return null;
	/**
	* @type {StructStore}
	*/
	const restStructs = new StructStore();
	const missingSV = /* @__PURE__ */ new Map();
	/**
	* @param {number} client
	* @param {number} clock
	*/
	const updateMissingSv = (client, clock) => {
		const mclock = missingSV.get(client);
		if (mclock == null || mclock > clock) missingSV.set(client, clock);
	};
	/**
	* @type {GC|Item}
	*/
	let stackHead = curStructsTarget.refs[curStructsTarget.i++];
	const state = /* @__PURE__ */ new Map();
	const addStackToRestSS = () => {
		for (const item of stack) {
			const client = item.id.client;
			const inapplicableItems = clientsStructRefs.get(client);
			if (inapplicableItems) {
				inapplicableItems.i--;
				restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
				clientsStructRefs.delete(client);
				inapplicableItems.i = 0;
				inapplicableItems.refs = [];
			} else restStructs.clients.set(client, [item]);
			clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
		}
		stack.length = 0;
	};
	while (true) {
		if (stackHead.constructor !== Skip) {
			const offset = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client)) - stackHead.id.clock;
			if (offset < 0) {
				stack.push(stackHead);
				updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
				addStackToRestSS();
			} else {
				const missing = stackHead.getMissing(transaction, store);
				if (missing !== null) {
					stack.push(stackHead);
					/**
					* @type {{ refs: Array<GC|Item>, i: number }}
					*/
					const structRefs = clientsStructRefs.get(missing) || {
						refs: [],
						i: 0
					};
					if (structRefs.refs.length === structRefs.i) {
						updateMissingSv(missing, getState(store, missing));
						addStackToRestSS();
					} else {
						stackHead = structRefs.refs[structRefs.i++];
						continue;
					}
				} else if (offset === 0 || offset < stackHead.length) {
					stackHead.integrate(transaction, offset);
					state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
				}
			}
		}
		if (stack.length > 0) stackHead = stack.pop();
		else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) stackHead = curStructsTarget.refs[curStructsTarget.i++];
		else {
			curStructsTarget = getNextStructTarget();
			if (curStructsTarget === null) break;
			else stackHead = curStructsTarget.refs[curStructsTarget.i++];
		}
	}
	if (restStructs.clients.size > 0) {
		const encoder = new UpdateEncoderV2();
		writeClientsStructs(encoder, restStructs, /* @__PURE__ */ new Map());
		writeVarUint(encoder.restEncoder, 0);
		return {
			missing: missingSV,
			update: encoder.toUint8Array()
		};
	}
	return null;
};
/**
* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
* @param {Transaction} transaction
*
* @private
* @function
*/
var writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
/**
* Read and apply a document update.
*
* This function has the same effect as `applyUpdate` but accepts a decoder.
*
* @param {decoding.Decoder} decoder
* @param {Doc} ydoc
* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
* @param {UpdateDecoderV1 | UpdateDecoderV2} [structDecoder]
*
* @function
*/
var readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
	transaction.local = false;
	let retry = false;
	const doc = transaction.doc;
	const store = doc.store;
	const restStructs = integrateStructs(transaction, store, readClientsStructRefs(structDecoder, doc));
	const pending = store.pendingStructs;
	if (pending) {
		for (const [client, clock] of pending.missing) if (clock < getState(store, client)) {
			retry = true;
			break;
		}
		if (restStructs) {
			for (const [client, clock] of restStructs.missing) {
				const mclock = pending.missing.get(client);
				if (mclock == null || mclock > clock) pending.missing.set(client, clock);
			}
			pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
		}
	} else store.pendingStructs = restStructs;
	const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
	if (store.pendingDs) {
		const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
		readVarUint(pendingDSUpdate.restDecoder);
		const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
		if (dsRest && dsRest2) store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
		else store.pendingDs = dsRest || dsRest2;
	} else store.pendingDs = dsRest;
	if (retry) {
		const update = store.pendingStructs.update;
		store.pendingStructs = null;
		applyUpdateV2(transaction.doc, update);
	}
}, transactionOrigin, false);
/**
* Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
*
* This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
*
* @param {Doc} ydoc
* @param {Uint8Array} update
* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
*
* @function
*/
var applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
	const decoder = createDecoder(update);
	readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
};
/**
* Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
*
* This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
*
* @param {Doc} ydoc
* @param {Uint8Array} update
* @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
*
* @function
*/
var applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
/**
* Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
* only write the operations that are missing.
*
* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
* @param {Doc} doc
* @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
*
* @function
*/
var writeStateAsUpdate = (encoder, doc, targetStateVector = /* @__PURE__ */ new Map()) => {
	writeClientsStructs(encoder, doc.store, targetStateVector);
	writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
};
/**
* Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
* only write the operations that are missing.
*
* Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
*
* @param {Doc} doc
* @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
* @param {UpdateEncoderV1 | UpdateEncoderV2} [encoder]
* @return {Uint8Array}
*
* @function
*/
var encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
	writeStateAsUpdate(encoder, doc, decodeStateVector(encodedTargetStateVector));
	const updates = [encoder.toUint8Array()];
	if (doc.store.pendingDs) updates.push(doc.store.pendingDs);
	if (doc.store.pendingStructs) updates.push(diffUpdateV2(doc.store.pendingStructs.update, encodedTargetStateVector));
	if (updates.length > 1) {
		if (encoder.constructor === UpdateEncoderV1) return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
		else if (encoder.constructor === UpdateEncoderV2) return mergeUpdatesV2(updates);
	}
	return updates[0];
};
/**
* Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
* only write the operations that are missing.
*
* Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
*
* @param {Doc} doc
* @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
* @return {Uint8Array}
*
* @function
*/
var encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new UpdateEncoderV1());
/**
* Read state vector from Decoder and return as Map
*
* @param {DSDecoderV1 | DSDecoderV2} decoder
* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
*
* @function
*/
var readStateVector = (decoder) => {
	const ss = /* @__PURE__ */ new Map();
	const ssLength = readVarUint(decoder.restDecoder);
	for (let i = 0; i < ssLength; i++) {
		const client = readVarUint(decoder.restDecoder);
		const clock = readVarUint(decoder.restDecoder);
		ss.set(client, clock);
	}
	return ss;
};
/**
* Read decodedState and return State as Map.
*
* @param {Uint8Array} decodedState
* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
*
* @function
*/
/**
* Read decodedState and return State as Map.
*
* @param {Uint8Array} decodedState
* @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
*
* @function
*/
var decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
/**
* @param {DSEncoderV1 | DSEncoderV2} encoder
* @param {Map<number,number>} sv
* @function
*/
var writeStateVector = (encoder, sv) => {
	writeVarUint(encoder.restEncoder, sv.size);
	from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
		writeVarUint(encoder.restEncoder, client);
		writeVarUint(encoder.restEncoder, clock);
	});
	return encoder;
};
/**
* @param {DSEncoderV1 | DSEncoderV2} encoder
* @param {Doc} doc
*
* @function
*/
var writeDocumentStateVector = (encoder, doc) => writeStateVector(encoder, getStateVector(doc.store));
/**
* Encode State as Uint8Array.
*
* @param {Doc|Map<number,number>} doc
* @param {DSEncoderV1 | DSEncoderV2} [encoder]
* @return {Uint8Array}
*
* @function
*/
var encodeStateVectorV2 = (doc, encoder = new DSEncoderV2()) => {
	if (doc instanceof Map) writeStateVector(encoder, doc);
	else writeDocumentStateVector(encoder, doc);
	return encoder.toUint8Array();
};
/**
* Encode State as Uint8Array.
*
* @param {Doc|Map<number,number>} doc
* @return {Uint8Array}
*
* @function
*/
var encodeStateVector = (doc) => encodeStateVectorV2(doc, new DSEncoderV1());
/**
* General event handler implementation.
*
* @template ARG0, ARG1
*
* @private
*/
var EventHandler = class {
	constructor() {
		/**
		* @type {Array<function(ARG0, ARG1):void>}
		*/
		this.l = [];
	}
};
/**
* @template ARG0,ARG1
* @returns {EventHandler<ARG0,ARG1>}
*
* @private
* @function
*/
var createEventHandler = () => new EventHandler();
/**
* Adds an event listener that is called when
* {@link EventHandler#callEventListeners} is called.
*
* @template ARG0,ARG1
* @param {EventHandler<ARG0,ARG1>} eventHandler
* @param {function(ARG0,ARG1):void} f The event handler.
*
* @private
* @function
*/
var addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
/**
* Removes an event listener.
*
* @template ARG0,ARG1
* @param {EventHandler<ARG0,ARG1>} eventHandler
* @param {function(ARG0,ARG1):void} f The event handler that was added with
*                     {@link EventHandler#addEventListener}
*
* @private
* @function
*/
var removeEventHandlerListener = (eventHandler, f) => {
	const l = eventHandler.l;
	const len = l.length;
	eventHandler.l = l.filter((g) => f !== g);
	if (len === eventHandler.l.length) console.error("[yjs] Tried to remove event handler that doesn't exist.");
};
/**
* Call all event listeners that were added via
* {@link EventHandler#addEventListener}.
*
* @template ARG0,ARG1
* @param {EventHandler<ARG0,ARG1>} eventHandler
* @param {ARG0} arg0
* @param {ARG1} arg1
*
* @private
* @function
*/
var callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);
var ID = class {
	/**
	* @param {number} client client id
	* @param {number} clock unique per client id, continuous number
	*/
	constructor(client, clock) {
		/**
		* Client id
		* @type {number}
		*/
		this.client = client;
		/**
		* unique per client id, continuous number
		* @type {number}
		*/
		this.clock = clock;
	}
};
/**
* @param {ID | null} a
* @param {ID | null} b
* @return {boolean}
*
* @function
*/
var compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
/**
* @param {number} client
* @param {number} clock
*
* @private
* @function
*/
var createID = (client, clock) => new ID(client, clock);
/**
* The top types are mapped from y.share.get(keyname) => type.
* `type` does not store any information about the `keyname`.
* This function finds the correct `keyname` for `type` and throws otherwise.
*
* @param {AbstractType<any>} type
* @return {string}
*
* @private
* @function
*/
var findRootTypeKey = (type) => {
	for (const [key, value] of type.doc.share.entries()) if (value === type) return key;
	throw unexpectedCase();
};
/**
* Check if `parent` is a parent of `child`.
*
* @param {AbstractType<any>} parent
* @param {Item|null} child
* @return {Boolean} Whether `parent` is a parent of `child`.
*
* @private
* @function
*/
var isParentOf = (parent, child) => {
	while (child !== null) {
		if (child.parent === parent) return true;
		child = child.parent._item;
	}
	return false;
};
var PermanentUserData = class {
	/**
	* @param {Doc} doc
	* @param {YMap<any>} [storeType]
	*/
	constructor(doc, storeType = doc.getMap("users")) {
		/**
		* @type {Map<string,DeleteSet>}
		*/
		const dss = /* @__PURE__ */ new Map();
		this.yusers = storeType;
		this.doc = doc;
		/**
		* Maps from clientid to userDescription
		*
		* @type {Map<number,string>}
		*/
		this.clients = /* @__PURE__ */ new Map();
		this.dss = dss;
		/**
		* @param {YMap<any>} user
		* @param {string} userDescription
		*/
		const initUser = (user, userDescription) => {
			/**
			* @type {YArray<Uint8Array>}
			*/
			const ds = user.get("ds");
			const ids = user.get("ids");
			const addClientId = (clientid) => this.clients.set(clientid, userDescription);
			ds.observe(
				/** @param {YArrayEvent<any>} event */
				(event) => {
					event.changes.added.forEach((item) => {
						item.content.getContent().forEach((encodedDs) => {
							if (encodedDs instanceof Uint8Array) this.dss.set(userDescription, mergeDeleteSets([this.dss.get(userDescription) || createDeleteSet(), readDeleteSet(new DSDecoderV1(createDecoder(encodedDs)))]));
						});
					});
				}
			);
			this.dss.set(userDescription, mergeDeleteSets(ds.map((encodedDs) => readDeleteSet(new DSDecoderV1(createDecoder(encodedDs))))));
			ids.observe(
				/** @param {YArrayEvent<any>} event */
				(event) => event.changes.added.forEach((item) => item.content.getContent().forEach(addClientId))
			);
			ids.forEach(addClientId);
		};
		storeType.observe((event) => {
			event.keysChanged.forEach((userDescription) => initUser(storeType.get(userDescription), userDescription));
		});
		storeType.forEach(initUser);
	}
	/**
	* @param {Doc} doc
	* @param {number} clientid
	* @param {string} userDescription
	* @param {Object} conf
	* @param {function(Transaction, DeleteSet):boolean} [conf.filter]
	*/
	setUserMapping(doc, clientid, userDescription, { filter = () => true } = {}) {
		const users = this.yusers;
		let user = users.get(userDescription);
		if (!user) {
			user = new YMap();
			user.set("ids", new YArray());
			user.set("ds", new YArray());
			users.set(userDescription, user);
		}
		user.get("ids").push([clientid]);
		users.observe((_event) => {
			setTimeout(() => {
				const userOverwrite = users.get(userDescription);
				if (userOverwrite !== user) {
					user = userOverwrite;
					this.clients.forEach((_userDescription, clientid) => {
						if (userDescription === _userDescription) user.get("ids").push([clientid]);
					});
					const encoder = new DSEncoderV1();
					const ds = this.dss.get(userDescription);
					if (ds) {
						writeDeleteSet(encoder, ds);
						user.get("ds").push([encoder.toUint8Array()]);
					}
				}
			}, 0);
		});
		doc.on(
			"afterTransaction",
			/** @param {Transaction} transaction */
			(transaction) => {
				setTimeout(() => {
					const yds = user.get("ds");
					const ds = transaction.deleteSet;
					if (transaction.local && ds.clients.size > 0 && filter(transaction, ds)) {
						const encoder = new DSEncoderV1();
						writeDeleteSet(encoder, ds);
						yds.push([encoder.toUint8Array()]);
					}
				});
			}
		);
	}
	/**
	* @param {number} clientid
	* @return {any}
	*/
	getUserByClientId(clientid) {
		return this.clients.get(clientid) || null;
	}
	/**
	* @param {ID} id
	* @return {string | null}
	*/
	getUserByDeletedId(id) {
		for (const [userDescription, ds] of this.dss.entries()) if (isDeleted(ds, id)) return userDescription;
		return null;
	}
};
/**
* A relative position is based on the Yjs model and is not affected by document changes.
* E.g. If you place a relative position before a certain character, it will always point to this character.
* If you place a relative position at the end of a type, it will always point to the end of the type.
*
* A numeric position is often unsuited for user selections, because it does not change when content is inserted
* before or after.
*
* ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the relative position.
*
* One of the properties must be defined.
*
* @example
*   // Current cursor position is at position 10
*   const relativePosition = createRelativePositionFromIndex(yText, 10)
*   // modify yText
*   yText.insert(0, 'abc')
*   yText.delete(3, 10)
*   // Compute the cursor position
*   const absolutePosition = createAbsolutePositionFromRelativePosition(y, relativePosition)
*   absolutePosition.type === yText // => true
*   console.log('cursor location is ' + absolutePosition.index) // => cursor location is 3
*
*/
var RelativePosition = class {
	/**
	* @param {ID|null} type
	* @param {string|null} tname
	* @param {ID|null} item
	* @param {number} assoc
	*/
	constructor(type, tname, item, assoc = 0) {
		/**
		* @type {ID|null}
		*/
		this.type = type;
		/**
		* @type {string|null}
		*/
		this.tname = tname;
		/**
		* @type {ID | null}
		*/
		this.item = item;
		/**
		* A relative position is associated to a specific character. By default
		* assoc >= 0, the relative position is associated to the character
		* after the meant position.
		* I.e. position 1 in 'ab' is associated to character 'b'.
		*
		* If assoc < 0, then the relative position is associated to the character
		* before the meant position.
		*
		* @type {number}
		*/
		this.assoc = assoc;
	}
};
var AbsolutePosition = class {
	/**
	* @param {AbstractType<any>} type
	* @param {number} index
	* @param {number} [assoc]
	*/
	constructor(type, index, assoc = 0) {
		/**
		* @type {AbstractType<any>}
		*/
		this.type = type;
		/**
		* @type {number}
		*/
		this.index = index;
		this.assoc = assoc;
	}
};
/**
* @param {AbstractType<any>} type
* @param {number} index
* @param {number} [assoc]
*
* @function
*/
var createAbsolutePosition$1 = (type, index, assoc = 0) => new AbsolutePosition(type, index, assoc);
/**
* @param {AbstractType<any>} type
* @param {ID|null} item
* @param {number} [assoc]
*
* @function
*/
var createRelativePosition$1 = (type, item, assoc) => {
	let typeid = null;
	let tname = null;
	if (type._item === null) tname = findRootTypeKey(type);
	else typeid = createID(type._item.id.client, type._item.id.clock);
	return new RelativePosition(typeid, tname, item, assoc);
};
/**
* Create a relativePosition based on a absolute position.
*
* @param {AbstractType<any>} type The base type (e.g. YText or YArray).
* @param {number} index The absolute position.
* @param {number} [assoc]
* @return {RelativePosition}
*
* @function
*/
var createRelativePositionFromTypeIndex = (type, index, assoc = 0) => {
	let t = type._start;
	if (assoc < 0) {
		if (index === 0) return createRelativePosition$1(type, null, assoc);
		index--;
	}
	while (t !== null) {
		if (!t.deleted && t.countable) {
			if (t.length > index) return createRelativePosition$1(type, createID(t.id.client, t.id.clock + index), assoc);
			index -= t.length;
		}
		if (t.right === null && assoc < 0) return createRelativePosition$1(type, t.lastId, assoc);
		t = t.right;
	}
	return createRelativePosition$1(type, null, assoc);
};
/**
* @param {StructStore} store
* @param {ID} id
*/
var getItemWithOffset = (store, id) => {
	const item = getItem(store, id);
	return {
		item,
		diff: id.clock - item.id.clock
	};
};
/**
* Transform a relative position to an absolute position.
*
* If you want to share the relative position with other users, you should set
* `followUndoneDeletions` to false to get consistent results across all clients.
*
* When calculating the absolute position, we try to follow the "undone deletions". This yields
* better results for the user who performed undo. However, only the user who performed the undo
* will get the better results, the other users don't know which operations recreated a deleted
* range of content. There is more information in this ticket: https://github.com/yjs/yjs/issues/638
*
* @param {RelativePosition} rpos
* @param {Doc} doc
* @param {boolean} followUndoneDeletions - whether to follow undone deletions - see https://github.com/yjs/yjs/issues/638
* @return {AbsolutePosition|null}
*
* @function
*/
var createAbsolutePositionFromRelativePosition = (rpos, doc, followUndoneDeletions = true) => {
	const store = doc.store;
	const rightID = rpos.item;
	const typeID = rpos.type;
	const tname = rpos.tname;
	const assoc = rpos.assoc;
	let type = null;
	let index = 0;
	if (rightID !== null) {
		if (getState(store, rightID.client) <= rightID.clock) return null;
		const res = followUndoneDeletions ? followRedone(store, rightID) : getItemWithOffset(store, rightID);
		const right = res.item;
		if (!(right instanceof Item)) return null;
		type = right.parent;
		if (type._item === null || !type._item.deleted) {
			index = right.deleted || !right.countable ? 0 : res.diff + (assoc >= 0 ? 0 : 1);
			let n = right.left;
			while (n !== null) {
				if (!n.deleted && n.countable) index += n.length;
				n = n.left;
			}
		}
	} else {
		if (tname !== null) type = doc.get(tname);
		else if (typeID !== null) {
			if (getState(store, typeID.client) <= typeID.clock) return null;
			const { item } = followUndoneDeletions ? followRedone(store, typeID) : { item: getItem(store, typeID) };
			if (item instanceof Item && item.content instanceof ContentType) type = item.content.type;
			else return null;
		} else throw unexpectedCase();
		if (assoc >= 0) index = type._length;
		else index = 0;
	}
	return createAbsolutePosition$1(type, index, rpos.assoc);
};
/**
* @param {RelativePosition|null} a
* @param {RelativePosition|null} b
* @return {boolean}
*
* @function
*/
var compareRelativePositions = (a, b) => a === b || a !== null && b !== null && a.tname === b.tname && compareIDs(a.item, b.item) && compareIDs(a.type, b.type) && a.assoc === b.assoc;
var Snapshot = class {
	/**
	* @param {DeleteSet} ds
	* @param {Map<number,number>} sv state map
	*/
	constructor(ds, sv) {
		/**
		* @type {DeleteSet}
		*/
		this.ds = ds;
		/**
		* State Map
		* @type {Map<number,number>}
		*/
		this.sv = sv;
	}
};
/**
* @param {DeleteSet} ds
* @param {Map<number,number>} sm
* @return {Snapshot}
*/
var createSnapshot = (ds, sm) => new Snapshot(ds, sm);
var emptySnapshot = createSnapshot(createDeleteSet(), /* @__PURE__ */ new Map());
/**
* @param {Doc} doc
* @return {Snapshot}
*/
var snapshot = (doc) => createSnapshot(createDeleteSetFromStructStore(doc.store), getStateVector(doc.store));
/**
* @param {Item} item
* @param {Snapshot|undefined} snapshot
*
* @protected
* @function
*/
var isVisible = (item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);
/**
* @param {Transaction} transaction
* @param {Snapshot} snapshot
*/
var splitSnapshotAffectedStructs = (transaction, snapshot) => {
	const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create$4);
	const store = transaction.doc.store;
	if (!meta.has(snapshot)) {
		snapshot.sv.forEach((clock, client) => {
			if (clock < getState(store, client)) getItemCleanStart(transaction, createID(client, clock));
		});
		iterateDeletedStructs(transaction, snapshot.ds, (_item) => {});
		meta.add(snapshot);
	}
};
var StructStore = class {
	constructor() {
		/**
		* @type {Map<number,Array<GC|Item>>}
		*/
		this.clients = /* @__PURE__ */ new Map();
		/**
		* @type {null | { missing: Map<number, number>, update: Uint8Array }}
		*/
		this.pendingStructs = null;
		/**
		* @type {null | Uint8Array}
		*/
		this.pendingDs = null;
	}
};
/**
* Return the states as a Map<client,clock>.
* Note that clock refers to the next expected clock id.
*
* @param {StructStore} store
* @return {Map<number,number>}
*
* @public
* @function
*/
var getStateVector = (store) => {
	const sm = /* @__PURE__ */ new Map();
	store.clients.forEach((structs, client) => {
		const struct = structs[structs.length - 1];
		sm.set(client, struct.id.clock + struct.length);
	});
	return sm;
};
/**
* @param {StructStore} store
* @param {number} client
* @return {number}
*
* @public
* @function
*/
var getState = (store, client) => {
	const structs = store.clients.get(client);
	if (structs === void 0) return 0;
	const lastStruct = structs[structs.length - 1];
	return lastStruct.id.clock + lastStruct.length;
};
/**
* @param {StructStore} store
* @param {GC|Item} struct
*
* @private
* @function
*/
var addStruct = (store, struct) => {
	let structs = store.clients.get(struct.id.client);
	if (structs === void 0) {
		structs = [];
		store.clients.set(struct.id.client, structs);
	} else {
		const lastStruct = structs[structs.length - 1];
		if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) throw unexpectedCase();
	}
	structs.push(struct);
};
/**
* Perform a binary search on a sorted array
* @param {Array<Item|GC>} structs
* @param {number} clock
* @return {number}
*
* @private
* @function
*/
var findIndexSS = (structs, clock) => {
	let left = 0;
	let right = structs.length - 1;
	let mid = structs[right];
	let midclock = mid.id.clock;
	if (midclock === clock) return right;
	let midindex = floor(clock / (midclock + mid.length - 1) * right);
	while (left <= right) {
		mid = structs[midindex];
		midclock = mid.id.clock;
		if (midclock <= clock) {
			if (clock < midclock + mid.length) return midindex;
			left = midindex + 1;
		} else right = midindex - 1;
		midindex = floor((left + right) / 2);
	}
	throw unexpectedCase();
};
/**
* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
*
* @param {StructStore} store
* @param {ID} id
* @return {GC|Item}
*
* @private
* @function
*/
var find = (store, id) => {
	/**
	* @type {Array<GC|Item>}
	*/
	const structs = store.clients.get(id.client);
	return structs[findIndexSS(structs, id.clock)];
};
/**
* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
* @private
* @function
*/
var getItem = find;
/**
* @param {Transaction} transaction
* @param {Array<Item|GC>} structs
* @param {number} clock
*/
var findIndexCleanStart = (transaction, structs, clock) => {
	const index = findIndexSS(structs, clock);
	const struct = structs[index];
	if (struct.id.clock < clock && struct instanceof Item) {
		structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
		return index + 1;
	}
	return index;
};
/**
* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
*
* @param {Transaction} transaction
* @param {ID} id
* @return {Item}
*
* @private
* @function
*/
var getItemCleanStart = (transaction, id) => {
	const structs = transaction.doc.store.clients.get(id.client);
	return structs[findIndexCleanStart(transaction, structs, id.clock)];
};
/**
* Expects that id is actually in store. This function throws or is an infinite loop otherwise.
*
* @param {Transaction} transaction
* @param {StructStore} store
* @param {ID} id
* @return {Item}
*
* @private
* @function
*/
var getItemCleanEnd = (transaction, store, id) => {
	/**
	* @type {Array<Item>}
	*/
	const structs = store.clients.get(id.client);
	const index = findIndexSS(structs, id.clock);
	const struct = structs[index];
	if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) structs.splice(index + 1, 0, splitItem(transaction, struct, id.clock - struct.id.clock + 1));
	return struct;
};
/**
* Replace `item` with `newitem` in store
* @param {StructStore} store
* @param {GC|Item} struct
* @param {GC|Item} newStruct
*
* @private
* @function
*/
var replaceStruct = (store, struct, newStruct) => {
	const structs = store.clients.get(struct.id.client);
	structs[findIndexSS(structs, struct.id.clock)] = newStruct;
};
/**
* Iterate over a range of structs
*
* @param {Transaction} transaction
* @param {Array<Item|GC>} structs
* @param {number} clockStart Inclusive start
* @param {number} len
* @param {function(GC|Item):void} f
*
* @function
*/
var iterateStructs = (transaction, structs, clockStart, len, f) => {
	if (len === 0) return;
	const clockEnd = clockStart + len;
	let index = findIndexCleanStart(transaction, structs, clockStart);
	let struct;
	do {
		struct = structs[index++];
		if (clockEnd < struct.id.clock + struct.length) findIndexCleanStart(transaction, structs, clockEnd);
		f(struct);
	} while (index < structs.length && structs[index].id.clock < clockEnd);
};
/**
* A transaction is created for every change on the Yjs model. It is possible
* to bundle changes on the Yjs model in a single transaction to
* minimize the number on messages sent and the number of observer calls.
* If possible the user of this library should bundle as many changes as
* possible. Here is an example to illustrate the advantages of bundling:
*
* @example
* const ydoc = new Y.Doc()
* const map = ydoc.getMap('map')
* // Log content when change is triggered
* map.observe(() => {
*   console.log('change triggered')
* })
* // Each change on the map type triggers a log message:
* map.set('a', 0) // => "change triggered"
* map.set('b', 0) // => "change triggered"
* // When put in a transaction, it will trigger the log after the transaction:
* ydoc.transact(() => {
*   map.set('a', 1)
*   map.set('b', 1)
* }) // => "change triggered"
*
* @public
*/
var Transaction = class {
	/**
	* @param {Doc} doc
	* @param {any} origin
	* @param {boolean} local
	*/
	constructor(doc, origin, local) {
		/**
		* The Yjs instance.
		* @type {Doc}
		*/
		this.doc = doc;
		/**
		* Describes the set of deleted items by ids
		* @type {DeleteSet}
		*/
		this.deleteSet = new DeleteSet();
		/**
		* Holds the state before the transaction started.
		* @type {Map<Number,Number>}
		*/
		this.beforeState = getStateVector(doc.store);
		/**
		* Holds the state after the transaction.
		* @type {Map<Number,Number>}
		*/
		this.afterState = /* @__PURE__ */ new Map();
		/**
		* All types that were directly modified (property added or child
		* inserted/deleted). New types are not included in this Set.
		* Maps from type to parentSubs (`item.parentSub = null` for YArray)
		* @type {Map<AbstractType<YEvent<any>>,Set<String|null>>}
		*/
		this.changed = /* @__PURE__ */ new Map();
		/**
		* Stores the events for the types that observe also child elements.
		* It is mainly used by `observeDeep`.
		* @type {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>}
		*/
		this.changedParentTypes = /* @__PURE__ */ new Map();
		/**
		* @type {Array<AbstractStruct>}
		*/
		this._mergeStructs = [];
		/**
		* @type {any}
		*/
		this.origin = origin;
		/**
		* Stores meta information on the transaction
		* @type {Map<any,any>}
		*/
		this.meta = /* @__PURE__ */ new Map();
		/**
		* Whether this change originates from this doc.
		* @type {boolean}
		*/
		this.local = local;
		/**
		* @type {Set<Doc>}
		*/
		this.subdocsAdded = /* @__PURE__ */ new Set();
		/**
		* @type {Set<Doc>}
		*/
		this.subdocsRemoved = /* @__PURE__ */ new Set();
		/**
		* @type {Set<Doc>}
		*/
		this.subdocsLoaded = /* @__PURE__ */ new Set();
		/**
		* @type {boolean}
		*/
		this._needFormattingCleanup = false;
	}
};
/**
* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
* @param {Transaction} transaction
* @return {boolean} Whether data was written.
*/
var writeUpdateMessageFromTransaction = (encoder, transaction) => {
	if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) return false;
	sortAndMergeDeleteSet(transaction.deleteSet);
	writeStructsFromTransaction(encoder, transaction);
	writeDeleteSet(encoder, transaction.deleteSet);
	return true;
};
/**
* If `type.parent` was added in current transaction, `type` technically
* did not change, it was just added and we should not fire events for `type`.
*
* @param {Transaction} transaction
* @param {AbstractType<YEvent<any>>} type
* @param {string|null} parentSub
*/
var addChangedTypeToTransaction = (transaction, type, parentSub) => {
	const item = type._item;
	if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) setIfUndefined(transaction.changed, type, create$4).add(parentSub);
};
/**
* @param {Array<AbstractStruct>} structs
* @param {number} pos
* @return {number} # of merged structs
*/
var tryToMergeWithLefts = (structs, pos) => {
	let right = structs[pos];
	let left = structs[pos - 1];
	let i = pos;
	for (; i > 0; right = left, left = structs[--i - 1]) {
		if (left.deleted === right.deleted && left.constructor === right.constructor) {
			if (left.mergeWith(right)) {
				if (right instanceof Item && right.parentSub !== null && right.parent._map.get(right.parentSub) === right)
 /** @type {AbstractType<any>} */ right.parent._map.set(right.parentSub, left);
				continue;
			}
		}
		break;
	}
	const merged = pos - i;
	if (merged) structs.splice(pos + 1 - merged, merged);
	return merged;
};
/**
* @param {DeleteSet} ds
* @param {StructStore} store
* @param {function(Item):boolean} gcFilter
*/
var tryGcDeleteSet = (ds, store, gcFilter) => {
	for (const [client, deleteItems] of ds.clients.entries()) {
		const structs = store.clients.get(client);
		for (let di = deleteItems.length - 1; di >= 0; di--) {
			const deleteItem = deleteItems[di];
			const endDeleteItemClock = deleteItem.clock + deleteItem.len;
			for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
				const struct = structs[si];
				if (deleteItem.clock + deleteItem.len <= struct.id.clock) break;
				if (struct instanceof Item && struct.deleted && !struct.keep && gcFilter(struct)) struct.gc(store, false);
			}
		}
	}
};
/**
* @param {DeleteSet} ds
* @param {StructStore} store
*/
var tryMergeDeleteSet = (ds, store) => {
	ds.clients.forEach((deleteItems, client) => {
		const structs = store.clients.get(client);
		for (let di = deleteItems.length - 1; di >= 0; di--) {
			const deleteItem = deleteItems[di];
			const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
			for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) si -= 1 + tryToMergeWithLefts(structs, si);
		}
	});
};
/**
* @param {Array<Transaction>} transactionCleanups
* @param {number} i
*/
var cleanupTransactions = (transactionCleanups, i) => {
	if (i < transactionCleanups.length) {
		const transaction = transactionCleanups[i];
		const doc = transaction.doc;
		const store = doc.store;
		const ds = transaction.deleteSet;
		const mergeStructs = transaction._mergeStructs;
		try {
			sortAndMergeDeleteSet(ds);
			transaction.afterState = getStateVector(transaction.doc.store);
			doc.emit("beforeObserverCalls", [transaction, doc]);
			/**
			* An array of event callbacks.
			*
			* Each callback is called even if the other ones throw errors.
			*
			* @type {Array<function():void>}
			*/
			const fs = [];
			transaction.changed.forEach((subs, itemtype) => fs.push(() => {
				if (itemtype._item === null || !itemtype._item.deleted) itemtype._callObserver(transaction, subs);
			}));
			fs.push(() => {
				transaction.changedParentTypes.forEach((events, type) => {
					if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
						events = events.filter((event) => event.target._item === null || !event.target._item.deleted);
						events.forEach((event) => {
							event.currentTarget = type;
							event._path = null;
						});
						events.sort((event1, event2) => event1.path.length - event2.path.length);
						fs.push(() => {
							callEventHandlerListeners(type._dEH, events, transaction);
						});
					}
				});
				fs.push(() => doc.emit("afterTransaction", [transaction, doc]));
				fs.push(() => {
					if (transaction._needFormattingCleanup) cleanupYTextAfterTransaction(transaction);
				});
			});
			callAll(fs, []);
		} finally {
			if (doc.gc) tryGcDeleteSet(ds, store, doc.gcFilter);
			tryMergeDeleteSet(ds, store);
			transaction.afterState.forEach((clock, client) => {
				const beforeClock = transaction.beforeState.get(client) || 0;
				if (beforeClock !== clock) {
					const structs = store.clients.get(client);
					const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
					for (let i = structs.length - 1; i >= firstChangePos;) i -= 1 + tryToMergeWithLefts(structs, i);
				}
			});
			for (let i = mergeStructs.length - 1; i >= 0; i--) {
				const { client, clock } = mergeStructs[i].id;
				const structs = store.clients.get(client);
				const replacedStructPos = findIndexSS(structs, clock);
				if (replacedStructPos + 1 < structs.length) {
					if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) continue;
				}
				if (replacedStructPos > 0) tryToMergeWithLefts(structs, replacedStructPos);
			}
			if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
				print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
				doc.clientID = generateNewClientId();
			}
			doc.emit("afterTransactionCleanup", [transaction, doc]);
			if (doc._observers.has("update")) {
				const encoder = new UpdateEncoderV1();
				if (writeUpdateMessageFromTransaction(encoder, transaction)) doc.emit("update", [
					encoder.toUint8Array(),
					transaction.origin,
					doc,
					transaction
				]);
			}
			if (doc._observers.has("updateV2")) {
				const encoder = new UpdateEncoderV2();
				if (writeUpdateMessageFromTransaction(encoder, transaction)) doc.emit("updateV2", [
					encoder.toUint8Array(),
					transaction.origin,
					doc,
					transaction
				]);
			}
			const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
			if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
				subdocsAdded.forEach((subdoc) => {
					subdoc.clientID = doc.clientID;
					if (subdoc.collectionid == null) subdoc.collectionid = doc.collectionid;
					doc.subdocs.add(subdoc);
				});
				subdocsRemoved.forEach((subdoc) => doc.subdocs.delete(subdoc));
				doc.emit("subdocs", [
					{
						loaded: subdocsLoaded,
						added: subdocsAdded,
						removed: subdocsRemoved
					},
					doc,
					transaction
				]);
				subdocsRemoved.forEach((subdoc) => subdoc.destroy());
			}
			if (transactionCleanups.length <= i + 1) {
				doc._transactionCleanups = [];
				doc.emit("afterAllTransactions", [doc, transactionCleanups]);
			} else cleanupTransactions(transactionCleanups, i + 1);
		}
	}
};
/**
* Implements the functionality of `y.transact(()=>{..})`
*
* @template T
* @param {Doc} doc
* @param {function(Transaction):T} f
* @param {any} [origin=true]
* @return {T}
*
* @function
*/
var transact = (doc, f, origin = null, local = true) => {
	const transactionCleanups = doc._transactionCleanups;
	let initialCall = false;
	/**
	* @type {any}
	*/
	let result = null;
	if (doc._transaction === null) {
		initialCall = true;
		doc._transaction = new Transaction(doc, origin, local);
		transactionCleanups.push(doc._transaction);
		if (transactionCleanups.length === 1) doc.emit("beforeAllTransactions", [doc]);
		doc.emit("beforeTransaction", [doc._transaction, doc]);
	}
	try {
		result = f(doc._transaction);
	} finally {
		if (initialCall) {
			const finishCleanup = doc._transaction === transactionCleanups[0];
			doc._transaction = null;
			if (finishCleanup) cleanupTransactions(transactionCleanups, 0);
		}
	}
	return result;
};
var StackItem = class {
	/**
	* @param {DeleteSet} deletions
	* @param {DeleteSet} insertions
	*/
	constructor(deletions, insertions) {
		this.insertions = insertions;
		this.deletions = deletions;
		/**
		* Use this to save and restore metadata like selection range
		*/
		this.meta = /* @__PURE__ */ new Map();
	}
};
/**
* @param {Transaction} tr
* @param {UndoManager} um
* @param {StackItem} stackItem
*/
var clearUndoManagerStackItem = (tr, um, stackItem) => {
	iterateDeletedStructs(tr, stackItem.deletions, (item) => {
		if (item instanceof Item && um.scope.some((type) => type === tr.doc || isParentOf(type, item))) keepItem(item, false);
	});
};
/**
* @param {UndoManager} undoManager
* @param {Array<StackItem>} stack
* @param {'undo'|'redo'} eventType
* @return {StackItem?}
*/
var popStackItem = (undoManager, stack, eventType) => {
	/**
	* Keep a reference to the transaction so we can fire the event with the changedParentTypes
	* @type {any}
	*/
	let _tr = null;
	const doc = undoManager.doc;
	const scope = undoManager.scope;
	transact(doc, (transaction) => {
		while (stack.length > 0 && undoManager.currStackItem === null) {
			const store = doc.store;
			const stackItem = stack.pop();
			/**
			* @type {Set<Item>}
			*/
			const itemsToRedo = /* @__PURE__ */ new Set();
			/**
			* @type {Array<Item>}
			*/
			const itemsToDelete = [];
			let performedChange = false;
			iterateDeletedStructs(transaction, stackItem.insertions, (struct) => {
				if (struct instanceof Item) {
					if (struct.redone !== null) {
						let { item, diff } = followRedone(store, struct.id);
						if (diff > 0) item = getItemCleanStart(transaction, createID(item.id.client, item.id.clock + diff));
						struct = item;
					}
					if (!struct.deleted && scope.some((type) => type === transaction.doc || isParentOf(type, struct))) itemsToDelete.push(struct);
				}
			});
			iterateDeletedStructs(transaction, stackItem.deletions, (struct) => {
				if (struct instanceof Item && scope.some((type) => type === transaction.doc || isParentOf(type, struct)) && !isDeleted(stackItem.insertions, struct.id)) itemsToRedo.add(struct);
			});
			itemsToRedo.forEach((struct) => {
				performedChange = redoItem(transaction, struct, itemsToRedo, stackItem.insertions, undoManager.ignoreRemoteMapChanges, undoManager) !== null || performedChange;
			});
			for (let i = itemsToDelete.length - 1; i >= 0; i--) {
				const item = itemsToDelete[i];
				if (undoManager.deleteFilter(item)) {
					item.delete(transaction);
					performedChange = true;
				}
			}
			undoManager.currStackItem = performedChange ? stackItem : null;
		}
		transaction.changed.forEach((subProps, type) => {
			if (subProps.has(null) && type._searchMarker) type._searchMarker.length = 0;
		});
		_tr = transaction;
	}, undoManager);
	const res = undoManager.currStackItem;
	if (res != null) {
		const changedParentTypes = _tr.changedParentTypes;
		undoManager.emit("stack-item-popped", [{
			stackItem: res,
			type: eventType,
			changedParentTypes,
			origin: undoManager
		}, undoManager]);
		undoManager.currStackItem = null;
	}
	return res;
};
/**
* @typedef {Object} UndoManagerOptions
* @property {number} [UndoManagerOptions.captureTimeout=500]
* @property {function(Transaction):boolean} [UndoManagerOptions.captureTransaction] Do not capture changes of a Transaction if result false.
* @property {function(Item):boolean} [UndoManagerOptions.deleteFilter=()=>true] Sometimes
* it is necessary to filter what an Undo/Redo operation can delete. If this
* filter returns false, the type/item won't be deleted even it is in the
* undo/redo scope.
* @property {Set<any>} [UndoManagerOptions.trackedOrigins=new Set([null])]
* @property {boolean} [ignoreRemoteMapChanges] Experimental. By default, the UndoManager will never overwrite remote changes. Enable this property to enable overwriting remote changes on key-value changes (Y.Map, properties on Y.Xml, etc..).
* @property {Doc} [doc] The document that this UndoManager operates on. Only needed if typeScope is empty.
*/
/**
* @typedef {Object} StackItemEvent
* @property {StackItem} StackItemEvent.stackItem
* @property {any} StackItemEvent.origin
* @property {'undo'|'redo'} StackItemEvent.type
* @property {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>} StackItemEvent.changedParentTypes
*/
/**
* Fires 'stack-item-added' event when a stack item was added to either the undo- or
* the redo-stack. You may store additional stack information via the
* metadata property on `event.stackItem.meta` (it is a `Map` of metadata properties).
* Fires 'stack-item-popped' event when a stack item was popped from either the
* undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.meta`.
*
* @extends {ObservableV2<{'stack-item-added':function(StackItemEvent, UndoManager):void, 'stack-item-popped': function(StackItemEvent, UndoManager):void, 'stack-cleared': function({ undoStackCleared: boolean, redoStackCleared: boolean }):void, 'stack-item-updated': function(StackItemEvent, UndoManager):void }>}
*/
var UndoManager = class extends ObservableV2 {
	/**
	* @param {Doc|AbstractType<any>|Array<AbstractType<any>>} typeScope Limits the scope of the UndoManager. If this is set to a ydoc instance, all changes on that ydoc will be undone. If set to a specific type, only changes on that type or its children will be undone. Also accepts an array of types.
	* @param {UndoManagerOptions} options
	*/
	constructor(typeScope, { captureTimeout = 500, captureTransaction = (_tr) => true, deleteFilter = () => true, trackedOrigins = /* @__PURE__ */ new Set([null]), ignoreRemoteMapChanges = false, doc = isArray(typeScope) ? typeScope[0].doc : typeScope instanceof Doc ? typeScope : typeScope.doc } = {}) {
		super();
		/**
		* @type {Array<AbstractType<any> | Doc>}
		*/
		this.scope = [];
		this.doc = doc;
		this.addToScope(typeScope);
		this.deleteFilter = deleteFilter;
		trackedOrigins.add(this);
		this.trackedOrigins = trackedOrigins;
		this.captureTransaction = captureTransaction;
		/**
		* @type {Array<StackItem>}
		*/
		this.undoStack = [];
		/**
		* @type {Array<StackItem>}
		*/
		this.redoStack = [];
		/**
		* Whether the client is currently undoing (calling UndoManager.undo)
		*
		* @type {boolean}
		*/
		this.undoing = false;
		this.redoing = false;
		/**
		* The currently popped stack item if UndoManager.undoing or UndoManager.redoing
		*
		* @type {StackItem|null}
		*/
		this.currStackItem = null;
		this.lastChange = 0;
		this.ignoreRemoteMapChanges = ignoreRemoteMapChanges;
		this.captureTimeout = captureTimeout;
		/**
		* @param {Transaction} transaction
		*/
		this.afterTransactionHandler = (transaction) => {
			if (!this.captureTransaction(transaction) || !this.scope.some((type) => transaction.changedParentTypes.has(type) || type === this.doc) || !this.trackedOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedOrigins.has(transaction.origin.constructor))) return;
			const undoing = this.undoing;
			const redoing = this.redoing;
			const stack = undoing ? this.redoStack : this.undoStack;
			if (undoing) this.stopCapturing();
			else if (!redoing) this.clear(false, true);
			const insertions = new DeleteSet();
			transaction.afterState.forEach((endClock, client) => {
				const startClock = transaction.beforeState.get(client) || 0;
				const len = endClock - startClock;
				if (len > 0) addToDeleteSet(insertions, client, startClock, len);
			});
			const now = getUnixTime();
			let didAdd = false;
			if (this.lastChange > 0 && now - this.lastChange < this.captureTimeout && stack.length > 0 && !undoing && !redoing) {
				const lastOp = stack[stack.length - 1];
				lastOp.deletions = mergeDeleteSets([lastOp.deletions, transaction.deleteSet]);
				lastOp.insertions = mergeDeleteSets([lastOp.insertions, insertions]);
			} else {
				stack.push(new StackItem(transaction.deleteSet, insertions));
				didAdd = true;
			}
			if (!undoing && !redoing) this.lastChange = now;
			iterateDeletedStructs(
				transaction,
				transaction.deleteSet,
				/** @param {Item|GC} item */
				(item) => {
					if (item instanceof Item && this.scope.some((type) => type === transaction.doc || isParentOf(type, item))) keepItem(item, true);
				}
			);
			/**
			* @type {[StackItemEvent, UndoManager]}
			*/
			const changeEvent = [{
				stackItem: stack[stack.length - 1],
				origin: transaction.origin,
				type: undoing ? "redo" : "undo",
				changedParentTypes: transaction.changedParentTypes
			}, this];
			if (didAdd) this.emit("stack-item-added", changeEvent);
			else this.emit("stack-item-updated", changeEvent);
		};
		this.doc.on("afterTransaction", this.afterTransactionHandler);
		this.doc.on("destroy", () => {
			this.destroy();
		});
	}
	/**
	* Extend the scope.
	*
	* @param {Array<AbstractType<any> | Doc> | AbstractType<any> | Doc} ytypes
	*/
	addToScope(ytypes) {
		const tmpSet = new Set(this.scope);
		ytypes = isArray(ytypes) ? ytypes : [ytypes];
		ytypes.forEach((ytype) => {
			if (!tmpSet.has(ytype)) {
				tmpSet.add(ytype);
				if (ytype instanceof AbstractType ? ytype.doc !== this.doc : ytype !== this.doc) warn("[yjs#509] Not same Y.Doc");
				this.scope.push(ytype);
			}
		});
	}
	/**
	* @param {any} origin
	*/
	addTrackedOrigin(origin) {
		this.trackedOrigins.add(origin);
	}
	/**
	* @param {any} origin
	*/
	removeTrackedOrigin(origin) {
		this.trackedOrigins.delete(origin);
	}
	clear(clearUndoStack = true, clearRedoStack = true) {
		if (clearUndoStack && this.canUndo() || clearRedoStack && this.canRedo()) this.doc.transact((tr) => {
			if (clearUndoStack) {
				this.undoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
				this.undoStack = [];
			}
			if (clearRedoStack) {
				this.redoStack.forEach((item) => clearUndoManagerStackItem(tr, this, item));
				this.redoStack = [];
			}
			this.emit("stack-cleared", [{
				undoStackCleared: clearUndoStack,
				redoStackCleared: clearRedoStack
			}]);
		});
	}
	/**
	* UndoManager merges Undo-StackItem if they are created within time-gap
	* smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
	* StackItem won't be merged.
	*
	*
	* @example
	*     // without stopCapturing
	*     ytext.insert(0, 'a')
	*     ytext.insert(1, 'b')
	*     um.undo()
	*     ytext.toString() // => '' (note that 'ab' was removed)
	*     // with stopCapturing
	*     ytext.insert(0, 'a')
	*     um.stopCapturing()
	*     ytext.insert(0, 'b')
	*     um.undo()
	*     ytext.toString() // => 'a' (note that only 'b' was removed)
	*
	*/
	stopCapturing() {
		this.lastChange = 0;
	}
	/**
	* Undo last changes on type.
	*
	* @return {StackItem?} Returns StackItem if a change was applied
	*/
	undo() {
		this.undoing = true;
		let res;
		try {
			res = popStackItem(this, this.undoStack, "undo");
		} finally {
			this.undoing = false;
		}
		return res;
	}
	/**
	* Redo last undo operation.
	*
	* @return {StackItem?} Returns StackItem if a change was applied
	*/
	redo() {
		this.redoing = true;
		let res;
		try {
			res = popStackItem(this, this.redoStack, "redo");
		} finally {
			this.redoing = false;
		}
		return res;
	}
	/**
	* Are undo steps available?
	*
	* @return {boolean} `true` if undo is possible
	*/
	canUndo() {
		return this.undoStack.length > 0;
	}
	/**
	* Are redo steps available?
	*
	* @return {boolean} `true` if redo is possible
	*/
	canRedo() {
		return this.redoStack.length > 0;
	}
	destroy() {
		this.trackedOrigins.delete(this);
		this.doc.off("afterTransaction", this.afterTransactionHandler);
		super.destroy();
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
*/
function* lazyStructReaderGenerator(decoder) {
	const numOfStateUpdates = readVarUint(decoder.restDecoder);
	for (let i = 0; i < numOfStateUpdates; i++) {
		const numberOfStructs = readVarUint(decoder.restDecoder);
		const client = decoder.readClient();
		let clock = readVarUint(decoder.restDecoder);
		for (let i = 0; i < numberOfStructs; i++) {
			const info = decoder.readInfo();
			if (info === 10) {
				const len = readVarUint(decoder.restDecoder);
				yield new Skip(createID(client, clock), len);
				clock += len;
			} else if ((31 & info) !== 0) {
				const cantCopyParentInfo = (info & 192) === 0;
				const struct = new Item(createID(client, clock), null, (info & 128) === 128 ? decoder.readLeftID() : null, null, (info & 64) === 64 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null, cantCopyParentInfo && (info & 32) === 32 ? decoder.readString() : null, readItemContent(decoder, info));
				yield struct;
				clock += struct.length;
			} else {
				const len = decoder.readLen();
				yield new GC(createID(client, clock), len);
				clock += len;
			}
		}
	}
}
var LazyStructReader = class {
	/**
	* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
	* @param {boolean} filterSkips
	*/
	constructor(decoder, filterSkips) {
		this.gen = lazyStructReaderGenerator(decoder);
		/**
		* @type {null | Item | Skip | GC}
		*/
		this.curr = null;
		this.done = false;
		this.filterSkips = filterSkips;
		this.next();
	}
	/**
	* @return {Item | GC | Skip |null}
	*/
	next() {
		do
			this.curr = this.gen.next().value || null;
		while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
		return this.curr;
	}
};
var LazyStructWriter = class {
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	*/
	constructor(encoder) {
		this.currClient = 0;
		this.startClock = 0;
		this.written = 0;
		this.encoder = encoder;
		/**
		* We want to write operations lazily, but also we need to know beforehand how many operations we want to write for each client.
		*
		* This kind of meta-information (#clients, #structs-per-client-written) is written to the restEncoder.
		*
		* We fragment the restEncoder and store a slice of it per-client until we know how many clients there are.
		* When we flush (toUint8Array) we write the restEncoder using the fragments and the meta-information.
		*
		* @type {Array<{ written: number, restEncoder: Uint8Array }>}
		*/
		this.clientStructs = [];
	}
};
/**
* @param {Array<Uint8Array>} updates
* @return {Uint8Array}
*/
var mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
/**
* This method is intended to slice any kind of struct and retrieve the right part.
* It does not handle side-effects, so it should only be used by the lazy-encoder.
*
* @param {Item | GC | Skip} left
* @param {number} diff
* @return {Item | GC}
*/
var sliceStruct = (left, diff) => {
	if (left.constructor === GC) {
		const { client, clock } = left.id;
		return new GC(createID(client, clock + diff), left.length - diff);
	} else if (left.constructor === Skip) {
		const { client, clock } = left.id;
		return new Skip(createID(client, clock + diff), left.length - diff);
	} else {
		const leftItem = left;
		const { client, clock } = leftItem.id;
		return new Item(createID(client, clock + diff), null, createID(client, clock + diff - 1), null, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
	}
};
/**
*
* This function works similarly to `readUpdateV2`.
*
* @param {Array<Uint8Array>} updates
* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
* @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
* @return {Uint8Array}
*/
var mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
	if (updates.length === 1) return updates[0];
	const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
	let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
	/**
	* @todo we don't need offset because we always slice before
	* @type {null | { struct: Item | GC | Skip, offset: number }}
	*/
	let currWrite = null;
	const updateEncoder = new YEncoder();
	const lazyStructEncoder = new LazyStructWriter(updateEncoder);
	while (true) {
		lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
		lazyStructDecoders.sort(
			/** @type {function(any,any):number} */
			(dec1, dec2) => {
				if (dec1.curr.id.client === dec2.curr.id.client) {
					const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
					if (clockDiff === 0) return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
					else return clockDiff;
				} else return dec2.curr.id.client - dec1.curr.id.client;
			}
		);
		if (lazyStructDecoders.length === 0) break;
		const currDecoder = lazyStructDecoders[0];
		const firstClient = currDecoder.curr.id.client;
		if (currWrite !== null) {
			let curr = currDecoder.curr;
			let iterated = false;
			while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
				curr = currDecoder.next();
				iterated = true;
			}
			if (curr === null || curr.id.client !== firstClient || iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) continue;
			if (firstClient !== currWrite.struct.id.client) {
				writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
				currWrite = {
					struct: curr,
					offset: 0
				};
				currDecoder.next();
			} else if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
				if (currWrite.struct.constructor === Skip) currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
				else {
					writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
					const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
					currWrite = {
						struct: new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff),
						offset: 0
					};
				}
			} else {
				const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
				if (diff > 0) {
					if (currWrite.struct.constructor === Skip) currWrite.struct.length -= diff;
					else curr = sliceStruct(curr, diff);
				}
				if (!currWrite.struct.mergeWith(curr)) {
					writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
					currWrite = {
						struct: curr,
						offset: 0
					};
					currDecoder.next();
				}
			}
		} else {
			currWrite = {
				struct: currDecoder.curr,
				offset: 0
			};
			currDecoder.next();
		}
		for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
			writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
			currWrite = {
				struct: next,
				offset: 0
			};
		}
	}
	if (currWrite !== null) {
		writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
		currWrite = null;
	}
	finishLazyStructWriting(lazyStructEncoder);
	writeDeleteSet(updateEncoder, mergeDeleteSets(updateDecoders.map((decoder) => readDeleteSet(decoder))));
	return updateEncoder.toUint8Array();
};
/**
* @param {Uint8Array} update
* @param {Uint8Array} sv
* @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
* @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
*/
var diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
	const state = decodeStateVector(sv);
	const encoder = new YEncoder();
	const lazyStructWriter = new LazyStructWriter(encoder);
	const decoder = new YDecoder(createDecoder(update));
	const reader = new LazyStructReader(decoder, false);
	while (reader.curr) {
		const curr = reader.curr;
		const currClient = curr.id.client;
		const svClock = state.get(currClient) || 0;
		if (reader.curr.constructor === Skip) {
			reader.next();
			continue;
		}
		if (curr.id.clock + curr.length > svClock) {
			writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
			reader.next();
			while (reader.curr && reader.curr.id.client === currClient) {
				writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
				reader.next();
			}
		} else while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) reader.next();
	}
	finishLazyStructWriting(lazyStructWriter);
	writeDeleteSet(encoder, readDeleteSet(decoder));
	return encoder.toUint8Array();
};
/**
* @param {LazyStructWriter} lazyWriter
*/
var flushLazyStructWriter = (lazyWriter) => {
	if (lazyWriter.written > 0) {
		lazyWriter.clientStructs.push({
			written: lazyWriter.written,
			restEncoder: toUint8Array(lazyWriter.encoder.restEncoder)
		});
		lazyWriter.encoder.restEncoder = createEncoder();
		lazyWriter.written = 0;
	}
};
/**
* @param {LazyStructWriter} lazyWriter
* @param {Item | GC} struct
* @param {number} offset
*/
var writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
	if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) flushLazyStructWriter(lazyWriter);
	if (lazyWriter.written === 0) {
		lazyWriter.currClient = struct.id.client;
		lazyWriter.encoder.writeClient(struct.id.client);
		writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
	}
	struct.write(lazyWriter.encoder, offset);
	lazyWriter.written++;
};
/**
* Call this function when we collected all parts and want to
* put all the parts together. After calling this method,
* you can continue using the UpdateEncoder.
*
* @param {LazyStructWriter} lazyWriter
*/
var finishLazyStructWriting = (lazyWriter) => {
	flushLazyStructWriter(lazyWriter);
	const restEncoder = lazyWriter.encoder.restEncoder;
	/**
	* Now we put all the fragments together.
	* This works similarly to `writeClientsStructs`
	*/
	writeVarUint(restEncoder, lazyWriter.clientStructs.length);
	for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
		const partStructs = lazyWriter.clientStructs[i];
		/**
		* Works similarly to `writeStructs`
		*/
		writeVarUint(restEncoder, partStructs.written);
		writeUint8Array(restEncoder, partStructs.restEncoder);
	}
};
/**
* @param {Uint8Array} update
* @param {function(Item|GC|Skip):Item|GC|Skip} blockTransformer
* @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} YDecoder
* @param {typeof UpdateEncoderV2 | typeof UpdateEncoderV1 } YEncoder
*/
var convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
	const updateDecoder = new YDecoder(createDecoder(update));
	const lazyDecoder = new LazyStructReader(updateDecoder, false);
	const updateEncoder = new YEncoder();
	const lazyWriter = new LazyStructWriter(updateEncoder);
	for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
	finishLazyStructWriting(lazyWriter);
	writeDeleteSet(updateEncoder, readDeleteSet(updateDecoder));
	return updateEncoder.toUint8Array();
};
/**
* @param {Uint8Array} update
*/
var convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
var errorComputeChanges = "You must not compute changes after the event-handler fired.";
/**
* @template {AbstractType<any>} T
* YEvent describes the changes on a YType.
*/
var YEvent = class {
	/**
	* @param {T} target The changed type.
	* @param {Transaction} transaction
	*/
	constructor(target, transaction) {
		/**
		* The type on which this event was created on.
		* @type {T}
		*/
		this.target = target;
		/**
		* The current target on which the observe callback is called.
		* @type {AbstractType<any>}
		*/
		this.currentTarget = target;
		/**
		* The transaction that triggered this event.
		* @type {Transaction}
		*/
		this.transaction = transaction;
		/**
		* @type {Object|null}
		*/
		this._changes = null;
		/**
		* @type {null | Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
		*/
		this._keys = null;
		/**
		* @type {null | Array<{ insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any> }>}
		*/
		this._delta = null;
		/**
		* @type {Array<string|number>|null}
		*/
		this._path = null;
	}
	/**
	* Computes the path from `y` to the changed type.
	*
	* @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
	*
	* The following property holds:
	* @example
	*   let type = y
	*   event.path.forEach(dir => {
	*     type = type.get(dir)
	*   })
	*   type === event.target // => true
	*/
	get path() {
		return this._path || (this._path = getPathTo(this.currentTarget, this.target));
	}
	/**
	* Check if a struct is deleted by this event.
	*
	* In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
	*
	* @param {AbstractStruct} struct
	* @return {boolean}
	*/
	deletes(struct) {
		return isDeleted(this.transaction.deleteSet, struct.id);
	}
	/**
	* @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
	*/
	get keys() {
		if (this._keys === null) {
			if (this.transaction.doc._transactionCleanups.length === 0) throw create$3(errorComputeChanges);
			const keys = /* @__PURE__ */ new Map();
			const target = this.target;
			this.transaction.changed.get(target).forEach((key) => {
				if (key !== null) {
					const item = target._map.get(key);
					/**
					* @type {'delete' | 'add' | 'update'}
					*/
					let action;
					let oldValue;
					if (this.adds(item)) {
						let prev = item.left;
						while (prev !== null && this.adds(prev)) prev = prev.left;
						if (this.deletes(item)) {
							if (prev !== null && this.deletes(prev)) {
								action = "delete";
								oldValue = last(prev.content.getContent());
							} else return;
						} else if (prev !== null && this.deletes(prev)) {
							action = "update";
							oldValue = last(prev.content.getContent());
						} else {
							action = "add";
							oldValue = void 0;
						}
					} else if (this.deletes(item)) {
						action = "delete";
						oldValue = last(
							/** @type {Item} */
							item.content.getContent()
						);
					} else return;
					keys.set(key, {
						action,
						oldValue
					});
				}
			});
			this._keys = keys;
		}
		return this._keys;
	}
	/**
	* This is a computed property. Note that this can only be safely computed during the
	* event call. Computing this property after other changes happened might result in
	* unexpected behavior (incorrect computation of deltas). A safe way to collect changes
	* is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
	*
	* @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
	*/
	get delta() {
		return this.changes.delta;
	}
	/**
	* Check if a struct is added by this event.
	*
	* In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
	*
	* @param {AbstractStruct} struct
	* @return {boolean}
	*/
	adds(struct) {
		return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
	}
	/**
	* This is a computed property. Note that this can only be safely computed during the
	* event call. Computing this property after other changes happened might result in
	* unexpected behavior (incorrect computation of deltas). A safe way to collect changes
	* is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
	*
	* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
	*/
	get changes() {
		let changes = this._changes;
		if (changes === null) {
			if (this.transaction.doc._transactionCleanups.length === 0) throw create$3(errorComputeChanges);
			const target = this.target;
			const added = create$4();
			const deleted = create$4();
			/**
			* @type {Array<{insert:Array<any>}|{delete:number}|{retain:number}>}
			*/
			const delta = [];
			changes = {
				added,
				deleted,
				delta,
				keys: this.keys
			};
			if (this.transaction.changed.get(target).has(null)) {
				/**
				* @type {any}
				*/
				let lastOp = null;
				const packOp = () => {
					if (lastOp) delta.push(lastOp);
				};
				for (let item = target._start; item !== null; item = item.right) if (item.deleted) {
					if (this.deletes(item) && !this.adds(item)) {
						if (lastOp === null || lastOp.delete === void 0) {
							packOp();
							lastOp = { delete: 0 };
						}
						lastOp.delete += item.length;
						deleted.add(item);
					}
				} else if (this.adds(item)) {
					if (lastOp === null || lastOp.insert === void 0) {
						packOp();
						lastOp = { insert: [] };
					}
					lastOp.insert = lastOp.insert.concat(item.content.getContent());
					added.add(item);
				} else {
					if (lastOp === null || lastOp.retain === void 0) {
						packOp();
						lastOp = { retain: 0 };
					}
					lastOp.retain += item.length;
				}
				if (lastOp !== null && lastOp.retain === void 0) packOp();
			}
			this._changes = changes;
		}
		return changes;
	}
};
/**
* Compute the path from this type to the specified target.
*
* @example
*   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
*   const path = type.getPathTo(child)
*   // assuming `type instanceof YArray`
*   console.log(path) // might look like => [2, 'key1']
*   child === type.get(path[0]).get(path[1])
*
* @param {AbstractType<any>} parent
* @param {AbstractType<any>} child target
* @return {Array<string|number>} Path to the target
*
* @private
* @function
*/
var getPathTo = (parent, child) => {
	const path = [];
	while (child._item !== null && child !== parent) {
		if (child._item.parentSub !== null) path.unshift(child._item.parentSub);
		else {
			let i = 0;
			let c = child._item.parent._start;
			while (c !== child._item && c !== null) {
				if (!c.deleted && c.countable) i += c.length;
				c = c.right;
			}
			path.unshift(i);
		}
		child = child._item.parent;
	}
	return path;
};
/**
* https://docs.yjs.dev/getting-started/working-with-shared-types#caveats
*/
var warnPrematureAccess = () => {
	warn("Invalid access: Add Yjs type to a document before reading data.");
};
var maxSearchMarker = 80;
/**
* A unique timestamp that identifies each marker.
*
* Time is relative,.. this is more like an ever-increasing clock.
*
* @type {number}
*/
var globalSearchMarkerTimestamp = 0;
var ArraySearchMarker = class {
	/**
	* @param {Item} p
	* @param {number} index
	*/
	constructor(p, index) {
		p.marker = true;
		this.p = p;
		this.index = index;
		this.timestamp = globalSearchMarkerTimestamp++;
	}
};
/**
* @param {ArraySearchMarker} marker
*/
var refreshMarkerTimestamp = (marker) => {
	marker.timestamp = globalSearchMarkerTimestamp++;
};
/**
* This is rather complex so this function is the only thing that should overwrite a marker
*
* @param {ArraySearchMarker} marker
* @param {Item} p
* @param {number} index
*/
var overwriteMarker = (marker, p, index) => {
	marker.p.marker = false;
	marker.p = p;
	p.marker = true;
	marker.index = index;
	marker.timestamp = globalSearchMarkerTimestamp++;
};
/**
* @param {Array<ArraySearchMarker>} searchMarker
* @param {Item} p
* @param {number} index
*/
var markPosition = (searchMarker, p, index) => {
	if (searchMarker.length >= maxSearchMarker) {
		const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
		overwriteMarker(marker, p, index);
		return marker;
	} else {
		const pm = new ArraySearchMarker(p, index);
		searchMarker.push(pm);
		return pm;
	}
};
/**
* Search marker help us to find positions in the associative array faster.
*
* They speed up the process of finding a position without much bookkeeping.
*
* A maximum of `maxSearchMarker` objects are created.
*
* This function always returns a refreshed marker (updated timestamp)
*
* @param {AbstractType<any>} yarray
* @param {number} index
*/
var findMarker = (yarray, index) => {
	if (yarray._start === null || index === 0 || yarray._searchMarker === null) return null;
	const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
	let p = yarray._start;
	let pindex = 0;
	if (marker !== null) {
		p = marker.p;
		pindex = marker.index;
		refreshMarkerTimestamp(marker);
	}
	while (p.right !== null && pindex < index) {
		if (!p.deleted && p.countable) {
			if (index < pindex + p.length) break;
			pindex += p.length;
		}
		p = p.right;
	}
	while (p.left !== null && pindex > index) {
		p = p.left;
		if (!p.deleted && p.countable) pindex -= p.length;
	}
	while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
		p = p.left;
		if (!p.deleted && p.countable) pindex -= p.length;
	}
	if (marker !== null && abs(marker.index - pindex) < p.parent.length / maxSearchMarker) {
		overwriteMarker(marker, p, pindex);
		return marker;
	} else return markPosition(yarray._searchMarker, p, pindex);
};
/**
* Update markers when a change happened.
*
* This should be called before doing a deletion!
*
* @param {Array<ArraySearchMarker>} searchMarker
* @param {number} index
* @param {number} len If insertion, len is positive. If deletion, len is negative.
*/
var updateMarkerChanges = (searchMarker, index, len) => {
	for (let i = searchMarker.length - 1; i >= 0; i--) {
		const m = searchMarker[i];
		if (len > 0) {
			/**
			* @type {Item|null}
			*/
			let p = m.p;
			p.marker = false;
			while (p && (p.deleted || !p.countable)) {
				p = p.left;
				if (p && !p.deleted && p.countable) m.index -= p.length;
			}
			if (p === null || p.marker === true) {
				searchMarker.splice(i, 1);
				continue;
			}
			m.p = p;
			p.marker = true;
		}
		if (index < m.index || len > 0 && index === m.index) m.index = max(index, m.index + len);
	}
};
/**
* Call event listeners with an event. This will also add an event to all
* parents (for `.observeDeep` handlers).
*
* @template EventType
* @param {AbstractType<EventType>} type
* @param {Transaction} transaction
* @param {EventType} event
*/
var callTypeObservers = (type, transaction, event) => {
	const changedType = type;
	const changedParentTypes = transaction.changedParentTypes;
	while (true) {
		setIfUndefined(changedParentTypes, type, () => []).push(event);
		if (type._item === null) break;
		type = type._item.parent;
	}
	callEventHandlerListeners(changedType._eH, event, transaction);
};
/**
* @template EventType
* Abstract Yjs Type class
*/
var AbstractType = class {
	constructor() {
		/**
		* @type {Item|null}
		*/
		this._item = null;
		/**
		* @type {Map<string,Item>}
		*/
		this._map = /* @__PURE__ */ new Map();
		/**
		* @type {Item|null}
		*/
		this._start = null;
		/**
		* @type {Doc|null}
		*/
		this.doc = null;
		this._length = 0;
		/**
		* Event handlers
		* @type {EventHandler<EventType,Transaction>}
		*/
		this._eH = createEventHandler();
		/**
		* Deep event handlers
		* @type {EventHandler<Array<YEvent<any>>,Transaction>}
		*/
		this._dEH = createEventHandler();
		/**
		* @type {null | Array<ArraySearchMarker>}
		*/
		this._searchMarker = null;
	}
	/**
	* @return {AbstractType<any>|null}
	*/
	get parent() {
		return this._item ? this._item.parent : null;
	}
	/**
	* Integrate this type into the Yjs instance.
	*
	* * Save this struct in the os
	* * This type is sent to other client
	* * Observer functions are fired
	*
	* @param {Doc} y The Yjs instance
	* @param {Item|null} item
	*/
	_integrate(y, item) {
		this.doc = y;
		this._item = item;
	}
	/**
	* @return {AbstractType<EventType>}
	*/
	_copy() {
		throw methodUnimplemented();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {AbstractType<EventType>}
	*/
	clone() {
		throw methodUnimplemented();
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
	*/
	_write(_encoder) {}
	/**
	* The first non-deleted item
	*/
	get _first() {
		let n = this._start;
		while (n !== null && n.deleted) n = n.right;
		return n;
	}
	/**
	* Creates YEvent and calls all type observers.
	* Must be implemented by each type.
	*
	* @param {Transaction} transaction
	* @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
	*/
	_callObserver(transaction, _parentSubs) {
		if (!transaction.local && this._searchMarker) this._searchMarker.length = 0;
	}
	/**
	* Observe all events that are created on this type.
	*
	* @param {function(EventType, Transaction):void} f Observer function
	*/
	observe(f) {
		addEventHandlerListener(this._eH, f);
	}
	/**
	* Observe all events that are created by this type and its children.
	*
	* @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
	*/
	observeDeep(f) {
		addEventHandlerListener(this._dEH, f);
	}
	/**
	* Unregister an observer function.
	*
	* @param {function(EventType,Transaction):void} f Observer function
	*/
	unobserve(f) {
		removeEventHandlerListener(this._eH, f);
	}
	/**
	* Unregister an observer function.
	*
	* @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
	*/
	unobserveDeep(f) {
		removeEventHandlerListener(this._dEH, f);
	}
	/**
	* @abstract
	* @return {any}
	*/
	toJSON() {}
};
/**
* @param {AbstractType<any>} type
* @param {number} start
* @param {number} end
* @return {Array<any>}
*
* @private
* @function
*/
var typeListSlice = (type, start, end) => {
	type.doc ?? warnPrematureAccess();
	if (start < 0) start = type._length + start;
	if (end < 0) end = type._length + end;
	let len = end - start;
	const cs = [];
	let n = type._start;
	while (n !== null && len > 0) {
		if (n.countable && !n.deleted) {
			const c = n.content.getContent();
			if (c.length <= start) start -= c.length;
			else {
				for (let i = start; i < c.length && len > 0; i++) {
					cs.push(c[i]);
					len--;
				}
				start = 0;
			}
		}
		n = n.right;
	}
	return cs;
};
/**
* @param {AbstractType<any>} type
* @return {Array<any>}
*
* @private
* @function
*/
var typeListToArray = (type) => {
	type.doc ?? warnPrematureAccess();
	const cs = [];
	let n = type._start;
	while (n !== null) {
		if (n.countable && !n.deleted) {
			const c = n.content.getContent();
			for (let i = 0; i < c.length; i++) cs.push(c[i]);
		}
		n = n.right;
	}
	return cs;
};
/**
* @param {AbstractType<any>} type
* @param {Snapshot} snapshot
* @return {Array<any>}
*
* @private
* @function
*/
var typeListToArraySnapshot = (type, snapshot) => {
	const cs = [];
	let n = type._start;
	while (n !== null) {
		if (n.countable && isVisible(n, snapshot)) {
			const c = n.content.getContent();
			for (let i = 0; i < c.length; i++) cs.push(c[i]);
		}
		n = n.right;
	}
	return cs;
};
/**
* Executes a provided function on once on every element of this YArray.
*
* @param {AbstractType<any>} type
* @param {function(any,number,any):void} f A function to execute on every element of this YArray.
*
* @private
* @function
*/
var typeListForEach = (type, f) => {
	let index = 0;
	let n = type._start;
	type.doc ?? warnPrematureAccess();
	while (n !== null) {
		if (n.countable && !n.deleted) {
			const c = n.content.getContent();
			for (let i = 0; i < c.length; i++) f(c[i], index++, type);
		}
		n = n.right;
	}
};
/**
* @template C,R
* @param {AbstractType<any>} type
* @param {function(C,number,AbstractType<any>):R} f
* @return {Array<R>}
*
* @private
* @function
*/
var typeListMap = (type, f) => {
	/**
	* @type {Array<any>}
	*/
	const result = [];
	typeListForEach(type, (c, i) => {
		result.push(f(c, i, type));
	});
	return result;
};
/**
* @param {AbstractType<any>} type
* @return {IterableIterator<any>}
*
* @private
* @function
*/
var typeListCreateIterator = (type) => {
	let n = type._start;
	/**
	* @type {Array<any>|null}
	*/
	let currentContent = null;
	let currentContentIndex = 0;
	return {
		[Symbol.iterator]() {
			return this;
		},
		next: () => {
			if (currentContent === null) {
				while (n !== null && n.deleted) n = n.right;
				if (n === null) return {
					done: true,
					value: void 0
				};
				currentContent = n.content.getContent();
				currentContentIndex = 0;
				n = n.right;
			}
			const value = currentContent[currentContentIndex++];
			if (currentContent.length <= currentContentIndex) currentContent = null;
			return {
				done: false,
				value
			};
		}
	};
};
/**
* @param {AbstractType<any>} type
* @param {number} index
* @return {any}
*
* @private
* @function
*/
var typeListGet = (type, index) => {
	type.doc ?? warnPrematureAccess();
	const marker = findMarker(type, index);
	let n = type._start;
	if (marker !== null) {
		n = marker.p;
		index -= marker.index;
	}
	for (; n !== null; n = n.right) if (!n.deleted && n.countable) {
		if (index < n.length) return n.content.getContent()[index];
		index -= n.length;
	}
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {Item?} referenceItem
* @param {Array<Object<string,any>|Array<any>|boolean|number|null|string|Uint8Array>} content
*
* @private
* @function
*/
var typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
	let left = referenceItem;
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	const store = doc.store;
	const right = referenceItem === null ? parent._start : referenceItem.right;
	/**
	* @type {Array<Object|Array<any>|number|null>}
	*/
	let jsonContent = [];
	const packJsonContent = () => {
		if (jsonContent.length > 0) {
			left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
			left.integrate(transaction, 0);
			jsonContent = [];
		}
	};
	content.forEach((c) => {
		if (c === null) jsonContent.push(c);
		else switch (c.constructor) {
			case Number:
			case Object:
			case Boolean:
			case Array:
			case String:
				jsonContent.push(c);
				break;
			default:
				packJsonContent();
				switch (c.constructor) {
					case Uint8Array:
					case ArrayBuffer:
						left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(c)));
						left.integrate(transaction, 0);
						break;
					case Doc:
						left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(c));
						left.integrate(transaction, 0);
						break;
					default: if (c instanceof AbstractType) {
						left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
						left.integrate(transaction, 0);
					} else throw new Error("Unexpected content type in insert operation");
				}
		}
	});
	packJsonContent();
};
var lengthExceeded = () => create$3("Length exceeded!");
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {number} index
* @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
*
* @private
* @function
*/
var typeListInsertGenerics = (transaction, parent, index, content) => {
	if (index > parent._length) throw lengthExceeded();
	if (index === 0) {
		if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, index, content.length);
		return typeListInsertGenericsAfter(transaction, parent, null, content);
	}
	const startIndex = index;
	const marker = findMarker(parent, index);
	let n = parent._start;
	if (marker !== null) {
		n = marker.p;
		index -= marker.index;
		if (index === 0) {
			n = n.prev;
			index += n && n.countable && !n.deleted ? n.length : 0;
		}
	}
	for (; n !== null; n = n.right) if (!n.deleted && n.countable) {
		if (index <= n.length) {
			if (index < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
			break;
		}
		index -= n.length;
	}
	if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, startIndex, content.length);
	return typeListInsertGenericsAfter(transaction, parent, n, content);
};
/**
* Pushing content is special as we generally want to push after the last item. So we don't have to update
* the search marker.
*
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
*
* @private
* @function
*/
var typeListPushGenerics = (transaction, parent, content) => {
	let n = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, {
		index: 0,
		p: parent._start
	}).p;
	if (n) while (n.right) n = n.right;
	return typeListInsertGenericsAfter(transaction, parent, n, content);
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {number} index
* @param {number} length
*
* @private
* @function
*/
var typeListDelete = (transaction, parent, index, length) => {
	if (length === 0) return;
	const startIndex = index;
	const startLength = length;
	const marker = findMarker(parent, index);
	let n = parent._start;
	if (marker !== null) {
		n = marker.p;
		index -= marker.index;
	}
	for (; n !== null && index > 0; n = n.right) if (!n.deleted && n.countable) {
		if (index < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
		index -= n.length;
	}
	while (length > 0 && n !== null) {
		if (!n.deleted) {
			if (length < n.length) getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length));
			n.delete(transaction);
			length -= n.length;
		}
		n = n.right;
	}
	if (length > 0) throw lengthExceeded();
	if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, startIndex, -startLength + length);
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {string} key
*
* @private
* @function
*/
var typeMapDelete = (transaction, parent, key) => {
	const c = parent._map.get(key);
	if (c !== void 0) c.delete(transaction);
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {string} key
* @param {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} value
*
* @private
* @function
*/
var typeMapSet = (transaction, parent, key, value) => {
	const left = parent._map.get(key) || null;
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	let content;
	if (value == null) content = new ContentAny([value]);
	else switch (value.constructor) {
		case Number:
		case Object:
		case Boolean:
		case Array:
		case String:
		case Date:
		case BigInt:
			content = new ContentAny([value]);
			break;
		case Uint8Array:
			content = new ContentBinary(value);
			break;
		case Doc:
			content = new ContentDoc(value);
			break;
		default: if (value instanceof AbstractType) content = new ContentType(value);
		else throw new Error("Unexpected content type");
	}
	new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
};
/**
* @param {AbstractType<any>} parent
* @param {string} key
* @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
*
* @private
* @function
*/
var typeMapGet = (parent, key) => {
	parent.doc ?? warnPrematureAccess();
	const val = parent._map.get(key);
	return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
};
/**
* @param {AbstractType<any>} parent
* @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
*
* @private
* @function
*/
var typeMapGetAll = (parent) => {
	/**
	* @type {Object<string,any>}
	*/
	const res = {};
	parent.doc ?? warnPrematureAccess();
	parent._map.forEach((value, key) => {
		if (!value.deleted) res[key] = value.content.getContent()[value.length - 1];
	});
	return res;
};
/**
* @param {AbstractType<any>} parent
* @param {string} key
* @return {boolean}
*
* @private
* @function
*/
var typeMapHas = (parent, key) => {
	parent.doc ?? warnPrematureAccess();
	const val = parent._map.get(key);
	return val !== void 0 && !val.deleted;
};
/**
* @param {AbstractType<any>} parent
* @param {Snapshot} snapshot
* @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
*
* @private
* @function
*/
var typeMapGetAllSnapshot = (parent, snapshot) => {
	/**
	* @type {Object<string,any>}
	*/
	const res = {};
	parent._map.forEach((value, key) => {
		/**
		* @type {Item|null}
		*/
		let v = value;
		while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) v = v.left;
		if (v !== null && isVisible(v, snapshot)) res[key] = v.content.getContent()[v.length - 1];
	});
	return res;
};
/**
* @param {AbstractType<any> & { _map: Map<string, Item> }} type
* @return {IterableIterator<Array<any>>}
*
* @private
* @function
*/
var createMapIterator = (type) => {
	type.doc ?? warnPrematureAccess();
	return iteratorFilter(
		type._map.entries(),
		/** @param {any} entry */
		(entry) => !entry[1].deleted
	);
};
/**
* @module YArray
*/
/**
* Event that describes the changes on a YArray
* @template T
* @extends YEvent<YArray<T>>
*/
var YArrayEvent = class extends YEvent {};
/**
* A shared Array implementation.
* @template T
* @extends AbstractType<YArrayEvent<T>>
* @implements {Iterable<T>}
*/
var YArray = class YArray extends AbstractType {
	constructor() {
		super();
		/**
		* @type {Array<any>?}
		* @private
		*/
		this._prelimContent = [];
		/**
		* @type {Array<ArraySearchMarker>}
		*/
		this._searchMarker = [];
	}
	/**
	* Construct a new YArray containing the specified items.
	* @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
	* @param {Array<T>} items
	* @return {YArray<T>}
	*/
	static from(items) {
		/**
		* @type {YArray<T>}
		*/
		const a = new YArray();
		a.push(items);
		return a;
	}
	/**
	* Integrate this type into the Yjs instance.
	*
	* * Save this struct in the os
	* * This type is sent to other client
	* * Observer functions are fired
	*
	* @param {Doc} y The Yjs instance
	* @param {Item} item
	*/
	_integrate(y, item) {
		super._integrate(y, item);
		this.insert(0, this._prelimContent);
		this._prelimContent = null;
	}
	/**
	* @return {YArray<T>}
	*/
	_copy() {
		return new YArray();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YArray<T>}
	*/
	clone() {
		/**
		* @type {YArray<T>}
		*/
		const arr = new YArray();
		arr.insert(0, this.toArray().map((el) => el instanceof AbstractType ? el.clone() : el));
		return arr;
	}
	get length() {
		this.doc ?? warnPrematureAccess();
		return this._length;
	}
	/**
	* Creates YArrayEvent and calls observers.
	*
	* @param {Transaction} transaction
	* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
	*/
	_callObserver(transaction, parentSubs) {
		super._callObserver(transaction, parentSubs);
		callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
	}
	/**
	* Inserts new content at an index.
	*
	* Important: This function expects an array of content. Not just a content
	* object. The reason for this "weirdness" is that inserting several elements
	* is very efficient when it is done as a single operation.
	*
	* @example
	*  // Insert character 'a' at position 0
	*  yarray.insert(0, ['a'])
	*  // Insert numbers 1, 2 at position 1
	*  yarray.insert(1, [1, 2])
	*
	* @param {number} index The index to insert content at.
	* @param {Array<T>} content The array of content
	*/
	insert(index, content) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeListInsertGenerics(transaction, this, index, content);
		});
		else
 /** @type {Array<any>} */ this._prelimContent.splice(index, 0, ...content);
	}
	/**
	* Appends content to this YArray.
	*
	* @param {Array<T>} content Array of content to append.
	*
	* @todo Use the following implementation in all types.
	*/
	push(content) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeListPushGenerics(transaction, this, content);
		});
		else
 /** @type {Array<any>} */ this._prelimContent.push(...content);
	}
	/**
	* Prepends content to this YArray.
	*
	* @param {Array<T>} content Array of content to prepend.
	*/
	unshift(content) {
		this.insert(0, content);
	}
	/**
	* Deletes elements starting from an index.
	*
	* @param {number} index Index at which to start deleting elements
	* @param {number} length The number of elements to remove. Defaults to 1.
	*/
	delete(index, length = 1) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeListDelete(transaction, this, index, length);
		});
		else
 /** @type {Array<any>} */ this._prelimContent.splice(index, length);
	}
	/**
	* Returns the i-th element from a YArray.
	*
	* @param {number} index The index of the element to return from the YArray
	* @return {T}
	*/
	get(index) {
		return typeListGet(this, index);
	}
	/**
	* Transforms this YArray to a JavaScript Array.
	*
	* @return {Array<T>}
	*/
	toArray() {
		return typeListToArray(this);
	}
	/**
	* Returns a portion of this YArray into a JavaScript Array selected
	* from start to end (end not included).
	*
	* @param {number} [start]
	* @param {number} [end]
	* @return {Array<T>}
	*/
	slice(start = 0, end = this.length) {
		return typeListSlice(this, start, end);
	}
	/**
	* Transforms this Shared Type to a JSON object.
	*
	* @return {Array<any>}
	*/
	toJSON() {
		return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
	}
	/**
	* Returns an Array with the result of calling a provided function on every
	* element of this YArray.
	*
	* @template M
	* @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
	* @return {Array<M>} A new array with each element being the result of the
	*                 callback function
	*/
	map(f) {
		return typeListMap(this, f);
	}
	/**
	* Executes a provided function once on every element of this YArray.
	*
	* @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
	*/
	forEach(f) {
		typeListForEach(this, f);
	}
	/**
	* @return {IterableIterator<T>}
	*/
	[Symbol.iterator]() {
		return typeListCreateIterator(this);
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	*/
	_write(encoder) {
		encoder.writeTypeRef(YArrayRefID);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
*
* @private
* @function
*/
var readYArray = (_decoder) => new YArray();
/**
* @module YMap
*/
/**
* @template T
* @extends YEvent<YMap<T>>
* Event that describes the changes on a YMap.
*/
var YMapEvent = class extends YEvent {
	/**
	* @param {YMap<T>} ymap The YArray that changed.
	* @param {Transaction} transaction
	* @param {Set<any>} subs The keys that changed.
	*/
	constructor(ymap, transaction, subs) {
		super(ymap, transaction);
		this.keysChanged = subs;
	}
};
/**
* @template MapType
* A shared Map implementation.
*
* @extends AbstractType<YMapEvent<MapType>>
* @implements {Iterable<[string, MapType]>}
*/
var YMap = class YMap extends AbstractType {
	/**
	*
	* @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
	*/
	constructor(entries) {
		super();
		/**
		* @type {Map<string,any>?}
		* @private
		*/
		this._prelimContent = null;
		if (entries === void 0) this._prelimContent = /* @__PURE__ */ new Map();
		else this._prelimContent = new Map(entries);
	}
	/**
	* Integrate this type into the Yjs instance.
	*
	* * Save this struct in the os
	* * This type is sent to other client
	* * Observer functions are fired
	*
	* @param {Doc} y The Yjs instance
	* @param {Item} item
	*/
	_integrate(y, item) {
		super._integrate(y, item);
		/** @type {Map<string, any>} */ this._prelimContent.forEach((value, key) => {
			this.set(key, value);
		});
		this._prelimContent = null;
	}
	/**
	* @return {YMap<MapType>}
	*/
	_copy() {
		return new YMap();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YMap<MapType>}
	*/
	clone() {
		/**
		* @type {YMap<MapType>}
		*/
		const map = new YMap();
		this.forEach((value, key) => {
			map.set(key, value instanceof AbstractType ? value.clone() : value);
		});
		return map;
	}
	/**
	* Creates YMapEvent and calls observers.
	*
	* @param {Transaction} transaction
	* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
	*/
	_callObserver(transaction, parentSubs) {
		callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
	}
	/**
	* Transforms this Shared Type to a JSON object.
	*
	* @return {Object<string,any>}
	*/
	toJSON() {
		this.doc ?? warnPrematureAccess();
		/**
		* @type {Object<string,MapType>}
		*/
		const map = {};
		this._map.forEach((item, key) => {
			if (!item.deleted) {
				const v = item.content.getContent()[item.length - 1];
				map[key] = v instanceof AbstractType ? v.toJSON() : v;
			}
		});
		return map;
	}
	/**
	* Returns the size of the YMap (count of key/value pairs)
	*
	* @return {number}
	*/
	get size() {
		return [...createMapIterator(this)].length;
	}
	/**
	* Returns the keys for each element in the YMap Type.
	*
	* @return {IterableIterator<string>}
	*/
	keys() {
		return iteratorMap(
			createMapIterator(this),
			/** @param {any} v */
			(v) => v[0]
		);
	}
	/**
	* Returns the values for each element in the YMap Type.
	*
	* @return {IterableIterator<MapType>}
	*/
	values() {
		return iteratorMap(
			createMapIterator(this),
			/** @param {any} v */
			(v) => v[1].content.getContent()[v[1].length - 1]
		);
	}
	/**
	* Returns an Iterator of [key, value] pairs
	*
	* @return {IterableIterator<[string, MapType]>}
	*/
	entries() {
		return iteratorMap(
			createMapIterator(this),
			/** @param {any} v */
			(v) => [v[0], v[1].content.getContent()[v[1].length - 1]]
		);
	}
	/**
	* Executes a provided function on once on every key-value pair.
	*
	* @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
	*/
	forEach(f) {
		this.doc ?? warnPrematureAccess();
		this._map.forEach((item, key) => {
			if (!item.deleted) f(item.content.getContent()[item.length - 1], key, this);
		});
	}
	/**
	* Returns an Iterator of [key, value] pairs
	*
	* @return {IterableIterator<[string, MapType]>}
	*/
	[Symbol.iterator]() {
		return this.entries();
	}
	/**
	* Remove a specified element from this YMap.
	*
	* @param {string} key The key of the element to remove.
	*/
	delete(key) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapDelete(transaction, this, key);
		});
		else
 /** @type {Map<string, any>} */ this._prelimContent.delete(key);
	}
	/**
	* Adds or updates an element with a specified key and value.
	* @template {MapType} VAL
	*
	* @param {string} key The key of the element to add to this YMap
	* @param {VAL} value The value of the element to add
	* @return {VAL}
	*/
	set(key, value) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapSet(transaction, this, key, value);
		});
		else
 /** @type {Map<string, any>} */ this._prelimContent.set(key, value);
		return value;
	}
	/**
	* Returns a specified element from this YMap.
	*
	* @param {string} key
	* @return {MapType|undefined}
	*/
	get(key) {
		return typeMapGet(this, key);
	}
	/**
	* Returns a boolean indicating whether the specified key exists or not.
	*
	* @param {string} key The key to test.
	* @return {boolean}
	*/
	has(key) {
		return typeMapHas(this, key);
	}
	/**
	* Removes all elements from this YMap.
	*/
	clear() {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			this.forEach(function(_value, key, map) {
				typeMapDelete(transaction, map, key);
			});
		});
		else
 /** @type {Map<string, any>} */ this._prelimContent.clear();
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	*/
	_write(encoder) {
		encoder.writeTypeRef(YMapRefID);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
*
* @private
* @function
*/
var readYMap = (_decoder) => new YMap();
/**
* @module YText
*/
/**
* @param {any} a
* @param {any} b
* @return {boolean}
*/
var equalAttrs$1 = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);
var ItemTextListPosition = class {
	/**
	* @param {Item|null} left
	* @param {Item|null} right
	* @param {number} index
	* @param {Map<string,any>} currentAttributes
	*/
	constructor(left, right, index, currentAttributes) {
		this.left = left;
		this.right = right;
		this.index = index;
		this.currentAttributes = currentAttributes;
	}
	/**
	* Only call this if you know that this.right is defined
	*/
	forward() {
		if (this.right === null) unexpectedCase();
		switch (this.right.content.constructor) {
			case ContentFormat:
				if (!this.right.deleted) updateCurrentAttributes(this.currentAttributes, this.right.content);
				break;
			default: if (!this.right.deleted) this.index += this.right.length;
		}
		this.left = this.right;
		this.right = this.right.right;
	}
};
/**
* @param {Transaction} transaction
* @param {ItemTextListPosition} pos
* @param {number} count steps to move forward
* @return {ItemTextListPosition}
*
* @private
* @function
*/
var findNextPosition = (transaction, pos, count) => {
	while (pos.right !== null && count > 0) {
		switch (pos.right.content.constructor) {
			case ContentFormat:
				if (!pos.right.deleted) updateCurrentAttributes(pos.currentAttributes, pos.right.content);
				break;
			default: if (!pos.right.deleted) {
				if (count < pos.right.length) getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
				pos.index += pos.right.length;
				count -= pos.right.length;
			}
		}
		pos.left = pos.right;
		pos.right = pos.right.right;
	}
	return pos;
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {number} index
* @param {boolean} useSearchMarker
* @return {ItemTextListPosition}
*
* @private
* @function
*/
var findPosition = (transaction, parent, index, useSearchMarker) => {
	const currentAttributes = /* @__PURE__ */ new Map();
	const marker = useSearchMarker ? findMarker(parent, index) : null;
	if (marker) return findNextPosition(transaction, new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes), index - marker.index);
	else return findNextPosition(transaction, new ItemTextListPosition(null, parent._start, 0, currentAttributes), index);
};
/**
* Negate applied formats
*
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {ItemTextListPosition} currPos
* @param {Map<string,any>} negatedAttributes
*
* @private
* @function
*/
var insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
	while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs$1(
		negatedAttributes.get(
			/** @type {ContentFormat} */
			currPos.right.content.key
		),
		/** @type {ContentFormat} */
		currPos.right.content.value
	))) {
		if (!currPos.right.deleted) negatedAttributes.delete(
			/** @type {ContentFormat} */
			currPos.right.content.key
		);
		currPos.forward();
	}
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	negatedAttributes.forEach((val, key) => {
		const left = currPos.left;
		const right = currPos.right;
		const nextFormat = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
		nextFormat.integrate(transaction, 0);
		currPos.right = nextFormat;
		currPos.forward();
	});
};
/**
* @param {Map<string,any>} currentAttributes
* @param {ContentFormat} format
*
* @private
* @function
*/
var updateCurrentAttributes = (currentAttributes, format) => {
	const { key, value } = format;
	if (value === null) currentAttributes.delete(key);
	else currentAttributes.set(key, value);
};
/**
* @param {ItemTextListPosition} currPos
* @param {Object<string,any>} attributes
*
* @private
* @function
*/
var minimizeAttributeChanges = (currPos, attributes) => {
	while (true) {
		if (currPos.right === null) break;
		else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs$1(
			attributes[currPos.right.content.key] ?? null,
			/** @type {ContentFormat} */
			currPos.right.content.value
		));
		else break;
		currPos.forward();
	}
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {ItemTextListPosition} currPos
* @param {Object<string,any>} attributes
* @return {Map<string,any>}
*
* @private
* @function
**/
var insertAttributes = (transaction, parent, currPos, attributes) => {
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	const negatedAttributes = /* @__PURE__ */ new Map();
	for (const key in attributes) {
		const val = attributes[key];
		const currentVal = currPos.currentAttributes.get(key) ?? null;
		if (!equalAttrs$1(currentVal, val)) {
			negatedAttributes.set(key, currentVal);
			const { left, right } = currPos;
			currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
			currPos.right.integrate(transaction, 0);
			currPos.forward();
		}
	}
	return negatedAttributes;
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {ItemTextListPosition} currPos
* @param {string|object|AbstractType<any>} text
* @param {Object<string,any>} attributes
*
* @private
* @function
**/
var insertText = (transaction, parent, currPos, text, attributes) => {
	currPos.currentAttributes.forEach((_val, key) => {
		if (attributes[key] === void 0) attributes[key] = null;
	});
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	minimizeAttributeChanges(currPos, attributes);
	const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
	const content = text.constructor === String ? new ContentString(text) : text instanceof AbstractType ? new ContentType(text) : new ContentEmbed(text);
	let { left, right, index } = currPos;
	if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
	right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
	right.integrate(transaction, 0);
	currPos.right = right;
	currPos.index = index;
	currPos.forward();
	insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
/**
* @param {Transaction} transaction
* @param {AbstractType<any>} parent
* @param {ItemTextListPosition} currPos
* @param {number} length
* @param {Object<string,any>} attributes
*
* @private
* @function
*/
var formatText = (transaction, parent, currPos, length, attributes) => {
	const doc = transaction.doc;
	const ownClientId = doc.clientID;
	minimizeAttributeChanges(currPos, attributes);
	const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
	iterationLoop: while (currPos.right !== null && (length > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
		if (!currPos.right.deleted) switch (currPos.right.content.constructor) {
			case ContentFormat: {
				const { key, value } = currPos.right.content;
				const attr = attributes[key];
				if (attr !== void 0) {
					if (equalAttrs$1(attr, value)) negatedAttributes.delete(key);
					else {
						if (length === 0) break iterationLoop;
						negatedAttributes.set(key, value);
					}
					currPos.right.delete(transaction);
				} else currPos.currentAttributes.set(key, value);
				break;
			}
			default:
				if (length < currPos.right.length) getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
				length -= currPos.right.length;
		}
		currPos.forward();
	}
	if (length > 0) {
		let newlines = "";
		for (; length > 0; length--) newlines += "\n";
		currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
		currPos.right.integrate(transaction, 0);
		currPos.forward();
	}
	insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
/**
* Call this function after string content has been deleted in order to
* clean up formatting Items.
*
* @param {Transaction} transaction
* @param {Item} start
* @param {Item|null} curr exclusive end, automatically iterates to the next Content Item
* @param {Map<string,any>} startAttributes
* @param {Map<string,any>} currAttributes
* @return {number} The amount of formatting Items deleted.
*
* @function
*/
var cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
	/**
	* @type {Item|null}
	*/
	let end = start;
	/**
	* @type {Map<string,ContentFormat>}
	*/
	const endFormats = create$5();
	while (end && (!end.countable || end.deleted)) {
		if (!end.deleted && end.content.constructor === ContentFormat) {
			const cf = end.content;
			endFormats.set(cf.key, cf);
		}
		end = end.right;
	}
	let cleanups = 0;
	let reachedCurr = false;
	while (start !== end) {
		if (curr === start) reachedCurr = true;
		if (!start.deleted) {
			const content = start.content;
			switch (content.constructor) {
				case ContentFormat: {
					const { key, value } = content;
					const startAttrValue = startAttributes.get(key) ?? null;
					if (endFormats.get(key) !== content || startAttrValue === value) {
						start.delete(transaction);
						cleanups++;
						if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
							if (startAttrValue === null) currAttributes.delete(key);
							else currAttributes.set(key, startAttrValue);
						}
					}
					if (!reachedCurr && !start.deleted) updateCurrentAttributes(currAttributes, content);
					break;
				}
			}
		}
		start = start.right;
	}
	return cleanups;
};
/**
* @param {Transaction} transaction
* @param {Item | null} item
*/
var cleanupContextlessFormattingGap = (transaction, item) => {
	while (item && item.right && (item.right.deleted || !item.right.countable)) item = item.right;
	const attrs = /* @__PURE__ */ new Set();
	while (item && (item.deleted || !item.countable)) {
		if (!item.deleted && item.content.constructor === ContentFormat) {
			const key = item.content.key;
			if (attrs.has(key)) item.delete(transaction);
			else attrs.add(key);
		}
		item = item.left;
	}
};
/**
* This function is experimental and subject to change / be removed.
*
* Ideally, we don't need this function at all. Formatting attributes should be cleaned up
* automatically after each change. This function iterates twice over the complete YText type
* and removes unnecessary formatting attributes. This is also helpful for testing.
*
* This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
*
* @param {YText} type
* @return {number} How many formatting attributes have been cleaned up.
*/
var cleanupYTextFormatting = (type) => {
	let res = 0;
	transact(type.doc, (transaction) => {
		let start = type._start;
		let end = type._start;
		let startAttributes = create$5();
		const currentAttributes = copy(startAttributes);
		while (end) {
			if (end.deleted === false) switch (end.content.constructor) {
				case ContentFormat:
					updateCurrentAttributes(currentAttributes, end.content);
					break;
				default:
					res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
					startAttributes = copy(currentAttributes);
					start = end;
			}
			end = end.right;
		}
	});
	return res;
};
/**
* This will be called by the transaction once the event handlers are called to potentially cleanup
* formatting attributes.
*
* @param {Transaction} transaction
*/
var cleanupYTextAfterTransaction = (transaction) => {
	/**
	* @type {Set<YText>}
	*/
	const needFullCleanup = /* @__PURE__ */ new Set();
	const doc = transaction.doc;
	for (const [client, afterClock] of transaction.afterState.entries()) {
		const clock = transaction.beforeState.get(client) || 0;
		if (afterClock === clock) continue;
		iterateStructs(transaction, doc.store.clients.get(client), clock, afterClock, (item) => {
			if (!item.deleted && item.content.constructor === ContentFormat && item.constructor !== GC) needFullCleanup.add(
				/** @type {any} */
				item.parent
			);
		});
	}
	transact(doc, (t) => {
		iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
			if (item instanceof GC || !item.parent._hasFormatting || needFullCleanup.has(item.parent)) return;
			const parent = item.parent;
			if (item.content.constructor === ContentFormat) needFullCleanup.add(parent);
			else cleanupContextlessFormattingGap(t, item);
		});
		for (const yText of needFullCleanup) cleanupYTextFormatting(yText);
	});
};
/**
* @param {Transaction} transaction
* @param {ItemTextListPosition} currPos
* @param {number} length
* @return {ItemTextListPosition}
*
* @private
* @function
*/
var deleteText = (transaction, currPos, length) => {
	const startLength = length;
	const startAttrs = copy(currPos.currentAttributes);
	const start = currPos.right;
	while (length > 0 && currPos.right !== null) {
		if (currPos.right.deleted === false) switch (currPos.right.content.constructor) {
			case ContentType:
			case ContentEmbed:
			case ContentString:
				if (length < currPos.right.length) getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length));
				length -= currPos.right.length;
				currPos.right.delete(transaction);
		}
		currPos.forward();
	}
	if (start) cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
	const parent = (currPos.left || currPos.right).parent;
	if (parent._searchMarker) updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length);
	return currPos;
};
/**
* The Quill Delta format represents changes on a text document with
* formatting information. For more information visit {@link https://quilljs.com/docs/delta/|Quill Delta}
*
* @example
*   {
*     ops: [
*       { insert: 'Gandalf', attributes: { bold: true } },
*       { insert: ' the ' },
*       { insert: 'Grey', attributes: { color: '#cccccc' } }
*     ]
*   }
*
*/
/**
* Attributes that can be assigned to a selection of text.
*
* @example
*   {
*     bold: true,
*     font-size: '40px'
*   }
*
* @typedef {Object} TextAttributes
*/
/**
* @extends YEvent<YText>
* Event that describes the changes on a YText type.
*/
var YTextEvent = class extends YEvent {
	/**
	* @param {YText} ytext
	* @param {Transaction} transaction
	* @param {Set<any>} subs The keys that changed
	*/
	constructor(ytext, transaction, subs) {
		super(ytext, transaction);
		/**
		* Whether the children changed.
		* @type {Boolean}
		* @private
		*/
		this.childListChanged = false;
		/**
		* Set of all changed attributes.
		* @type {Set<string>}
		*/
		this.keysChanged = /* @__PURE__ */ new Set();
		subs.forEach((sub) => {
			if (sub === null) this.childListChanged = true;
			else this.keysChanged.add(sub);
		});
	}
	/**
	* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
	*/
	get changes() {
		if (this._changes === null) {
			/**
			* @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string|AbstractType<any>|object, delete?:number, retain?:number}>}}
			*/
			const changes = {
				keys: this.keys,
				delta: this.delta,
				added: /* @__PURE__ */ new Set(),
				deleted: /* @__PURE__ */ new Set()
			};
			this._changes = changes;
		}
		return this._changes;
	}
	/**
	* Compute the changes in the delta format.
	* A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
	*
	* @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
	*
	* @public
	*/
	get delta() {
		if (this._delta === null) {
			const y = this.target.doc;
			/**
			* @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
			*/
			const delta = [];
			transact(y, (transaction) => {
				const currentAttributes = /* @__PURE__ */ new Map();
				const oldAttributes = /* @__PURE__ */ new Map();
				let item = this.target._start;
				/**
				* @type {string?}
				*/
				let action = null;
				/**
				* @type {Object<string,any>}
				*/
				const attributes = {};
				/**
				* @type {string|object}
				*/
				let insert = "";
				let retain = 0;
				let deleteLen = 0;
				const addOp = () => {
					if (action !== null) {
						/**
						* @type {any}
						*/
						let op = null;
						switch (action) {
							case "delete":
								if (deleteLen > 0) op = { delete: deleteLen };
								deleteLen = 0;
								break;
							case "insert":
								if (typeof insert === "object" || insert.length > 0) {
									op = { insert };
									if (currentAttributes.size > 0) {
										op.attributes = {};
										currentAttributes.forEach((value, key) => {
											if (value !== null) op.attributes[key] = value;
										});
									}
								}
								insert = "";
								break;
							case "retain":
								if (retain > 0) {
									op = { retain };
									if (!isEmpty(attributes)) op.attributes = assign({}, attributes);
								}
								retain = 0;
						}
						if (op) delta.push(op);
						action = null;
					}
				};
				while (item !== null) {
					switch (item.content.constructor) {
						case ContentType:
						case ContentEmbed:
							if (this.adds(item)) {
								if (!this.deletes(item)) {
									addOp();
									action = "insert";
									insert = item.content.getContent()[0];
									addOp();
								}
							} else if (this.deletes(item)) {
								if (action !== "delete") {
									addOp();
									action = "delete";
								}
								deleteLen += 1;
							} else if (!item.deleted) {
								if (action !== "retain") {
									addOp();
									action = "retain";
								}
								retain += 1;
							}
							break;
						case ContentString:
							if (this.adds(item)) {
								if (!this.deletes(item)) {
									if (action !== "insert") {
										addOp();
										action = "insert";
									}
									insert += item.content.str;
								}
							} else if (this.deletes(item)) {
								if (action !== "delete") {
									addOp();
									action = "delete";
								}
								deleteLen += item.length;
							} else if (!item.deleted) {
								if (action !== "retain") {
									addOp();
									action = "retain";
								}
								retain += item.length;
							}
							break;
						case ContentFormat: {
							const { key, value } = item.content;
							if (this.adds(item)) {
								if (!this.deletes(item)) {
									if (!equalAttrs$1(currentAttributes.get(key) ?? null, value)) {
										if (action === "retain") addOp();
										if (equalAttrs$1(value, oldAttributes.get(key) ?? null)) delete attributes[key];
										else attributes[key] = value;
									} else if (value !== null) item.delete(transaction);
								}
							} else if (this.deletes(item)) {
								oldAttributes.set(key, value);
								const curVal = currentAttributes.get(key) ?? null;
								if (!equalAttrs$1(curVal, value)) {
									if (action === "retain") addOp();
									attributes[key] = curVal;
								}
							} else if (!item.deleted) {
								oldAttributes.set(key, value);
								const attr = attributes[key];
								if (attr !== void 0) {
									if (!equalAttrs$1(attr, value)) {
										if (action === "retain") addOp();
										if (value === null) delete attributes[key];
										else attributes[key] = value;
									} else if (attr !== null) item.delete(transaction);
								}
							}
							if (!item.deleted) {
								if (action === "insert") addOp();
								updateCurrentAttributes(currentAttributes, item.content);
							}
							break;
						}
					}
					item = item.right;
				}
				addOp();
				while (delta.length > 0) {
					const lastOp = delta[delta.length - 1];
					if (lastOp.retain !== void 0 && lastOp.attributes === void 0) delta.pop();
					else break;
				}
			});
			this._delta = delta;
		}
		return this._delta;
	}
};
/**
* Type that represents text with formatting information.
*
* This type replaces y-richtext as this implementation is able to handle
* block formats (format information on a paragraph), embeds (complex elements
* like pictures and videos), and text formats (**bold**, *italic*).
*
* @extends AbstractType<YTextEvent>
*/
var YText = class YText extends AbstractType {
	/**
	* @param {String} [string] The initial value of the YText.
	*/
	constructor(string) {
		super();
		/**
		* Array of pending operations on this type
		* @type {Array<function():void>?}
		*/
		this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
		/**
		* @type {Array<ArraySearchMarker>|null}
		*/
		this._searchMarker = [];
		/**
		* Whether this YText contains formatting attributes.
		* This flag is updated when a formatting item is integrated (see ContentFormat.integrate)
		*/
		this._hasFormatting = false;
	}
	/**
	* Number of characters of this text type.
	*
	* @type {number}
	*/
	get length() {
		this.doc ?? warnPrematureAccess();
		return this._length;
	}
	/**
	* @param {Doc} y
	* @param {Item} item
	*/
	_integrate(y, item) {
		super._integrate(y, item);
		try {
			/** @type {Array<function>} */ this._pending.forEach((f) => f());
		} catch (e) {
			console.error(e);
		}
		this._pending = null;
	}
	_copy() {
		return new YText();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YText}
	*/
	clone() {
		const text = new YText();
		text.applyDelta(this.toDelta());
		return text;
	}
	/**
	* Creates YTextEvent and calls observers.
	*
	* @param {Transaction} transaction
	* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
	*/
	_callObserver(transaction, parentSubs) {
		super._callObserver(transaction, parentSubs);
		const event = new YTextEvent(this, transaction, parentSubs);
		callTypeObservers(this, transaction, event);
		if (!transaction.local && this._hasFormatting) transaction._needFormattingCleanup = true;
	}
	/**
	* Returns the unformatted string representation of this YText type.
	*
	* @public
	*/
	toString() {
		this.doc ?? warnPrematureAccess();
		let str = "";
		/**
		* @type {Item|null}
		*/
		let n = this._start;
		while (n !== null) {
			if (!n.deleted && n.countable && n.content.constructor === ContentString) str += n.content.str;
			n = n.right;
		}
		return str;
	}
	/**
	* Returns the unformatted string representation of this YText type.
	*
	* @return {string}
	* @public
	*/
	toJSON() {
		return this.toString();
	}
	/**
	* Apply a {@link Delta} on this shared YText type.
	*
	* @param {Array<any>} delta The changes to apply on this element.
	* @param {object}  opts
	* @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
	*
	*
	* @public
	*/
	applyDelta(delta, { sanitize = true } = {}) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			const currPos = new ItemTextListPosition(null, this._start, 0, /* @__PURE__ */ new Map());
			for (let i = 0; i < delta.length; i++) {
				const op = delta[i];
				if (op.insert !== void 0) {
					const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
					if (typeof ins !== "string" || ins.length > 0) insertText(transaction, this, currPos, ins, op.attributes || {});
				} else if (op.retain !== void 0) formatText(transaction, this, currPos, op.retain, op.attributes || {});
				else if (op.delete !== void 0) deleteText(transaction, currPos, op.delete);
			}
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.applyDelta(delta));
	}
	/**
	* Returns the Delta representation of this YText type.
	*
	* @param {Snapshot} [snapshot]
	* @param {Snapshot} [prevSnapshot]
	* @param {function('removed' | 'added', ID):any} [computeYChange]
	* @return {any} The Delta representation of this type.
	*
	* @public
	*/
	toDelta(snapshot, prevSnapshot, computeYChange) {
		this.doc ?? warnPrematureAccess();
		/**
		* @type{Array<any>}
		*/
		const ops = [];
		const currentAttributes = /* @__PURE__ */ new Map();
		const doc = this.doc;
		let str = "";
		let n = this._start;
		function packStr() {
			if (str.length > 0) {
				/**
				* @type {Object<string,any>}
				*/
				const attributes = {};
				let addAttributes = false;
				currentAttributes.forEach((value, key) => {
					addAttributes = true;
					attributes[key] = value;
				});
				/**
				* @type {Object<string,any>}
				*/
				const op = { insert: str };
				if (addAttributes) op.attributes = attributes;
				ops.push(op);
				str = "";
			}
		}
		const computeDelta = () => {
			while (n !== null) {
				if (isVisible(n, snapshot) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) switch (n.content.constructor) {
					case ContentString: {
						const cur = currentAttributes.get("ychange");
						if (snapshot !== void 0 && !isVisible(n, snapshot)) {
							if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
								packStr();
								currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
							}
						} else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
							if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
								packStr();
								currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
							}
						} else if (cur !== void 0) {
							packStr();
							currentAttributes.delete("ychange");
						}
						str += n.content.str;
						break;
					}
					case ContentType:
					case ContentEmbed: {
						packStr();
						/**
						* @type {Object<string,any>}
						*/
						const op = { insert: n.content.getContent()[0] };
						if (currentAttributes.size > 0) {
							const attrs = {};
							op.attributes = attrs;
							currentAttributes.forEach((value, key) => {
								attrs[key] = value;
							});
						}
						ops.push(op);
						break;
					}
					case ContentFormat: if (isVisible(n, snapshot)) {
						packStr();
						updateCurrentAttributes(currentAttributes, n.content);
					}
				}
				n = n.right;
			}
			packStr();
		};
		if (snapshot || prevSnapshot) transact(doc, (transaction) => {
			if (snapshot) splitSnapshotAffectedStructs(transaction, snapshot);
			if (prevSnapshot) splitSnapshotAffectedStructs(transaction, prevSnapshot);
			computeDelta();
		}, "cleanup");
		else computeDelta();
		return ops;
	}
	/**
	* Insert text at a given index.
	*
	* @param {number} index The index at which to start inserting.
	* @param {String} text The text to insert at the specified position.
	* @param {TextAttributes} [attributes] Optionally define some formatting
	*                                    information to apply on the inserted
	*                                    Text.
	* @public
	*/
	insert(index, text, attributes) {
		if (text.length <= 0) return;
		const y = this.doc;
		if (y !== null) transact(y, (transaction) => {
			const pos = findPosition(transaction, this, index, !attributes);
			if (!attributes) {
				attributes = {};
				pos.currentAttributes.forEach((v, k) => {
					attributes[k] = v;
				});
			}
			insertText(transaction, this, pos, text, attributes);
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.insert(index, text, attributes));
	}
	/**
	* Inserts an embed at a index.
	*
	* @param {number} index The index to insert the embed at.
	* @param {Object | AbstractType<any>} embed The Object that represents the embed.
	* @param {TextAttributes} [attributes] Attribute information to apply on the
	*                                    embed
	*
	* @public
	*/
	insertEmbed(index, embed, attributes) {
		const y = this.doc;
		if (y !== null) transact(y, (transaction) => {
			const pos = findPosition(transaction, this, index, !attributes);
			insertText(transaction, this, pos, embed, attributes || {});
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
	}
	/**
	* Deletes text starting from an index.
	*
	* @param {number} index Index at which to start deleting.
	* @param {number} length The number of characters to remove. Defaults to 1.
	*
	* @public
	*/
	delete(index, length) {
		if (length === 0) return;
		const y = this.doc;
		if (y !== null) transact(y, (transaction) => {
			deleteText(transaction, findPosition(transaction, this, index, true), length);
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.delete(index, length));
	}
	/**
	* Assigns properties to a range of text.
	*
	* @param {number} index The position where to start formatting.
	* @param {number} length The amount of characters to assign properties to.
	* @param {TextAttributes} attributes Attribute information to apply on the
	*                                    text.
	*
	* @public
	*/
	format(index, length, attributes) {
		if (length === 0) return;
		const y = this.doc;
		if (y !== null) transact(y, (transaction) => {
			const pos = findPosition(transaction, this, index, false);
			if (pos.right === null) return;
			formatText(transaction, this, pos, length, attributes);
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.format(index, length, attributes));
	}
	/**
	* Removes an attribute.
	*
	* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
	*
	* @param {String} attributeName The attribute name that is to be removed.
	*
	* @public
	*/
	removeAttribute(attributeName) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapDelete(transaction, this, attributeName);
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.removeAttribute(attributeName));
	}
	/**
	* Sets or updates an attribute.
	*
	* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
	*
	* @param {String} attributeName The attribute name that is to be set.
	* @param {any} attributeValue The attribute value that is to be set.
	*
	* @public
	*/
	setAttribute(attributeName, attributeValue) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapSet(transaction, this, attributeName, attributeValue);
		});
		else
 /** @type {Array<function>} */ this._pending.push(() => this.setAttribute(attributeName, attributeValue));
	}
	/**
	* Returns an attribute value that belongs to the attribute name.
	*
	* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
	*
	* @param {String} attributeName The attribute name that identifies the
	*                               queried value.
	* @return {any} The queried attribute value.
	*
	* @public
	*/
	getAttribute(attributeName) {
		return typeMapGet(this, attributeName);
	}
	/**
	* Returns all attribute name/value pairs in a JSON Object.
	*
	* @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
	*
	* @return {Object<string, any>} A JSON Object that describes the attributes.
	*
	* @public
	*/
	getAttributes() {
		return typeMapGetAll(this);
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	*/
	_write(encoder) {
		encoder.writeTypeRef(YTextRefID);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
* @return {YText}
*
* @private
* @function
*/
var readYText = (_decoder) => new YText();
/**
* @module YXml
*/
/**
* Define the elements to which a set of CSS queries apply.
* {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
*
* @example
*   query = '.classSelector'
*   query = 'nodeSelector'
*   query = '#idSelector'
*
* @typedef {string} CSS_Selector
*/
/**
* Dom filter function.
*
* @callback domFilter
* @param {string} nodeName The nodeName of the element
* @param {Map} attributes The map of attributes.
* @return {boolean} Whether to include the Dom node in the YXmlElement.
*/
/**
* Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
* position within them.
*
* Can be created with {@link YXmlFragment#createTreeWalker}
*
* @public
* @implements {Iterable<YXmlElement|YXmlText|YXmlElement|YXmlHook>}
*/
var YXmlTreeWalker = class {
	/**
	* @param {YXmlFragment | YXmlElement} root
	* @param {function(AbstractType<any>):boolean} [f]
	*/
	constructor(root, f = () => true) {
		this._filter = f;
		this._root = root;
		/**
		* @type {Item}
		*/
		this._currentNode = root._start;
		this._firstCall = true;
		root.doc ?? warnPrematureAccess();
	}
	[Symbol.iterator]() {
		return this;
	}
	/**
	* Get the next node.
	*
	* @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
	*
	* @public
	*/
	next() {
		/**
		* @type {Item|null}
		*/
		let n = this._currentNode;
		let type = n && n.content && n.content.type;
		if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) do {
			type = n.content.type;
			if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) n = type._start;
			else while (n !== null) {
				/**
				* @type {Item | null}
				*/
				const nxt = n.next;
				if (nxt !== null) {
					n = nxt;
					break;
				} else if (n.parent === this._root) n = null;
				else n = n.parent._item;
			}
		} while (n !== null && (n.deleted || !this._filter(
			/** @type {ContentType} */
			n.content.type
		)));
		this._firstCall = false;
		if (n === null) return {
			value: void 0,
			done: true
		};
		this._currentNode = n;
		return {
			value: /** @type {any} */ n.content.type,
			done: false
		};
	}
};
/**
* Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
* A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
* nodeName and it does not have attributes. Though it can be bound to a DOM
* element - in this case the attributes and the nodeName are not shared.
*
* @public
* @extends AbstractType<YXmlEvent>
*/
var YXmlFragment = class YXmlFragment extends AbstractType {
	constructor() {
		super();
		/**
		* @type {Array<any>|null}
		*/
		this._prelimContent = [];
	}
	/**
	* @type {YXmlElement|YXmlText|null}
	*/
	get firstChild() {
		const first = this._first;
		return first ? first.content.getContent()[0] : null;
	}
	/**
	* Integrate this type into the Yjs instance.
	*
	* * Save this struct in the os
	* * This type is sent to other client
	* * Observer functions are fired
	*
	* @param {Doc} y The Yjs instance
	* @param {Item} item
	*/
	_integrate(y, item) {
		super._integrate(y, item);
		this.insert(0, this._prelimContent);
		this._prelimContent = null;
	}
	_copy() {
		return new YXmlFragment();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YXmlFragment}
	*/
	clone() {
		const el = new YXmlFragment();
		el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
		return el;
	}
	get length() {
		this.doc ?? warnPrematureAccess();
		return this._prelimContent === null ? this._length : this._prelimContent.length;
	}
	/**
	* Create a subtree of childNodes.
	*
	* @example
	* const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
	* for (let node in walker) {
	*   // `node` is a div node
	*   nop(node)
	* }
	*
	* @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
	*                          returns a Boolean indicating whether the child
	*                          is to be included in the subtree.
	* @return {YXmlTreeWalker} A subtree and a position within it.
	*
	* @public
	*/
	createTreeWalker(filter) {
		return new YXmlTreeWalker(this, filter);
	}
	/**
	* Returns the first YXmlElement that matches the query.
	* Similar to DOM's {@link querySelector}.
	*
	* Query support:
	*   - tagname
	* TODO:
	*   - id
	*   - attribute
	*
	* @param {CSS_Selector} query The query on the children.
	* @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
	*
	* @public
	*/
	querySelector(query) {
		query = query.toUpperCase();
		const next = new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query).next();
		if (next.done) return null;
		else return next.value;
	}
	/**
	* Returns all YXmlElements that match the query.
	* Similar to Dom's {@link querySelectorAll}.
	*
	* @todo Does not yet support all queries. Currently only query by tagName.
	*
	* @param {CSS_Selector} query The query on the children
	* @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
	*
	* @public
	*/
	querySelectorAll(query) {
		query = query.toUpperCase();
		return from(new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query));
	}
	/**
	* Creates YXmlEvent and calls observers.
	*
	* @param {Transaction} transaction
	* @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
	*/
	_callObserver(transaction, parentSubs) {
		callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
	}
	/**
	* Get the string representation of all the children of this YXmlFragment.
	*
	* @return {string} The string representation of all children.
	*/
	toString() {
		return typeListMap(this, (xml) => xml.toString()).join("");
	}
	/**
	* @return {string}
	*/
	toJSON() {
		return this.toString();
	}
	/**
	* Creates a Dom Element that mirrors this YXmlElement.
	*
	* @param {Document} [_document=document] The document object (you must define
	*                                        this when calling this method in
	*                                        nodejs)
	* @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
	*                                             are presented in the DOM
	* @param {any} [binding] You should not set this property. This is
	*                               used if DomBinding wants to create a
	*                               association to the created DOM type.
	* @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
	*
	* @public
	*/
	toDOM(_document = document, hooks = {}, binding) {
		const fragment = _document.createDocumentFragment();
		if (binding !== void 0) binding._createAssociation(fragment, this);
		typeListForEach(this, (xmlType) => {
			fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
		});
		return fragment;
	}
	/**
	* Inserts new content at an index.
	*
	* @example
	*  // Insert character 'a' at position 0
	*  xml.insert(0, [new Y.XmlText('text')])
	*
	* @param {number} index The index to insert content at
	* @param {Array<YXmlElement|YXmlText>} content The array of content
	*/
	insert(index, content) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeListInsertGenerics(transaction, this, index, content);
		});
		else this._prelimContent.splice(index, 0, ...content);
	}
	/**
	* Inserts new content at an index.
	*
	* @example
	*  // Insert character 'a' at position 0
	*  xml.insert(0, [new Y.XmlText('text')])
	*
	* @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
	* @param {Array<YXmlElement|YXmlText>} content The array of content
	*/
	insertAfter(ref, content) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
			typeListInsertGenericsAfter(transaction, this, refItem, content);
		});
		else {
			const pc = this._prelimContent;
			const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
			if (index === 0 && ref !== null) throw create$3("Reference item not found");
			pc.splice(index, 0, ...content);
		}
	}
	/**
	* Deletes elements starting from an index.
	*
	* @param {number} index Index at which to start deleting elements
	* @param {number} [length=1] The number of elements to remove. Defaults to 1.
	*/
	delete(index, length = 1) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeListDelete(transaction, this, index, length);
		});
		else this._prelimContent.splice(index, length);
	}
	/**
	* Transforms this YArray to a JavaScript Array.
	*
	* @return {Array<YXmlElement|YXmlText|YXmlHook>}
	*/
	toArray() {
		return typeListToArray(this);
	}
	/**
	* Appends content to this YArray.
	*
	* @param {Array<YXmlElement|YXmlText>} content Array of content to append.
	*/
	push(content) {
		this.insert(this.length, content);
	}
	/**
	* Prepends content to this YArray.
	*
	* @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
	*/
	unshift(content) {
		this.insert(0, content);
	}
	/**
	* Returns the i-th element from a YArray.
	*
	* @param {number} index The index of the element to return from the YArray
	* @return {YXmlElement|YXmlText}
	*/
	get(index) {
		return typeListGet(this, index);
	}
	/**
	* Returns a portion of this YXmlFragment into a JavaScript Array selected
	* from start to end (end not included).
	*
	* @param {number} [start]
	* @param {number} [end]
	* @return {Array<YXmlElement|YXmlText>}
	*/
	slice(start = 0, end = this.length) {
		return typeListSlice(this, start, end);
	}
	/**
	* Executes a provided function on once on every child element.
	*
	* @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
	*/
	forEach(f) {
		typeListForEach(this, f);
	}
	/**
	* Transform the properties of this type to binary and write it to an
	* BinaryEncoder.
	*
	* This is called when this Item is sent to a remote peer.
	*
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
	*/
	_write(encoder) {
		encoder.writeTypeRef(YXmlFragmentRefID);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
* @return {YXmlFragment}
*
* @private
* @function
*/
var readYXmlFragment = (_decoder) => new YXmlFragment();
/**
* @typedef {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} ValueTypes
*/
/**
* An YXmlElement imitates the behavior of a
* https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element
*
* * An YXmlElement has attributes (key value pairs)
* * An YXmlElement has childElements that must inherit from YXmlElement
*
* @template {{ [key: string]: ValueTypes }} [KV={ [key: string]: string }]
*/
var YXmlElement = class YXmlElement extends YXmlFragment {
	constructor(nodeName = "UNDEFINED") {
		super();
		this.nodeName = nodeName;
		/**
		* @type {Map<string, any>|null}
		*/
		this._prelimAttrs = /* @__PURE__ */ new Map();
	}
	/**
	* @type {YXmlElement|YXmlText|null}
	*/
	get nextSibling() {
		const n = this._item ? this._item.next : null;
		return n ? n.content.type : null;
	}
	/**
	* @type {YXmlElement|YXmlText|null}
	*/
	get prevSibling() {
		const n = this._item ? this._item.prev : null;
		return n ? n.content.type : null;
	}
	/**
	* Integrate this type into the Yjs instance.
	*
	* * Save this struct in the os
	* * This type is sent to other client
	* * Observer functions are fired
	*
	* @param {Doc} y The Yjs instance
	* @param {Item} item
	*/
	_integrate(y, item) {
		super._integrate(y, item);
		this._prelimAttrs.forEach((value, key) => {
			this.setAttribute(key, value);
		});
		this._prelimAttrs = null;
	}
	/**
	* Creates an Item with the same effect as this Item (without position effect)
	*
	* @return {YXmlElement}
	*/
	_copy() {
		return new YXmlElement(this.nodeName);
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YXmlElement<KV>}
	*/
	clone() {
		/**
		* @type {YXmlElement<KV>}
		*/
		const el = new YXmlElement(this.nodeName);
		forEach(this.getAttributes(), (value, key) => {
			el.setAttribute(key, value);
		});
		el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
		return el;
	}
	/**
	* Returns the XML serialization of this YXmlElement.
	* The attributes are ordered by attribute-name, so you can easily use this
	* method to compare YXmlElements
	*
	* @return {string} The string representation of this type.
	*
	* @public
	*/
	toString() {
		const attrs = this.getAttributes();
		const stringBuilder = [];
		const keys = [];
		for (const key in attrs) keys.push(key);
		keys.sort();
		const keysLen = keys.length;
		for (let i = 0; i < keysLen; i++) {
			const key = keys[i];
			stringBuilder.push(key + "=\"" + attrs[key] + "\"");
		}
		const nodeName = this.nodeName.toLocaleLowerCase();
		return `<${nodeName}${stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : ""}>${super.toString()}</${nodeName}>`;
	}
	/**
	* Removes an attribute from this YXmlElement.
	*
	* @param {string} attributeName The attribute name that is to be removed.
	*
	* @public
	*/
	removeAttribute(attributeName) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapDelete(transaction, this, attributeName);
		});
		else
 /** @type {Map<string,any>} */ this._prelimAttrs.delete(attributeName);
	}
	/**
	* Sets or updates an attribute.
	*
	* @template {keyof KV & string} KEY
	*
	* @param {KEY} attributeName The attribute name that is to be set.
	* @param {KV[KEY]} attributeValue The attribute value that is to be set.
	*
	* @public
	*/
	setAttribute(attributeName, attributeValue) {
		if (this.doc !== null) transact(this.doc, (transaction) => {
			typeMapSet(transaction, this, attributeName, attributeValue);
		});
		else
 /** @type {Map<string, any>} */ this._prelimAttrs.set(attributeName, attributeValue);
	}
	/**
	* Returns an attribute value that belongs to the attribute name.
	*
	* @template {keyof KV & string} KEY
	*
	* @param {KEY} attributeName The attribute name that identifies the
	*                               queried value.
	* @return {KV[KEY]|undefined} The queried attribute value.
	*
	* @public
	*/
	getAttribute(attributeName) {
		return typeMapGet(this, attributeName);
	}
	/**
	* Returns whether an attribute exists
	*
	* @param {string} attributeName The attribute name to check for existence.
	* @return {boolean} whether the attribute exists.
	*
	* @public
	*/
	hasAttribute(attributeName) {
		return typeMapHas(this, attributeName);
	}
	/**
	* Returns all attribute name/value pairs in a JSON Object.
	*
	* @param {Snapshot} [snapshot]
	* @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
	*
	* @public
	*/
	getAttributes(snapshot) {
		return snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this);
	}
	/**
	* Creates a Dom Element that mirrors this YXmlElement.
	*
	* @param {Document} [_document=document] The document object (you must define
	*                                        this when calling this method in
	*                                        nodejs)
	* @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
	*                                             are presented in the DOM
	* @param {any} [binding] You should not set this property. This is
	*                               used if DomBinding wants to create a
	*                               association to the created DOM type.
	* @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
	*
	* @public
	*/
	toDOM(_document = document, hooks = {}, binding) {
		const dom = _document.createElement(this.nodeName);
		const attrs = this.getAttributes();
		for (const key in attrs) {
			const value = attrs[key];
			if (typeof value === "string") dom.setAttribute(key, value);
		}
		typeListForEach(this, (yxml) => {
			dom.appendChild(yxml.toDOM(_document, hooks, binding));
		});
		if (binding !== void 0) binding._createAssociation(dom, this);
		return dom;
	}
	/**
	* Transform the properties of this type to binary and write it to an
	* BinaryEncoder.
	*
	* This is called when this Item is sent to a remote peer.
	*
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
	*/
	_write(encoder) {
		encoder.writeTypeRef(YXmlElementRefID);
		encoder.writeKey(this.nodeName);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {YXmlElement}
*
* @function
*/
var readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());
/**
* @extends YEvent<YXmlElement|YXmlText|YXmlFragment>
* An Event that describes changes on a YXml Element or Yxml Fragment
*/
var YXmlEvent = class extends YEvent {
	/**
	* @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
	* @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
	*                   child list changed.
	* @param {Transaction} transaction The transaction instance with which the
	*                                  change was created.
	*/
	constructor(target, subs, transaction) {
		super(target, transaction);
		/**
		* Whether the children changed.
		* @type {Boolean}
		* @private
		*/
		this.childListChanged = false;
		/**
		* Set of all changed attributes.
		* @type {Set<string>}
		*/
		this.attributesChanged = /* @__PURE__ */ new Set();
		subs.forEach((sub) => {
			if (sub === null) this.childListChanged = true;
			else this.attributesChanged.add(sub);
		});
	}
};
/**
* You can manage binding to a custom type with YXmlHook.
*
* @extends {YMap<any>}
*/
var YXmlHook = class YXmlHook extends YMap {
	/**
	* @param {string} hookName nodeName of the Dom Node.
	*/
	constructor(hookName) {
		super();
		/**
		* @type {string}
		*/
		this.hookName = hookName;
	}
	/**
	* Creates an Item with the same effect as this Item (without position effect)
	*/
	_copy() {
		return new YXmlHook(this.hookName);
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YXmlHook}
	*/
	clone() {
		const el = new YXmlHook(this.hookName);
		this.forEach((value, key) => {
			el.set(key, value);
		});
		return el;
	}
	/**
	* Creates a Dom Element that mirrors this YXmlElement.
	*
	* @param {Document} [_document=document] The document object (you must define
	*                                        this when calling this method in
	*                                        nodejs)
	* @param {Object.<string, any>} [hooks] Optional property to customize how hooks
	*                                             are presented in the DOM
	* @param {any} [binding] You should not set this property. This is
	*                               used if DomBinding wants to create a
	*                               association to the created DOM type
	* @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
	*
	* @public
	*/
	toDOM(_document = document, hooks = {}, binding) {
		const hook = hooks[this.hookName];
		let dom;
		if (hook !== void 0) dom = hook.createDom(this);
		else dom = document.createElement(this.hookName);
		dom.setAttribute("data-yjs-hook", this.hookName);
		if (binding !== void 0) binding._createAssociation(dom, this);
		return dom;
	}
	/**
	* Transform the properties of this type to binary and write it to an
	* BinaryEncoder.
	*
	* This is called when this Item is sent to a remote peer.
	*
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
	*/
	_write(encoder) {
		encoder.writeTypeRef(YXmlHookRefID);
		encoder.writeKey(this.hookName);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {YXmlHook}
*
* @private
* @function
*/
var readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());
/**
* Represents text in a Dom Element. In the future this type will also handle
* simple formatting information like bold and italic.
*/
var YXmlText = class YXmlText extends YText {
	/**
	* @type {YXmlElement|YXmlText|null}
	*/
	get nextSibling() {
		const n = this._item ? this._item.next : null;
		return n ? n.content.type : null;
	}
	/**
	* @type {YXmlElement|YXmlText|null}
	*/
	get prevSibling() {
		const n = this._item ? this._item.prev : null;
		return n ? n.content.type : null;
	}
	_copy() {
		return new YXmlText();
	}
	/**
	* Makes a copy of this data type that can be included somewhere else.
	*
	* Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
	*
	* @return {YXmlText}
	*/
	clone() {
		const text = new YXmlText();
		text.applyDelta(this.toDelta());
		return text;
	}
	/**
	* Creates a Dom Element that mirrors this YXmlText.
	*
	* @param {Document} [_document=document] The document object (you must define
	*                                        this when calling this method in
	*                                        nodejs)
	* @param {Object<string, any>} [hooks] Optional property to customize how hooks
	*                                             are presented in the DOM
	* @param {any} [binding] You should not set this property. This is
	*                               used if DomBinding wants to create a
	*                               association to the created DOM type.
	* @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
	*
	* @public
	*/
	toDOM(_document = document, hooks, binding) {
		const dom = _document.createTextNode(this.toString());
		if (binding !== void 0) binding._createAssociation(dom, this);
		return dom;
	}
	toString() {
		return this.toDelta().map((delta) => {
			const nestedNodes = [];
			for (const nodeName in delta.attributes) {
				const attrs = [];
				for (const key in delta.attributes[nodeName]) attrs.push({
					key,
					value: delta.attributes[nodeName][key]
				});
				attrs.sort((a, b) => a.key < b.key ? -1 : 1);
				nestedNodes.push({
					nodeName,
					attrs
				});
			}
			nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
			let str = "";
			for (let i = 0; i < nestedNodes.length; i++) {
				const node = nestedNodes[i];
				str += `<${node.nodeName}`;
				for (let j = 0; j < node.attrs.length; j++) {
					const attr = node.attrs[j];
					str += ` ${attr.key}="${attr.value}"`;
				}
				str += ">";
			}
			str += delta.insert;
			for (let i = nestedNodes.length - 1; i >= 0; i--) str += `</${nestedNodes[i].nodeName}>`;
			return str;
		}).join("");
	}
	/**
	* @return {string}
	*/
	toJSON() {
		return this.toString();
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	*/
	_write(encoder) {
		encoder.writeTypeRef(YXmlTextRefID);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {YXmlText}
*
* @private
* @function
*/
var readYXmlText = (decoder) => new YXmlText();
var AbstractStruct = class {
	/**
	* @param {ID} id
	* @param {number} length
	*/
	constructor(id, length) {
		this.id = id;
		this.length = length;
	}
	/**
	* @type {boolean}
	*/
	get deleted() {
		throw methodUnimplemented();
	}
	/**
	* Merge this struct with the item to the right.
	* This method is already assuming that `this.id.clock + this.length === this.id.clock`.
	* Also this method does *not* remove right from StructStore!
	* @param {AbstractStruct} right
	* @return {boolean} whether this merged with right
	*/
	mergeWith(right) {
		return false;
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
	* @param {number} offset
	* @param {number} encodingRef
	*/
	write(encoder, offset, encodingRef) {
		throw methodUnimplemented();
	}
	/**
	* @param {Transaction} transaction
	* @param {number} offset
	*/
	integrate(transaction, offset) {
		throw methodUnimplemented();
	}
};
var structGCRefNumber = 0;
/**
* @private
*/
var GC = class extends AbstractStruct {
	get deleted() {
		return true;
	}
	delete() {}
	/**
	* @param {GC} right
	* @return {boolean}
	*/
	mergeWith(right) {
		if (this.constructor !== right.constructor) return false;
		this.length += right.length;
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {number} offset
	*/
	integrate(transaction, offset) {
		if (offset > 0) {
			this.id.clock += offset;
			this.length -= offset;
		}
		addStruct(transaction.doc.store, this);
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeInfo(structGCRefNumber);
		encoder.writeLen(this.length - offset);
	}
	/**
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @return {null | number}
	*/
	getMissing(transaction, store) {
		return null;
	}
};
var ContentBinary = class ContentBinary {
	/**
	* @param {Uint8Array} content
	*/
	constructor(content) {
		this.content = content;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return 1;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [this.content];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentBinary}
	*/
	copy() {
		return new ContentBinary(this.content);
	}
	/**
	* @param {number} offset
	* @return {ContentBinary}
	*/
	splice(offset) {
		throw methodUnimplemented();
	}
	/**
	* @param {ContentBinary} right
	* @return {boolean}
	*/
	mergeWith(right) {
		return false;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeBuf(this.content);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 3;
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
* @return {ContentBinary}
*/
var readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());
var ContentDeleted = class ContentDeleted {
	/**
	* @param {number} len
	*/
	constructor(len) {
		this.len = len;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return this.len;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return false;
	}
	/**
	* @return {ContentDeleted}
	*/
	copy() {
		return new ContentDeleted(this.len);
	}
	/**
	* @param {number} offset
	* @return {ContentDeleted}
	*/
	splice(offset) {
		const right = new ContentDeleted(this.len - offset);
		this.len = offset;
		return right;
	}
	/**
	* @param {ContentDeleted} right
	* @return {boolean}
	*/
	mergeWith(right) {
		this.len += right.len;
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {
		addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
		item.markDeleted();
	}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeLen(this.len - offset);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 1;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
* @return {ContentDeleted}
*/
var readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
/**
* @param {string} guid
* @param {Object<string, any>} opts
*/
var createDocFromOpts = (guid, opts) => new Doc({
	guid,
	...opts,
	shouldLoad: opts.shouldLoad || opts.autoLoad || false
});
/**
* @private
*/
var ContentDoc = class ContentDoc {
	/**
	* @param {Doc} doc
	*/
	constructor(doc) {
		if (doc._item) console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
		/**
		* @type {Doc}
		*/
		this.doc = doc;
		/**
		* @type {any}
		*/
		const opts = {};
		this.opts = opts;
		if (!doc.gc) opts.gc = false;
		if (doc.autoLoad) opts.autoLoad = true;
		if (doc.meta !== null) opts.meta = doc.meta;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return 1;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [this.doc];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentDoc}
	*/
	copy() {
		return new ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
	}
	/**
	* @param {number} offset
	* @return {ContentDoc}
	*/
	splice(offset) {
		throw methodUnimplemented();
	}
	/**
	* @param {ContentDoc} right
	* @return {boolean}
	*/
	mergeWith(right) {
		return false;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {
		this.doc._item = item;
		transaction.subdocsAdded.add(this.doc);
		if (this.doc.shouldLoad) transaction.subdocsLoaded.add(this.doc);
	}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {
		if (transaction.subdocsAdded.has(this.doc)) transaction.subdocsAdded.delete(this.doc);
		else transaction.subdocsRemoved.add(this.doc);
	}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeString(this.doc.guid);
		encoder.writeAny(this.opts);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 9;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentDoc}
*/
var readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
/**
* @private
*/
var ContentEmbed = class ContentEmbed {
	/**
	* @param {Object} embed
	*/
	constructor(embed) {
		this.embed = embed;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return 1;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [this.embed];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentEmbed}
	*/
	copy() {
		return new ContentEmbed(this.embed);
	}
	/**
	* @param {number} offset
	* @return {ContentEmbed}
	*/
	splice(offset) {
		throw methodUnimplemented();
	}
	/**
	* @param {ContentEmbed} right
	* @return {boolean}
	*/
	mergeWith(right) {
		return false;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeJSON(this.embed);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 5;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentEmbed}
*/
var readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());
/**
* @private
*/
var ContentFormat = class ContentFormat {
	/**
	* @param {string} key
	* @param {Object} value
	*/
	constructor(key, value) {
		this.key = key;
		this.value = value;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return 1;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return false;
	}
	/**
	* @return {ContentFormat}
	*/
	copy() {
		return new ContentFormat(this.key, this.value);
	}
	/**
	* @param {number} _offset
	* @return {ContentFormat}
	*/
	splice(_offset) {
		throw methodUnimplemented();
	}
	/**
	* @param {ContentFormat} _right
	* @return {boolean}
	*/
	mergeWith(_right) {
		return false;
	}
	/**
	* @param {Transaction} _transaction
	* @param {Item} item
	*/
	integrate(_transaction, item) {
		const p = item.parent;
		p._searchMarker = null;
		p._hasFormatting = true;
	}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeKey(this.key);
		encoder.writeJSON(this.value);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 6;
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentFormat}
*/
var readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());
/**
* @private
*/
var ContentJSON = class ContentJSON {
	/**
	* @param {Array<any>} arr
	*/
	constructor(arr) {
		/**
		* @type {Array<any>}
		*/
		this.arr = arr;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return this.arr.length;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return this.arr;
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentJSON}
	*/
	copy() {
		return new ContentJSON(this.arr);
	}
	/**
	* @param {number} offset
	* @return {ContentJSON}
	*/
	splice(offset) {
		const right = new ContentJSON(this.arr.slice(offset));
		this.arr = this.arr.slice(0, offset);
		return right;
	}
	/**
	* @param {ContentJSON} right
	* @return {boolean}
	*/
	mergeWith(right) {
		this.arr = this.arr.concat(right.arr);
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		const len = this.arr.length;
		encoder.writeLen(len - offset);
		for (let i = offset; i < len; i++) {
			const c = this.arr[i];
			encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
		}
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 2;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentJSON}
*/
var readContentJSON = (decoder) => {
	const len = decoder.readLen();
	const cs = [];
	for (let i = 0; i < len; i++) {
		const c = decoder.readString();
		if (c === "undefined") cs.push(void 0);
		else cs.push(JSON.parse(c));
	}
	return new ContentJSON(cs);
};
var isDevMode = getVariable("node_env") === "development";
var ContentAny = class ContentAny {
	/**
	* @param {Array<any>} arr
	*/
	constructor(arr) {
		/**
		* @type {Array<any>}
		*/
		this.arr = arr;
		isDevMode && deepFreeze(arr);
	}
	/**
	* @return {number}
	*/
	getLength() {
		return this.arr.length;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return this.arr;
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentAny}
	*/
	copy() {
		return new ContentAny(this.arr);
	}
	/**
	* @param {number} offset
	* @return {ContentAny}
	*/
	splice(offset) {
		const right = new ContentAny(this.arr.slice(offset));
		this.arr = this.arr.slice(0, offset);
		return right;
	}
	/**
	* @param {ContentAny} right
	* @return {boolean}
	*/
	mergeWith(right) {
		this.arr = this.arr.concat(right.arr);
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		const len = this.arr.length;
		encoder.writeLen(len - offset);
		for (let i = offset; i < len; i++) {
			const c = this.arr[i];
			encoder.writeAny(c);
		}
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 8;
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentAny}
*/
var readContentAny = (decoder) => {
	const len = decoder.readLen();
	const cs = [];
	for (let i = 0; i < len; i++) cs.push(decoder.readAny());
	return new ContentAny(cs);
};
/**
* @private
*/
var ContentString = class ContentString {
	/**
	* @param {string} str
	*/
	constructor(str) {
		/**
		* @type {string}
		*/
		this.str = str;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return this.str.length;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return this.str.split("");
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentString}
	*/
	copy() {
		return new ContentString(this.str);
	}
	/**
	* @param {number} offset
	* @return {ContentString}
	*/
	splice(offset) {
		const right = new ContentString(this.str.slice(offset));
		this.str = this.str.slice(0, offset);
		const firstCharCode = this.str.charCodeAt(offset - 1);
		if (firstCharCode >= 55296 && firstCharCode <= 56319) {
			this.str = this.str.slice(0, offset - 1) + "�";
			right.str = "�" + right.str.slice(1);
		}
		return right;
	}
	/**
	* @param {ContentString} right
	* @return {boolean}
	*/
	mergeWith(right) {
		this.str += right.str;
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {}
	/**
	* @param {StructStore} store
	*/
	gc(store) {}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 4;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentString}
*/
var readContentString = (decoder) => new ContentString(decoder.readString());
/**
* @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractType<any>>}
* @private
*/
var typeRefs = [
	readYArray,
	readYMap,
	readYText,
	readYXmlElement,
	readYXmlFragment,
	readYXmlHook,
	readYXmlText
];
var YArrayRefID = 0;
var YMapRefID = 1;
var YTextRefID = 2;
var YXmlElementRefID = 3;
var YXmlFragmentRefID = 4;
var YXmlHookRefID = 5;
var YXmlTextRefID = 6;
/**
* @private
*/
var ContentType = class ContentType {
	/**
	* @param {AbstractType<any>} type
	*/
	constructor(type) {
		/**
		* @type {AbstractType<any>}
		*/
		this.type = type;
	}
	/**
	* @return {number}
	*/
	getLength() {
		return 1;
	}
	/**
	* @return {Array<any>}
	*/
	getContent() {
		return [this.type];
	}
	/**
	* @return {boolean}
	*/
	isCountable() {
		return true;
	}
	/**
	* @return {ContentType}
	*/
	copy() {
		return new ContentType(this.type._copy());
	}
	/**
	* @param {number} offset
	* @return {ContentType}
	*/
	splice(offset) {
		throw methodUnimplemented();
	}
	/**
	* @param {ContentType} right
	* @return {boolean}
	*/
	mergeWith(right) {
		return false;
	}
	/**
	* @param {Transaction} transaction
	* @param {Item} item
	*/
	integrate(transaction, item) {
		this.type._integrate(transaction.doc, item);
	}
	/**
	* @param {Transaction} transaction
	*/
	delete(transaction) {
		let item = this.type._start;
		while (item !== null) {
			if (!item.deleted) item.delete(transaction);
			else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) transaction._mergeStructs.push(item);
			item = item.right;
		}
		this.type._map.forEach((item) => {
			if (!item.deleted) item.delete(transaction);
			else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) transaction._mergeStructs.push(item);
		});
		transaction.changed.delete(this.type);
	}
	/**
	* @param {StructStore} store
	*/
	gc(store) {
		let item = this.type._start;
		while (item !== null) {
			item.gc(store, true);
			item = item.right;
		}
		this.type._start = null;
		this.type._map.forEach(
			/** @param {Item | null} item */
			(item) => {
				while (item !== null) {
					item.gc(store, true);
					item = item.left;
				}
			}
		);
		this.type._map = /* @__PURE__ */ new Map();
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		this.type._write(encoder);
	}
	/**
	* @return {number}
	*/
	getRef() {
		return 7;
	}
};
/**
* @private
*
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @return {ContentType}
*/
var readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
/**
* @todo This should return several items
*
* @param {StructStore} store
* @param {ID} id
* @return {{item:Item, diff:number}}
*/
var followRedone = (store, id) => {
	/**
	* @type {ID|null}
	*/
	let nextID = id;
	let diff = 0;
	let item;
	do {
		if (diff > 0) nextID = createID(nextID.client, nextID.clock + diff);
		item = getItem(store, nextID);
		diff = nextID.clock - item.id.clock;
		nextID = item.redone;
	} while (nextID !== null && item instanceof Item);
	return {
		item,
		diff
	};
};
/**
* Make sure that neither item nor any of its parents is ever deleted.
*
* This property does not persist when storing it into a database or when
* sending it to other peers
*
* @param {Item|null} item
* @param {boolean} keep
*/
var keepItem = (item, keep) => {
	while (item !== null && item.keep !== keep) {
		item.keep = keep;
		item = item.parent._item;
	}
};
/**
* Split leftItem into two items
* @param {Transaction} transaction
* @param {Item} leftItem
* @param {number} diff
* @return {Item}
*
* @function
* @private
*/
var splitItem = (transaction, leftItem, diff) => {
	const { client, clock } = leftItem.id;
	const rightItem = new Item(createID(client, clock + diff), leftItem, createID(client, clock + diff - 1), leftItem.right, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
	if (leftItem.deleted) rightItem.markDeleted();
	if (leftItem.keep) rightItem.keep = true;
	if (leftItem.redone !== null) rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
	leftItem.right = rightItem;
	if (rightItem.right !== null) rightItem.right.left = rightItem;
	transaction._mergeStructs.push(rightItem);
	if (rightItem.parentSub !== null && rightItem.right === null)
 /** @type {AbstractType<any>} */ rightItem.parent._map.set(rightItem.parentSub, rightItem);
	leftItem.length = diff;
	return rightItem;
};
/**
* @param {Array<StackItem>} stack
* @param {ID} id
*/
var isDeletedByUndoStack = (stack, id) => some(
	stack,
	/** @param {StackItem} s */
	(s) => isDeleted(s.deletions, id)
);
/**
* Redoes the effect of this operation.
*
* @param {Transaction} transaction The Yjs instance.
* @param {Item} item
* @param {Set<Item>} redoitems
* @param {DeleteSet} itemsToDelete
* @param {boolean} ignoreRemoteMapChanges
* @param {import('../utils/UndoManager.js').UndoManager} um
*
* @return {Item|null}
*
* @private
*/
var redoItem = (transaction, item, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) => {
	const doc = transaction.doc;
	const store = doc.store;
	const ownClientID = doc.clientID;
	const redone = item.redone;
	if (redone !== null) return getItemCleanStart(transaction, redone);
	let parentItem = item.parent._item;
	/**
	* @type {Item|null}
	*/
	let left = null;
	/**
	* @type {Item|null}
	*/
	let right;
	if (parentItem !== null && parentItem.deleted === true) {
		if (parentItem.redone === null && (!redoitems.has(parentItem) || redoItem(transaction, parentItem, redoitems, itemsToDelete, ignoreRemoteMapChanges, um) === null)) return null;
		while (parentItem.redone !== null) parentItem = getItemCleanStart(transaction, parentItem.redone);
	}
	const parentType = parentItem === null ? item.parent : /** @type {ContentType} */ parentItem.content.type;
	if (item.parentSub === null) {
		left = item.left;
		right = item;
		while (left !== null) {
			/**
			* @type {Item|null}
			*/
			let leftTrace = left;
			while (leftTrace !== null && leftTrace.parent._item !== parentItem) leftTrace = leftTrace.redone === null ? null : getItemCleanStart(transaction, leftTrace.redone);
			if (leftTrace !== null && leftTrace.parent._item === parentItem) {
				left = leftTrace;
				break;
			}
			left = left.left;
		}
		while (right !== null) {
			/**
			* @type {Item|null}
			*/
			let rightTrace = right;
			while (rightTrace !== null && rightTrace.parent._item !== parentItem) rightTrace = rightTrace.redone === null ? null : getItemCleanStart(transaction, rightTrace.redone);
			if (rightTrace !== null && rightTrace.parent._item === parentItem) {
				right = rightTrace;
				break;
			}
			right = right.right;
		}
	} else {
		right = null;
		if (item.right && !ignoreRemoteMapChanges) {
			left = item;
			while (left !== null && left.right !== null && (left.right.redone || isDeleted(itemsToDelete, left.right.id) || isDeletedByUndoStack(um.undoStack, left.right.id) || isDeletedByUndoStack(um.redoStack, left.right.id))) {
				left = left.right;
				while (left.redone) left = getItemCleanStart(transaction, left.redone);
			}
			if (left && left.right !== null) return null;
		} else left = parentType._map.get(item.parentSub) || null;
		if (left !== null && left.parent._item !== parentItem) left = parentType._map.get(item.parentSub) || null;
	}
	const nextId = createID(ownClientID, getState(store, ownClientID));
	const redoneItem = new Item(nextId, left, left && left.lastId, right, right && right.id, parentType, item.parentSub, item.content.copy());
	item.redone = nextId;
	keepItem(redoneItem, true);
	redoneItem.integrate(transaction, 0);
	return redoneItem;
};
/**
* Abstract class that represents any content.
*/
var Item = class Item extends AbstractStruct {
	/**
	* @param {ID} id
	* @param {Item | null} left
	* @param {ID | null} origin
	* @param {Item | null} right
	* @param {ID | null} rightOrigin
	* @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
	* @param {string | null} parentSub
	* @param {AbstractContent} content
	*/
	constructor(id, left, origin, right, rightOrigin, parent, parentSub, content) {
		super(id, content.getLength());
		/**
		* The item that was originally to the left of this item.
		* @type {ID | null}
		*/
		this.origin = origin;
		/**
		* The item that is currently to the left of this item.
		* @type {Item | null}
		*/
		this.left = left;
		/**
		* The item that is currently to the right of this item.
		* @type {Item | null}
		*/
		this.right = right;
		/**
		* The item that was originally to the right of this item.
		* @type {ID | null}
		*/
		this.rightOrigin = rightOrigin;
		/**
		* @type {AbstractType<any>|ID|null}
		*/
		this.parent = parent;
		/**
		* If the parent refers to this item with some kind of key (e.g. YMap, the
		* key is specified here. The key is then used to refer to the list in which
		* to insert this item. If `parentSub = null` type._start is the list in
		* which to insert to. Otherwise it is `parent._map`.
		* @type {String | null}
		*/
		this.parentSub = parentSub;
		/**
		* If this type's effect is redone this type refers to the type that undid
		* this operation.
		* @type {ID | null}
		*/
		this.redone = null;
		/**
		* @type {AbstractContent}
		*/
		this.content = content;
		/**
		* bit1: keep
		* bit2: countable
		* bit3: deleted
		* bit4: mark - mark node as fast-search-marker
		* @type {number} byte
		*/
		this.info = this.content.isCountable() ? 2 : 0;
	}
	/**
	* This is used to mark the item as an indexed fast-search marker
	*
	* @type {boolean}
	*/
	set marker(isMarked) {
		if ((this.info & 8) > 0 !== isMarked) this.info ^= 8;
	}
	get marker() {
		return (this.info & 8) > 0;
	}
	/**
	* If true, do not garbage collect this Item.
	*/
	get keep() {
		return (this.info & 1) > 0;
	}
	set keep(doKeep) {
		if (this.keep !== doKeep) this.info ^= 1;
	}
	get countable() {
		return (this.info & 2) > 0;
	}
	/**
	* Whether this item was deleted or not.
	* @type {Boolean}
	*/
	get deleted() {
		return (this.info & 4) > 0;
	}
	set deleted(doDelete) {
		if (this.deleted !== doDelete) this.info ^= 4;
	}
	markDeleted() {
		this.info |= 4;
	}
	/**
	* Return the creator clientID of the missing op or define missing items and return null.
	*
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @return {null | number}
	*/
	getMissing(transaction, store) {
		if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) return this.origin.client;
		if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) return this.rightOrigin.client;
		if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) return this.parent.client;
		if (this.origin) {
			this.left = getItemCleanEnd(transaction, store, this.origin);
			this.origin = this.left.lastId;
		}
		if (this.rightOrigin) {
			this.right = getItemCleanStart(transaction, this.rightOrigin);
			this.rightOrigin = this.right.id;
		}
		if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) this.parent = null;
		else if (!this.parent) {
			if (this.left && this.left.constructor === Item) {
				this.parent = this.left.parent;
				this.parentSub = this.left.parentSub;
			} else if (this.right && this.right.constructor === Item) {
				this.parent = this.right.parent;
				this.parentSub = this.right.parentSub;
			}
		} else if (this.parent.constructor === ID) {
			const parentItem = getItem(store, this.parent);
			if (parentItem.constructor === GC) this.parent = null;
			else this.parent = parentItem.content.type;
		}
		return null;
	}
	/**
	* @param {Transaction} transaction
	* @param {number} offset
	*/
	integrate(transaction, offset) {
		if (offset > 0) {
			this.id.clock += offset;
			this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
			this.origin = this.left.lastId;
			this.content = this.content.splice(offset);
			this.length -= offset;
		}
		if (this.parent) {
			if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
				/**
				* @type {Item|null}
				*/
				let left = this.left;
				/**
				* @type {Item|null}
				*/
				let o;
				if (left !== null) o = left.right;
				else if (this.parentSub !== null) {
					o = this.parent._map.get(this.parentSub) || null;
					while (o !== null && o.left !== null) o = o.left;
				} else o = this.parent._start;
				/**
				* @type {Set<Item>}
				*/
				const conflictingItems = /* @__PURE__ */ new Set();
				/**
				* @type {Set<Item>}
				*/
				const itemsBeforeOrigin = /* @__PURE__ */ new Set();
				while (o !== null && o !== this.right) {
					itemsBeforeOrigin.add(o);
					conflictingItems.add(o);
					if (compareIDs(this.origin, o.origin)) {
						if (o.id.client < this.id.client) {
							left = o;
							conflictingItems.clear();
						} else if (compareIDs(this.rightOrigin, o.rightOrigin)) break;
					} else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
						if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
							left = o;
							conflictingItems.clear();
						}
					} else break;
					o = o.right;
				}
				this.left = left;
			}
			if (this.left !== null) {
				const right = this.left.right;
				this.right = right;
				this.left.right = this;
			} else {
				let r;
				if (this.parentSub !== null) {
					r = this.parent._map.get(this.parentSub) || null;
					while (r !== null && r.left !== null) r = r.left;
				} else {
					r = this.parent._start;
					/** @type {AbstractType<any>} */ this.parent._start = this;
				}
				this.right = r;
			}
			if (this.right !== null) this.right.left = this;
			else if (this.parentSub !== null) {
				/** @type {AbstractType<any>} */ this.parent._map.set(this.parentSub, this);
				if (this.left !== null) this.left.delete(transaction);
			}
			if (this.parentSub === null && this.countable && !this.deleted)
 /** @type {AbstractType<any>} */ this.parent._length += this.length;
			addStruct(transaction.doc.store, this);
			this.content.integrate(transaction, this);
			addChangedTypeToTransaction(transaction, this.parent, this.parentSub);
			if (this.parent._item !== null && this.parent._item.deleted || this.parentSub !== null && this.right !== null) this.delete(transaction);
		} else new GC(this.id, this.length).integrate(transaction, 0);
	}
	/**
	* Returns the next non-deleted item
	*/
	get next() {
		let n = this.right;
		while (n !== null && n.deleted) n = n.right;
		return n;
	}
	/**
	* Returns the previous non-deleted item
	*/
	get prev() {
		let n = this.left;
		while (n !== null && n.deleted) n = n.left;
		return n;
	}
	/**
	* Computes the last content address of this Item.
	*/
	get lastId() {
		return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
	}
	/**
	* Try to merge two items
	*
	* @param {Item} right
	* @return {boolean}
	*/
	mergeWith(right) {
		if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
			const searchMarker = this.parent._searchMarker;
			if (searchMarker) searchMarker.forEach((marker) => {
				if (marker.p === right) {
					marker.p = this;
					if (!this.deleted && this.countable) marker.index -= this.length;
				}
			});
			if (right.keep) this.keep = true;
			this.right = right.right;
			if (this.right !== null) this.right.left = this;
			this.length += right.length;
			return true;
		}
		return false;
	}
	/**
	* Mark this Item as deleted.
	*
	* @param {Transaction} transaction
	*/
	delete(transaction) {
		if (!this.deleted) {
			const parent = this.parent;
			if (this.countable && this.parentSub === null) parent._length -= this.length;
			this.markDeleted();
			addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
			addChangedTypeToTransaction(transaction, parent, this.parentSub);
			this.content.delete(transaction);
		}
	}
	/**
	* @param {StructStore} store
	* @param {boolean} parentGCd
	*/
	gc(store, parentGCd) {
		if (!this.deleted) throw unexpectedCase();
		this.content.gc(store);
		if (parentGCd) replaceStruct(store, this, new GC(this.id, this.length));
		else this.content = new ContentDeleted(this.length);
	}
	/**
	* Transform the properties of this type to binary and write it to an
	* BinaryEncoder.
	*
	* This is called when this Item is sent to a remote peer.
	*
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
	* @param {number} offset
	*/
	write(encoder, offset) {
		const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
		const rightOrigin = this.rightOrigin;
		const parentSub = this.parentSub;
		const info = this.content.getRef() & 31 | (origin === null ? 0 : 128) | (rightOrigin === null ? 0 : 64) | (parentSub === null ? 0 : 32);
		encoder.writeInfo(info);
		if (origin !== null) encoder.writeLeftID(origin);
		if (rightOrigin !== null) encoder.writeRightID(rightOrigin);
		if (origin === null && rightOrigin === null) {
			const parent = this.parent;
			if (parent._item !== void 0) {
				const parentItem = parent._item;
				if (parentItem === null) {
					const ykey = findRootTypeKey(parent);
					encoder.writeParentInfo(true);
					encoder.writeString(ykey);
				} else {
					encoder.writeParentInfo(false);
					encoder.writeLeftID(parentItem.id);
				}
			} else if (parent.constructor === String) {
				encoder.writeParentInfo(true);
				encoder.writeString(parent);
			} else if (parent.constructor === ID) {
				encoder.writeParentInfo(false);
				encoder.writeLeftID(parent);
			} else unexpectedCase();
			if (parentSub !== null) encoder.writeString(parentSub);
		}
		this.content.write(encoder, offset);
	}
};
/**
* @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
* @param {number} info
*/
var readItemContent = (decoder, info) => contentRefs[info & 31](decoder);
/**
* A lookup map for reading Item content.
*
* @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractContent>}
*/
var contentRefs = [
	() => {
		unexpectedCase();
	},
	readContentDeleted,
	readContentJSON,
	readContentBinary,
	readContentString,
	readContentEmbed,
	readContentFormat,
	readContentType,
	readContentAny,
	readContentDoc,
	() => {
		unexpectedCase();
	}
];
var structSkipRefNumber = 10;
/**
* @private
*/
var Skip = class extends AbstractStruct {
	get deleted() {
		return true;
	}
	delete() {}
	/**
	* @param {Skip} right
	* @return {boolean}
	*/
	mergeWith(right) {
		if (this.constructor !== right.constructor) return false;
		this.length += right.length;
		return true;
	}
	/**
	* @param {Transaction} transaction
	* @param {number} offset
	*/
	integrate(transaction, offset) {
		unexpectedCase();
	}
	/**
	* @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
	* @param {number} offset
	*/
	write(encoder, offset) {
		encoder.writeInfo(structSkipRefNumber);
		writeVarUint(encoder.restEncoder, this.length - offset);
	}
	/**
	* @param {Transaction} transaction
	* @param {StructStore} store
	* @return {null | number}
	*/
	getMissing(transaction, store) {
		return null;
	}
};
/** eslint-env browser */
var glo = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
var importIdentifier = "__ $YJS$ __";
if (glo[importIdentifier] === true)
 /**
* Dear reader of this message. Please take this seriously.
*
* If you see this message, make sure that you only import one version of Yjs. In many cases,
* your package manager installs two versions of Yjs that are used by different packages within your project.
* Another reason for this message is that some parts of your project use the commonjs version of Yjs
* and others use the EcmaScript version of Yjs.
*
* This often leads to issues that are hard to debug. We often need to perform constructor checks,
* e.g. `struct instanceof GC`. If you imported different versions of Yjs, it is impossible for us to
* do the constructor checks anymore - which might break the CRDT algorithm.
*
* https://github.com/yjs/yjs/issues/438
*/
console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
glo[importIdentifier] = true;
//#endregion
//#region ../lexical-yjs/dist/LexicalYjs.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function formatDevErrorMessage$1(message) {
	throw new Error(message);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function simpleDiffWithCursor(a, b, cursor) {
	const aLength = a.length;
	const bLength = b.length;
	let left = 0;
	let right = 0;
	while (left < aLength && left < bLength && a[left] === b[left] && left < cursor) left++;
	while (right + left < aLength && right + left < bLength && a[aLength - right - 1] === b[bLength - right - 1]) right++;
	while (right + left < aLength && right + left < bLength && a[left] === b[left]) left++;
	return {
		index: left,
		insert: b.slice(left, bLength - right),
		remove: aLength - left - right
	};
}
var CollabDecoratorNode = class CollabDecoratorNode {
	_xmlElem;
	_key;
	_parent;
	_type;
	constructor(xmlElem, parent, type) {
		this._key = "";
		this._xmlElem = xmlElem;
		this._parent = parent;
		this._type = type;
	}
	getPrevNode(nodeMap) {
		if (nodeMap === null) return null;
		const node = nodeMap.get(this._key);
		return $isDecoratorNode(node) ? node : null;
	}
	getNode() {
		const node = $getNodeByKey(this._key);
		return $isDecoratorNode(node) ? node : null;
	}
	getSharedType() {
		return this._xmlElem;
	}
	getType() {
		return this._type;
	}
	getKey() {
		return this._key;
	}
	getSize() {
		return 1;
	}
	getOffset() {
		if (!!(this._parent instanceof CollabDecoratorNode)) formatDevErrorMessage$1(`getOffset: expected parent to be a collab element node`);
		return this._parent.getChildOffset(this);
	}
	syncPropertiesFromLexical(binding, nextLexicalNode, prevNodeMap) {
		const prevLexicalNode = this.getPrevNode(prevNodeMap);
		const xmlElem = this._xmlElem;
		syncPropertiesFromLexical(binding, xmlElem, prevLexicalNode, nextLexicalNode);
	}
	syncPropertiesFromYjs(binding, keysChanged) {
		const lexicalNode = this.getNode();
		if (lexicalNode === null) return;
		const xmlElem = this._xmlElem;
		$syncPropertiesFromYjs(binding, xmlElem, lexicalNode, keysChanged);
	}
	syncSlotsFromYjs(binding, lexicalNode) {
		$syncSlotsFromYjsShared(binding, this._xmlElem, lexicalNode, this);
	}
	syncSlotsFromLexical(binding, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves) {
		$syncSlotsFromLexicalShared(binding, this._xmlElem, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves, this);
	}
	destroy(binding) {
		const collabNodeMap = binding.collabNodeMap;
		$destroySlotsShared(binding, this._xmlElem);
		if (collabNodeMap.get(this._key) === this) collabNodeMap.delete(this._key);
	}
};
function $createCollabDecoratorNode(xmlElem, parent, type) {
	const collabNode = new CollabDecoratorNode(xmlElem, parent, type);
	xmlElem._collabNode = collabNode;
	return collabNode;
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var CollabLineBreakNode = class {
	_map;
	_key;
	_parent;
	_type;
	constructor(map, parent) {
		this._key = "";
		this._map = map;
		this._parent = parent;
		this._type = "linebreak";
	}
	getNode() {
		const node = $getNodeByKey(this._key);
		return $isLineBreakNode(node) ? node : null;
	}
	getKey() {
		return this._key;
	}
	getSharedType() {
		return this._map;
	}
	getType() {
		return this._type;
	}
	getSize() {
		return 1;
	}
	getOffset() {
		return this._parent.getChildOffset(this);
	}
	destroy(binding) {
		const collabNodeMap = binding.collabNodeMap;
		if (collabNodeMap.get(this._key) === this) collabNodeMap.delete(this._key);
	}
};
function $createCollabLineBreakNode(map, parent) {
	const collabNode = new CollabLineBreakNode(map, parent);
	map._collabNode = collabNode;
	return collabNode;
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function $diffTextContentAndApplyDelta(collabNode, key, prevText, nextText) {
	const selection = $getSelection();
	let cursorOffset = nextText.length;
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		const anchor = selection.anchor;
		if (anchor.key === key) cursorOffset = anchor.offset;
	}
	const diff = simpleDiffWithCursor(prevText, nextText, cursorOffset);
	collabNode.spliceText(diff.index, diff.remove, diff.insert);
}
var CollabTextNode = class {
	_map;
	_key;
	_parent;
	_text;
	_type;
	_normalized;
	constructor(map, text, parent, type) {
		this._key = "";
		this._map = map;
		this._parent = parent;
		this._text = text;
		this._type = type;
		this._normalized = false;
	}
	getPrevNode(nodeMap) {
		if (nodeMap === null) return null;
		const node = nodeMap.get(this._key);
		return $isTextNode(node) ? node : null;
	}
	getNode() {
		const node = $getNodeByKey(this._key);
		return $isTextNode(node) ? node : null;
	}
	getSharedType() {
		return this._map;
	}
	getType() {
		return this._type;
	}
	getKey() {
		return this._key;
	}
	getSize() {
		return this._text.length + (this._normalized ? 0 : 1);
	}
	getOffset() {
		return this._parent.getChildOffset(this);
	}
	spliceText(index, delCount, newText) {
		const xmlText = this._parent._xmlText;
		const offset = this.getOffset() + 1 + index;
		if (delCount !== 0) xmlText.delete(offset, delCount);
		if (newText !== "") xmlText.insert(offset, newText);
	}
	syncPropertiesAndTextFromLexical(binding, nextLexicalNode, prevNodeMap) {
		const prevLexicalNode = this.getPrevNode(prevNodeMap);
		const nextText = nextLexicalNode.__text;
		syncPropertiesFromLexical(binding, this._map, prevLexicalNode, nextLexicalNode);
		if (prevLexicalNode !== null) {
			const prevText = prevLexicalNode.__text;
			if (prevText !== nextText) {
				const key = nextLexicalNode.__key;
				$diffTextContentAndApplyDelta(this, key, prevText, nextText);
				this._text = nextText;
			}
		}
	}
	syncPropertiesAndTextFromYjs(binding, keysChanged) {
		const lexicalNode = this.getNode();
		if (lexicalNode === null) return;
		$syncPropertiesFromYjs(binding, this._map, lexicalNode, keysChanged);
		const collabText = this._text;
		if (lexicalNode.__text !== collabText) lexicalNode.setTextContent(collabText);
	}
	destroy(binding) {
		const collabNodeMap = binding.collabNodeMap;
		if (collabNodeMap.get(this._key) === this) collabNodeMap.delete(this._key);
	}
};
function $createCollabTextNode(map, text, parent, type) {
	const collabNode = new CollabTextNode(map, text, parent, type);
	map._collabNode = collabNode;
	return collabNode;
}
var CollabElementNode = class CollabElementNode {
	_key;
	_children;
	_xmlText;
	_type;
	_parent;
	constructor(xmlText, parent, type) {
		this._key = "";
		this._children = [];
		this._xmlText = xmlText;
		this._type = type;
		this._parent = parent;
	}
	getPrevNode(nodeMap) {
		if (nodeMap === null) return null;
		const node = nodeMap.get(this._key);
		return $isElementNode(node) ? node : null;
	}
	getNode() {
		const node = $getNodeByKey(this._key);
		return $isElementNode(node) ? node : null;
	}
	getSharedType() {
		return this._xmlText;
	}
	getType() {
		return this._type;
	}
	getKey() {
		return this._key;
	}
	isEmpty() {
		return this._children.length === 0;
	}
	getSize() {
		return 1;
	}
	getOffset() {
		const collabElementNode = this._parent;
		if (!(collabElementNode instanceof CollabElementNode)) formatDevErrorMessage$1(`getOffset: could not find collab element node`);
		return collabElementNode.getChildOffset(this);
	}
	syncPropertiesFromYjs(binding, keysChanged) {
		const lexicalNode = this.getNode();
		if (lexicalNode === null) return;
		$syncPropertiesFromYjs(binding, this._xmlText, lexicalNode, keysChanged);
	}
	applyChildrenYjsDelta(binding, deltas) {
		const children = this._children;
		let currIndex = 0;
		let pendingSplitText = null;
		for (let i = 0; i < deltas.length; i++) {
			const delta = deltas[i];
			const insertDelta = delta.insert;
			const deleteDelta = delta.delete;
			if (delta.retain != null) currIndex += delta.retain;
			else if (typeof deleteDelta === "number") {
				let deletionSize = deleteDelta;
				while (deletionSize > 0) {
					const { node, nodeIndex, offset, length } = getPositionFromElementAndOffset(this, currIndex, false);
					if (node instanceof CollabElementNode || node instanceof CollabLineBreakNode || node instanceof CollabDecoratorNode) {
						children.splice(nodeIndex, 1);
						deletionSize -= 1;
					} else if (node instanceof CollabTextNode) {
						const delCount = Math.min(deletionSize, length);
						const prevCollabNode = nodeIndex !== 0 ? children[nodeIndex - 1] : null;
						const nodeSize = node.getSize();
						if (offset === 0 && length === nodeSize) {
							children.splice(nodeIndex, 1);
							const danglingText = spliceString(node._text, offset, delCount - 1, "");
							if (danglingText.length > 0) {
								if (prevCollabNode instanceof CollabTextNode) prevCollabNode._text += danglingText;
								else this._xmlText.delete(offset, danglingText.length);
							}
						} else node._text = spliceString(node._text, offset, delCount, "");
						deletionSize -= delCount;
					} else break;
				}
			} else if (insertDelta != null) {
				if (typeof insertDelta === "string") {
					const { node, offset } = getPositionFromElementAndOffset(this, currIndex, true);
					if (node instanceof CollabTextNode) node._text = spliceString(node._text, offset, 0, insertDelta);
					else this._xmlText.delete(offset, insertDelta.length);
					currIndex += insertDelta.length;
				} else {
					const sharedType = insertDelta;
					if (getNodeTypeFromSharedType(sharedType) === void 0) continue;
					const { node, nodeIndex, length } = getPositionFromElementAndOffset(this, currIndex, false);
					const collabNode = $getOrInitCollabNodeFromSharedType(binding, sharedType, this);
					if (node instanceof CollabTextNode && length > 0 && length < node._text.length) {
						const text = node._text;
						const splitIdx = text.length - length;
						node._text = spliceString(text, splitIdx, length, "");
						children.splice(nodeIndex + 1, 0, collabNode);
						pendingSplitText = spliceString(text, 0, splitIdx, "");
					} else children.splice(nodeIndex, 0, collabNode);
					if (pendingSplitText !== null && collabNode instanceof CollabTextNode) {
						collabNode._text = pendingSplitText + collabNode._text;
						pendingSplitText = null;
					}
					currIndex += 1;
				}
			} else throw new Error("Unexpected delta format");
		}
	}
	syncChildrenFromYjs(binding) {
		const lexicalNode = this.getNode();
		if (lexicalNode === null) return;
		const key = lexicalNode.__key;
		const prevLexicalChildrenKeys = $createChildrenArray(lexicalNode, null);
		const lexicalChildrenKeysLength = prevLexicalChildrenKeys.length;
		const collabChildren = this._children;
		const collabChildrenLength = collabChildren.length;
		const collabNodeMap = binding.collabNodeMap;
		const visitedKeys = /* @__PURE__ */ new Set();
		let collabKeys;
		let writableLexicalNode;
		let prevIndex = 0;
		let prevChildNode = null;
		if (collabChildrenLength !== lexicalChildrenKeysLength) writableLexicalNode = lexicalNode.getWritable();
		for (let i = 0; i < collabChildrenLength; i++) {
			const lexicalChildKey = prevLexicalChildrenKeys[prevIndex];
			const childCollabNode = collabChildren[i];
			const collabLexicalChildNode = childCollabNode.getNode();
			const collabKey = childCollabNode._key;
			if (collabLexicalChildNode !== null && lexicalChildKey === collabKey) {
				const childNeedsUpdating = $isTextNode(collabLexicalChildNode);
				visitedKeys.add(lexicalChildKey);
				if (childNeedsUpdating) {
					childCollabNode._key = lexicalChildKey;
					if (childCollabNode instanceof CollabElementNode) {
						const xmlText = childCollabNode._xmlText;
						childCollabNode.syncPropertiesFromYjs(binding, null);
						childCollabNode.applyChildrenYjsDelta(binding, xmlText.toDelta());
						childCollabNode.syncChildrenFromYjs(binding);
					} else if (childCollabNode instanceof CollabTextNode) childCollabNode.syncPropertiesAndTextFromYjs(binding, null);
					else if (childCollabNode instanceof CollabDecoratorNode) childCollabNode.syncPropertiesFromYjs(binding, null);
					else if (!(childCollabNode instanceof CollabLineBreakNode)) formatDevErrorMessage$1(`syncChildrenFromYjs: expected text, element, decorator, or linebreak collab node`);
				}
				prevChildNode = collabLexicalChildNode;
				prevIndex++;
			} else {
				if (collabKeys === void 0) {
					collabKeys = /* @__PURE__ */ new Set();
					for (let s = 0; s < collabChildrenLength; s++) {
						const childKey = collabChildren[s]._key;
						if (childKey !== "") collabKeys.add(childKey);
					}
				}
				if (collabLexicalChildNode !== null && lexicalChildKey !== void 0 && !collabKeys.has(lexicalChildKey)) {
					const nodeToRemove = $getNodeByKeyOrThrow(lexicalChildKey);
					$removeFromParent(nodeToRemove);
					i--;
					prevIndex++;
					continue;
				}
				writableLexicalNode = lexicalNode.getWritable();
				const lexicalChildNode = createLexicalNodeFromCollabNode(binding, childCollabNode, key);
				const childKey = lexicalChildNode.__key;
				collabNodeMap.set(childKey, childCollabNode);
				if (prevChildNode === null) {
					const nextSibling = writableLexicalNode.getFirstChild();
					writableLexicalNode.__first = childKey;
					if (nextSibling !== null) {
						const writableNextSibling = nextSibling.getWritable();
						writableNextSibling.__prev = childKey;
						lexicalChildNode.__next = writableNextSibling.__key;
					}
				} else {
					const writablePrevChildNode = prevChildNode.getWritable();
					const nextSibling = prevChildNode.getNextSibling();
					writablePrevChildNode.__next = childKey;
					lexicalChildNode.__prev = prevChildNode.__key;
					if (nextSibling !== null) {
						const writableNextSibling = nextSibling.getWritable();
						writableNextSibling.__prev = childKey;
						lexicalChildNode.__next = writableNextSibling.__key;
					}
				}
				if (i === collabChildrenLength - 1) writableLexicalNode.__last = childKey;
				writableLexicalNode.__size++;
				prevChildNode = lexicalChildNode;
			}
		}
		for (let i = 0; i < lexicalChildrenKeysLength; i++) {
			const lexicalChildKey = prevLexicalChildrenKeys[i];
			if (!visitedKeys.has(lexicalChildKey)) {
				const lexicalChildNode = $getNodeByKeyOrThrow(lexicalChildKey);
				const collabNode = binding.collabNodeMap.get(lexicalChildKey);
				if (collabNode !== void 0) collabNode.destroy(binding);
				$removeFromParent(lexicalChildNode);
			}
		}
		this.syncSlotsFromYjs(binding, lexicalNode);
	}
	syncSlotsFromYjs(binding, lexicalNode) {
		$syncSlotsFromYjsShared(binding, this._xmlText, lexicalNode, this);
	}
	syncPropertiesFromLexical(binding, nextLexicalNode, prevNodeMap) {
		syncPropertiesFromLexical(binding, this._xmlText, this.getPrevNode(prevNodeMap), nextLexicalNode);
	}
	_syncChildFromLexical(binding, index, key, prevNodeMap, dirtyElements, dirtyLeaves) {
		const childCollabNode = this._children[index];
		const nextChildNode = $getNodeByKeyOrThrow(key);
		if (childCollabNode instanceof CollabElementNode && $isElementNode(nextChildNode)) {
			childCollabNode.syncPropertiesFromLexical(binding, nextChildNode, prevNodeMap);
			childCollabNode.syncChildrenFromLexical(binding, nextChildNode, prevNodeMap, dirtyElements, dirtyLeaves);
			childCollabNode.syncSlotsFromLexical(binding, nextChildNode, prevNodeMap, dirtyElements, dirtyLeaves);
		} else if (childCollabNode instanceof CollabTextNode && $isTextNode(nextChildNode)) childCollabNode.syncPropertiesAndTextFromLexical(binding, nextChildNode, prevNodeMap);
		else if (childCollabNode instanceof CollabDecoratorNode && $isDecoratorNode(nextChildNode)) {
			childCollabNode.syncPropertiesFromLexical(binding, nextChildNode, prevNodeMap);
			childCollabNode.syncSlotsFromLexical(binding, nextChildNode, prevNodeMap, dirtyElements, dirtyLeaves);
		}
	}
	syncSlotsFromLexical(binding, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves) {
		$syncSlotsFromLexicalShared(binding, this._xmlText, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves, this);
	}
	syncChildrenFromLexical(binding, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves) {
		const prevLexicalNode = this.getPrevNode(prevNodeMap);
		const prevChildren = prevLexicalNode === null ? [] : $createChildrenArray(prevLexicalNode, prevNodeMap);
		const nextChildren = $createChildrenArray(nextLexicalNode, null);
		const prevEndIndex = prevChildren.length - 1;
		const nextEndIndex = nextChildren.length - 1;
		const collabNodeMap = binding.collabNodeMap;
		let prevChildrenSet;
		let nextChildrenSet;
		let prevIndex = 0;
		let nextIndex = 0;
		while (prevIndex <= prevEndIndex && nextIndex <= nextEndIndex) {
			const prevKey = prevChildren[prevIndex];
			const nextKey = nextChildren[nextIndex];
			if (prevKey === nextKey) {
				this._syncChildFromLexical(binding, nextIndex, nextKey, prevNodeMap, dirtyElements, dirtyLeaves);
				prevIndex++;
				nextIndex++;
			} else {
				if (prevChildrenSet === void 0) prevChildrenSet = new Set(prevChildren);
				if (nextChildrenSet === void 0) nextChildrenSet = new Set(nextChildren);
				const nextHasPrevKey = nextChildrenSet.has(prevKey);
				const prevHasNextKey = prevChildrenSet.has(nextKey);
				if (!nextHasPrevKey) {
					this.splice(binding, nextIndex, 1);
					prevIndex++;
				} else {
					const collabNode = $createCollabNodeFromLexicalNode(binding, $getNodeByKeyOrThrow(nextKey), this);
					collabNodeMap.set(nextKey, collabNode);
					if (prevHasNextKey) {
						this.splice(binding, nextIndex, 1, collabNode);
						prevIndex++;
						nextIndex++;
					} else {
						this.splice(binding, nextIndex, 0, collabNode);
						nextIndex++;
					}
				}
			}
		}
		const appendNewChildren = prevIndex > prevEndIndex;
		const removeOldChildren = nextIndex > nextEndIndex;
		if (appendNewChildren && !removeOldChildren) for (; nextIndex <= nextEndIndex; ++nextIndex) {
			const key = nextChildren[nextIndex];
			const collabNode = $createCollabNodeFromLexicalNode(binding, $getNodeByKeyOrThrow(key), this);
			this.append(collabNode);
			collabNodeMap.set(key, collabNode);
		}
		else if (removeOldChildren && !appendNewChildren) for (let i = this._children.length - 1; i >= nextIndex; i--) this.splice(binding, i, 1);
	}
	append(collabNode) {
		const xmlText = this._xmlText;
		const children = this._children;
		const lastChild = children[children.length - 1];
		const offset = lastChild !== void 0 ? lastChild.getOffset() + lastChild.getSize() : 0;
		if (collabNode instanceof CollabElementNode) xmlText.insertEmbed(offset, collabNode._xmlText);
		else if (collabNode instanceof CollabTextNode) {
			const map = collabNode._map;
			if (map.parent === null) xmlText.insertEmbed(offset, map);
			xmlText.insert(offset + 1, collabNode._text);
		} else if (collabNode instanceof CollabLineBreakNode) xmlText.insertEmbed(offset, collabNode._map);
		else if (collabNode instanceof CollabDecoratorNode) xmlText.insertEmbed(offset, collabNode._xmlElem);
		this._children.push(collabNode);
	}
	splice(binding, index, delCount, collabNode) {
		const children = this._children;
		const child = children[index];
		if (child === void 0) {
			if (collabNode !== void 0) this.append(collabNode);
			return;
		}
		const offset = child.getOffset();
		if (!(offset !== -1)) formatDevErrorMessage$1(`splice: expected offset to be greater than zero`);
		const xmlText = this._xmlText;
		if (delCount !== 0) {
			const childrenToDelete = children.slice(index, index + delCount);
			for (let i = 0; i < childrenToDelete.length; i++) childrenToDelete[i].destroy(binding);
			xmlText.delete(offset, child.getSize());
		}
		if (collabNode instanceof CollabElementNode) xmlText.insertEmbed(offset, collabNode._xmlText);
		else if (collabNode instanceof CollabTextNode) {
			const map = collabNode._map;
			if (map.parent === null) xmlText.insertEmbed(offset, map);
			xmlText.insert(offset + 1, collabNode._text);
		} else if (collabNode instanceof CollabLineBreakNode) xmlText.insertEmbed(offset, collabNode._map);
		else if (collabNode instanceof CollabDecoratorNode) xmlText.insertEmbed(offset, collabNode._xmlElem);
		if (collabNode !== void 0) children.splice(index, delCount, collabNode);
		else children.splice(index, delCount);
	}
	getChildOffset(collabNode) {
		let offset = 0;
		const children = this._children;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child === collabNode) return offset;
			offset += child.getSize();
		}
		return -1;
	}
	destroy(binding) {
		const collabNodeMap = binding.collabNodeMap;
		const children = this._children;
		for (let i = 0; i < children.length; i++) children[i].destroy(binding);
		$destroySlotsShared(binding, this._xmlText);
		if (collabNodeMap.get(this._key) === this) collabNodeMap.delete(this._key);
	}
};
function $createCollabElementNode(xmlText, parent, type) {
	const collabNode = new CollabElementNode(xmlText, parent, type);
	xmlText._collabNode = collabNode;
	return collabNode;
}
var CollabV2Mapping = class {
	_nodeMap = (() => /* @__PURE__ */ new Map())();
	_sharedTypeToNodeKeys = (() => /* @__PURE__ */ new Map())();
	_nodeKeyToSharedType = (() => /* @__PURE__ */ new Map())();
	set(sharedType, node) {
		const isArray = node instanceof Array;
		this.delete(sharedType);
		const nodes = isArray ? node : [node];
		for (const n of nodes) {
			const key = n.getKey();
			if (this._nodeKeyToSharedType.has(key)) {
				const otherSharedType = this._nodeKeyToSharedType.get(key);
				const keyIndex = this._sharedTypeToNodeKeys.get(otherSharedType).indexOf(key);
				if (keyIndex !== -1) this._sharedTypeToNodeKeys.get(otherSharedType).splice(keyIndex, 1);
				this._nodeKeyToSharedType.delete(key);
				this._nodeMap.delete(key);
			}
		}
		if (sharedType instanceof YXmlText) {
			if (!isArray) formatDevErrorMessage$1(`Text nodes must be mapped as an array`);
			if (node.length === 0) return;
			this._sharedTypeToNodeKeys.set(sharedType, node.map((n) => n.getKey()));
			for (const n of node) {
				this._nodeMap.set(n.getKey(), n);
				this._nodeKeyToSharedType.set(n.getKey(), sharedType);
			}
		} else {
			if (!!isArray) formatDevErrorMessage$1(`Element nodes must be mapped as a single node`);
			if (!!$isTextNode(node)) formatDevErrorMessage$1(`Text nodes must be mapped to XmlText`);
			this._sharedTypeToNodeKeys.set(sharedType, [node.getKey()]);
			this._nodeMap.set(node.getKey(), node);
			this._nodeKeyToSharedType.set(node.getKey(), sharedType);
		}
	}
	get(sharedType) {
		const nodes = this._sharedTypeToNodeKeys.get(sharedType);
		if (nodes === void 0) return;
		if (sharedType instanceof YXmlText) {
			const arr = Array.from(nodes.map((nodeKey) => this._nodeMap.get(nodeKey)));
			return arr.length > 0 ? arr : void 0;
		}
		return this._nodeMap.get(nodes[0]);
	}
	getSharedType(node) {
		return this._nodeKeyToSharedType.get(node.getKey());
	}
	delete(sharedType) {
		const nodeKeys = this._sharedTypeToNodeKeys.get(sharedType);
		if (nodeKeys === void 0) return;
		for (const nodeKey of nodeKeys) {
			this._nodeMap.delete(nodeKey);
			this._nodeKeyToSharedType.delete(nodeKey);
		}
		this._sharedTypeToNodeKeys.delete(sharedType);
	}
	deleteNode(nodeKey) {
		const sharedType = this._nodeKeyToSharedType.get(nodeKey);
		if (sharedType) this.delete(sharedType);
		this._nodeMap.delete(nodeKey);
	}
	has(sharedType) {
		return this._sharedTypeToNodeKeys.has(sharedType);
	}
	clear() {
		this._nodeMap.clear();
		this._sharedTypeToNodeKeys.clear();
		this._nodeKeyToSharedType.clear();
	}
};
function createBaseBinding(editor, id, doc, docMap, excludedProperties) {
	const binding = {
		clientID: doc.clientID,
		cursorHighlightSheet: null,
		cursors: /* @__PURE__ */ new Map(),
		cursorsContainer: null,
		doc,
		docMap,
		editor,
		excludedProperties: excludedProperties || /* @__PURE__ */ new Map(),
		id,
		isBootstrapping: false,
		nodeProperties: /* @__PURE__ */ new Map()
	};
	initializeNodeProperties(binding);
	return binding;
}
/** Options for {@link createYjsBinding}. */
/**
* Create a V1 Yjs {@link Binding} that connects a {@link LexicalEditor} to a
* Yjs `Doc` for real-time collaboration.
*
* For the legacy positional-argument API, see {@link createBinding}.
*/
function createYjsBinding({ editor, id, doc, docMap, excludedProperties, rootName = "root", getXmlText }) {
	const rootXmlText = getXmlText ? getXmlText(doc) : doc.get(rootName, YXmlText);
	if (!(rootXmlText instanceof YXmlText && rootXmlText.doc === doc)) formatDevErrorMessage$1(`createYjsBinding: getXmlText must return an XmlText that is already integrated into the given doc`);
	const root = $createCollabElementNode(rootXmlText, null, "root");
	root._key = "root";
	return {
		...createBaseBinding(editor, id, doc, docMap, excludedProperties),
		collabNodeMap: /* @__PURE__ */ new Map(),
		root
	};
}
/** Options for {@link createBindingV2__EXPERIMENTAL}. */
function createBindingV2__EXPERIMENTAL(editor, id, doc, docMap, options = {}) {
	if (!(doc !== void 0 && doc !== null)) formatDevErrorMessage$1(`createBinding: doc is null or undefined`);
	const { excludedProperties, rootName = "root-v2", getXmlElement } = options;
	const root = getXmlElement ? getXmlElement(doc) : doc.get(rootName, YXmlElement);
	if (!(root instanceof YXmlElement && root.doc === doc)) formatDevErrorMessage$1(`createBindingV2: getXmlElement must return an XmlElement that is already integrated into the given doc`);
	if (!(root.nodeName === ROOT_NODE_NAME)) formatDevErrorMessage$1(`createBindingV2: the root XmlElement must be created without a nodeName (its nodeName is ${root.nodeName}, expected ${ROOT_NODE_NAME})`);
	return {
		...createBaseBinding(editor, id, doc, docMap, excludedProperties),
		mapping: new CollabV2Mapping(),
		root
	};
}
function isBindingV1(binding) {
	return Object.prototype.hasOwnProperty.call(binding, "collabNodeMap");
}
var SLOTS_ATTR_KEY = "__slots";
/**
* The `nodeName` yjs gives an `XmlElement` created without one, which is what
* `doc.get(name, XmlElement)` produces for a top-level type. V2 identifies the
* root of an editor's tree by this name, so an `XmlElement` supplied through
* `getXmlElement` must have been created as `new XmlElement()`.
*
* https://docs.yjs.dev/api/shared-types/y.xmlelement
* "Define a top-level type; Note that the nodeName is always "undefined""
*/
var ROOT_NODE_NAME = "UNDEFINED";
var baseExcludedProperties = /* @__PURE__ */ new Set([
	"__key",
	"__parent",
	"__next",
	"__prev",
	"__state",
	"__slotHost",
	"__slots"
]);
var elementExcludedProperties = /* @__PURE__ */ new Set([
	"__first",
	"__last",
	"__size"
]);
var rootExcludedProperties = /* @__PURE__ */ new Set([
	"__cachedText",
	"__textFormat",
	"__textStyle"
]);
var textExcludedProperties = /* @__PURE__ */ new Set(["__text"]);
function setSlotsAttr(sharedType, slotsY) {
	sharedType.setAttribute(SLOTS_ATTR_KEY, slotsY);
}
function isReservedSlotName(name) {
	return name === "__proto__" || name === "constructor" || name === "prototype";
}
function $isSlotValueNode(node) {
	return ($isElementNode(node) || $isDecoratorNode(node)) && !node.isInline();
}
function isExcludedProperty(name, node, binding) {
	if (baseExcludedProperties.has(name) || typeof node[name] === "function") return true;
	if ($isTextNode(node)) {
		if (textExcludedProperties.has(name)) return true;
	} else if ($isElementNode(node)) {
		if (elementExcludedProperties.has(name) || $isRootNode(node) && rootExcludedProperties.has(name)) return true;
	}
	const nodeKlass = node.constructor;
	const excludedProperties = binding.excludedProperties.get(nodeKlass);
	return excludedProperties != null && excludedProperties.has(name);
}
function initializeNodeProperties(binding) {
	const { editor, nodeProperties } = binding;
	editor.update(() => {
		editor._nodes.forEach((nodeInfo) => {
			const node = new nodeInfo.klass();
			const defaultProperties = {};
			for (const [property, value] of Object.entries(node)) if (!isExcludedProperty(property, node, binding)) defaultProperties[property] = value;
			nodeProperties.set(node.__type, Object.freeze(defaultProperties));
		});
	});
}
function getDefaultNodeProperties(node, binding) {
	const type = node.__type;
	const { nodeProperties } = binding;
	const properties = nodeProperties.get(type);
	if (!(properties !== void 0)) formatDevErrorMessage$1(`Node properties for ${type} not initialized for sync`);
	return properties;
}
function $syncSlotContentFromLexical(binding, slotCollab, slotNode, prevNodeMap, dirtyElements, dirtyLeaves) {
	if (slotCollab instanceof CollabElementNode && $isElementNode(slotNode)) {
		slotCollab.syncPropertiesFromLexical(binding, slotNode, prevNodeMap);
		slotCollab.syncChildrenFromLexical(binding, slotNode, prevNodeMap, dirtyElements, dirtyLeaves);
		slotCollab.syncSlotsFromLexical(binding, slotNode, prevNodeMap, dirtyElements, dirtyLeaves);
	} else if (slotCollab instanceof CollabTextNode && $isTextNode(slotNode)) slotCollab.syncPropertiesAndTextFromLexical(binding, slotNode, prevNodeMap);
	else if (slotCollab instanceof CollabDecoratorNode && $isDecoratorNode(slotNode)) {
		slotCollab.syncPropertiesFromLexical(binding, slotNode, prevNodeMap);
		slotCollab.syncSlotsFromLexical(binding, slotNode, prevNodeMap, dirtyElements, dirtyLeaves);
	}
}
function $seedHostSlots(binding, lexicalNode, hostCollab, sharedType) {
	const slotNames = $getSlotNames(lexicalNode);
	const declaresSlots = getDeclaredSlots(lexicalNode.constructor).length > 0;
	if (slotNames.length === 0 && !declaresSlots) return;
	const slotsY = new YMap();
	let hasSlot = false;
	for (const name of slotNames) {
		const slotNode = $getSlot(lexicalNode, name);
		if (slotNode === null) continue;
		const slotCollab = $createCollabNodeFromLexicalNode(binding, slotNode, hostCollab);
		binding.collabNodeMap.set(slotNode.__key, slotCollab);
		slotsY.set(name, slotCollab.getSharedType());
		hasSlot = true;
	}
	if (hasSlot || declaresSlots) setSlotsAttr(sharedType, slotsY);
}
function $createCollabNodeFromLexicalNode(binding, lexicalNode, parent) {
	const nodeType = lexicalNode.__type;
	let collabNode;
	if ($isElementNode(lexicalNode)) {
		const xmlText = new YXmlText();
		collabNode = $createCollabElementNode(xmlText, parent, nodeType);
		collabNode.syncPropertiesFromLexical(binding, lexicalNode, null);
		collabNode.syncChildrenFromLexical(binding, lexicalNode, null, null, null);
		$seedHostSlots(binding, lexicalNode, collabNode, xmlText);
	} else if ($isTextNode(lexicalNode)) {
		if (!(parent instanceof CollabElementNode)) formatDevErrorMessage$1(`Expected parent of a text node to be a collab element node`);
		collabNode = $createCollabTextNode(new YMap(), lexicalNode.__text, parent, nodeType);
		collabNode.syncPropertiesAndTextFromLexical(binding, lexicalNode, null);
	} else if ($isLineBreakNode(lexicalNode)) {
		if (!(parent instanceof CollabElementNode)) formatDevErrorMessage$1(`Expected parent of a linebreak node to be a collab element node`);
		const map = new YMap();
		map.set("__type", "linebreak");
		collabNode = $createCollabLineBreakNode(map, parent);
	} else if ($isDecoratorNode(lexicalNode)) {
		const xmlElem = new YXmlElement();
		collabNode = $createCollabDecoratorNode(xmlElem, parent, nodeType);
		collabNode.syncPropertiesFromLexical(binding, lexicalNode, null);
		$seedHostSlots(binding, lexicalNode, collabNode, xmlElem);
	} else formatDevErrorMessage$1(`Expected text, element, decorator, or linebreak node`);
	collabNode._key = lexicalNode.__key;
	return collabNode;
}
function getNodeTypeFromSharedType(sharedType) {
	const type = sharedTypeGet(sharedType, "__type");
	if (!(typeof type === "string" || typeof type === "undefined")) formatDevErrorMessage$1(`Expected shared type to include type attribute`);
	return type;
}
function decoratorHostsSlotSharedType(parent, sharedType) {
	const slotsY = parent._xmlElem.getAttribute(SLOTS_ATTR_KEY);
	if (!(slotsY instanceof YMap)) return false;
	for (const value of slotsY.values()) if (value === sharedType) return true;
	return false;
}
function $getOrInitCollabNodeFromSharedType(binding, sharedType, parent) {
	const collabNode = sharedType._collabNode;
	if (collabNode === void 0) {
		const registeredNodes = binding.editor._nodes;
		const type = getNodeTypeFromSharedType(sharedType);
		if (!(typeof type === "string")) formatDevErrorMessage$1(`Expected shared type to include type attribute`);
		if (!(registeredNodes.get(type) !== void 0)) formatDevErrorMessage$1(`Node ${type} is not registered`);
		const sharedParent = sharedType.parent;
		const targetParent = parent === void 0 && sharedParent !== null ? $getOrInitCollabNodeFromSharedType(binding, sharedParent) : parent || null;
		if (!(targetParent instanceof CollabElementNode || targetParent instanceof CollabDecoratorNode && decoratorHostsSlotSharedType(targetParent, sharedType))) formatDevErrorMessage$1(`Expected parent to be a collab element node, or a collab decorator node hosting this shared type as a named slot`);
		if (sharedType instanceof YXmlText) return $createCollabElementNode(sharedType, targetParent, type);
		else if (sharedType instanceof YMap) {
			if (!(targetParent instanceof CollabElementNode)) formatDevErrorMessage$1(`Expected parent of a text or linebreak node to be a collab element node`);
			if (type === "linebreak") return $createCollabLineBreakNode(sharedType, targetParent);
			return $createCollabTextNode(sharedType, "", targetParent, type);
		} else if (sharedType instanceof YXmlElement) return $createCollabDecoratorNode(sharedType, targetParent, type);
	}
	return collabNode;
}
function createLexicalNodeFromCollabNode(binding, collabNode, parentKey) {
	const type = collabNode.getType();
	const nodeInfo = binding.editor._nodes.get(type);
	if (!(nodeInfo !== void 0)) formatDevErrorMessage$1(`Node ${type} is not registered`);
	const lexicalNode = new nodeInfo.klass();
	lexicalNode.__parent = parentKey;
	collabNode._key = lexicalNode.__key;
	if (collabNode instanceof CollabElementNode) {
		const xmlText = collabNode._xmlText;
		collabNode.syncPropertiesFromYjs(binding, null);
		collabNode.applyChildrenYjsDelta(binding, xmlText.toDelta());
		collabNode.syncChildrenFromYjs(binding);
	} else if (collabNode instanceof CollabTextNode) collabNode.syncPropertiesAndTextFromYjs(binding, null);
	else if (collabNode instanceof CollabDecoratorNode) {
		collabNode.syncPropertiesFromYjs(binding, null);
		if (!$isDecoratorNode(lexicalNode)) formatDevErrorMessage$1(`Expected a decorator node for a collab decorator node`);
		collabNode.syncSlotsFromYjs(binding, lexicalNode);
	}
	binding.collabNodeMap.set(lexicalNode.__key, collabNode);
	return lexicalNode;
}
function $syncPropertiesFromYjs(binding, sharedType, lexicalNode, keysChanged) {
	const properties = keysChanged === null ? sharedType instanceof YMap ? Array.from(sharedType.keys()) : sharedType instanceof YXmlText || sharedType instanceof YXmlElement ? Object.keys(sharedType.getAttributes()) : Object.keys(sharedType) : Array.from(keysChanged);
	let writableNode;
	for (let i = 0; i < properties.length; i++) {
		const property = properties[i];
		if (isExcludedProperty(property, lexicalNode, binding)) {
			if (property === "__state" && isBindingV1(binding)) {
				if (!writableNode) writableNode = lexicalNode.getWritable();
				$syncNodeStateToLexical(sharedType, writableNode);
			}
			continue;
		}
		const prevValue = lexicalNode[property];
		let nextValue = sharedTypeGet(sharedType, property);
		if (prevValue !== nextValue) {
			if (nextValue instanceof Doc) {
				const yjsDocMap = binding.docMap;
				if (prevValue instanceof Doc) yjsDocMap.delete(prevValue.guid);
				const key = nextValue.guid;
				yjsDocMap.set(key, nextValue);
				if (isLexicalEditor(prevValue)) {
					prevValue._key = key;
					nextValue = prevValue;
				} else {
					const nestedEditor = createEditor();
					nestedEditor._key = key;
					nextValue = nestedEditor;
				}
			}
			if (writableNode === void 0) writableNode = lexicalNode.getWritable();
			writableNode[property] = nextValue;
		}
	}
}
function sharedTypeGet(sharedType, property) {
	if (sharedType instanceof YMap) return sharedType.get(property);
	else if (sharedType instanceof YXmlText || sharedType instanceof YXmlElement) return sharedType.getAttribute(property);
	else return sharedType[property];
}
function sharedTypeSet(sharedType, property, nextValue) {
	if (sharedType instanceof YMap) sharedType.set(property, nextValue);
	else sharedType.setAttribute(property, nextValue);
}
function $syncNodeStateToLexical(sharedType, lexicalNode) {
	const existingState = sharedTypeGet(sharedType, "__state");
	if (!(existingState instanceof YMap)) return;
	$getWritableNodeState(lexicalNode).updateFromJSON(existingState.toJSON());
}
function syncNodeStateFromLexical(binding, sharedType, prevLexicalNode, nextLexicalNode) {
	const nextState = nextLexicalNode.__state;
	const existingState = sharedType.doc === null ? void 0 : sharedTypeGet(sharedType, "__state");
	if (!nextState) return;
	const [unknown, known] = nextState.getInternalState();
	const prevState = prevLexicalNode && prevLexicalNode.__state;
	const stateMap = existingState instanceof YMap ? existingState : new YMap();
	if (prevState === nextState) return;
	const [prevUnknown, prevKnown] = prevState && stateMap.doc ? prevState.getInternalState() : [void 0, /* @__PURE__ */ new Map()];
	if (unknown) {
		for (const [k, v] of Object.entries(unknown)) if (!prevUnknown || v !== prevUnknown[k]) stateMap.set(k, v);
	}
	for (const [stateConfig, v] of known) if (prevKnown.get(stateConfig) !== v) stateMap.set(stateConfig.key, stateConfig.unparse(v));
	if (!existingState) sharedTypeSet(sharedType, "__state", stateMap);
}
function syncPropertiesFromLexical(binding, sharedType, prevLexicalNode, nextLexicalNode) {
	const properties = Object.keys(getDefaultNodeProperties(nextLexicalNode, binding));
	const EditorClass = binding.editor.constructor;
	syncNodeStateFromLexical(binding, sharedType, prevLexicalNode, nextLexicalNode);
	for (let i = 0; i < properties.length; i++) {
		const property = properties[i];
		const prevValue = prevLexicalNode === null ? void 0 : prevLexicalNode[property];
		let nextValue = nextLexicalNode[property];
		if (prevValue !== nextValue) {
			if (nextValue instanceof EditorClass) {
				const yjsDocMap = binding.docMap;
				let prevDoc;
				if (prevValue instanceof EditorClass) {
					const prevKey = prevValue._key;
					prevDoc = yjsDocMap.get(prevKey);
					yjsDocMap.delete(prevKey);
				}
				const doc = prevDoc || new Doc();
				const key = doc.guid;
				nextValue._key = key;
				yjsDocMap.set(key, doc);
				nextValue = doc;
				binding.editor.update(() => {
					nextLexicalNode.markDirty();
				});
			}
			sharedTypeSet(sharedType, property, nextValue);
		}
	}
}
function spliceString(str, index, delCount, newText) {
	return str.slice(0, index) + newText + str.slice(index + delCount);
}
function getPositionFromElementAndOffset(node, offset, boundaryIsEdge) {
	let index = 0;
	let i = 0;
	const children = node._children;
	const childrenLength = children.length;
	for (; i < childrenLength; i++) {
		const child = children[i];
		const childOffset = index;
		const size = child.getSize();
		index += size;
		if ((boundaryIsEdge ? index >= offset : index > offset) && child instanceof CollabTextNode) {
			let textOffset = offset - childOffset - 1;
			if (textOffset < 0) textOffset = 0;
			return {
				length: index - offset,
				node: child,
				nodeIndex: i,
				offset: textOffset
			};
		}
		if (index > offset) return {
			length: 0,
			node: child,
			nodeIndex: i,
			offset: childOffset
		};
		else if (i === childrenLength - 1) return {
			length: 0,
			node: null,
			nodeIndex: i + 1,
			offset: childOffset + 1
		};
	}
	return {
		length: 0,
		node: null,
		nodeIndex: 0,
		offset: 0
	};
}
function doesSelectionNeedRecovering(selection) {
	const anchor = selection.anchor;
	const focus = selection.focus;
	let recoveryNeeded = false;
	try {
		const anchorNode = anchor.getNode();
		const focusNode = focus.getNode();
		if (!anchorNode.isAttached() || !focusNode.isAttached() || $isTextNode(anchorNode) && anchor.offset > anchorNode.getTextContentSize() || $isTextNode(focusNode) && focus.offset > focusNode.getTextContentSize()) recoveryNeeded = true;
	} catch (_e) {
		recoveryNeeded = true;
	}
	return recoveryNeeded;
}
function syncWithTransaction(binding, fn) {
	binding.doc.transact(fn, binding);
}
function $moveSelectionToPreviousNode(anchorNodeKey, currentEditorState) {
	const anchorNode = currentEditorState._nodeMap.get(anchorNodeKey);
	if (!anchorNode) {
		$getRoot().selectStart();
		return;
	}
	const prevNodeKey = anchorNode.__prev;
	let prevNode = null;
	if (prevNodeKey) prevNode = $getNodeByKey(prevNodeKey);
	if (prevNode === null && anchorNode.__parent !== null) prevNode = $getNodeByKey(anchorNode.__parent);
	if (prevNode === null) {
		$getRoot().selectStart();
		return;
	}
	if (prevNode !== null && prevNode.isAttached()) {
		prevNode.selectEnd();
		return;
	} else $moveSelectionToPreviousNode(prevNode.__key, currentEditorState);
}
function $syncSlotsFromYjsShared(binding, slotsParent, lexicalNode, ownerCollab) {
	const slotsY = slotsParent.getAttribute(SLOTS_ATTR_KEY);
	const yNames = slotsY instanceof YMap ? new Set(slotsY.keys()) : /* @__PURE__ */ new Set();
	for (const name of $getSlotNames(lexicalNode)) if (!yNames.has(name)) {
		const slotNode = $getSlot(lexicalNode, name);
		if (slotNode !== null) {
			const slotCollab = binding.collabNodeMap.get(slotNode.__key);
			if (slotCollab !== void 0) slotCollab.destroy(binding);
		}
		$removeSlot(lexicalNode, name);
	}
	if (!(slotsY instanceof YMap)) return;
	for (const [name, slotSharedType] of slotsY.entries()) {
		if (isReservedSlotName(name)) continue;
		if (!(slotSharedType instanceof YXmlText || slotSharedType instanceof YXmlElement || slotSharedType instanceof YMap)) continue;
		const existingSlot = $getSlot(lexicalNode, name);
		const existingCollab = existingSlot === null ? void 0 : binding.collabNodeMap.get(existingSlot.__key);
		if (existingCollab !== void 0 && existingCollab.getSharedType() === slotSharedType) continue;
		if (slotSharedType._collabNode === void 0 && typeof sharedTypeGet(slotSharedType, "__type") !== "string") continue;
		if (slotSharedType instanceof YMap && ownerCollab instanceof CollabDecoratorNode) continue;
		const cachedCollab = slotSharedType._collabNode;
		if (cachedCollab !== void 0) {
			const cachedNode = $getNodeByKey(cachedCollab._key);
			if (cachedNode !== null && (cachedNode.isAttached() || ($isElementNode(cachedNode) || $isDecoratorNode(cachedNode)) && cachedNode.getLatest().__slotHost !== null)) continue;
		}
		const slotCollab = $getOrInitCollabNodeFromSharedType(binding, slotSharedType, ownerCollab);
		const slotLexicalNode = createLexicalNodeFromCollabNode(binding, slotCollab, null);
		if (!$isSlotValueNode(slotLexicalNode)) {
			if (binding.collabNodeMap.get(slotLexicalNode.__key) === slotCollab) binding.collabNodeMap.delete(slotLexicalNode.__key);
			continue;
		}
		if (existingCollab !== void 0) existingCollab.destroy(binding);
		$setSlot(lexicalNode, name, slotLexicalNode);
	}
}
function $syncSlotsFromLexicalShared(binding, slotsParent, nextLexicalNode, prevNodeMap, dirtyElements, dirtyLeaves, ownerCollab) {
	const slotNames = $getSlotNames(nextLexicalNode);
	const existing = slotsParent.getAttribute(SLOTS_ATTR_KEY);
	if (slotNames.length === 0 && !(existing instanceof YMap)) return;
	let slotsY;
	if (existing instanceof YMap) slotsY = existing;
	else {
		slotsY = new YMap();
		setSlotsAttr(slotsParent, slotsY);
	}
	const nextNames = new Set(slotNames);
	for (const name of Array.from(slotsY.keys())) if (!nextNames.has(name)) {
		const removed = slotsY.get(name);
		const removedCollab = removed == null ? void 0 : removed._collabNode;
		if (removedCollab !== void 0) removedCollab.destroy(binding);
		slotsY.delete(name);
	}
	const collabNodeMap = binding.collabNodeMap;
	for (const name of slotNames) {
		const slotNode = $getSlot(nextLexicalNode, name);
		if (slotNode === null) continue;
		const slotCollab = collabNodeMap.get(slotNode.__key);
		if (slotCollab !== void 0 && slotsY.get(name) === slotCollab.getSharedType()) $syncSlotContentFromLexical(binding, slotCollab, slotNode, prevNodeMap, dirtyElements, dirtyLeaves);
		else {
			const prev = slotsY.get(name);
			const prevCollab = prev == null ? void 0 : prev._collabNode;
			if (prevCollab !== void 0) prevCollab.destroy(binding);
			const created = $createCollabNodeFromLexicalNode(binding, slotNode, ownerCollab);
			collabNodeMap.set(slotNode.__key, created);
			slotsY.set(name, created.getSharedType());
		}
	}
}
function $destroySlotsShared(binding, slotsParent) {
	const slotsY = slotsParent.getAttribute(SLOTS_ATTR_KEY);
	if (slotsY instanceof YMap) for (const name of slotsY.keys()) {
		const slot = slotsY.get(name);
		const slotCollab = slot == null ? void 0 : slot._collabNode;
		if (slotCollab !== void 0) slotCollab.destroy(binding);
	}
}
var isRootElement = (el) => el.nodeName === ROOT_NODE_NAME;
var $createOrUpdateNodeFromYElement = (el, binding, keysChanged, childListChanged, snapshot, prevSnapshot, computeYChange) => {
	let node = binding.mapping.get(el);
	if (node && keysChanged && keysChanged.size === 0 && !childListChanged) return node;
	const type = isRootElement(el) ? RootNode.getType() : el.nodeName;
	const nodeInfo = binding.editor._nodes.get(type);
	if (nodeInfo === void 0) throw new Error(`$createOrUpdateNodeFromYElement: Node ${type} is not registered`);
	if (!node) {
		node = new nodeInfo.klass();
		keysChanged = null;
		childListChanged = true;
	}
	if (childListChanged && node instanceof ElementNode) {
		const children = [];
		const $createChildren = (childType) => {
			if (childType instanceof YXmlElement) {
				const n = $createOrUpdateNodeFromYElement(childType, binding, /* @__PURE__ */ new Set(), false, snapshot, prevSnapshot, computeYChange);
				if (n !== null) children.push(n);
			} else if (childType instanceof YXmlText) {
				const ns = $createOrUpdateTextNodesFromYText(childType, binding, snapshot, prevSnapshot, computeYChange);
				if (ns !== null) ns.forEach((textchild) => {
					if (textchild !== null) children.push(textchild);
				});
			} else formatDevErrorMessage$1(`XmlHook is not supported`);
		};
		if (snapshot === void 0 || prevSnapshot === void 0) el.toArray().forEach($createChildren);
		else typeListToArraySnapshot(el, new Snapshot(prevSnapshot.ds, snapshot.sv)).filter((childType) => !childType._item.deleted || isItemVisible(childType._item, snapshot) || isItemVisible(childType._item, prevSnapshot)).forEach($createChildren);
		$spliceChildren(node, children);
	}
	const attrs = el.getAttributes(snapshot);
	if (!isRootElement(el) && snapshot !== void 0) {
		if (!isItemVisible(el._item, snapshot)) attrs[stateKeyToAttrKey("ychange")] = computeYChange ? computeYChange("removed", el._item.id) : { type: "removed" };
		else if (!isItemVisible(el._item, prevSnapshot)) attrs[stateKeyToAttrKey("ychange")] = computeYChange ? computeYChange("added", el._item.id) : { type: "added" };
	}
	const properties = { ...getDefaultNodeProperties(node, binding) };
	const state = {};
	for (const k in attrs) if (k.startsWith(STATE_KEY_PREFIX)) state[attrKeyToStateKey(k)] = attrs[k];
	else if (k !== SLOTS_ATTR_KEY && k !== "__proto__" && k !== "constructor" && k !== "prototype") properties[k] = attrs[k];
	$syncPropertiesFromYjs(binding, properties, node, keysChanged);
	if (!keysChanged) $getWritableNodeState(node).updateFromJSON(state);
	else if (keysChanged.size > 0) {
		const writableState = $getWritableNodeState(node);
		for (const changedKey of keysChanged) if (changedKey.startsWith(STATE_KEY_PREFIX)) {
			const stateKey = attrKeyToStateKey(changedKey);
			writableState.updateFromUnknown(stateKey, state[stateKey]);
		}
	}
	if (node instanceof ElementNode || $isDecoratorNode(node)) {
		const slotsY = attrs[SLOTS_ATTR_KEY];
		const yNames = /* @__PURE__ */ new Set();
		if (slotsY instanceof YMap) {
			const slotEntries = snapshot === void 0 ? Array.from(slotsY.entries()) : Object.entries(typeMapGetAllSnapshot(slotsY, snapshot));
			for (const [name, slotType] of slotEntries) {
				yNames.add(name);
				if (isReservedSlotName(name)) continue;
				let slotNode = null;
				if (slotType instanceof YXmlElement) slotNode = $createOrUpdateNodeFromYElement(slotType, binding, /* @__PURE__ */ new Set(), false, snapshot, prevSnapshot, computeYChange);
				if (slotNode === null) continue;
				const existingSlot = $getSlot(node, name);
				if (existingSlot !== null && existingSlot.getKey() === slotNode.getKey()) continue;
				if (!$isSlotValueNode(slotNode)) {
					if (!slotNode.isAttached()) $deleteMappingForSubtree(slotType, binding);
					continue;
				}
				if (slotNode.getLatest().__slotHost !== null) continue;
				$setSlot(node, name, slotNode);
			}
		}
		for (const name of $getSlotNames(node)) if (!yNames.has(name)) $removeSlot(node, name);
	}
	const latestNode = node.getLatest();
	binding.mapping.set(el, latestNode);
	return latestNode;
};
var $spliceChildren = (node, nextChildren) => {
	const prevChildren = node.getChildren();
	const prevChildrenKeySet = new Set(prevChildren.map((child) => child.getKey()));
	const nextChildrenKeySet = new Set(nextChildren.map((child) => child.getKey()));
	const prevEndIndex = prevChildren.length - 1;
	const nextEndIndex = nextChildren.length - 1;
	let prevIndex = 0;
	let nextIndex = 0;
	while (prevIndex <= prevEndIndex && nextIndex <= nextEndIndex) {
		const prevKey = prevChildren[prevIndex].getKey();
		const nextKey = nextChildren[nextIndex].getKey();
		if (prevKey === nextKey) {
			prevIndex++;
			nextIndex++;
			continue;
		}
		const nextHasPrevKey = nextChildrenKeySet.has(prevKey);
		const prevHasNextKey = prevChildrenKeySet.has(nextKey);
		if (!nextHasPrevKey) {
			if (nextIndex === 0 && node.getChildrenSize() === 1) {
				node.splice(nextIndex, 1, nextChildren.slice(nextIndex));
				return;
			}
			node.splice(nextIndex, 1, []);
			prevIndex++;
			continue;
		}
		const nextChildNode = nextChildren[nextIndex];
		if (prevHasNextKey) {
			node.splice(nextIndex, 1, [nextChildNode]);
			prevIndex++;
			nextIndex++;
		} else {
			node.splice(nextIndex, 0, [nextChildNode]);
			nextIndex++;
		}
	}
	const appendNewChildren = prevIndex > prevEndIndex;
	const removeOldChildren = nextIndex > nextEndIndex;
	if (appendNewChildren && !removeOldChildren) node.append(...nextChildren.slice(nextIndex));
	else if (removeOldChildren && !appendNewChildren) node.splice(nextChildren.length, node.getChildrenSize() - nextChildren.length, []);
};
var isItemVisible = (item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && snapshot.sv.get(item.id.client) > item.id.clock && !isDeleted(snapshot.ds, item.id);
var $createOrUpdateTextNodesFromYText = (text, binding, snapshot, prevSnapshot, computeYChange) => {
	const deltas = toDelta(text, snapshot, prevSnapshot, computeYChange);
	let nodes = binding.mapping.get(text) ?? [];
	const nodeTypes = deltas.map((delta) => delta.attributes.t ?? TextNode.getType());
	if (!(nodes.length === nodeTypes.length && nodes.every((node, i) => node.getType() === nodeTypes[i]))) {
		const registeredNodes = binding.editor._nodes;
		nodes = nodeTypes.map((type) => {
			const nodeInfo = registeredNodes.get(type);
			if (nodeInfo === void 0) throw new Error(`$createTextNodesFromYText: Node ${type} is not registered`);
			const node = new nodeInfo.klass();
			if (!$isTextNode(node)) throw new Error(`$createTextNodesFromYText: Node ${type} is not a TextNode`);
			return node;
		});
	}
	for (let i = 0; i < deltas.length; i++) {
		const node = nodes[i];
		const { attributes, insert } = deltas[i];
		if (node.__text !== insert) node.setTextContent(insert);
		const properties = {
			...getDefaultNodeProperties(node, binding),
			...attributes.p
		};
		const state = Object.fromEntries(Object.entries(attributes).filter(([k]) => k.startsWith(STATE_KEY_PREFIX)).map(([k, v]) => [attrKeyToStateKey(k), v]));
		$syncPropertiesFromYjs(binding, properties, node, null);
		$getWritableNodeState(node).updateFromJSON(state);
	}
	const latestNodes = nodes.map((node) => node.getLatest());
	binding.mapping.set(text, latestNodes);
	return latestNodes;
};
var $createTypeFromTextNodes = (nodes, binding) => {
	const type = new YXmlText();
	$updateYText(type, nodes, binding);
	return type;
};
var $createSlotsYType = (node, binding) => {
	const names = $getSlotNames(node);
	if (names.length === 0 && getDeclaredSlots(node.constructor).length === 0) return;
	const slotsY = new YMap();
	for (const name of names) {
		const slotNode = $getSlot(node, name);
		if (slotNode == null) continue;
		slotsY.set(name, $createSlotValueType(slotNode, binding));
	}
	return slotsY;
};
var $deleteMappingForSubtree = (type, binding) => {
	if (type instanceof YXmlElement || type instanceof YXmlText) binding.mapping.delete(type);
	if (type instanceof YXmlElement) {
		const slotsY = type.getAttribute(SLOTS_ATTR_KEY);
		if (slotsY instanceof YMap) for (const slot of slotsY.values()) $deleteMappingForSubtree(slot, binding);
		for (const child of type.toArray()) $deleteMappingForSubtree(child, binding);
	}
};
var $updateSlotsYType = (yDomFragment, node, binding, dirtyElements, y) => {
	const names = $getSlotNames(node);
	const existing = yDomFragment.getAttribute(SLOTS_ATTR_KEY);
	if (names.length === 0 && !(existing instanceof YMap) && getDeclaredSlots(node.constructor).length === 0) return;
	let slotsY;
	if (existing instanceof YMap) slotsY = existing;
	else {
		slotsY = new YMap();
		setSlotsAttr(yDomFragment, slotsY);
	}
	const nextNames = new Set(names);
	for (const name of Array.from(slotsY.keys())) if (!nextNames.has(name)) {
		const removed = slotsY.get(name);
		if (removed !== void 0) $deleteMappingForSubtree(removed, binding);
		slotsY.delete(name);
	}
	for (const name of names) {
		const slotNode = $getSlot(node, name);
		if (slotNode == null) continue;
		const slotY = slotsY.get(name);
		if (slotY instanceof YXmlElement && (slotNode instanceof ElementNode || $isDecoratorNode(slotNode)) && slotY === binding.mapping.getSharedType(slotNode)) {
			if (dirtyElements.has(slotNode.getKey())) $updateYFragment(y, slotY, slotNode, binding, dirtyElements);
		} else {
			if (slotY instanceof YXmlElement) $deleteMappingForSubtree(slotY, binding);
			slotsY.set(name, $createSlotValueType(slotNode, binding));
		}
	}
};
var $createTypeFromElementNode = (node, binding) => {
	const type = new YXmlElement(node.getType());
	const attrs = {
		...propertiesToAttributes(node, binding),
		...stateToAttributes(node)
	};
	for (const key in attrs) {
		const val = attrs[key];
		if (val !== null) type.setAttribute(key, val);
	}
	if (!(node instanceof ElementNode)) {
		const decoratorSlotsY = $createSlotsYType(node, binding);
		if (decoratorSlotsY !== void 0) {
			setSlotsAttr(type, decoratorSlotsY);
			binding.mapping.set(type, node);
		}
		return type;
	}
	const slotsY = $createSlotsYType(node, binding);
	if (slotsY !== void 0) setSlotsAttr(type, slotsY);
	type.insert(0, normalizeNodeContent(node).map((n) => $createTypeFromTextOrElementNode(n, binding)));
	binding.mapping.set(type, node);
	return type;
};
var $createSlotValueType = (slotNode, binding) => {
	const type = $createTypeFromElementNode(slotNode, binding);
	if ($isDecoratorNode(slotNode) && binding.mapping.getSharedType(slotNode) === void 0) binding.mapping.set(type, slotNode);
	return type;
};
var $createTypeFromTextOrElementNode = (node, meta) => node instanceof Array ? $createTypeFromTextNodes(node, meta) : $createTypeFromElementNode(node, meta);
var isObject = (val) => typeof val === "object" && val != null;
var equalAttrs = (pattrs, yattrs) => {
	const keys = Object.keys(pattrs).filter((key) => pattrs[key] !== null);
	if (yattrs == null) return keys.length === 0;
	let eq = keys.length === Object.keys(yattrs).filter((key) => yattrs[key] !== null).length;
	for (let i = 0; i < keys.length && eq; i++) {
		const key = keys[i];
		const l = pattrs[key];
		const r = yattrs[key];
		eq = key === "ychange" || l === r || isObject(l) && isObject(r) && equalAttrs(l, r);
	}
	return eq;
};
var normalizeNodeContent = (node) => {
	if (!(node instanceof ElementNode)) return [];
	const c = node.getChildren();
	const res = [];
	for (let i = 0; i < c.length; i++) {
		const n = c[i];
		if ($isTextNode(n)) {
			const textNodes = [];
			for (let maybeTextNode = c[i]; i < c.length && $isTextNode(maybeTextNode); maybeTextNode = c[++i]) textNodes.push(maybeTextNode);
			i--;
			res.push(textNodes);
		} else res.push(n);
	}
	return res;
};
var equalYTextLText = (ytext, ltexts, binding) => {
	const deltas = toDelta(ytext);
	return deltas.length === ltexts.length && deltas.every((d, i) => {
		const ltext = ltexts[i];
		const type = d.attributes.t ?? TextNode.getType();
		const propertyAttrs = d.attributes.p ?? {};
		const stateAttrs = Object.fromEntries(Object.entries(d.attributes).filter(([k]) => k.startsWith(STATE_KEY_PREFIX)));
		return d.insert === ltext.getTextContent() && type === ltext.getType() && equalAttrs(propertyAttrs, propertiesToAttributes(ltext, binding)) && equalAttrs(stateAttrs, stateToAttributes(ltext));
	});
};
var $equalSlots = (ytype, lnode, binding) => {
	const names = $getSlotNames(lnode);
	const slotsY = ytype.getAttribute(SLOTS_ATTR_KEY);
	if (!(slotsY instanceof YMap)) return names.length === 0;
	if (slotsY.size !== names.length) return false;
	for (const name of names) {
		const slotNode = $getSlot(lnode, name);
		const slotY = slotsY.get(name);
		if (slotNode === null || !(slotY instanceof YXmlElement) || binding.mapping.get(slotY) !== slotNode) return false;
	}
	return true;
};
var $equalYTypePNode = (ytype, lnode, binding) => {
	if (ytype instanceof YXmlElement && !(lnode instanceof Array) && matchNodeName(ytype, lnode)) {
		const normalizedContent = normalizeNodeContent(lnode);
		const yattrs = ytype.getAttributes();
		delete yattrs[SLOTS_ATTR_KEY];
		return ytype._length === normalizedContent.length && equalAttrs(yattrs, {
			...propertiesToAttributes(lnode, binding),
			...stateToAttributes(lnode)
		}) && $equalSlots(ytype, lnode, binding) && ytype.toArray().every((ychild, i) => $equalYTypePNode(ychild, normalizedContent[i], binding));
	}
	return ytype instanceof YXmlText && lnode instanceof Array && equalYTextLText(ytype, lnode, binding);
};
var mappedIdentity = (mapped, lcontent) => mapped === lcontent || mapped instanceof Array && lcontent instanceof Array && mapped.length === lcontent.length && mapped.every((a, i) => lcontent[i] === a);
var $computeChildEqualityFactor = (ytype, lnode, binding) => {
	const yChildren = ytype.toArray();
	const pChildren = normalizeNodeContent(lnode);
	const pChildCnt = pChildren.length;
	const yChildCnt = yChildren.length;
	const minCnt = Math.min(yChildCnt, pChildCnt);
	let left = 0;
	let right = 0;
	let foundMappedChild = false;
	for (; left < minCnt; left++) {
		const leftY = yChildren[left];
		const leftP = pChildren[left];
		if (leftY instanceof YXmlHook) break;
		else if (mappedIdentity(binding.mapping.get(leftY), leftP)) foundMappedChild = true;
		else if (!$equalYTypePNode(leftY, leftP, binding)) break;
	}
	for (; left + right < minCnt; right++) {
		const rightY = yChildren[yChildCnt - right - 1];
		const rightP = pChildren[pChildCnt - right - 1];
		if (rightY instanceof YXmlHook) break;
		else if (mappedIdentity(binding.mapping.get(rightY), rightP)) foundMappedChild = true;
		else if (!$equalYTypePNode(rightY, rightP, binding)) break;
	}
	return {
		equalityFactor: left + right,
		foundMappedChild
	};
};
var ytextTrans = (ytext) => {
	let str = "";
	let n = ytext._start;
	const nAttrs = {};
	while (n !== null) {
		if (!n.deleted) {
			if (n.countable && n.content instanceof ContentString) str += n.content.str;
			else if (n.content instanceof ContentFormat) nAttrs[n.content.key] = null;
		}
		n = n.right;
	}
	return {
		nAttrs,
		str
	};
};
var $updateYText = (ytext, ltexts, binding) => {
	binding.mapping.set(ytext, ltexts);
	const { nAttrs, str } = ytextTrans(ytext);
	const content = ltexts.map((node, i) => {
		const nodeType = node.getType();
		let p = propertiesToAttributes(node, binding);
		if (Object.keys(p).length === 0) p = null;
		return {
			attributes: Object.assign({}, nAttrs, {
				...nodeType !== TextNode.getType() && { t: nodeType },
				p,
				...stateToAttributes(node),
				...i > 0 && { i }
			}),
			insert: node.getTextContent(),
			nodeKey: node.getKey()
		};
	});
	const nextText = content.map((c) => c.insert).join("");
	const selection = $getSelection();
	let cursorOffset;
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		cursorOffset = 0;
		for (const c of content) {
			if (c.nodeKey === selection.anchor.key) {
				cursorOffset += selection.anchor.offset;
				break;
			}
			cursorOffset += c.insert.length;
		}
	} else cursorOffset = nextText.length;
	const { insert, remove, index } = simpleDiffWithCursor(str, nextText, cursorOffset);
	ytext.delete(index, remove);
	ytext.insert(index, insert);
	ytext.applyDelta(content.map((c) => ({
		attributes: c.attributes,
		retain: c.insert.length
	})));
};
var toDelta = (ytext, snapshot, prevSnapshot, computeYChange) => {
	return ytext.toDelta(snapshot, prevSnapshot, computeYChange).map((delta) => {
		const attributes = delta.attributes ?? {};
		if ("ychange" in attributes) {
			attributes[stateKeyToAttrKey("ychange")] = attributes.ychange;
			delete attributes.ychange;
		}
		return {
			...delta,
			attributes
		};
	});
};
var propertiesToAttributes = (node, meta) => {
	const defaultProperties = getDefaultNodeProperties(node, meta);
	const attrs = {};
	Object.entries(defaultProperties).forEach(([property, defaultValue]) => {
		const value = node[property];
		if (value !== defaultValue) attrs[property] = value;
	});
	return attrs;
};
var STATE_KEY_PREFIX = "s_";
var stateKeyToAttrKey = (key) => `s_${key}`;
var attrKeyToStateKey = (key) => {
	if (!key.startsWith(STATE_KEY_PREFIX)) throw new Error(`Invalid state key: ${key}`);
	return key.slice(2);
};
var stateToAttributes = (node) => {
	const state = node.__state;
	if (!state) return {};
	const [unknown = {}, known] = state.getInternalState();
	const attrs = {};
	for (const [k, v] of Object.entries(unknown)) attrs[stateKeyToAttrKey(k)] = v;
	for (const [stateConfig, v] of known) attrs[stateKeyToAttrKey(stateConfig.key)] = stateConfig.unparse(v);
	return attrs;
};
var $updateYFragment = (y, yDomFragment, node, binding, dirtyElements) => {
	if (yDomFragment instanceof YXmlElement && yDomFragment.nodeName !== node.getType() && !(isRootElement(yDomFragment) && node.getType() === RootNode.getType())) throw new Error("node name mismatch!");
	binding.mapping.set(yDomFragment, node);
	if (yDomFragment instanceof YXmlElement) {
		const yDomAttrs = yDomFragment.getAttributes();
		const lexicalAttrs = {
			...propertiesToAttributes(node, binding),
			...stateToAttributes(node)
		};
		for (const key in lexicalAttrs) if (lexicalAttrs[key] != null) {
			if (!(yDomAttrs[key] === lexicalAttrs[key] || isObject(yDomAttrs[key]) && isObject(lexicalAttrs[key]) && equalAttrs(yDomAttrs[key], lexicalAttrs[key])) && key !== "ychange") yDomFragment.setAttribute(key, lexicalAttrs[key]);
		} else yDomFragment.removeAttribute(key);
		for (const key in yDomAttrs) if (key !== SLOTS_ATTR_KEY && lexicalAttrs[key] === void 0) yDomFragment.removeAttribute(key);
		if (node instanceof ElementNode || $isDecoratorNode(node)) $updateSlotsYType(yDomFragment, node, binding, dirtyElements, y);
	}
	const lChildren = normalizeNodeContent(node);
	const lChildCnt = lChildren.length;
	const yChildren = yDomFragment.toArray();
	const yChildCnt = yChildren.length;
	const minCnt = Math.min(lChildCnt, yChildCnt);
	let left = 0;
	let right = 0;
	for (; left < minCnt; left++) {
		const leftY = yChildren[left];
		const leftL = lChildren[left];
		if (leftY instanceof YXmlHook) break;
		else if (mappedIdentity(binding.mapping.get(leftY), leftL)) {
			if (!(leftL instanceof Array) && (leftL instanceof ElementNode || $isDecoratorNode(leftL)) && dirtyElements.has(leftL.getKey())) $updateYFragment(y, leftY, leftL, binding, dirtyElements);
		} else if ($equalYTypePNode(leftY, leftL, binding)) binding.mapping.set(leftY, leftL);
		else break;
	}
	for (; right + left < minCnt; right++) {
		const rightY = yChildren[yChildCnt - right - 1];
		const rightL = lChildren[lChildCnt - right - 1];
		if (rightY instanceof YXmlHook) break;
		else if (mappedIdentity(binding.mapping.get(rightY), rightL)) {
			if (!(rightL instanceof Array) && (rightL instanceof ElementNode || $isDecoratorNode(rightL)) && dirtyElements.has(rightL.getKey())) $updateYFragment(y, rightY, rightL, binding, dirtyElements);
		} else if ($equalYTypePNode(rightY, rightL, binding)) binding.mapping.set(rightY, rightL);
		else break;
	}
	while (yChildCnt - left - right > 0 && lChildCnt - left - right > 0) {
		const leftY = yChildren[left];
		const leftL = lChildren[left];
		const rightY = yChildren[yChildCnt - right - 1];
		const rightL = lChildren[lChildCnt - right - 1];
		if (leftY instanceof YXmlText && leftL instanceof Array) {
			if (!equalYTextLText(leftY, leftL, binding)) $updateYText(leftY, leftL, binding);
			left += 1;
		} else {
			let updateLeft = leftY instanceof YXmlElement && matchNodeName(leftY, leftL);
			let updateRight = rightY instanceof YXmlElement && matchNodeName(rightY, rightL);
			if (updateLeft && updateRight) {
				const equalityLeft = $computeChildEqualityFactor(leftY, leftL, binding);
				const equalityRight = $computeChildEqualityFactor(rightY, rightL, binding);
				if (equalityLeft.foundMappedChild && !equalityRight.foundMappedChild) updateRight = false;
				else if (!equalityLeft.foundMappedChild && equalityRight.foundMappedChild) updateLeft = false;
				else if (equalityLeft.equalityFactor < equalityRight.equalityFactor) updateLeft = false;
				else updateRight = false;
			}
			if (updateLeft) {
				$updateYFragment(y, leftY, leftL, binding, dirtyElements);
				left += 1;
			} else if (updateRight) {
				$updateYFragment(y, rightY, rightL, binding, dirtyElements);
				right += 1;
			} else {
				binding.mapping.delete(yDomFragment.get(left));
				yDomFragment.delete(left, 1);
				yDomFragment.insert(left, [$createTypeFromTextOrElementNode(leftL, binding)]);
				left += 1;
			}
		}
	}
	const yDelLen = yChildCnt - left - right;
	if (yChildCnt === 1 && lChildCnt === 0 && yChildren[0] instanceof YXmlText) {
		binding.mapping.delete(yChildren[0]);
		yChildren[0].delete(0, yChildren[0].length);
	} else if (yDelLen > 0) {
		yDomFragment.slice(left, left + yDelLen).forEach((type) => binding.mapping.delete(type));
		yDomFragment.delete(left, yDelLen);
	}
	if (left + right < lChildCnt) {
		const ins = [];
		for (let i = left; i < lChildCnt - right; i++) ins.push($createTypeFromTextOrElementNode(lChildren[i], binding));
		yDomFragment.insert(left, ins);
	}
};
var matchNodeName = (yElement, lnode) => !(lnode instanceof Array) && yElement.nodeName === lnode.getType();
var ychangeState = /* @__PURE__ */ createState("ychange", {
	isEqual: (a, b) => a === b,
	parse: (value) => value ?? null
});
function $getYChangeState(node) {
	return $getState(node, ychangeState);
}
/**
* Replaces the editor content with a view that compares the state between two given snapshots.
* Any added or removed nodes between the two snapshots will have {@link YChange} attached to them.
*
* @param binding Yjs binding
* @param snapshot Ending snapshot state (default: current state of the Yjs document)
* @param prevSnapshot Starting snapshot state (default: empty snapshot)
*/
var renderSnapshot__EXPERIMENTAL = (binding, snapshot$1 = snapshot(binding.doc), prevSnapshot = emptySnapshot) => {
	const { doc } = binding;
	if (!!doc.gc) formatDevErrorMessage$1(`GC must be disabled to render snapshot`);
	doc.transact((transaction) => {
		const pud = new PermanentUserData(doc);
		if (pud) pud.dss.forEach((ds) => {
			iterateDeletedStructs(transaction, ds, (_item) => {});
		});
		const computeYChange = (type, id) => {
			return {
				id,
				type,
				user: (type === "added" ? pud.getUserByClientId(id.client) : pud.getUserByDeletedId(id)) ?? null
			};
		};
		binding.mapping.clear();
		binding.editor.update(() => {
			$getRoot().clear();
			$createOrUpdateNodeFromYElement(binding.root, binding, null, true, snapshot$1, prevSnapshot, computeYChange);
		});
	}, binding);
};
/** @__NO_SIDE_EFFECTS__ */
function supportsCSSHighlights() {
	return typeof Highlight !== "undefined" && typeof CSS !== "undefined" && "highlights" in CSS;
}
var SUPPORTS_CSS_HIGHLIGHTS = /* @__PURE__ */ supportsCSSHighlights();
/**
* The subset of a binding that {@link getCursorHighlightSheet} reads. Declared
* structurally so callers pass a full binding and tests pass a lightweight stub,
* neither needing a cast.
*
* @internal
*/
/**
* Resolve the per-binding stylesheet that hosts `::highlight(...)` rules,
* re-adopting it into the editor's current tree scope (document or shadow
* root) on every call.
*
* The editor root can move between the light DOM and a shadow root (a
* shadow-DOM toggle) without recreating the binding, and `::highlight()` rules
* only apply in the tree scope that owns the highlighted ranges, so the sheet
* is re-homed each call. A leftover adoption in a previously-used scope is
* harmless: shadow encapsulation means a rule there cannot match ranges in the
* new scope.
*
* @internal Exported for tests; not part of the package's public API.
*/
function getCursorHighlightSheet(binding) {
	const rootElement = binding.editor.getRootElement();
	const ownerDocument = getRootOwnerDocument(rootElement);
	let sheet = binding.cursorHighlightSheet;
	if (sheet === null) {
		sheet = new (ownerDocument.defaultView || window).CSSStyleSheet();
		binding.cursorHighlightSheet = sheet;
	}
	const root = rootElement !== null ? rootElement.getRootNode() : null;
	const target = isDOMShadowRoot(root) ? root : ownerDocument;
	if (!target.adoptedStyleSheets.includes(sheet)) target.adoptedStyleSheets = [...target.adoptedStyleSheets, sheet];
	return sheet;
}
function addCursorHighlightRule(binding, highlightName, color) {
	if (!CSS.supports("color", color)) return;
	const sheet = getCursorHighlightSheet(binding);
	const idx = sheet.insertRule(`::highlight(${highlightName}) { }`, sheet.cssRules.length);
	const rule = sheet.cssRules[idx];
	rule.style.setProperty("background-color", `color-mix(in srgb, ${color} 30%, transparent)`);
	rule.style.setProperty("color", "inherit");
}
function removeCursorHighlightRule(binding, highlightName) {
	const sheet = binding.cursorHighlightSheet;
	if (sheet === null) return;
	const selector = `::highlight(${highlightName})`;
	for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
		const rule = sheet.cssRules[i];
		if (rule != null && rule.selectorText === selector) {
			sheet.deleteRule(i);
			return;
		}
	}
}
function createRelativePosition(point, binding, assoc = 0) {
	const collabNode = binding.collabNodeMap.get(point.key);
	if (collabNode === void 0) return null;
	let offset = point.offset;
	let sharedType = collabNode.getSharedType();
	if (collabNode instanceof CollabTextNode) {
		sharedType = collabNode._parent._xmlText;
		const currentOffset = collabNode.getOffset();
		if (currentOffset === -1) return null;
		offset = currentOffset + 1 + offset;
	} else if (collabNode instanceof CollabElementNode && point.type === "element") {
		const parent = point.getNode();
		if (!$isElementNode(parent)) formatDevErrorMessage$1(`Element point must be an element node`);
		let accumulatedOffset = 0;
		let i = 0;
		let node = parent.getFirstChild();
		while (node !== null && i++ < offset) {
			if ($isTextNode(node)) accumulatedOffset += node.getTextContentSize() + 1;
			else accumulatedOffset++;
			node = node.getNextSibling();
		}
		offset = accumulatedOffset;
	}
	return createRelativePositionFromTypeIndex(sharedType, offset, assoc);
}
function createRelativePositionV2(point, binding, assoc = 0) {
	const { mapping } = binding;
	const { offset } = point;
	const node = point.getNode();
	const yType = mapping.getSharedType(node);
	if (yType === void 0) return null;
	if (point.type === "text") {
		if (!$isTextNode(node)) formatDevErrorMessage$1(`Text point must be a text node`);
		let prevSibling = node.getPreviousSibling();
		let adjustedOffset = offset;
		while ($isTextNode(prevSibling)) {
			adjustedOffset += prevSibling.getTextContentSize();
			prevSibling = prevSibling.getPreviousSibling();
		}
		return createRelativePositionFromTypeIndex(yType, adjustedOffset, assoc);
	} else if (point.type === "element") {
		if (!$isElementNode(node)) formatDevErrorMessage$1(`Element point must be an element node`);
		let yIndex = 0;
		let lexicalIndex = 0;
		let child = node.getFirstChild();
		while (child !== null && lexicalIndex < offset) {
			let nextSibling = child.getNextSibling();
			lexicalIndex++;
			if ($isTextNode(child)) while ($isTextNode(nextSibling)) {
				nextSibling = nextSibling.getNextSibling();
				lexicalIndex++;
			}
			yIndex++;
			child = nextSibling;
		}
		return createRelativePositionFromTypeIndex(yType, yIndex, assoc);
	}
	return null;
}
function createAbsolutePosition(relativePosition, binding) {
	return createAbsolutePositionFromRelativePosition(relativePosition, binding.doc);
}
function shouldUpdatePosition(currentPos, pos) {
	if (currentPos == null) {
		if (pos != null) return true;
	} else if (pos == null || !compareRelativePositions(currentPos, pos)) return true;
	return false;
}
function createCursor(name, color) {
	return {
		color,
		name,
		selection: null
	};
}
function destroySelection(binding, selection) {
	if (selection.highlight !== null) {
		CSS.highlights.delete(selection.highlightName);
		removeCursorHighlightRule(binding, selection.highlightName);
	}
	const cursorsContainer = binding.cursorsContainer;
	if (cursorsContainer === null) return;
	if (selection.caret.parentNode === cursorsContainer) cursorsContainer.removeChild(selection.caret);
	const selections = selection.selections;
	for (let i = 0; i < selections.length; i++) if (selections[i].parentNode === cursorsContainer) cursorsContainer.removeChild(selections[i]);
}
function destroyCursor(binding, cursor) {
	const selection = cursor.selection;
	if (selection !== null) destroySelection(binding, selection);
}
function createCursorSelection(cursor, binding, clientID, anchorKey, anchorOffset, focusKey, focusOffset, selectionHighlight, theme = {}) {
	const color = cursor.color;
	const ownerDocument = getRootOwnerDocument(binding.editor.getRootElement());
	const caret = ownerDocument.createElement("span");
	if (theme.cursor) {
		caret.className = theme.cursor;
		setDOMStyleObject(caret.style, {
			"--lexical-cursor-color": color,
			bottom: "0",
			position: "absolute",
			right: "-1px",
			top: "0"
		});
	} else setDOMStyleObject(caret.style, {
		"background-color": color,
		bottom: "0",
		position: "absolute",
		right: "-1px",
		top: "0",
		width: "1px",
		"z-index": "10"
	});
	const name = ownerDocument.createElement("span");
	name.textContent = cursor.name;
	if (theme.cursorName) name.className = theme.cursorName;
	else setDOMStyleObject(name.style, {
		"background-color": color,
		color: "#fff",
		"font-family": "Arial",
		"font-size": "12px",
		"font-weight": "bold",
		left: "-2px",
		"line-height": "12px",
		padding: "2px",
		position: "absolute",
		top: "-16px",
		"white-space": "nowrap"
	});
	caret.appendChild(name);
	const highlightName = `lexical-cursor-${binding.id}-${clientID}`;
	let highlight = null;
	if (selectionHighlight && SUPPORTS_CSS_HIGHLIGHTS) {
		highlight = new Highlight();
		CSS.highlights.set(highlightName, highlight);
		addCursorHighlightRule(binding, highlightName, color);
	}
	return {
		anchor: {
			key: anchorKey,
			offset: anchorOffset
		},
		caret,
		color,
		focus: {
			key: focusKey,
			offset: focusOffset
		},
		highlight,
		highlightName,
		name,
		selections: []
	};
}
function updateCursor(binding, cursor, nextSelection, nodeMap, theme = {}) {
	const editor = binding.editor;
	const rootElement = editor.getRootElement();
	const cursorsContainer = binding.cursorsContainer;
	if (cursorsContainer === null || rootElement === null) return;
	const ownerDocument = getRootOwnerDocument(rootElement);
	const cursorsContainerOffsetParent = cursorsContainer.offsetParent;
	if (cursorsContainerOffsetParent === null) return;
	const containerRect = cursorsContainerOffsetParent.getBoundingClientRect();
	const prevSelection = cursor.selection;
	if (nextSelection === null) {
		if (prevSelection === null) return;
		else {
			cursor.selection = null;
			destroySelection(binding, prevSelection);
			return;
		}
	} else cursor.selection = nextSelection;
	const caret = nextSelection.caret;
	const color = nextSelection.color;
	const highlight = nextSelection.highlight;
	const anchor = nextSelection.anchor;
	const focus = nextSelection.focus;
	const anchorKey = anchor.key;
	const focusKey = focus.key;
	const anchorNode = nodeMap.get(anchorKey);
	const focusNode = nodeMap.get(focusKey);
	if (anchorNode == null || focusNode == null) return;
	const positionCaretAtFocus = () => {
		const focusRange = createDOMRange(editor, focusNode, focus.offset, focusNode, focus.offset);
		let caretRect = focusRange === null ? void 0 : focusRange.getBoundingClientRect();
		if ((!caretRect || caretRect.height === 0) && $isLineBreakNode(focusNode)) {
			const focusEl = editor.getElementByKey(focusKey);
			if (focusEl !== null) caretRect = focusEl.getBoundingClientRect();
		}
		if (caretRect !== void 0 && caretRect.width === 0 && caretRect.height === 0 && $isElementNode(focusNode)) {
			const adjacentRect = editor.read("latest", () => {
				const previous = focusNode.getChildAtIndex(focus.offset - 1);
				const next = focusNode.getChildAtIndex(focus.offset);
				for (const [node, offset] of [[previous, $isTextNode(previous) ? previous.getTextContentSize() : 0], [next, 0]]) if ($isTextNode(node)) {
					const range = createDOMRange(editor, node, offset, node, offset);
					const rect = range === null ? void 0 : range.getBoundingClientRect();
					if (rect && rect.height > 0) return rect;
				}
				return null;
			});
			if (adjacentRect !== null) caretRect = adjacentRect;
		}
		if (!caretRect || caretRect.width === 0 && caretRect.height === 0) return false;
		setDOMStyleObject(caret.style, {
			"background-color": theme.cursor ? "" : color,
			bottom: "",
			height: `${caretRect.height || 16}px`,
			left: `${caretRect.left - containerRect.left}px`,
			"pointer-events": "none",
			position: "absolute",
			right: "",
			top: `${caretRect.top - containerRect.top}px`,
			width: "1px",
			"z-index": "10"
		});
		if (caret.parentNode !== cursorsContainer) cursorsContainer.appendChild(caret);
		return true;
	};
	if (highlight !== null) {
		const range = createDOMRange(editor, anchorNode, anchor.offset, focusNode, focus.offset);
		if (range === null) return;
		highlight.clear();
		if (!range.collapsed) highlight.add(range);
		positionCaretAtFocus();
		return;
	}
	const selections = nextSelection.selections;
	let selectionRects;
	if (anchorNode === focusNode && $isLineBreakNode(anchorNode)) selectionRects = [editor.getElementByKey(anchorKey).getBoundingClientRect()];
	else {
		const range = createDOMRange(editor, anchorNode, anchor.offset, focusNode, focus.offset);
		if (range === null) return;
		selectionRects = createRectsFromDOMRange(editor, range);
	}
	const selectionsLength = selections.length;
	const selectionRectsLength = selectionRects.length;
	for (let i = 0; i < selectionRectsLength; i++) {
		const selectionRect = selectionRects[i];
		let selection = selections[i];
		if (selection === void 0) {
			selection = ownerDocument.createElement("span");
			selections[i] = selection;
			const selectionBg = ownerDocument.createElement("span");
			if (theme.selectionBg) selectionBg.className = theme.selectionBg;
			selection.appendChild(selectionBg);
			cursorsContainer.appendChild(selection);
		}
		const top = selectionRect.top - containerRect.top;
		const left = selectionRect.left - containerRect.left;
		const positionStyle = {
			height: `${selectionRect.height}px`,
			left: `${left}px`,
			"pointer-events": "none",
			position: "absolute",
			top: `${top}px`,
			width: `${selectionRect.width}px`
		};
		if (theme.selection) {
			selection.className = theme.selection;
			setDOMStyleObject(selection.style, {
				...positionStyle,
				"--lexical-cursor-color": color
			});
			setDOMStyleObject(selection.firstChild.style, {
				height: "100%",
				left: "0",
				position: "absolute",
				top: "0",
				width: "100%"
			});
		} else {
			setDOMStyleObject(selection.style, positionStyle);
			setDOMStyleObject(selection.firstChild.style, {
				...positionStyle,
				"background-color": color,
				left: "0",
				opacity: "0.3",
				top: "0",
				"z-index": "5"
			});
		}
	}
	if (!positionCaretAtFocus() && selectionRectsLength > 0) {
		const lastSelection = selections[selectionRectsLength - 1];
		setDOMStyleObject(caret.style, {
			bottom: "0",
			height: "",
			left: "",
			right: "-1px",
			top: "0"
		});
		if (caret.parentNode !== lastSelection) lastSelection.appendChild(caret);
	}
	for (let i = selectionsLength - 1; i >= selectionRectsLength; i--) {
		const selection = selections[i];
		cursorsContainer.removeChild(selection);
		selections.pop();
	}
}
function $getAnchorAndFocusForUserState(binding, userState) {
	const { anchorPos, focusPos } = userState;
	const anchorAbsPos = anchorPos ? createAbsolutePosition(anchorPos, binding) : null;
	const focusAbsPos = focusPos ? createAbsolutePosition(focusPos, binding) : null;
	if (anchorAbsPos === null || focusAbsPos === null) return {
		anchorKey: null,
		anchorOffset: 0,
		focusKey: null,
		focusOffset: 0
	};
	if (isBindingV1(binding)) {
		const [anchorCollabNode, anchorOffset] = getCollabNodeAndOffset(binding, anchorAbsPos.type, anchorAbsPos.index);
		const [focusCollabNode, focusOffset] = getCollabNodeAndOffset(binding, focusAbsPos.type, focusAbsPos.index);
		return {
			anchorKey: anchorCollabNode !== null ? anchorCollabNode.getKey() : null,
			anchorOffset,
			focusKey: focusCollabNode !== null ? focusCollabNode.getKey() : null,
			focusOffset
		};
	}
	let [anchorNode, anchorOffset] = $getNodeAndOffsetV2(binding.mapping, anchorAbsPos);
	let [focusNode, focusOffset] = $getNodeAndOffsetV2(binding.mapping, focusAbsPos);
	if (focusNode && anchorNode && (focusNode !== anchorNode || focusOffset !== anchorOffset)) {
		const isBackwards = focusNode.isBefore(anchorNode);
		const startNode = isBackwards ? focusNode : anchorNode;
		const startOffset = isBackwards ? focusOffset : anchorOffset;
		if ($isTextNode(startNode) && $isTextNode(startNode.getNextSibling()) && startOffset === startNode.getTextContentSize()) {
			if (isBackwards) {
				focusNode = startNode.getNextSibling();
				focusOffset = 0;
			} else {
				anchorNode = startNode.getNextSibling();
				anchorOffset = 0;
			}
		}
	}
	return {
		anchorKey: anchorNode !== null ? anchorNode.getKey() : null,
		anchorOffset,
		focusKey: focusNode !== null ? focusNode.getKey() : null,
		focusOffset
	};
}
function $syncLocalCursorPosition(binding, provider) {
	const localState = provider.awareness.getLocalState();
	if (localState === null) return;
	const { anchorKey, anchorOffset, focusKey, focusOffset } = $getAnchorAndFocusForUserState(binding, localState);
	if (anchorKey !== null && focusKey !== null) {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) return;
		$setPoint(selection.anchor, anchorKey, anchorOffset);
		$setPoint(selection.focus, focusKey, focusOffset);
	}
}
function $setPoint(point, key, offset) {
	if (point.key !== key || point.offset !== offset) {
		let anchorNode = $getNodeByKey(key);
		if (anchorNode !== null && !$isElementNode(anchorNode) && !$isTextNode(anchorNode)) {
			const parent = anchorNode.getParentOrThrow();
			key = parent.getKey();
			offset = anchorNode.getIndexWithinParent();
			anchorNode = parent;
		}
		point.set(key, offset, $isElementNode(anchorNode) ? "element" : "text");
	}
}
/**
* Whether `sharedType` is inside the subtree this binding is bound to.
*
* Several editors can share one Yjs `Doc` (see the `rootName` and `getXmlText`
* binding options), which also puts them on one awareness channel, so a peer's
* position can describe a place in another editor's subtree. V1 resolves a
* position through the collab node cached on the shared type
* (`sharedType._collabNode`), which belongs to whichever binding materialized
* it and carries `NodeKey`s that only mean something in that binding's editor.
*
* The test walks the yjs type tree rather than the collab nodes: a cached
* collab node outlives the binding that created it (`destroy` does not clear
* `_collabNode`, and a later binding reuses the node without re-parenting it),
* so its `_parent` chain can still end at a previous binding's root even for a
* position that is squarely inside this one.
*/
function isSharedTypeInBinding(binding, sharedType) {
	const rootSharedType = binding.root.getSharedType();
	let type = sharedType;
	while (type != null) {
		if (type === rootSharedType) return true;
		type = type.parent;
	}
	return false;
}
function getCollabNodeAndOffset(binding, sharedType, offset) {
	const collabNode = sharedType._collabNode;
	if (collabNode === void 0 || !isSharedTypeInBinding(binding, sharedType)) return [null, 0];
	if (collabNode instanceof CollabElementNode) {
		const { node, offset: collabNodeOffset } = getPositionFromElementAndOffset(collabNode, offset, true);
		if (node === null) return [collabNode, collabNode._children.length];
		else return [node, collabNodeOffset];
	}
	return [null, 0];
}
function $getNodeAndOffsetV2(mapping, absolutePosition) {
	const yType = absolutePosition.type;
	const yOffset = absolutePosition.index;
	if (yType instanceof YXmlElement) {
		const node = mapping.get(yType);
		if (node === void 0) return [null, 0];
		if (!$isElementNode(node)) return [node, yOffset];
		let remainingYOffset = yOffset;
		let lexicalOffset = 0;
		const children = node.getChildren();
		while (remainingYOffset > 0 && lexicalOffset < children.length) {
			const child = children[lexicalOffset];
			remainingYOffset -= 1;
			lexicalOffset += 1;
			if ($isTextNode(child)) while (lexicalOffset < children.length && $isTextNode(children[lexicalOffset])) lexicalOffset += 1;
		}
		return [node, lexicalOffset];
	} else {
		const nodes = mapping.get(yType);
		if (nodes === void 0) return [null, 0];
		let i = 0;
		let adjustedOffset = yOffset;
		while (adjustedOffset > nodes[i].getTextContentSize() && i + 1 < nodes.length) {
			adjustedOffset -= nodes[i].getTextContentSize();
			i++;
		}
		const textNode = nodes[i];
		return [textNode, Math.min(adjustedOffset, textNode.getTextContentSize())];
	}
}
function getAwarenessStatesDefault(_binding, provider) {
	return provider.awareness.getStates();
}
function syncCursorPositions(binding, provider, options) {
	const { getAwarenessStates = getAwarenessStatesDefault, selectionHighlight = false } = options ?? {};
	const awarenessStates = Array.from(getAwarenessStates(binding, provider));
	const localClientID = binding.clientID;
	const cursors = binding.cursors;
	const editor = binding.editor;
	const collabTheme = editor._config.theme.collaboration;
	const nodeMap = editor._editorState._nodeMap;
	const visitedClientIDs = /* @__PURE__ */ new Set();
	for (let i = 0; i < awarenessStates.length; i++) {
		const [clientID, awareness] = awarenessStates[i];
		if (clientID !== 0 && clientID !== localClientID) {
			visitedClientIDs.add(clientID);
			const { name, color, focusing } = awareness;
			let selection = null;
			let cursor = cursors.get(clientID);
			if (cursor === void 0) {
				cursor = createCursor(name, color);
				cursors.set(clientID, cursor);
			} else if (cursor.name !== name || cursor.color !== color) {
				destroyCursor(binding, cursor);
				cursor.name = name;
				cursor.color = color;
				cursor.selection = null;
			}
			if (focusing) {
				const { anchorKey, anchorOffset, focusKey, focusOffset } = editor.read(() => $getAnchorAndFocusForUserState(binding, awareness));
				if (anchorKey !== null && focusKey !== null) {
					selection = cursor.selection;
					if (selection === null) selection = createCursorSelection(cursor, binding, clientID, anchorKey, anchorOffset, focusKey, focusOffset, selectionHighlight, collabTheme);
					else {
						const anchor = selection.anchor;
						const focus = selection.focus;
						anchor.key = anchorKey;
						anchor.offset = anchorOffset;
						focus.key = focusKey;
						focus.offset = focusOffset;
					}
				}
			}
			updateCursor(binding, cursor, selection, nodeMap, collabTheme);
		}
	}
	const allClientIDs = Array.from(cursors.keys());
	for (let i = 0; i < allClientIDs.length; i++) {
		const clientID = allClientIDs[i];
		if (!visitedClientIDs.has(clientID)) {
			const cursor = cursors.get(clientID);
			if (cursor !== void 0) {
				destroyCursor(binding, cursor);
				cursors.delete(clientID);
			}
		}
	}
}
function syncLexicalSelectionToYjs(binding, provider, prevSelection, nextSelection) {
	const awareness = provider.awareness;
	const localState = awareness.getLocalState();
	if (localState === null) return;
	const { anchorPos: currentAnchorPos, focusPos: currentFocusPos, name, color, focusing, awarenessData } = localState;
	let anchorPos = null;
	let focusPos = null;
	if (nextSelection === null || currentAnchorPos !== null && !nextSelection.is(prevSelection)) {
		if (prevSelection === null) return;
	}
	if ($isRangeSelection(nextSelection)) {
		const isCollapsed = nextSelection.isCollapsed();
		const isBackward = !isCollapsed && nextSelection.isBackward();
		const anchorAssoc = isBackward ? -1 : 0;
		const focusAssoc = !isCollapsed && !isBackward ? -1 : 0;
		if (isBindingV1(binding)) {
			anchorPos = createRelativePosition(nextSelection.anchor, binding, anchorAssoc);
			focusPos = createRelativePosition(nextSelection.focus, binding, focusAssoc);
		} else {
			anchorPos = createRelativePositionV2(nextSelection.anchor, binding, anchorAssoc);
			focusPos = createRelativePositionV2(nextSelection.focus, binding, focusAssoc);
		}
	}
	if (shouldUpdatePosition(currentAnchorPos, anchorPos) || shouldUpdatePosition(currentFocusPos, focusPos)) awareness.setLocalState({
		...localState,
		anchorPos,
		awarenessData,
		color,
		focusPos,
		focusing,
		name
	});
}
function $syncStateEvent(binding, event) {
	const { target } = event;
	if (!(target._item && target._item.parentSub === "__state" && getNodeTypeFromSharedType(target) === void 0 && (target.parent instanceof YXmlText || target.parent instanceof YXmlElement || target.parent instanceof YMap))) return false;
	const node = $getOrInitCollabNodeFromSharedType(binding, target.parent).getNode();
	if (node) {
		const state = $getWritableNodeState(node.getWritable());
		for (const k of event.keysChanged) state.updateFromUnknown(k, target.get(k));
	}
	return true;
}
function $syncEvent(binding, event) {
	if (event instanceof YMapEvent && $syncStateEvent(binding, event)) return;
	const { target } = event;
	if (event instanceof YMapEvent && target instanceof YMap && target._item != null && target._item.parentSub === SLOTS_ATTR_KEY && (target.parent instanceof YXmlText || target.parent instanceof YXmlElement)) {
		const hostCollab = $getOrInitCollabNodeFromSharedType(binding, target.parent);
		if (hostCollab instanceof CollabElementNode) {
			const hostNode = hostCollab.getNode();
			if (hostNode !== null) hostCollab.syncSlotsFromYjs(binding, hostNode);
		} else if (hostCollab instanceof CollabDecoratorNode) {
			const hostNode = hostCollab.getNode();
			if (hostNode !== null) hostCollab.syncSlotsFromYjs(binding, hostNode);
		}
		return;
	}
	const collabNode = $getOrInitCollabNodeFromSharedType(binding, target);
	if (collabNode instanceof CollabElementNode && event instanceof YTextEvent) {
		const { keysChanged, childListChanged, delta } = event;
		if (keysChanged.size > 0) collabNode.syncPropertiesFromYjs(binding, keysChanged);
		if (keysChanged.has(SLOTS_ATTR_KEY)) {
			const node = collabNode.getNode();
			if (node !== null) collabNode.syncSlotsFromYjs(binding, node);
		}
		if (childListChanged) {
			collabNode.applyChildrenYjsDelta(binding, delta);
			collabNode.syncChildrenFromYjs(binding);
		}
	} else if (collabNode instanceof CollabTextNode && event instanceof YMapEvent) {
		const { keysChanged } = event;
		if (keysChanged.size > 0) collabNode.syncPropertiesAndTextFromYjs(binding, keysChanged);
	} else if (collabNode instanceof CollabDecoratorNode && event instanceof YXmlEvent) {
		const { attributesChanged } = event;
		if (attributesChanged.size > 0) collabNode.syncPropertiesFromYjs(binding, attributesChanged);
		if (attributesChanged.has(SLOTS_ATTR_KEY)) {
			const node = collabNode.getNode();
			if (node !== null) collabNode.syncSlotsFromYjs(binding, node);
		}
	} else formatDevErrorMessage$1(`Expected text, element, or decorator event`);
}
function syncYjsChangesToLexical(binding, provider, events, isFromUndoManger, syncCursorPositionsFn = syncCursorPositions) {
	const editor = binding.editor;
	const currentEditorState = editor._editorState;
	events.forEach((event) => event.delta);
	editor.update(() => {
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			$syncEvent(binding, event);
		}
		$syncCursorFromYjs(currentEditorState, binding, provider);
		if (!isFromUndoManger) $addUpdateTag(SKIP_SCROLL_INTO_VIEW_TAG);
	}, {
		onUpdate: () => {
			syncCursorPositionsFn(binding, provider);
			if (binding.root.isEmpty()) editor.update(() => $ensureEditorNotEmpty());
		},
		skipTransforms: true,
		tag: isFromUndoManger ? HISTORIC_TAG : COLLABORATION_TAG
	});
	if (events.length > 0) {
		const transaction = events[0].transaction;
		iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
			if (struct.constructor === Item) {
				const type = struct.content.type;
				if (type) {
					const collabNode = type._collabNode;
					if (collabNode !== void 0 && binding.collabNodeMap.get(collabNode._key) === collabNode) binding.collabNodeMap.delete(collabNode._key);
				}
			}
		});
	}
}
function $syncCursorFromYjs(editorState, binding, provider) {
	const selection = $getSelection();
	if ($isRangeSelection(selection)) {
		if (doesSelectionNeedRecovering(selection)) {
			const prevSelection = editorState._selection;
			if ($isRangeSelection(prevSelection)) {
				$syncLocalCursorPosition(binding, provider);
				if (doesSelectionNeedRecovering(selection)) {
					const anchorNodeKey = selection.anchor.key;
					$moveSelectionToPreviousNode(anchorNodeKey, editorState);
				}
			}
			syncLexicalSelectionToYjs(binding, provider, prevSelection, $getSelection());
		} else $syncLocalCursorPosition(binding, provider);
	}
}
function $handleNormalizationMergeConflicts(binding, normalizedNodes) {
	const normalizedNodesKeys = Array.from(normalizedNodes);
	const collabNodeMap = binding.collabNodeMap;
	const mergedNodes = [];
	const removedNodes = [];
	for (let i = 0; i < normalizedNodesKeys.length; i++) {
		const nodeKey = normalizedNodesKeys[i];
		const lexicalNode = $getNodeByKey(nodeKey);
		const collabNode = collabNodeMap.get(nodeKey);
		if (collabNode instanceof CollabTextNode) {
			if ($isTextNode(lexicalNode)) mergedNodes.push([collabNode, lexicalNode.__text]);
			else {
				const offset = collabNode.getOffset();
				if (offset === -1) continue;
				const parent = collabNode._parent;
				collabNode._normalized = true;
				parent._xmlText.delete(offset, 1);
				removedNodes.push(collabNode);
			}
		}
	}
	for (let i = 0; i < removedNodes.length; i++) {
		const collabNode = removedNodes[i];
		const nodeKey = collabNode.getKey();
		collabNodeMap.delete(nodeKey);
		const parentChildren = collabNode._parent._children;
		const index = parentChildren.indexOf(collabNode);
		parentChildren.splice(index, 1);
	}
	for (let i = 0; i < mergedNodes.length; i++) {
		const [collabNode, text] = mergedNodes[i];
		collabNode._text = text;
	}
}
function $ensureEditorNotEmpty() {
	if ($getRoot().getChildrenSize() === 0) $getRoot().append($createParagraphNode());
}
function syncLexicalUpdateToYjs(binding, provider, prevEditorState, currEditorState, dirtyElements, dirtyLeaves, normalizedNodes, tags) {
	syncWithTransaction(binding, () => {
		currEditorState.read(() => {
			if (tags.has("collaboration") || tags.has("historic")) {
				if (normalizedNodes.size > 0) $handleNormalizationMergeConflicts(binding, normalizedNodes);
				return;
			}
			if (dirtyElements.has("root")) {
				const prevNodeMap = prevEditorState._nodeMap;
				const nextLexicalRoot = $getRoot();
				const collabRoot = binding.root;
				collabRoot.syncPropertiesFromLexical(binding, nextLexicalRoot, prevNodeMap);
				collabRoot.syncChildrenFromLexical(binding, nextLexicalRoot, prevNodeMap, dirtyElements, dirtyLeaves);
				collabRoot.syncSlotsFromLexical(binding, nextLexicalRoot, prevNodeMap, dirtyElements, dirtyLeaves);
				if (nextLexicalRoot.getChildrenSize() === 0 && prevEditorState._nodeMap.size > 1) binding.editor.update(() => $ensureEditorNotEmpty());
			}
			const selection = $getSelection();
			const prevSelection = prevEditorState._selection;
			syncLexicalSelectionToYjs(binding, provider, prevSelection, selection);
		});
	});
}
function $syncEventV2(binding, event) {
	const { target } = event;
	if (target instanceof YXmlElement && event instanceof YXmlEvent) $createOrUpdateNodeFromYElement(target, binding, event.attributesChanged, event.childListChanged);
	else if (target instanceof YXmlText && event instanceof YTextEvent) {
		const parent = target.parent;
		if (parent instanceof YXmlElement) $createOrUpdateNodeFromYElement(parent, binding, /* @__PURE__ */ new Set(), true);
		else formatDevErrorMessage$1(`Expected XmlElement parent for XmlText`);
	} else if (target instanceof YMap && event instanceof YMapEvent && target._item != null && target._item.parentSub === SLOTS_ATTR_KEY) {
		const parent = target.parent;
		if (parent instanceof YXmlElement) $createOrUpdateNodeFromYElement(parent, binding, /* @__PURE__ */ new Set([SLOTS_ATTR_KEY]), false);
		else formatDevErrorMessage$1(`Expected XmlElement parent for slots Y.Map`);
	} else formatDevErrorMessage$1(`Expected xml or text event`);
}
function syncYjsChangesToLexicalV2__EXPERIMENTAL(binding, provider, events, transaction, isFromUndoManger) {
	const editor = binding.editor;
	const editorState = editor._editorState;
	iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
		if (struct.constructor === Item) {
			const type = struct.content.type;
			if (type) binding.mapping.delete(type);
		}
	});
	events.forEach((event) => event.delta);
	editor.update(() => {
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			$syncEventV2(binding, event);
		}
		$syncCursorFromYjs(editorState, binding, provider);
		if (!isFromUndoManger) $addUpdateTag(SKIP_SCROLL_INTO_VIEW_TAG);
	}, {
		discrete: true,
		onUpdate: () => {
			syncCursorPositions(binding, provider);
			if (binding.root.length === 0) editor.update(() => $ensureEditorNotEmpty());
		},
		skipTransforms: true,
		tag: isFromUndoManger ? HISTORIC_TAG : COLLABORATION_TAG
	});
}
function syncYjsStateToLexicalV2__EXPERIMENTAL(binding, provider) {
	binding.mapping.clear();
	const editor = binding.editor;
	editor.update(() => {
		$getRoot().clear();
		$createOrUpdateNodeFromYElement(binding.root, binding, null, true);
		$addUpdateTag(COLLABORATION_TAG);
	}, {
		discrete: true,
		onUpdate: () => {
			syncCursorPositions(binding, provider);
			if (binding.root.length === 0) editor.update(() => $ensureEditorNotEmpty());
		},
		skipTransforms: true,
		tag: COLLABORATION_TAG
	});
}
function syncLexicalUpdateToYjsV2__EXPERIMENTAL(binding, provider, prevEditorState, currEditorState, dirtyElements, dirtyLeaves, normalizedNodes, tags) {
	const isFromYjs = tags.has("collaboration") || tags.has("historic");
	if (isFromYjs && normalizedNodes.size === 0) return;
	normalizedNodes.forEach((nodeKey) => {
		binding.mapping.deleteNode(nodeKey);
	});
	syncWithTransaction(binding, () => {
		currEditorState.read(() => {
			if (dirtyElements.has("root")) {
				const nextLexicalRoot = $getRoot();
				$updateYFragment(binding.doc, binding.root, nextLexicalRoot, binding, /* @__PURE__ */ new Set([...dirtyElements.keys(), ...dirtyLeaves]));
				if (!isFromYjs && nextLexicalRoot.getChildrenSize() === 0 && prevEditorState._nodeMap.size > 1) binding.editor.update(() => $ensureEditorNotEmpty());
			}
			const selection = $getSelection();
			const prevSelection = prevEditorState._selection;
			syncLexicalSelectionToYjs(binding, provider, prevSelection, selection);
		});
	});
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var CONNECTED_COMMAND = /* @__PURE__ */ createCommand("CONNECTED_COMMAND");
var TOGGLE_CONNECT_COMMAND = /* @__PURE__ */ createCommand("TOGGLE_CONNECT_COMMAND");
var DIFF_VERSIONS_COMMAND__EXPERIMENTAL = /* @__PURE__ */ createCommand("DIFF_VERSIONS_COMMAND");
var CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL = /* @__PURE__ */ createCommand("CLEAR_DIFF_VERSIONS_COMMAND");
function createUndoManager(binding, root) {
	return new UndoManager(root, {
		captureTransaction: () => !binding.isBootstrapping,
		trackedOrigins: /* @__PURE__ */ new Set([binding, null])
	});
}
function initLocalState(provider, name, color, focusing, awarenessData) {
	provider.awareness.setLocalState({
		anchorPos: null,
		awarenessData,
		color,
		focusPos: null,
		focusing,
		name
	});
}
function setLocalStateFocus(provider, name, color, focusing, awarenessData) {
	const { awareness } = provider;
	let localState = awareness.getLocalState();
	if (localState === null) localState = {
		anchorPos: null,
		awarenessData,
		color,
		focusPos: null,
		focusing,
		name
	};
	localState.focusing = focusing;
	awareness.setLocalState(localState);
}
//#endregion
//#region ../lexical-react/dist/LexicalCollaborationPlugin.dev.js
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
* Well-known key under which the active Yjs {@link UndoManager} is published on
* the editor instance (mirroring how `@lexical/extension` attaches its builder
* via a `Symbol.for` key). Collab disables `@lexical/history`, so this is the
* handle tooling and e2e tests use to force a deterministic undo boundary via
* `editor[COLLAB_UNDO_MANAGER]?.stopCapturing()` instead of waiting out the
* UndoManager capture timeout.
*/
var COLLAB_UNDO_MANAGER = Symbol.for("@lexical/yjs/UndoManager");
function useYjsCollaboration(editor, id, provider, docMap, name, color, shouldBootstrap, binding, setDoc, cursorsContainerRef, initialEditorState, awarenessData, syncCursorPositionsFn = syncCursorPositions, selectionHighlight = false) {
	const isReloadingDoc = (0, import_react.useRef)(false);
	const onBootstrap = (0, import_react.useCallback)(() => {
		const { root } = binding;
		if (shouldBootstrap && root.isEmpty() && root._xmlText._length === 0) bootstrapEditor(binding, editor, initialEditorState);
	}, [
		binding,
		editor,
		initialEditorState,
		shouldBootstrap
	]);
	(0, import_react.useEffect)(() => {
		const { root } = binding;
		const onYjsTreeChanges = (events, transaction) => {
			const origin = transaction.origin;
			if (origin !== binding) syncYjsChangesToLexical(binding, provider, events, origin instanceof UndoManager, syncCursorPositionsFn);
		};
		root.getSharedType().observeDeep(onYjsTreeChanges);
		const removeListener = editor.registerUpdateListener(({ prevEditorState, editorState, dirtyLeaves, dirtyElements, normalizedNodes, tags }) => {
			if (!tags.has("skip-collab")) syncLexicalUpdateToYjs(binding, provider, prevEditorState, editorState, dirtyElements, dirtyLeaves, normalizedNodes, tags);
		});
		return () => {
			root.getSharedType().unobserveDeep(onYjsTreeChanges);
			removeListener();
		};
	}, [
		binding,
		provider,
		editor,
		setDoc,
		docMap,
		id,
		syncCursorPositionsFn
	]);
	(0, import_react.useEffect)(() => {
		const onProviderDocReload = (ydoc) => {
			clearEditorSkipCollab(editor, binding);
			setDoc(ydoc);
			docMap.set(id, ydoc);
			isReloadingDoc.current = true;
		};
		const onSync = () => {
			isReloadingDoc.current = false;
		};
		provider.on("reload", onProviderDocReload);
		provider.on("sync", onSync);
		return () => {
			provider.off("reload", onProviderDocReload);
			provider.off("sync", onSync);
		};
	}, [
		binding,
		provider,
		editor,
		setDoc,
		docMap,
		id
	]);
	useProvider(editor, provider, name, color, isReloadingDoc, awarenessData, onBootstrap);
	useAwareness(binding, provider, selectionHighlight);
	return useYjsCursors(binding, cursorsContainerRef);
}
function useYjsCollaborationV2__EXPERIMENTAL(editor, id, doc, provider, docMap, name, color, options = {}) {
	const { awarenessData, excludedProperties, rootName, getXmlElement, selectionHighlight = false, __shouldBootstrapUnsafe: shouldBootstrap } = options;
	const isReloadingDoc = (0, import_react.useMemo)(() => ({ current: false }), []);
	const [binding] = (0, import_react.useState)(() => createBindingV2__EXPERIMENTAL(editor, id, doc, docMap, {
		excludedProperties,
		getXmlElement,
		rootName
	}));
	(0, import_react.useEffect)(() => {
		docMap.set(id, doc);
		return () => {
			docMap.delete(id);
		};
	}, [
		doc,
		docMap,
		id
	]);
	const onBootstrap = (0, import_react.useCallback)(() => {
		const { root } = binding;
		if (shouldBootstrap && root._length === 0) bootstrapEditor(binding, editor);
	}, [
		binding,
		editor,
		shouldBootstrap
	]);
	const [diffSnapshots, setDiffSnapshots] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		mergeRegister(editor.registerCommand(CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL, () => {
			setDiffSnapshots(null);
			syncYjsStateToLexicalV2__EXPERIMENTAL(binding, provider);
			return true;
		}, 0), editor.registerCommand(DIFF_VERSIONS_COMMAND__EXPERIMENTAL, ({ prevSnapshot, snapshot }) => {
			setDiffSnapshots({
				prevSnapshot,
				snapshot
			});
			return true;
		}, 0));
	}, [
		editor,
		binding,
		provider
	]);
	(0, import_react.useEffect)(() => {
		const { root } = binding;
		if (diffSnapshots) {
			renderSnapshot__EXPERIMENTAL(binding, diffSnapshots.snapshot, diffSnapshots.prevSnapshot);
			return;
		}
		const onYjsTreeChanges = (events, transaction) => {
			const origin = transaction.origin;
			if (origin !== binding) {
				const isFromUndoManger = origin instanceof UndoManager;
				syncYjsChangesToLexicalV2__EXPERIMENTAL(binding, provider, events, transaction, isFromUndoManger);
			}
		};
		root.observeDeep(onYjsTreeChanges);
		const removeListener = editor.registerUpdateListener(({ prevEditorState, editorState, dirtyElements, dirtyLeaves, normalizedNodes, tags }) => {
			if (!tags.has("skip-collab")) syncLexicalUpdateToYjsV2__EXPERIMENTAL(binding, provider, prevEditorState, editorState, dirtyElements, dirtyLeaves, normalizedNodes, tags);
		});
		return () => {
			root.unobserveDeep(onYjsTreeChanges);
			removeListener();
		};
	}, [
		binding,
		provider,
		editor,
		diffSnapshots
	]);
	useProvider(editor, provider, name, color, isReloadingDoc, awarenessData, onBootstrap);
	useAwareness(binding, provider, selectionHighlight);
	return binding;
}
function useProvider(editor, provider, name, color, isReloadingDoc, awarenessData, onBootstrap) {
	const connect = (0, import_react.useCallback)(() => provider.connect(), [provider]);
	const disconnect = (0, import_react.useCallback)(() => {
		try {
			provider.disconnect();
		} catch (_e) {}
	}, [provider]);
	(0, import_react.useEffect)(() => {
		const onStatus = ({ status }) => {
			editor.dispatchCommand(CONNECTED_COMMAND, status === "connected");
		};
		const onSync = (isSynced) => {
			if (isSynced && isReloadingDoc.current === false && onBootstrap) onBootstrap();
		};
		const rootElement = editor.getRootElement();
		initLocalState(provider, name, color, rootElement !== null && getActiveElement(rootElement) === rootElement, awarenessData || {});
		provider.on("status", onStatus);
		provider.on("sync", onSync);
		const connectionPromise = connect();
		return () => {
			if (isReloadingDoc.current === false) {
				if (connectionPromise) connectionPromise.then(disconnect);
				else disconnect();
			}
			provider.off("sync", onSync);
			provider.off("status", onStatus);
		};
	}, [
		editor,
		provider,
		name,
		color,
		isReloadingDoc,
		awarenessData,
		onBootstrap,
		connect,
		disconnect
	]);
	(0, import_react.useEffect)(() => {
		return editor.registerCommand(TOGGLE_CONNECT_COMMAND, (payload) => {
			if (payload) {
				console.log("Collaboration connected!");
				connect();
			} else {
				console.log("Collaboration disconnected!");
				disconnect();
			}
			return true;
		}, 0);
	}, [
		connect,
		disconnect,
		editor
	]);
	(0, import_react.useEffect)(() => {
		const clearAwarenessState = () => {
			try {
				provider.awareness.setLocalState(null);
			} catch (_e) {}
		};
		return registerEventListeners(window, {
			beforeunload: clearAwarenessState,
			pagehide: clearAwarenessState
		});
	}, [provider]);
}
function useAwareness(binding, provider, selectionHighlight) {
	(0, import_react.useEffect)(() => {
		const { awareness } = provider;
		const onAwarenessUpdate = () => {
			syncCursorPositions(binding, provider, { selectionHighlight });
		};
		awareness.on("update", onAwarenessUpdate);
		return () => {
			awareness.off("update", onAwarenessUpdate);
		};
	}, [
		binding,
		provider,
		selectionHighlight
	]);
}
function useYjsCursors(binding, cursorsContainerRef) {
	return (0, import_react.useMemo)(() => {
		const ref = (element) => {
			binding.cursorsContainer = element;
		};
		return /*#__PURE__*/ (0, import_react_dom.createPortal)(/*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", { ref }), cursorsContainerRef && cursorsContainerRef.current || document.body);
	}, [binding, cursorsContainerRef]);
}
function useYjsFocusTracking(editor, provider, name, color, awarenessData) {
	(0, import_react.useEffect)(() => {
		return mergeRegister(editor.registerCommand(FOCUS_COMMAND, () => {
			setLocalStateFocus(provider, name, color, true, awarenessData || {});
			return false;
		}, 0), editor.registerCommand(BLUR_COMMAND, () => {
			setLocalStateFocus(provider, name, color, false, awarenessData || {});
			return false;
		}, 0));
	}, [
		color,
		editor,
		name,
		provider,
		awarenessData
	]);
}
function useYjsHistory(editor, binding) {
	return useYjsUndoManager(editor, (0, import_react.useMemo)(() => createUndoManager(binding, binding.root.getSharedType()), [binding]));
}
function useYjsHistoryV2(editor, binding) {
	return useYjsUndoManager(editor, (0, import_react.useMemo)(() => createUndoManager(binding, binding.root), [binding]));
}
function useYjsUndoManager(editor, undoManager) {
	(0, import_react.useEffect)(() => {
		const undo = () => {
			undoManager.undo();
		};
		const redo = () => {
			undoManager.redo();
		};
		return mergeRegister(editor.registerCommand(UNDO_COMMAND, () => {
			undo();
			return true;
		}, 0), editor.registerCommand(REDO_COMMAND, () => {
			redo();
			return true;
		}, 0));
	});
	(0, import_react.useEffect)(() => {
		const withManager = editor;
		withManager[COLLAB_UNDO_MANAGER] = undoManager;
		return () => {
			if (withManager[COLLAB_UNDO_MANAGER] === undoManager) delete withManager[COLLAB_UNDO_MANAGER];
		};
	}, [editor, undoManager]);
	const clearHistory = (0, import_react.useCallback)(() => {
		undoManager.clear();
	}, [undoManager]);
	import_react.useEffect(() => {
		const updateUndoRedoStates = () => {
			editor.dispatchCommand(CAN_UNDO_COMMAND, undoManager.undoStack.length > 0);
			editor.dispatchCommand(CAN_REDO_COMMAND, undoManager.redoStack.length > 0);
		};
		undoManager.on("stack-item-added", updateUndoRedoStates);
		undoManager.on("stack-item-popped", updateUndoRedoStates);
		undoManager.on("stack-cleared", updateUndoRedoStates);
		return () => {
			undoManager.off("stack-item-added", updateUndoRedoStates);
			undoManager.off("stack-item-popped", updateUndoRedoStates);
			undoManager.off("stack-cleared", updateUndoRedoStates);
		};
	}, [editor, undoManager]);
	return clearHistory;
}
/**
* Write the initial editor state into an empty shared document. The write is
* flagged on the binding so that the Yjs UndoManager created by
* `createUndoManager` skips the resulting transaction: bootstrapping is not a
* user edit and must not be undoable, which matches a non-collab editor where
* the initial state is applied with HISTORY_MERGE_TAG (#7110).
*/
function bootstrapEditor(binding, editor, initialEditorState) {
	binding.isBootstrapping = true;
	try {
		initializeEditor(editor, initialEditorState, () => {
			binding.isBootstrapping = false;
		});
	} finally {
		queueMicrotask(() => {
			binding.isBootstrapping = false;
		});
	}
}
function initializeEditor(editor, initialEditorState, onUpdate) {
	editor.update(() => {
		const root = $getRoot();
		if (root.isEmpty()) {
			if (initialEditorState) switch (typeof initialEditorState) {
				case "string": {
					const parsedEditorState = editor.parseEditorState(initialEditorState);
					editor.setEditorState(parsedEditorState, { tag: HISTORY_MERGE_TAG });
					break;
				}
				case "object":
					editor.setEditorState(initialEditorState, { tag: HISTORY_MERGE_TAG });
					break;
				case "function": editor.update(() => {
					if ($getRoot().isEmpty()) initialEditorState(editor);
				}, { tag: HISTORY_MERGE_TAG });
			}
			else {
				const paragraph = $createParagraphNode();
				root.append(paragraph);
				const rootElement = editor.getRootElement();
				if ($getSelection() !== null || rootElement !== null && getActiveElement(rootElement) === rootElement) paragraph.select();
			}
		}
	}, {
		onUpdate,
		tag: HISTORY_MERGE_TAG
	});
}
function clearEditorSkipCollab(editor, binding) {
	editor.update(() => {
		const root = $getRoot();
		root.clear();
		root.select();
	}, { tag: SKIP_COLLAB_TAG });
	if (binding.cursors == null) return;
	const cursors = binding.cursors;
	if (cursors == null) return;
	const cursorsContainer = binding.cursorsContainer;
	if (cursorsContainer == null) return;
	for (const cursor of cursors.values()) {
		const selection = cursor.selection;
		if (selection === null) continue;
		if (selection.highlight !== null) {
			CSS.highlights.delete(selection.highlightName);
			removeCursorHighlightRule(binding, selection.highlightName);
		}
		if (selection.caret.parentNode === cursorsContainer) cursorsContainer.removeChild(selection.caret);
		for (const span of selection.selections) if (span.parentNode === cursorsContainer) cursorsContainer.removeChild(span);
		cursor.selection = null;
	}
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Connects the editor to a Yjs document for real-time collaboration, syncing
* editor state and rendering remote users' cursors and selections. Provide a
* `providerFactory` that creates the Yjs {@link Provider} for the given
* document `id`. Must be used within a {@link LexicalCollaboration} provider.
*
* @returns The element that renders collaborators' cursors (or an empty
* fragment until the provider and binding are initialized).
*/
function CollaborationPlugin({ id, providerFactory, shouldBootstrap, username, cursorColor, cursorsContainerRef, initialEditorState, excludedProperties, awarenessData, syncCursorPositionsFn, selectionHighlight, rootName, getXmlText }) {
	const isBindingInitialized = (0, import_react.useRef)(false);
	const providerInputs = (0, import_react.useRef)(null);
	const providerRef = (0, import_react.useRef)(null);
	const collabContext = useCollaborationContext(username, cursorColor);
	const { yjsDocMap, name, color } = collabContext;
	const [editor] = useLexicalComposerContext();
	useCollabActive(collabContext, editor);
	const [provider, setProvider] = (0, import_react.useState)();
	const [doc, setDoc] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		const prevInputs = providerInputs.current;
		if (prevInputs !== null && prevInputs.id === id && prevInputs.providerFactory === providerFactory && prevInputs.yjsDocMap === yjsDocMap) return;
		providerInputs.current = {
			id,
			providerFactory,
			yjsDocMap
		};
		const newProvider = providerFactory(id, yjsDocMap);
		const previousProvider = providerRef.current;
		if (previousProvider !== null && previousProvider !== newProvider) previousProvider.disconnect();
		providerRef.current = newProvider;
		setProvider(newProvider);
		setDoc(yjsDocMap.get(id));
	}, [
		id,
		providerFactory,
		yjsDocMap
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			const currentProvider = providerRef.current;
			if (currentProvider !== null) {
				providerRef.current = null;
				currentProvider.disconnect();
			}
		};
	}, []);
	const [binding, setBinding] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!provider) return;
		if (isBindingInitialized.current) return;
		const resolvedDoc = doc || yjsDocMap.get(id);
		if (!resolvedDoc) return;
		isBindingInitialized.current = true;
		const newBinding = createYjsBinding({
			doc: resolvedDoc,
			docMap: yjsDocMap,
			editor,
			excludedProperties,
			getXmlText,
			id,
			rootName
		});
		setBinding(newBinding);
	}, [
		editor,
		provider,
		id,
		yjsDocMap,
		doc
	]);
	(0, import_react.useEffect)(() => {
		if (binding === void 0) return;
		return () => {
			binding.root.destroy(binding);
		};
	}, [binding]);
	if (!provider || !binding) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(YjsCollaborationCursors, {
		awarenessData,
		binding,
		collabContext,
		color,
		cursorsContainerRef,
		editor,
		id,
		initialEditorState,
		name,
		provider,
		setDoc,
		shouldBootstrap,
		yjsDocMap,
		syncCursorPositionsFn,
		selectionHighlight
	});
}
function YjsCollaborationCursors({ editor, id, provider, yjsDocMap, name, color, shouldBootstrap, cursorsContainerRef, initialEditorState, awarenessData, collabContext, binding, setDoc, syncCursorPositionsFn, selectionHighlight }) {
	const cursors = useYjsCollaboration(editor, id, provider, yjsDocMap, name, color, shouldBootstrap, binding, setDoc, cursorsContainerRef, initialEditorState, awarenessData, syncCursorPositionsFn, selectionHighlight);
	useYjsHistory(editor, binding);
	useYjsFocusTracking(editor, provider, name, color, awarenessData);
	return cursors;
}
/**
* A variant of {@link CollaborationPlugin} that takes an already-created Yjs
* `doc` and {@link Provider} directly instead of a provider factory, giving the
* application full control over their lifecycle. Must be used within a
* {@link LexicalCollaboration} provider.
*
* @experimental The API may change in a future release.
* @returns The element that renders collaborators' cursors.
*/
function CollaborationPluginV2__EXPERIMENTAL({ id, doc, provider, __shouldBootstrapUnsafe, username, cursorColor, cursorsContainerRef, excludedProperties, awarenessData, selectionHighlight, rootName, getXmlElement }) {
	const collabContext = useCollaborationContext(username, cursorColor);
	const { yjsDocMap, name, color } = collabContext;
	const [editor] = useLexicalComposerContext();
	useCollabActive(collabContext, editor);
	const binding = useYjsCollaborationV2__EXPERIMENTAL(editor, id, doc, provider, yjsDocMap, name, color, {
		__shouldBootstrapUnsafe,
		awarenessData,
		excludedProperties,
		getXmlElement,
		rootName,
		selectionHighlight
	});
	useYjsHistoryV2(editor, binding);
	useYjsFocusTracking(editor, provider, name, color, awarenessData);
	return useYjsCursors(binding, cursorsContainerRef);
}
var useCollabActive = (collabContext, editor) => {
	(0, import_react.useEffect)(() => {
		collabContext.isCollabActive = true;
		return () => {
			if (editor._parentEditor == null) collabContext.isCollabActive = false;
		};
	}, [collabContext, editor]);
};
//#endregion
//#region ../lexical-react/dist/LexicalContentEditable.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function mergeRefs(...refs) {
	return (value) => {
		for (const ref of refs) if (typeof ref === "function") ref(value);
		else if (ref != null) ref.current = value;
	};
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var useLayoutEffectImpl = CAN_USE_DOM ? import_react.useLayoutEffect : import_react.useEffect;
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function ContentEditableElementImpl({ editor, ariaActiveDescendant, ariaAutoComplete, ariaControls, ariaDescribedBy, ariaErrorMessage, ariaExpanded, ariaInvalid, ariaLabel, ariaLabelledBy, ariaMultiline, ariaOwns, ariaRequired, autoCapitalize, className, id, role = "textbox", spellCheck = true, style, tabIndex, "data-testid": testid, ...rest }, ref) {
	const [isEditable, setEditable] = (0, import_react.useState)(editor.isEditable());
	const handleRef = (0, import_react.useCallback)((rootElement) => {
		if (rootElement && rootElement.ownerDocument && rootElement.ownerDocument.defaultView) editor.setRootElement(rootElement);
		else editor.setRootElement(null);
	}, [editor]);
	const mergedRefs = (0, import_react.useMemo)(() => mergeRefs(ref, handleRef), [handleRef, ref]);
	useLayoutEffectImpl(() => {
		setEditable(editor.isEditable());
		return editor.registerEditableListener((currentIsEditable) => {
			setEditable(currentIsEditable);
		});
	}, [editor]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
		"aria-activedescendant": isEditable ? ariaActiveDescendant : void 0,
		"aria-autocomplete": isEditable ? ariaAutoComplete : "none",
		"aria-controls": isEditable ? ariaControls : void 0,
		"aria-describedby": ariaDescribedBy,
		...ariaErrorMessage != null ? { "aria-errormessage": ariaErrorMessage } : {},
		"aria-expanded": isEditable && role === "combobox" ? !!ariaExpanded : void 0,
		...ariaInvalid != null ? { "aria-invalid": ariaInvalid } : {},
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"aria-multiline": ariaMultiline,
		"aria-owns": isEditable ? ariaOwns : void 0,
		"aria-readonly": isEditable ? void 0 : true,
		"aria-required": ariaRequired,
		autoCapitalize,
		className,
		contentEditable: isEditable,
		"data-testid": testid,
		id,
		ref: mergedRefs,
		role,
		spellCheck,
		style,
		tabIndex: tabIndex ?? (isEditable ? void 0 : -1),
		...rest
	});
}
/**
* A lower-level building block for the editor's editable `<div>`. It binds the
* given `editor` to the rendered element via
* {@link LexicalEditor.setRootElement}, reflects the editor's editable state on
* the `contentEditable` attribute, and applies the provided ARIA and HTML
* attributes. Prefer {@link ContentEditable}, which reads the editor from
* context and adds placeholder support, unless you need this extra control.
*/
var ContentEditableElement = /* @__PURE__ */ (0, import_react.forwardRef)(ContentEditableElementImpl);
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function canShowPlaceholderFromCurrentEditorState(editor) {
	return editor.read("latest", $canShowPlaceholderCurry(editor.isComposing()));
}
function useCanShowPlaceholder(editor) {
	const [canShowPlaceholder, setCanShowPlaceholder] = (0, import_react.useState)(() => canShowPlaceholderFromCurrentEditorState(editor));
	useLayoutEffectImpl(() => {
		function resetCanShowPlaceholder() {
			const currentCanShowPlaceholder = canShowPlaceholderFromCurrentEditorState(editor);
			setCanShowPlaceholder(currentCanShowPlaceholder);
		}
		resetCanShowPlaceholder();
		return mergeRegister(editor.registerUpdateListener(() => {
			resetCanShowPlaceholder();
		}), editor.registerEditableListener(() => {
			resetCanShowPlaceholder();
		}));
	}, [editor]);
	return canShowPlaceholder;
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Props for the {@link ContentEditable} component. These are the
* {@link ContentEditableElementProps} (minus `editor`, which is read from
* context) plus an optional `placeholder`; when a `placeholder` is provided an
* `aria-placeholder` string is also required for accessibility.
*/
/**
* The editable surface of a Lexical editor: the `contentEditable` element that
* users type into. Render it inside a {@link LexicalComposer} (it reads the
* editor from context) and pass it to {@link RichTextPlugin} or
* {@link PlainTextPlugin}. An optional `placeholder` is shown while the editor
* is empty. The `ref` is forwarded to the underlying `<div>`.
*/
var ContentEditable = /* @__PURE__ */ (0, import_react.forwardRef)(ContentEditableImpl);
function ContentEditableImpl(props, ref) {
	const { placeholder, ...rest } = props;
	const [editor] = useLexicalComposerContext();
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/*#__PURE__*/ (0, import_jsx_runtime.jsx)(ContentEditableElement, {
		editor,
		...rest,
		ref
	}), placeholder != null && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Placeholder, {
		editor,
		content: placeholder
	})] });
}
function Placeholder({ content, editor }) {
	const showPlaceholder = useCanShowPlaceholder(editor);
	const [isEditable, setEditable] = (0, import_react.useState)(editor.isEditable());
	useLayoutEffectImpl(() => {
		setEditable(editor.isEditable());
		return editor.registerEditableListener((currentIsEditable) => {
			setEditable(currentIsEditable);
		});
	}, [editor]);
	if (!showPlaceholder) return null;
	let placeholder = null;
	if (typeof content === "function") placeholder = content(isEditable);
	else if (content !== null) placeholder = content;
	if (placeholder === null) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		children: placeholder
	});
}
//#endregion
//#region ../lexical-react/dist/LexicalReactProviderExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* An extension used to declare that there is a LexicalExtensionComposer or
* ReactPluginHostExtension available so that we can issue runtime warnings
* when plugins that depend on React are hosted in an environment
* where it is not ever going to be rendered.
*
* It is a separate extension so it can be used as a peer dependency.
*/
var ReactProviderExtension = { name: "@lexical/react/ReactProvider" };
//#endregion
//#region ../lexical-react/dist/LexicalReactExtension.dev.js
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function formatDevErrorMessage(message) {
	throw new Error(message);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function useRootElement(editor) {
	const [subscribe, getSnapshot] = (0, import_react.useMemo)(() => [editor.registerRootListener.bind(editor), editor.getRootElement.bind(editor)], [editor]);
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function useReactDecorators(editor, ErrorBoundary) {
	const [subscribe, getSnapshot] = (0, import_react.useMemo)(() => [(cb) => editor.registerDecoratorListener(cb), () => editor.getDecorators()], [editor]);
	const decorators = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
	const rootElement = useRootElement(editor);
	return (0, import_react.useMemo)(() => {
		const onError = (e) => editor._onError(e);
		const decoratedPortals = [];
		for (const nodeKey in decorators) {
			const element = editor.getElementByKey(nodeKey);
			if (element !== null) {
				const reactDecorator = /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ErrorBoundary, {
					onError,
					children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: null,
						children: decorators[nodeKey]
					})
				});
				decoratedPortals.push(/*#__PURE__*/ (0, import_react_dom.createPortal)(reactDecorator, element, nodeKey));
			}
		}
		return decoratedPortals;
	}, [
		ErrorBoundary,
		decorators,
		editor,
		rootElement
	]);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function buildEditorComponent(config, context) {
	const [editor] = context;
	const rawConfigDecorators = config.decorators.map((El) => typeof El === "function" ? /*#__PURE__*/ (0, import_jsx_runtime.jsx)(El, { context }) : El);
	return function EditorComponent(props) {
		const { EditorChildrenComponent = config.EditorChildrenComponent, ErrorBoundary = config.ErrorBoundary, contentEditable = config.contentEditable, children } = props;
		const decorators = useReactDecorators(editor, ErrorBoundary);
		const configDecorators = (0, import_react.useMemo)(() => rawConfigDecorators.map((decorator, i) => /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ErrorBoundary, {
			onError: (e) => {
				editor._onError(e);
			},
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: decorator
			})
		}, i)), [ErrorBoundary]);
		return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(LexicalComposerContext.Provider, {
			value: context,
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(EditorChildrenComponent, {
				context,
				contentEditable,
				children: [
					children,
					configDecorators,
					decorators
				]
			})
		});
	};
}
/**
* @example
* The default EditorChildrenComponent implementation
* ```jsx
* return (
*   <>
*     {contentEditable}
*     {children}
*   </>
* );
* ```
*/
function DefaultEditorChildrenComponent({ contentEditable, children }) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [contentEditable, children] });
}
/**
* An extension to use or configure React for use with Lexical. In an editor, you
* would typically use {@link LexicalExtensionComposer} (for React projects) or
* {@link ReactPluginHostExtension} (to use React Extensions and plug-ins in a non-React
* project).
*
* See {@link ReactConfig} for more detailed exextensionations of how to use
* the config for this Extension.
*
* For an Extension developer, you can defineConfig() override the extension with
* decorators to add JSX inside the editor context that is not
* location-dependent (e.g. floating UI that does not need to be mounted in
* some specific location, or effects that return null).
*/
var ReactExtension = {
	build(editor, config, state) {
		if (!state.getPeer(ReactProviderExtension.name)) formatDevErrorMessage(`No ReactProviderExtension detected. You must use ReactPluginHostExtension or LexicalExtensionComposer to host React extensions. The following extensions depend on ReactExtension: ${[...state.getDirectDependentNames()].join(" ")}`);
		const context = [editor, { getTheme: () => editor._config.theme }];
		return {
			Component: buildEditorComponent(config, context),
			context
		};
	},
	config: {
		EditorChildrenComponent: DefaultEditorChildrenComponent,
		ErrorBoundary: LexicalErrorBoundary,
		contentEditable: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(ContentEditable, {}),
		decorators: []
	},
	mergeConfig(a, b) {
		const config = shallowMergeConfig(a, b);
		if (b.decorators) config.decorators = b.decorators.length > 0 ? [...a.decorators, ...b.decorators] : a.decorators;
		return config;
	},
	name: "@lexical/react/React",
	peerDependencies: [["@lexical/react/ReactProvider"]]
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/broadcastchannel.js
/**
* Helpers for cross-tab communication using broadcastchannel with LocalStorage fallback.
*
* ```js
* // In browser window A:
* broadcastchannel.subscribe('my events', data => console.log(data))
* broadcastchannel.publish('my events', 'Hello world!') // => A: 'Hello world!' fires synchronously in same tab
*
* // In browser window B:
* broadcastchannel.publish('my events', 'hello from tab B') // => A: 'hello from tab B'
* ```
*
* @module broadcastchannel
*/
/**
* @typedef {Object} Channel
* @property {Set<function(any, any):any>} Channel.subs
* @property {any} Channel.bc
*/
/**
* @type {Map<string, Channel>}
*/
var channels = /* @__PURE__ */ new Map();
/* c8 ignore start */
var LocalStoragePolyfill = class {
	/**
	* @param {string} room
	*/
	constructor(room) {
		this.room = room;
		/**
		* @type {null|function({data:Uint8Array}):void}
		*/
		this.onmessage = null;
		/**
		* @param {any} e
		*/
		this._onChange = (e) => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || "") });
		onChange(this._onChange);
	}
	/**
	* @param {ArrayBuffer} buf
	*/
	postMessage(buf) {
		varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
	}
	close() {
		offChange(this._onChange);
	}
};
/* c8 ignore stop */
/* c8 ignore next */
var BC = typeof BroadcastChannel === "undefined" ? LocalStoragePolyfill : BroadcastChannel;
/**
* @param {string} room
* @return {Channel}
*/
var getChannel = (room) => setIfUndefined(channels, room, () => {
	const subs = create$4();
	const bc = new BC(room);
	/**
	* @param {{data:ArrayBuffer}} e
	*/
	/* c8 ignore next */
	bc.onmessage = (e) => subs.forEach((sub) => sub(e.data, "broadcastchannel"));
	return {
		bc,
		subs
	};
});
/**
* Subscribe to global `publish` events.
*
* @function
* @param {string} room
* @param {function(any, any):any} f
*/
var subscribe = (room, f) => {
	getChannel(room).subs.add(f);
	return f;
};
/**
* Unsubscribe from `publish` global events.
*
* @function
* @param {string} room
* @param {function(any, any):any} f
*/
var unsubscribe = (room, f) => {
	const channel = getChannel(room);
	const unsubscribed = channel.subs.delete(f);
	if (unsubscribed && channel.subs.size === 0) {
		channel.bc.close();
		channels.delete(room);
	}
	return unsubscribed;
};
/**
* Publish data to all subscribers (including subscribers on this tab)
*
* @function
* @param {string} room
* @param {any} data
* @param {any} [origin]
*/
var publish = (room, data, origin = null) => {
	const c = getChannel(room);
	c.bc.postMessage(data);
	c.subs.forEach((sub) => sub(data, origin));
};
/**
* Create a sync step 1 message based on the state of the current shared document.
*
* @param {encoding.Encoder} encoder
* @param {Y.Doc} doc
*/
var writeSyncStep1 = (encoder, doc) => {
	writeVarUint(encoder, 0);
	writeVarUint8Array(encoder, encodeStateVector(doc));
};
/**
* @param {encoding.Encoder} encoder
* @param {Y.Doc} doc
* @param {Uint8Array} [encodedStateVector]
*/
var writeSyncStep2 = (encoder, doc, encodedStateVector) => {
	writeVarUint(encoder, 1);
	writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
};
/**
* Read SyncStep1 message and reply with SyncStep2.
*
* @param {decoding.Decoder} decoder The reply to the received message
* @param {encoding.Encoder} encoder The received message
* @param {Y.Doc} doc
*/
var readSyncStep1 = (decoder, encoder, doc) => writeSyncStep2(encoder, doc, readVarUint8Array(decoder));
/**
* Read and apply Structs and then DeleteStore to a y instance.
*
* @param {decoding.Decoder} decoder
* @param {Y.Doc} doc
* @param {any} transactionOrigin
* @param {(error:Error)=>any} [errorHandler]
*/
var readSyncStep2 = (decoder, doc, transactionOrigin, errorHandler) => {
	try {
		applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
	} catch (error) {
		if (errorHandler != null) errorHandler(error);
		console.error("Caught error while handling a Yjs update", error);
	}
};
/**
* @param {encoding.Encoder} encoder
* @param {Uint8Array} update
*/
var writeUpdate = (encoder, update) => {
	writeVarUint(encoder, 2);
	writeVarUint8Array(encoder, update);
};
/**
* Read and apply Structs and then DeleteStore to a y instance.
*
* @param {decoding.Decoder} decoder
* @param {Y.Doc} doc
* @param {any} transactionOrigin
* @param {(error:Error)=>any} [errorHandler]
*/
var readUpdate = readSyncStep2;
/**
* @param {decoding.Decoder} decoder A message received from another client
* @param {encoding.Encoder} encoder The reply message. Does not need to be sent if empty.
* @param {Y.Doc} doc
* @param {any} transactionOrigin
* @param {(error:Error)=>any} [errorHandler] Optional error handler that catches errors when reading Yjs messages.
*/
var readSyncMessage = (decoder, encoder, doc, transactionOrigin, errorHandler) => {
	const messageType = readVarUint(decoder);
	switch (messageType) {
		case 0:
			readSyncStep1(decoder, encoder, doc);
			break;
		case 1:
			readSyncStep2(decoder, doc, transactionOrigin, errorHandler);
			break;
		case 2:
			readUpdate(decoder, doc, transactionOrigin, errorHandler);
			break;
		default: throw new Error("Unknown message type");
	}
	return messageType;
};
/**
* @callback PermissionDeniedHandler
* @param {any} y
* @param {string} reason
*/
/**
*
* @param {decoding.Decoder} decoder
* @param {Y.Doc} y
* @param {PermissionDeniedHandler} permissionDeniedHandler
*/
var readAuthMessage = (decoder, y, permissionDeniedHandler) => {
	switch (readVarUint(decoder)) {
		case 0: permissionDeniedHandler(y, readVarString(decoder));
	}
};
//#endregion
//#region ../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.31/node_modules/y-protocols/awareness.js
/**
* @module awareness-protocol
*/
var outdatedTimeout = 3e4;
/**
* @typedef {Object} MetaClientState
* @property {number} MetaClientState.clock
* @property {number} MetaClientState.lastUpdated unix timestamp
*/
/**
* The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
* (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
* remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
*
* Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
* its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
* applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
* a remote client is offline, it may propagate a message with
* `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
* message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
*
* Before a client disconnects, it should propagate a `null` state with an updated clock.
*
* Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
*
* @extends {Observable<string>}
*/
var Awareness = class extends Observable {
	/**
	* @param {Y.Doc} doc
	*/
	constructor(doc) {
		super();
		this.doc = doc;
		/**
		* @type {number}
		*/
		this.clientID = doc.clientID;
		/**
		* Maps from client id to client state
		* @type {Map<number, Object<string, any>>}
		*/
		this.states = /* @__PURE__ */ new Map();
		/**
		* @type {Map<number, MetaClientState>}
		*/
		this.meta = /* @__PURE__ */ new Map();
		this._checkInterval = setInterval(() => {
			const now = getUnixTime();
			if (this.getLocalState() !== null && 15e3 <= now - this.meta.get(this.clientID).lastUpdated) this.setLocalState(this.getLocalState());
			/**
			* @type {Array<number>}
			*/
			const remove = [];
			this.meta.forEach((meta, clientid) => {
				if (clientid !== this.clientID && 3e4 <= now - meta.lastUpdated && this.states.has(clientid)) remove.push(clientid);
			});
			if (remove.length > 0) removeAwarenessStates(this, remove, "timeout");
		}, floor(outdatedTimeout / 10));
		doc.on("destroy", () => {
			this.destroy();
		});
		this.setLocalState({});
	}
	destroy() {
		this.emit("destroy", [this]);
		this.setLocalState(null);
		super.destroy();
		clearInterval(this._checkInterval);
	}
	/**
	* @return {Object<string,any>|null}
	*/
	getLocalState() {
		return this.states.get(this.clientID) || null;
	}
	/**
	* @param {Object<string,any>|null} state
	*/
	setLocalState(state) {
		const clientID = this.clientID;
		const currLocalMeta = this.meta.get(clientID);
		const clock = currLocalMeta === void 0 ? 0 : currLocalMeta.clock + 1;
		const prevState = this.states.get(clientID);
		if (state === null) this.states.delete(clientID);
		else this.states.set(clientID, state);
		this.meta.set(clientID, {
			clock,
			lastUpdated: getUnixTime()
		});
		const added = [];
		const updated = [];
		const filteredUpdated = [];
		const removed = [];
		if (state === null) removed.push(clientID);
		else if (prevState == null) {
			if (state != null) added.push(clientID);
		} else {
			updated.push(clientID);
			if (!equalityDeep(prevState, state)) filteredUpdated.push(clientID);
		}
		if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) this.emit("change", [{
			added,
			updated: filteredUpdated,
			removed
		}, "local"]);
		this.emit("update", [{
			added,
			updated,
			removed
		}, "local"]);
	}
	/**
	* @param {string} field
	* @param {any} value
	*/
	setLocalStateField(field, value) {
		const state = this.getLocalState();
		if (state !== null) this.setLocalState({
			...state,
			[field]: value
		});
	}
	/**
	* @return {Map<number,Object<string,any>>}
	*/
	getStates() {
		return this.states;
	}
};
/**
* Mark (remote) clients as inactive and remove them from the list of active peers.
* This change will be propagated to remote clients.
*
* @param {Awareness} awareness
* @param {Array<number>} clients
* @param {any} origin
*/
var removeAwarenessStates = (awareness, clients, origin) => {
	const removed = [];
	for (let i = 0; i < clients.length; i++) {
		const clientID = clients[i];
		if (awareness.states.has(clientID)) {
			awareness.states.delete(clientID);
			if (clientID === awareness.clientID) {
				const curMeta = awareness.meta.get(clientID);
				awareness.meta.set(clientID, {
					clock: curMeta.clock + 1,
					lastUpdated: getUnixTime()
				});
			}
			removed.push(clientID);
		}
	}
	if (removed.length > 0) {
		awareness.emit("change", [{
			added: [],
			updated: [],
			removed
		}, origin]);
		awareness.emit("update", [{
			added: [],
			updated: [],
			removed
		}, origin]);
	}
};
/**
* @param {Awareness} awareness
* @param {Array<number>} clients
* @return {Uint8Array}
*/
var encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
	const len = clients.length;
	const encoder = createEncoder();
	writeVarUint(encoder, len);
	for (let i = 0; i < len; i++) {
		const clientID = clients[i];
		const state = states.get(clientID) || null;
		const clock = awareness.meta.get(clientID).clock;
		writeVarUint(encoder, clientID);
		writeVarUint(encoder, clock);
		writeVarString(encoder, JSON.stringify(state));
	}
	return toUint8Array(encoder);
};
/**
* @param {Awareness} awareness
* @param {Uint8Array} update
* @param {any} origin This will be added to the emitted change event
*/
var applyAwarenessUpdate = (awareness, update, origin) => {
	const decoder = createDecoder(update);
	const timestamp = getUnixTime();
	const added = [];
	const updated = [];
	const filteredUpdated = [];
	const removed = [];
	const len = readVarUint(decoder);
	for (let i = 0; i < len; i++) {
		const clientID = readVarUint(decoder);
		let clock = readVarUint(decoder);
		const state = JSON.parse(readVarString(decoder));
		const clientMeta = awareness.meta.get(clientID);
		const prevState = awareness.states.get(clientID);
		const currClock = clientMeta === void 0 ? 0 : clientMeta.clock;
		if (currClock < clock || currClock === clock && state === null && awareness.states.has(clientID)) {
			if (state === null) {
				if (clientID === awareness.clientID && awareness.getLocalState() != null) clock++;
				else awareness.states.delete(clientID);
			} else awareness.states.set(clientID, state);
			awareness.meta.set(clientID, {
				clock,
				lastUpdated: timestamp
			});
			if (clientMeta === void 0 && state !== null) added.push(clientID);
			else if (clientMeta !== void 0 && state === null) removed.push(clientID);
			else if (state !== null) {
				if (!equalityDeep(state, prevState)) filteredUpdated.push(clientID);
				updated.push(clientID);
			}
		}
	}
	if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) awareness.emit("change", [{
		added,
		updated: filteredUpdated,
		removed
	}, origin]);
	if (added.length > 0 || updated.length > 0 || removed.length > 0) awareness.emit("update", [{
		added,
		updated,
		removed
	}, origin]);
};
//#endregion
//#region ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/url.js
/**
* Utility module to work with urls.
*
* @module url
*/
/**
* @param {Object<string,string>} params
* @return {string}
*/
var encodeQueryParams = (params) => map(params, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");
/**
*                       encoder,          decoder,          provider,          emitSynced, messageType
* @type {Array<function(encoding.Encoder, decoding.Decoder, WebsocketProvider, boolean,    number):void>}
*/
var messageHandlers = [];
messageHandlers[0] = (encoder, decoder, provider, emitSynced, _messageType) => {
	writeVarUint(encoder, 0);
	const syncMessageType = readSyncMessage(decoder, encoder, provider.doc, provider);
	if (emitSynced && syncMessageType === 1 && !provider.synced) provider.synced = true;
};
messageHandlers[3] = (encoder, _decoder, provider, _emitSynced, _messageType) => {
	writeVarUint(encoder, 1);
	writeVarUint8Array(encoder, encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys())));
};
messageHandlers[1] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
	applyAwarenessUpdate(provider.awareness, readVarUint8Array(decoder), provider);
};
messageHandlers[2] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
	readAuthMessage(decoder, provider.doc, (_ydoc, reason) => permissionDeniedHandler(provider, reason));
};
var messageReconnectTimeout = 3e4;
/**
* @param {WebsocketProvider} provider
* @param {string} reason
*/
var permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.\n${reason}`);
/**
* @param {WebsocketProvider} provider
* @param {Uint8Array} buf
* @param {boolean} emitSynced
* @return {encoding.Encoder}
*/
var readMessage = (provider, buf, emitSynced) => {
	const decoder = createDecoder(buf);
	const encoder = createEncoder();
	const messageType = readVarUint(decoder);
	const messageHandler = provider.messageHandlers[messageType];
	if (messageHandler) messageHandler(encoder, decoder, provider, emitSynced, messageType);
	else console.error("Unable to compute message");
	return encoder;
};
/**
* Outsource this function so that a new websocket connection is created immediately.
* I suspect that the `ws.onclose` event is not always fired if there are network issues.
*
* @param {WebsocketProvider} provider
* @param {WebSocket} ws
* @param {CloseEvent | null} event
*/
var closeWebsocketConnection = (provider, ws, event) => {
	if (ws === provider.ws) {
		provider.emit("connection-close", [event, provider]);
		provider.ws = null;
		ws.close();
		provider.wsconnecting = false;
		if (provider.wsconnected) {
			provider.wsconnected = false;
			provider.synced = false;
			removeAwarenessStates(provider.awareness, Array.from(provider.awareness.getStates().keys()).filter((client) => client !== provider.doc.clientID), provider);
			provider.emit("status", [{ status: "disconnected" }]);
		} else provider.wsUnsuccessfulReconnects++;
		setTimeout(setupWS, min(pow(2, provider.wsUnsuccessfulReconnects) * 100, provider.maxBackoffTime), provider);
	}
};
/**
* @param {WebsocketProvider} provider
*/
var setupWS = (provider) => {
	if (provider.shouldConnect && provider.ws === null) {
		const websocket = new provider._WS(provider.url, provider.protocols);
		websocket.binaryType = "arraybuffer";
		provider.ws = websocket;
		provider.wsconnecting = true;
		provider.wsconnected = false;
		provider.synced = false;
		websocket.onmessage = (event) => {
			provider.wsLastMessageReceived = getUnixTime();
			const encoder = readMessage(provider, new Uint8Array(event.data), true);
			if (length(encoder) > 1) websocket.send(toUint8Array(encoder));
		};
		websocket.onerror = (event) => {
			provider.emit("connection-error", [event, provider]);
		};
		websocket.onclose = (event) => {
			closeWebsocketConnection(provider, websocket, event);
		};
		websocket.onopen = () => {
			provider.wsLastMessageReceived = getUnixTime();
			provider.wsconnecting = false;
			provider.wsconnected = true;
			provider.wsUnsuccessfulReconnects = 0;
			provider.emit("status", [{ status: "connected" }]);
			const encoder = createEncoder();
			writeVarUint(encoder, 0);
			writeSyncStep1(encoder, provider.doc);
			websocket.send(toUint8Array(encoder));
			if (provider.awareness.getLocalState() !== null) {
				const encoderAwarenessState = createEncoder();
				writeVarUint(encoderAwarenessState, 1);
				writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(provider.awareness, [provider.doc.clientID]));
				websocket.send(toUint8Array(encoderAwarenessState));
			}
		};
		provider.emit("status", [{ status: "connecting" }]);
	}
};
/**
* @param {WebsocketProvider} provider
* @param {ArrayBuffer} buf
*/
var broadcastMessage = (provider, buf) => {
	const ws = provider.ws;
	if (provider.wsconnected && ws && ws.readyState === ws.OPEN) ws.send(buf);
	if (provider.bcconnected) publish(provider.bcChannel, buf, provider);
};
/**
* Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
* The document name is attached to the provided url. I.e. the following example
* creates a websocket connection to http://localhost:1234/my-document-name
*
* @example
*   import * as Y from 'yjs'
*   import { WebsocketProvider } from 'y-websocket'
*   const doc = new Y.Doc()
*   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
*
* @extends {ObservableV2<{ 'connection-close': (event: CloseEvent | null,  provider: WebsocketProvider) => any, 'status': (event: { status: 'connected' | 'disconnected' | 'connecting' }) => any, 'connection-error': (event: Event, provider: WebsocketProvider) => any, 'sync': (state: boolean) => any }>}
*/
var WebsocketProvider = class extends ObservableV2 {
	/**
	* @param {string} serverUrl
	* @param {string} roomname
	* @param {Y.Doc} doc
	* @param {object} opts
	* @param {boolean} [opts.connect]
	* @param {awarenessProtocol.Awareness} [opts.awareness]
	* @param {Object<string,string>} [opts.params] specify url parameters
	* @param {Array<string>} [opts.protocols] specify websocket protocols
	* @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
	* @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
	* @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
	* @param {boolean} [opts.disableBc] Disable cross-tab BroadcastChannel communication
	*/
	constructor(serverUrl, roomname, doc, { connect = true, awareness = new Awareness(doc), params = {}, protocols = [], WebSocketPolyfill = WebSocket, resyncInterval = -1, maxBackoffTime = 2500, disableBc = false } = {}) {
		super();
		while (serverUrl[serverUrl.length - 1] === "/") serverUrl = serverUrl.slice(0, serverUrl.length - 1);
		this.serverUrl = serverUrl;
		this.bcChannel = serverUrl + "/" + roomname;
		this.maxBackoffTime = maxBackoffTime;
		/**
		* The specified url parameters. This can be safely updated. The changed parameters will be used
		* when a new connection is established.
		* @type {Object<string,string>}
		*/
		this.params = params;
		this.protocols = protocols;
		this.roomname = roomname;
		this.doc = doc;
		this._WS = WebSocketPolyfill;
		this.awareness = awareness;
		this.wsconnected = false;
		this.wsconnecting = false;
		this.bcconnected = false;
		this.disableBc = disableBc;
		this.wsUnsuccessfulReconnects = 0;
		this.messageHandlers = messageHandlers.slice();
		/**
		* @type {boolean}
		*/
		this._synced = false;
		/**
		* @type {WebSocket?}
		*/
		this.ws = null;
		this.wsLastMessageReceived = 0;
		/**
		* Whether to connect to other peers or not
		* @type {boolean}
		*/
		this.shouldConnect = connect;
		/**
		* @type {number}
		*/
		this._resyncInterval = 0;
		if (resyncInterval > 0) this._resyncInterval = setInterval(() => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				const encoder = createEncoder();
				writeVarUint(encoder, 0);
				writeSyncStep1(encoder, doc);
				this.ws.send(toUint8Array(encoder));
			}
		}, resyncInterval);
		/**
		* @param {ArrayBuffer} data
		* @param {any} origin
		*/
		this._bcSubscriber = (data, origin) => {
			if (origin !== this) {
				const encoder = readMessage(this, new Uint8Array(data), false);
				if (length(encoder) > 1) publish(this.bcChannel, toUint8Array(encoder), this);
			}
		};
		/**
		* Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
		* @param {Uint8Array} update
		* @param {any} origin
		*/
		this._updateHandler = (update, origin) => {
			if (origin !== this) {
				const encoder = createEncoder();
				writeVarUint(encoder, 0);
				writeUpdate(encoder, update);
				broadcastMessage(this, toUint8Array(encoder));
			}
		};
		this.doc.on("update", this._updateHandler);
		/**
		* @param {any} changed
		* @param {any} _origin
		*/
		this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
			const changedClients = added.concat(updated).concat(removed);
			const encoder = createEncoder();
			writeVarUint(encoder, 1);
			writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, changedClients));
			broadcastMessage(this, toUint8Array(encoder));
		};
		this._exitHandler = () => {
			removeAwarenessStates(this.awareness, [doc.clientID], "app closed");
		};
		if (isNode && typeof process !== "undefined") process.on("exit", this._exitHandler);
		awareness.on("update", this._awarenessUpdateHandler);
		this._checkInterval = setInterval(() => {
			if (this.wsconnected && messageReconnectTimeout < getUnixTime() - this.wsLastMessageReceived) closeWebsocketConnection(this, this.ws, null);
		}, messageReconnectTimeout / 10);
		if (connect) this.connect();
	}
	get url() {
		const encodedParams = encodeQueryParams(this.params);
		return this.serverUrl + "/" + this.roomname + (encodedParams.length === 0 ? "" : "?" + encodedParams);
	}
	/**
	* @type {boolean}
	*/
	get synced() {
		return this._synced;
	}
	set synced(state) {
		if (this._synced !== state) {
			this._synced = state;
			this.emit("synced", [state]);
			this.emit("sync", [state]);
		}
	}
	destroy() {
		if (this._resyncInterval !== 0) clearInterval(this._resyncInterval);
		clearInterval(this._checkInterval);
		this.disconnect();
		if (isNode && typeof process !== "undefined") process.off("exit", this._exitHandler);
		this.awareness.off("update", this._awarenessUpdateHandler);
		this.doc.off("update", this._updateHandler);
		super.destroy();
	}
	connectBc() {
		if (this.disableBc) return;
		if (!this.bcconnected) {
			subscribe(this.bcChannel, this._bcSubscriber);
			this.bcconnected = true;
		}
		const encoderSync = createEncoder();
		writeVarUint(encoderSync, 0);
		writeSyncStep1(encoderSync, this.doc);
		publish(this.bcChannel, toUint8Array(encoderSync), this);
		const encoderState = createEncoder();
		writeVarUint(encoderState, 0);
		writeSyncStep2(encoderState, this.doc);
		publish(this.bcChannel, toUint8Array(encoderState), this);
		const encoderAwarenessQuery = createEncoder();
		writeVarUint(encoderAwarenessQuery, 3);
		publish(this.bcChannel, toUint8Array(encoderAwarenessQuery), this);
		const encoderAwarenessState = createEncoder();
		writeVarUint(encoderAwarenessState, 1);
		writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
		publish(this.bcChannel, toUint8Array(encoderAwarenessState), this);
	}
	disconnectBc() {
		const encoder = createEncoder();
		writeVarUint(encoder, 1);
		writeVarUint8Array(encoder, encodeAwarenessUpdate(this.awareness, [this.doc.clientID], /* @__PURE__ */ new Map()));
		broadcastMessage(this, toUint8Array(encoder));
		if (this.bcconnected) {
			unsubscribe(this.bcChannel, this._bcSubscriber);
			this.bcconnected = false;
		}
	}
	disconnect() {
		this.shouldConnect = false;
		this.disconnectBc();
		if (this.ws !== null) closeWebsocketConnection(this, this.ws, null);
	}
	connect() {
		this.shouldConnect = true;
		if (!this.wsconnected && this.ws === null) {
			setupWS(this);
			this.connectBc();
		}
	}
};
//#endregion
//#region src/collaboration.ts
var url = new URL(window.location.href);
var params = new URLSearchParams(url.search);
var WEBSOCKET_ENDPOINT = params.get("collabEndpoint") || "ws://localhost:1234";
var WEBSOCKET_ID = params.get("collabId") || "0";
/**
* True in the `right` frame of the `/split/` two-client view, which exists to
* simulate a second user joining a document the `left` frame already created.
*
* `CollaborationPlugin`'s client-side `shouldBootstrap` seeds an empty Yjs
* document with a single empty paragraph once the provider reports `sync`. That
* write is an ordinary Yjs insert, not a compare-and-set, so two clients that
* both find the document empty each insert a paragraph and Yjs keeps both. Only
* one client may bootstrap a given document.
*
* For the main document only the `left` frame creates content, but a nested
* editor's document (an image caption, a sticky note) is reached by both
* clients the moment the node itself syncs -- `syncPropertiesToYjs` gives the
* nested editor a sub-`Doc` and uses that doc's `guid` as the editor key, so
* both frames resolve the same collab room at the same time. Nested editors
* therefore have to make the same choice the main document does.
*/
var skipCollaborationInit = isRightSplitFrame();
function isRightSplitFrame() {
	try {
		return window.parent != null && window.parent.frames.right === window;
	} catch (_error) {
		return false;
	}
}
function createWebsocketProvider(id, yjsDocMap) {
	let doc = yjsDocMap.get(id);
	if (doc === void 0) {
		doc = new Doc();
		yjsDocMap.set(id, doc);
	} else doc.load();
	return createWebsocketProviderWithDoc(id, doc);
}
function createWebsocketProviderWithDoc(id, doc) {
	return new WebsocketProvider(WEBSOCKET_ENDPOINT, "playground/" + WEBSOCKET_ID + "/" + id, doc, { connect: false });
}
//#endregion
//#region src/ui/ContentEditable.tsx
function LexicalContentEditable({ className, placeholder, placeholderClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentEditable, {
		className: className ?? "ContentEditable__root",
		"aria-placeholder": placeholder,
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: placeholderClassName ?? "ContentEditable__placeholder",
			children: placeholder
		})
	});
}
//#endregion
export { $setRenderContextValue as $, ClipboardDOMImportExtension as A, $isRootTextContentEmpty as B, $getClipboardDataFromSelection as C, $insertDataTransferForPlainText as D, $handleRichTextDrop as E, SharedHistoryExtension as F, NestedEditorExtension as G, registerLexicalTextEntity as H, createEmptyHistoryState as I, $generateHtmlFromNodes as J, $appendNodeToHTML as K, registerHistory as L, copyToClipboard as M, setLexicalClipboardDataTransfer as N, $insertDataTransferForRichText as O, HistoryExtension as P, $propagateTextAlignToBlockChildren as Q, $canShowPlaceholder as R, registerDragonSupport as S, $handlePlainTextDrop as T, NormalizeTripleClickSelectionExtension as U, $rootTextContent as V, NormalizeInlineElementsExtension as W, $generateNodesFromDOMViaExtension as X, $generateNodesFromDOM as Y, $isBlockLevel as Z, YArrayEvent as _, HorizontalRuleNode as _t, ReactExtension as a, ImportOverlays as at, snapshot as b, CollaborationPluginV2__EXPERIMENTAL as c, contextValue as ct, CONNECTED_COMMAND as d, domOverride as dt, $withRenderContext as et, DIFF_VERSIONS_COMMAND__EXPERIMENTAL as f, isElementOfTag as ft, YArray as g, HorizontalRuleExtension as gt, PermanentUserData as h, $isHorizontalRuleNode as ht, skipCollaborationInit as i, DOMRenderExtension as it, caretFromPoint as j, $writeDragSourceToDataTransfer as k, $getYChangeState as l, createRenderState as lt, Doc as m, $createHorizontalRuleNode as mt, createWebsocketProvider as n, CoreImportExtension as nt, ReactProviderExtension as o, ImportTextFormat as ot, TOGGLE_CONNECT_COMMAND as p, sel as pt, $distributeInlineWrapper as q, createWebsocketProviderWithDoc as r, DOMImportExtension as rt, CollaborationPlugin as s, ImportTextStyle as st, LexicalContentEditable as t, BlockSchema as tt, CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL as u, defineOverlayRules as ut, YMap as v, INSERT_HORIZONTAL_RULE_COMMAND as vt, $getHtmlContent as w, DragonExtension as x, YXmlElement as y, getPeerDependencyFromEditor as yt, $canShowPlaceholderCurry as z };
