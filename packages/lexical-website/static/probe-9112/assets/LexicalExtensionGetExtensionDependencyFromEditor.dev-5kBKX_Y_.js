import { $r as getDOMSelectionPoints, $t as $setSelection, A as $getAdjacentChildCaret, Ar as TextNode, B as $getDOMSlot, Bt as $normalizeCaret, Ci as isHTMLElement, Dt as $isRangeSelection, F as $getChildCaret, Ft as $isTextNode, Gn as INTERNAL_$isBlock, Hi as registerEventListener, It as $isTextPointCaret, Kt as $removeTextFromCaretRange, L as $getChildCaretOrSelf, Lt as $isTokenOrSegmented, M as $getAdjacentSiblingOrParentSiblingCaret, Mt as $isSiblingCaret, N as $getCaretRange, Ni as makeStepwiseIterator, Nt as $isSlotHost, O as $fullReconcile, Ot as $isRootNode, P as $getCaretRangeInDirection, Pi as mergeRegister, Pt as $isTabNode, Q as $getSelection, R as $getCollapsedCaretRange, Rn as HISTORY_MERGE_TAG, S as $createTextNode, T as $findMatchingParent, U as $getEditor, V as $getDOMTextNode, Vr as createEditor, X as $getPreviousSelection, Yn as IS_FIREFOX, Z as $getRoot, Zi as shallowMergeConfig, _ as $createParagraphNode, _t as $isDecoratorNode, at as $getSlotNames, bt as $isExtendableTextPointCaret, c as $caretRangeFromSelection, di as getStyleObjectFromCSS, en as $setSelectionFromCaretRange, et as $getSiblingCaret, ft as $insertNodeToNearestRootAtCaret, gr as ParagraphNode, gt as $isChildCaret, in as $splitAtPointCaretNext, kr as TabNode, l as $cloneWithProperties, li as getRootOwnerDocument, lr as LineBreakNode, lt as $getTextPointCaretSliceForNode, on as $splitTextPointCaretSlice, pn as CAN_USE_DOM, q as $getNodeByKey, qr as flipDirection, qt as $rewindSiblingCaret, ri as getDOMTextNode$1, rt as $getSlotHost, s as $caretFromPoint, si as getParentElement, tt as $getSlot, u as $cloneWithPropertiesEphemeral, ui as getStaticNodeConfig, vt as $isEditorState, w as $extendCaretToRange, yr as RootNode, yt as $isElementNode } from "./LexicalComposerContext.dev-CmGTZccv.js";
//#region ../../node_modules/.pnpm/@preact+signals-core@1.14.4/node_modules/@preact/signals-core/dist/signals-core.module.js
var i = Symbol.for("preact-signals");
function t() {
	if (!(v > 1)) {
		var i, t = !1;
		(function() {
			var i = c;
			c = void 0;
			while (void 0 !== i) {
				var t = i.S;
				if (t.v === i.v) {
					for (var n = t.t; void 0 !== n; n = n.x) if (n.i === i.i) n.i = t.i;
				}
				i = i.o;
			}
		})();
		while (void 0 !== h) {
			var n = h;
			h = void 0;
			s++;
			while (void 0 !== n) {
				var r = n.u;
				n.u = void 0;
				n.f &= -3;
				if (!(8 & n.f) && w(n)) try {
					n.c();
				} catch (n) {
					if (!t) {
						i = n;
						t = !0;
					}
				}
				n = r;
			}
		}
		s = 0;
		v--;
		if (t) throw i;
	} else v--;
}
function n(i) {
	if (v > 0) return i();
	e = ++u;
	v++;
	try {
		return i();
	} finally {
		t();
	}
}
var r;
var o = void 0;
function f(i) {
	var t = o, n = r;
	o = void 0;
	r = void 0;
	try {
		return i();
	} finally {
		o = t;
		r = n;
	}
}
var h = void 0;
var v = 0;
var s = 0;
var u = 0;
var e = 0;
var c = void 0;
var d = 0;
function a(i) {
	if (void 0 !== o) {
		var t = i.n;
		if (void 0 === t || t.t !== o) {
			t = {
				i: 0,
				S: i,
				p: o.s,
				n: void 0,
				t: o,
				e: void 0,
				x: void 0,
				r: t
			};
			if (void 0 !== o.s) o.s.n = t;
			o.s = t;
			i.n = t;
			if (32 & o.f) i.S(t);
			return t;
		} else if (-1 === t.i) {
			t.i = 0;
			if (void 0 !== t.n) {
				t.n.p = t.p;
				if (void 0 !== t.p) t.p.n = t.n;
				t.p = o.s;
				t.n = void 0;
				o.s.n = t;
				o.s = t;
			}
			return t;
		}
	}
}
function l(i, t) {
	this.v = i;
	this.i = 0;
	this.n = void 0;
	this.t = void 0;
	this.l = 0;
	this.W = null == t ? void 0 : t.watched;
	this.Z = null == t ? void 0 : t.unwatched;
	this.name = null == t ? void 0 : t.name;
}
l.prototype.brand = i;
l.prototype.h = function() {
	return !0;
};
l.prototype.S = function(i) {
	var t = this, n = this.t;
	if (n !== i && void 0 === i.e) {
		i.x = n;
		this.t = i;
		if (void 0 !== n) n.e = i;
		else f(function() {
			var i;
			null == (i = t.W) || i.call(t);
		});
	}
};
l.prototype.U = function(i) {
	var t = this;
	if (void 0 !== this.t) {
		var n = i.e, r = i.x;
		if (void 0 !== n) {
			n.x = r;
			i.e = void 0;
		}
		if (void 0 !== r) {
			r.e = n;
			i.x = void 0;
		}
		if (i === this.t) {
			this.t = r;
			if (void 0 === r) f(function() {
				var i;
				null == (i = t.Z) || i.call(t);
			});
		}
	}
};
l.prototype.subscribe = function(i) {
	var t = this;
	return j(function() {
		var n = t.value;
		f(function() {
			return i(n);
		});
	}, { name: "sub" });
};
l.prototype.valueOf = function() {
	return this.value;
};
l.prototype.toString = function() {
	return this.value + "";
};
l.prototype.toJSON = function() {
	return this.value;
};
l.prototype.peek = function() {
	var i = this;
	return f(function() {
		return i.value;
	});
};
Object.defineProperty(l.prototype, "value", {
	get: function() {
		var i = a(this);
		if (void 0 !== i) i.i = this.i;
		return this.v;
	},
	set: function(i) {
		if (i !== this.v) {
			if (s > 100) throw new Error("Cycle detected");
			(function(i) {
				if (0 !== v && 0 === s) {
					if (i.l !== e) {
						i.l = e;
						c = {
							S: i,
							v: i.v,
							i: i.i,
							o: c
						};
					}
				}
			})(this);
			this.v = i;
			this.i++;
			d++;
			v++;
			try {
				for (var n = this.t; void 0 !== n; n = n.x) n.t.N();
			} finally {
				t();
			}
		}
	}
});
function y(i, t) {
	return new l(i, t);
}
function w(i) {
	for (var t = i.s; void 0 !== t; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
	return !1;
}
function _(i) {
	for (var t = i.s; void 0 !== t; t = t.n) {
		var n = t.S.n;
		if (void 0 !== n) t.r = n;
		t.S.n = t;
		t.i = -1;
		if (void 0 === t.n) {
			i.s = t;
			break;
		}
	}
}
function b(i) {
	var t = i.s, n = void 0;
	while (void 0 !== t) {
		var r = t.p;
		if (-1 === t.i) {
			t.S.U(t);
			if (void 0 !== r) r.n = t.n;
			if (void 0 !== t.n) t.n.p = r;
		} else n = t;
		t.S.n = t.r;
		if (void 0 !== t.r) t.r = void 0;
		t = r;
	}
	i.s = n;
}
function p(i, t) {
	l.call(this, void 0, t);
	this.x = i;
	this.s = void 0;
	this.g = d - 1;
	this.f = 4;
}
p.prototype = new l();
p.prototype.h = function() {
	this.f &= -3;
	if (1 & this.f) return !1;
	if (32 == (36 & this.f)) return !0;
	this.f &= -5;
	if (this.g === d) return !0;
	this.g = d;
	this.f |= 1;
	if (this.i > 0 && !w(this)) {
		this.f &= -2;
		return !0;
	}
	var i = o;
	try {
		_(this);
		o = this;
		var t = this.x();
		if (16 & this.f || this.v !== t || 0 === this.i) {
			this.v = t;
			this.f &= -17;
			this.i++;
		}
	} catch (i) {
		this.v = i;
		this.f |= 16;
		this.i++;
	}
	o = i;
	b(this);
	this.f &= -2;
	return !0;
};
p.prototype.S = function(i) {
	if (void 0 === this.t) {
		this.f |= 36;
		for (var t = this.s; void 0 !== t; t = t.n) t.S.S(t);
	}
	l.prototype.S.call(this, i);
};
p.prototype.U = function(i) {
	if (void 0 !== this.t) {
		l.prototype.U.call(this, i);
		if (void 0 === this.t) {
			this.f &= -33;
			for (var t = this.s; void 0 !== t; t = t.n) t.S.U(t);
		}
	}
};
p.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 6;
		for (var i = this.t; void 0 !== i; i = i.x) i.t.N();
	}
};
Object.defineProperty(p.prototype, "value", { get: function() {
	if (1 & this.f) throw new Error("Cycle detected");
	var i = a(this);
	this.h();
	if (void 0 !== i) i.i = this.i;
	if (16 & this.f) throw this.v;
	return this.v;
} });
function g(i, t) {
	return new p(i, t);
}
function S(i) {
	var n = i.m;
	i.m = void 0;
	if ("function" == typeof n) {
		v++;
		var r = o;
		o = void 0;
		try {
			n();
		} catch (t) {
			i.f &= -2;
			i.f |= 8;
			m(i);
			throw t;
		} finally {
			o = r;
			t();
		}
	}
}
function m(i) {
	for (var t = i.s; void 0 !== t; t = t.n) t.S.U(t);
	i.x = void 0;
	i.s = void 0;
	S(i);
}
function x(i) {
	if (o !== this) throw new Error("Out-of-order effect");
	b(this);
	o = i;
	this.f &= -2;
	if (8 & this.f) m(this);
	t();
}
function E(i, t) {
	this.x = i;
	this.m = void 0;
	this.s = void 0;
	this.u = void 0;
	this.f = 32;
	this.name = null == t ? void 0 : t.name;
	if (r) r.push(this);
}
E.prototype.c = function() {
	var i = this.S();
	try {
		if (8 & this.f) return;
		if (void 0 === this.x) return;
		var t = this.x();
		if ("function" == typeof t) this.m = t;
	} finally {
		i();
	}
};
E.prototype.S = function() {
	if (1 & this.f) throw new Error("Cycle detected");
	this.f |= 1;
	this.f &= -9;
	S(this);
	_(this);
	v++;
	var i = o;
	o = this;
	return x.bind(this, i);
};
E.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 2;
		this.u = h;
		h = this;
	}
};
E.prototype.d = function() {
	this.f |= 8;
	if (!(1 & this.f)) m(this);
};
E.prototype.dispose = function() {
	this.d();
};
function j(i, t) {
	var n = new E(i, t);
	try {
		n.c();
	} catch (i) {
		n.d();
		throw i;
	}
	var r = n.d.bind(n);
	r[Symbol.dispose] = r;
	return r;
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionNamedSignals.dev.js
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
* Return an object with the same shape as `defaults` with a {@link Signal}
* for each value. If specified, the second `opts` argument is a partial
* of overrides to the defaults and will be used as the initial value.
*
* Typically used to make a reactive version of some subset of the
* configuration of an extension, so it can be reconfigured at runtime.
*
* @param defaults The object with default values
* @param opts Overrides to those default values
* @returns An object with signals initialized with the default values
*/
function namedSignals(defaults, opts = {}) {
	const initial = {};
	for (const k in defaults) {
		const v = opts[k];
		initial[k] = y(v === void 0 ? defaults[k] : v);
	}
	return initial;
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionWatchedSignal.dev.js
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
* Create a Signal that will subscribe to a value from an external store when watched, similar to
* React's [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore).
*
* @param getSnapshot Used to get the initial value of the signal when created and when first watched.
* @param register A callback that will subscribe to some external store and update the signal, must return a dispose function.
* @returns The signal
*/
function watchedSignal(getSnapshot, register) {
	let dispose;
	return y(getSnapshot(), {
		unwatched() {
			if (dispose) {
				dispose();
				dispose = void 0;
			}
		},
		watched() {
			this.value = getSnapshot();
			dispose = register(this);
		}
	});
}
//#endregion
//#region ../lexical-selection/dist/LexicalSelection.dev.js
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
function formatDevErrorMessage$3(message) {
	throw new Error(message);
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function getDOMTextNode(element) {
	let node = element;
	while (node != null) {
		if (node.nodeType === Node.TEXT_NODE) return node;
		node = node.firstChild;
	}
	return null;
}
function getDOMIndexWithinParent(node) {
	const parent = node.parentNode;
	if (parent == null) throw new Error("Should never happen");
	return [parent, Array.from(parent.childNodes).indexOf(node)];
}
/**
* Creates a selection range for the DOM.
* @param editor - The lexical editor.
* @param anchorNode - The anchor node of a selection.
* @param _anchorOffset - The amount of space offset from the anchor to the focus.
* @param focusNode - The current focus.
* @param _focusOffset - The amount of space offset from the focus to the anchor.
* @returns The range of selection for the DOM that was created.
*/
function createDOMRange(editor, anchorNode, _anchorOffset, focusNode, _focusOffset) {
	const anchorKey = anchorNode.getKey();
	const focusKey = focusNode.getKey();
	const range = getRootOwnerDocument(editor.getRootElement()).createRange();
	let anchorDOM = editor.getElementByKey(anchorKey);
	let focusDOM = editor.getElementByKey(focusKey);
	let anchorOffset = _anchorOffset;
	let focusOffset = _focusOffset;
	if ($isTextNode(anchorNode)) anchorDOM = getDOMTextNode(anchorDOM);
	if ($isTextNode(focusNode)) focusDOM = getDOMTextNode(focusDOM);
	if (anchorNode === void 0 || focusNode === void 0 || anchorDOM === null || focusDOM === null) return null;
	if (anchorDOM.nodeName === "BR") [anchorDOM, anchorOffset] = getDOMIndexWithinParent(anchorDOM);
	if (focusDOM.nodeName === "BR") [focusDOM, focusOffset] = getDOMIndexWithinParent(focusDOM);
	const firstChild = anchorDOM.firstChild;
	if (anchorDOM === focusDOM && firstChild != null && firstChild.nodeName === "BR" && anchorOffset === 0 && focusOffset === 0) focusOffset = 1;
	try {
		range.setStart(anchorDOM, anchorOffset);
		range.setEnd(focusDOM, focusOffset);
	} catch (_e) {
		return null;
	}
	if (range.collapsed && (anchorOffset !== focusOffset || anchorKey !== focusKey)) {
		range.setStart(focusDOM, focusOffset);
		range.setEnd(anchorDOM, anchorOffset);
	}
	return range;
}
/**
* Creates DOMRects, generally used to help the editor find a specific location on the screen.
* @param editor - The lexical editor
* @param range - A fragment of a document that can contain nodes and parts of text nodes.
* @returns The selectionRects as an array.
*/
function createRectsFromDOMRange(editor, range) {
	const rootElement = editor.getRootElement();
	if (rootElement === null) return [];
	const rootRect = rootElement.getBoundingClientRect();
	const computedStyle = getComputedStyle(rootElement);
	const rootPadding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
	const selectionRects = Array.from(range.getClientRects());
	let selectionRectsLength = selectionRects.length;
	selectionRects.sort((a, b) => {
		const top = a.top - b.top;
		if (Math.abs(top) <= 3) return a.left - b.left;
		return top;
	});
	let prevRect;
	for (let i = 0; i < selectionRectsLength; i++) {
		const selectionRect = selectionRects[i];
		const isContainedRect = prevRect && prevRect.top <= selectionRect.top && prevRect.bottom >= selectionRect.bottom && prevRect.left <= selectionRect.left && prevRect.right >= selectionRect.right;
		const selectionSpansElement = selectionRect.width + rootPadding === rootRect.width;
		if (isContainedRect || selectionSpansElement) {
			selectionRects.splice(i--, 1);
			selectionRectsLength--;
			continue;
		}
		prevRect = selectionRect;
	}
	return selectionRects;
}
/**
* Serializes a style object into a CSS declaration string, the inverse of
* {@link getStyleObjectFromCSS}.
* @param styles - An object mapping CSS property names to their values.
* @returns A CSS string of the form `prop: value;` for each entry, concatenated together.
*/
function getCSSFromStyleObject(styles) {
	let css = "";
	for (const style in styles) if (style) css += `${style}: ${styles[style]};`;
	return css;
}
/**
* Gets the computed DOM styles of the element.
* @param element - The node to check the styles for.
* @returns the computed styles of the element or null if there is no DOM element or no default view for the document.
*/
function $getComputedStyleForElement(element) {
	const domElement = $getEditor().getElementByKey(element.getKey());
	if (domElement === null) return null;
	const view = domElement.ownerDocument.defaultView;
	if (view === null) return null;
	return view.getComputedStyle(domElement);
}
/**
* Gets the computed DOM styles of the parent of the node.
* @param node - The node to check its parent's styles for.
* @returns the computed styles of the node, or null if the node has no parent,
* there is no DOM element, or there is no default view for the document.
*/
function $getComputedStyleForParent(node) {
	const parent = $isRootNode(node) ? node : node.getParent();
	return parent && $getComputedStyleForElement(parent);
}
/**
* Determines whether a node's parent is RTL.
* @param node - The node to check whether it is RTL.
* @returns whether the node is RTL.
*/
function $isParentRTL(node) {
	const styles = $getComputedStyleForParent(node);
	return styles !== null && styles.direction === "rtl";
}
/**
* Generally used to append text content to HTML and JSON. Grabs the text content and "slices"
* it to be generated into the new TextNode.
* @param selection - The selection containing the node whose TextNode is to be edited.
* @param textNode - The TextNode to be edited.
* @param mutates - 'clone' to return a clone before mutating, 'self' to update in-place
* @returns The updated TextNode or clone.
*/
function $sliceSelectedTextNodeContent(selection, textNode, mutates = "self") {
	const points = selection.getStartEndPoints();
	if (points !== null && textNode.isSelected(selection) && !$isTokenOrSegmented(textNode)) {
		const [start, end] = selection.isBackward() ? [points[1], points[0]] : points;
		const slice = $isRangeSelection(selection) && (start.type === "element" || end.type === "element") ? $getTextPointCaretSliceForNode($caretRangeFromSelection(selection).getTextSlices(), textNode) : void 0;
		const [startOffset, endOffset] = slice ? slice.getSliceIndices() : [textNode.__key === start.key ? start.offset : 0, textNode.__key === end.key ? end.offset : void 0];
		const text = textNode.__text.slice(startOffset, endOffset);
		if (text !== textNode.__text) {
			if (mutates === "clone") textNode = $cloneWithPropertiesEphemeral(textNode);
			textNode.__text = text;
		}
	}
	return textNode;
}
/**
* Determines if the current selection is at the end of the node.
* @param point - The point of the selection to test.
* @returns true if the provided point offset is in the last possible position, false otherwise.
*/
function $isAtNodeEnd(point) {
	if (point.type === "text") return point.offset === point.getNode().getTextContentSize();
	const node = point.getNode();
	if (!$isElementNode(node)) formatDevErrorMessage$3(`isAtNodeEnd: node must be a TextNode or ElementNode`);
	return point.offset === node.getChildrenSize();
}
/**
* Trims text from a node in order to shorten it, eg. to enforce a text's max length. If it deletes text
* that is an ancestor of the anchor then it will leave 2 indents, otherwise, if no text content exists, it deletes
* the TextNode. It will move the focus to either the end of any left over text or beginning of a new TextNode.
* @param editor - The lexical editor.
* @param anchor - The anchor of the current selection, where the selection should be pointing.
* @param delCount - The amount of characters to delete. Useful as a dynamic variable eg. textContentSize - maxLength;
*/
function $trimTextContentFromAnchor(editor, anchor, delCount) {
	let currentNode = anchor.getNode();
	let remaining = delCount;
	if ($isElementNode(currentNode)) {
		const descendantNode = currentNode.getDescendantByIndex(anchor.offset);
		if (descendantNode !== null) currentNode = descendantNode;
	}
	while (remaining > 0 && currentNode !== null) {
		if ($isElementNode(currentNode)) {
			const lastDescendant = currentNode.getLastDescendant();
			if (lastDescendant !== null) currentNode = lastDescendant;
		}
		let nextNode = currentNode.getPreviousSibling();
		let additionalElementWhitespace = 0;
		if (nextNode === null) {
			let parent = currentNode.getParentOrThrow();
			let parentSibling = parent.getPreviousSibling();
			while (parentSibling === null) {
				parent = parent.getParent();
				if (parent === null) {
					nextNode = null;
					break;
				}
				parentSibling = parent.getPreviousSibling();
			}
			if (parent !== null) {
				additionalElementWhitespace = parent.isInline() ? 0 : 2;
				nextNode = parentSibling;
			}
		}
		let text = currentNode.getTextContent();
		if (text === "" && $isElementNode(currentNode) && !currentNode.isInline()) text = "\n\n";
		const currentNodeSize = text.length;
		if (!$isTextNode(currentNode) || remaining >= currentNodeSize) {
			const parent = currentNode.getParent();
			currentNode.remove();
			if (parent != null && parent.getChildrenSize() === 0 && !$isRootNode(parent)) parent.remove();
			remaining -= currentNodeSize + additionalElementWhitespace;
			currentNode = nextNode;
		} else {
			const key = currentNode.getKey();
			const prevTextContent = editor.read("latest", () => {
				const prevNode = $getNodeByKey(key);
				if ($isTextNode(prevNode) && prevNode.isSimpleText()) return prevNode.getTextContent();
				return null;
			});
			const offset = currentNodeSize - remaining;
			const slicedText = text.slice(0, offset);
			if (prevTextContent !== null && prevTextContent !== text) {
				const prevSelection = $getPreviousSelection();
				let target = currentNode;
				if (!currentNode.isSimpleText()) {
					const textNode = $createTextNode(prevTextContent);
					currentNode.replace(textNode);
					target = textNode;
				} else currentNode.setTextContent(prevTextContent);
				if ($isRangeSelection(prevSelection) && prevSelection.isCollapsed()) {
					const prevOffset = prevSelection.anchor.offset;
					target.select(prevOffset, prevOffset);
				}
			} else if (currentNode.isSimpleText()) {
				const isSelected = anchor.key === key;
				let anchorOffset = anchor.offset;
				if (anchorOffset < remaining) anchorOffset = currentNodeSize;
				const splitStart = isSelected ? anchorOffset - remaining : 0;
				const splitEnd = isSelected ? anchorOffset : offset;
				if (isSelected && splitStart === 0) {
					const [excessNode] = currentNode.splitText(splitStart, splitEnd);
					excessNode.remove();
				} else {
					const [, excessNode] = currentNode.splitText(splitStart, splitEnd);
					excessNode.remove();
				}
			} else {
				const textNode = $createTextNode(slicedText);
				currentNode.replace(textNode);
			}
			remaining = 0;
		}
	}
}
/**
* Applies the provided styles to the given TextNode, ElementNode, or
* collapsed RangeSelection.
*
* @param target - The TextNode, ElementNode, or collapsed RangeSelection to apply the styles to
* @param patch - The patch to apply, which can include multiple styles. \\{CSSProperty: value\\} . Can also accept a function that returns the new property value.
*/
function $patchStyle(target, patch) {
	if (!($isRangeSelection(target) ? target.isCollapsed() : $isTextNode(target) || $isElementNode(target))) formatDevErrorMessage$3(`$patchStyle must only be called with a TextNode, ElementNode, or collapsed RangeSelection`);
	const prevStyles = getStyleObjectFromCSS($isRangeSelection(target) ? target.style : $isTextNode(target) ? target.getStyle() : target.getTextStyle());
	const newCSSText = getCSSFromStyleObject(Object.entries(patch).reduce((styles, [key, value]) => {
		if (typeof value === "function") styles[key] = value(prevStyles[key], target);
		else if (value === null) delete styles[key];
		else styles[key] = value;
		return styles;
	}, { ...prevStyles }));
	if ($isRangeSelection(target) || $isTextNode(target)) target.setStyle(newCSSText);
	else target.setTextStyle(newCSSText);
}
/**
* Applies the provided styles to the TextNodes in the provided Selection.
* Will update partially selected TextNodes by splitting the TextNode and applying
* the styles to the appropriate one.
* @param selection - The selected node(s) to update.
* @param patch - The patch to apply, which can include multiple styles. \\{CSSProperty: value\\} . Can also accept a function that returns the new property value.
*/
function $patchStyleText(selection, patch) {
	const patchedElementKeys = /* @__PURE__ */ new Set();
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		$patchStyle(selection, patch);
		const emptyNode = selection.anchor.getNode();
		if ($isElementNode(emptyNode) && emptyNode.isEmpty()) {
			patchedElementKeys.add(emptyNode.getKey());
			$patchStyle(emptyNode, patch);
		}
	}
	$forEachSelectedTextNodeInSelection(selection, (textNode) => {
		$patchStyle(textNode, patch);
	});
	const nodes = selection.getNodes();
	if (nodes.length > 0) for (const node of nodes) {
		if (!$isElementNode(node) || !node.canBeEmpty() || node.getChildrenSize() !== 0) continue;
		const key = node.getKey();
		if (patchedElementKeys.has(key)) continue;
		patchedElementKeys.add(key);
		$patchStyle(node, patch);
	}
}
function $forEachSelectedTextNodeInSelection(selection, fn) {
	if (!selection) return;
	const slices = $isRangeSelection(selection) ? $caretRangeFromSelection(selection).getTextSlices() : [];
	for (const node of selection.getNodes()) {
		if (!$isTextNode(node) || !node.canHaveFormat()) continue;
		const slice = $getTextPointCaretSliceForNode(slices, node);
		if (slice ? slice.distance === 0 : node.getTextContentSize() === 0) continue;
		fn(slice && !$isTokenOrSegmented(node) ? $splitTextPointCaretSlice(slice, $isRangeSelection(selection) ? selection : null) : node);
	}
	if ($isRangeSelection(selection) && selection.anchor.type === "text" && selection.focus.type === "text" && selection.anchor.key === selection.focus.key) $ensureForwardRangeSelection(selection);
}
/**
* Ensure that the given RangeSelection is not backwards. If it
* is backwards, then the anchor and focus points will be swapped
* in-place. Ensuring that the selection is a writable RangeSelection
* is the responsibility of the caller (e.g. in a read-only context
* you will want to clone $getSelection() before using this).
*
* @param selection a writable RangeSelection
*/
function $ensureForwardRangeSelection(selection) {
	if (selection.isBackward()) {
		const { anchor, focus } = selection;
		const { key, offset, type } = anchor;
		anchor.set(focus.key, focus.offset, focus.type);
		focus.set(key, offset, type);
	}
}
function $copyBlockFormatIndent(srcNode, destNode) {
	const format = srcNode.getFormatType();
	const indent = srcNode.getIndent();
	if (format !== destNode.getFormatType()) destNode.setFormat(format);
	if (indent !== destNode.getIndent()) destNode.setIndent(indent);
}
/**
* Determine whether a point sits at the leading ('previous') or trailing
* ('next') edge of `element`'s content — i.e. there is no content between the
* point and that edge of the element.
*
* This is the caret-based generalization of {@link $isAtNodeEnd}. An empty
* `element` is considered to be at both of its edges. `@lexical/utils`
* re-exports this as the direction-specific `$isAtStartOfNode` /
* `$isAtEndOfNode` helpers.
*
* @param point - The point to test.
* @param element - The ancestor element whose edge is tested.
* @param direction - 'previous' for the start of `element`, 'next' for the end.
*/
function $isAtEdgeOfElement(point, element, direction) {
	let caret = $caretFromPoint(point, direction);
	if ($isExtendableTextPointCaret(caret)) return false;
	for (; caret; caret = caret.getParentCaret()) {
		const parent = caret.getParentAtCaret();
		if (!parent || caret.getNodeAtCaret()) return false;
		if (element.is(parent)) return true;
	}
	return false;
}
/**
* Determine whether a point sits at the edge of a block in the given
* direction: 'previous' for the start of the block, 'next' for the end.
*
* Unlike {@link $isAtEdgeOfElement}, an empty block is treated as not being at
* the edge: when an ElementNode is empty it's not possible to distinguish if
* the selection's intent is the entire block or the edge so we consider it to
* be the entire block.
*/
function $isPointAtBlockEdge(point, block, direction) {
	const node = point.getNode();
	if ($isElementNode(node) && node.isEmpty()) return false;
	return $isAtEdgeOfElement(point, block, direction);
}
/**
* Converts all nodes in the selection that are of one block type to another.
* @param selection - The selected blocks to be converted.
* @param $createElement - The function that creates the node. eg. $createParagraphNode.
* @param $afterCreateElement - The function that updates the new node based on the previous one ($copyBlockFormatIndent by default)
*/
function $setBlocksType(selection, $createElement, $afterCreateElement = $copyBlockFormatIndent) {
	if (!selection) return;
	const anchorAndFocus = selection.getStartEndPoints();
	let skipFocus = false;
	let focusBlock = null;
	const blockMap = /* @__PURE__ */ new Map();
	if (anchorAndFocus) {
		const [anchor, focus] = anchorAndFocus;
		const anchorBlock = $findMatchingParent(anchor.getNode(), INTERNAL_$isBlock);
		focusBlock = $findMatchingParent(focus.getNode(), INTERNAL_$isBlock);
		const direction = selection.isBackward() ? "previous" : "next";
		skipFocus = $isElementNode(focusBlock) && !focusBlock.is(anchorBlock) && $isPointAtBlockEdge(focus, focusBlock, flipDirection(direction));
		if ($isElementNode(anchorBlock)) blockMap.set(anchorBlock.getKey(), anchorBlock);
		if ($isElementNode(focusBlock) && !skipFocus) blockMap.set(focusBlock.getKey(), focusBlock);
	}
	for (const node of selection.getNodes()) if ($isElementNode(node) && INTERNAL_$isBlock(node)) {
		if (skipFocus && node.is(focusBlock)) continue;
		blockMap.set(node.getKey(), node);
	} else if (!anchorAndFocus) {
		const ancestorBlock = $findMatchingParent(node, INTERNAL_$isBlock);
		if ($isElementNode(ancestorBlock)) blockMap.set(ancestorBlock.getKey(), ancestorBlock);
	}
	for (const prevNode of blockMap.values()) {
		if ($getSlotHost(prevNode) !== null) continue;
		const element = $createElement();
		$afterCreateElement(prevNode, element);
		prevNode.replace(element, true);
	}
}
/**
* Tests if the selection's parent element has vertical writing mode.
* @param selection - The selection whose parent to test.
* @returns true if the selection's parent has vertical writing mode (writing-mode: vertical-rl), false otherwise.
*/
function $isEditorVerticalOrientation(selection) {
	const computedStyle = $getComputedStyle(selection);
	return computedStyle !== null && computedStyle.writingMode === "vertical-rl";
}
/**
* Gets the computed DOM styles of the parent of the selection's anchor node.
* @param selection - The selection to check the styles for.
* @returns the computed styles of the node or null if there is no DOM element or no default view for the document.
*/
function $getComputedStyle(selection) {
	const anchorNode = selection.anchor.getNode();
	if ($isElementNode(anchorNode)) return $getComputedStyleForElement(anchorNode);
	return $getComputedStyleForParent(anchorNode);
}
/**
* Determines if the default character selection should be overridden. Used with DecoratorNodes
* @param selection - The selection whose default character selection may need to be overridden.
* @param isBackward - Is the selection backwards (the focus comes before the anchor)?
* @returns true if it should be overridden, false if not.
*/
function $shouldOverrideDefaultCharacterSelection(selection, isBackward) {
	let adjustedIsBackward = $isEditorVerticalOrientation(selection) ? !isBackward : isBackward;
	if ($isParentElementRTL(selection)) adjustedIsBackward = !adjustedIsBackward;
	const focusCaret = $caretFromPoint(selection.focus, adjustedIsBackward ? "previous" : "next");
	if ($isExtendableTextPointCaret(focusCaret)) return false;
	if ($isTextPointCaret(focusCaret) && !$isTabNode(focusCaret.origin) && focusCaret.origin.isUnmergeable()) {
		const sibling = focusCaret.getNodeAtCaret();
		if ($isTextNode(sibling) && !$isTabNode(sibling)) return true;
	}
	for (const nextCaret of $extendCaretToRange(focusCaret)) {
		if ($isChildCaret(nextCaret)) return !nextCaret.origin.isInline();
		else if ($isElementNode(nextCaret.origin)) continue;
		else if ($isDecoratorNode(nextCaret.origin)) return true;
		break;
	}
	return false;
}
/**
* Moves the selection according to the arguments.
* @param selection - The selected text or nodes.
* @param isHoldingShift - Is the shift key being held down during the operation.
* @param isBackward - Is the selection selected backwards (the focus comes before the anchor)?
* @param granularity - The distance to adjust the current selection.
*/
function $moveCaretSelection(selection, isHoldingShift, isBackward, granularity) {
	selection.modify(isHoldingShift ? "extend" : "move", isBackward, granularity);
}
/**
* Tests a parent element for right to left direction.
* @param selection - The selection whose parent is to be tested.
* @returns true if the selections' parent element has a direction of 'rtl' (right to left), false otherwise.
*/
function $isParentElementRTL(selection) {
	const computedStyle = $getComputedStyle(selection);
	return computedStyle !== null && computedStyle.direction === "rtl";
}
/**
* Moves selection by character according to arguments.
* @param selection - The selection of the characters to move.
* @param isHoldingShift - Is the shift key being held down during the operation.
* @param isBackward - Is the selection backward (the focus comes before the anchor)?
*/
function $moveCharacter(selection, isHoldingShift, isBackward) {
	const isRTL = $isParentElementRTL(selection);
	const isVertical = $isEditorVerticalOrientation(selection);
	let adjustedIsBackward;
	if (isVertical) adjustedIsBackward = !isBackward;
	else if (isRTL) adjustedIsBackward = !isBackward;
	else adjustedIsBackward = isBackward;
	$moveCaretSelection(selection, isHoldingShift, adjustedIsBackward, "character");
}
/**
* Returns the current value of a CSS property for Nodes, if set. If not set, it returns the defaultValue.
* @param node - The node whose style value to get.
* @param styleProperty - The CSS style property.
* @param defaultValue - The default value for the property.
* @returns The value of the property for node.
*/
function $getNodeStyleValueForProperty(node, styleProperty, defaultValue) {
	const css = node.getStyle();
	const styleObject = getStyleObjectFromCSS(css);
	if (styleObject !== null) return styleObject[styleProperty] || defaultValue;
	return defaultValue;
}
/**
* Returns the current value of a CSS property for TextNodes in the Selection, if set. If not set, it returns the defaultValue.
* If all TextNodes do not have the same value, it returns an empty string.
* @param selection - The selection of TextNodes whose value to find.
* @param styleProperty - The CSS style property.
* @param defaultValue - The default value for the property, defaults to an empty string.
* @returns The value of the property for the selected TextNodes.
*/
function $getSelectionStyleValueForProperty(selection, styleProperty, defaultValue = "") {
	let styleValue = null;
	const nodes = selection.getNodes();
	let startNode;
	let endNode;
	if ($isRangeSelection(selection)) {
		if (selection.isCollapsed() && selection.style !== "") {
			const styleObject = getStyleObjectFromCSS(selection.style);
			if (styleObject !== null && styleProperty in styleObject) return styleObject[styleProperty];
		}
		const { anchor, focus } = selection;
		const isBackward = selection.isBackward();
		const firstNode = isBackward ? focus.getNode() : anchor.getNode();
		const lastNode = isBackward ? anchor.getNode() : focus.getNode();
		const startOffset = isBackward ? focus.offset : anchor.offset;
		const endOffset = isBackward ? anchor.offset : focus.offset;
		if ($isTextNode(firstNode) && startOffset === firstNode.getTextContentSize()) startNode = firstNode;
		if (endOffset === 0) endNode = lastNode;
	}
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if ($isTextNode(node) && !node.is(i === 0 ? startNode : endNode)) {
			const nodeStyleValue = $getNodeStyleValueForProperty(node, styleProperty, defaultValue);
			if (styleValue === null) styleValue = nodeStyleValue;
			else if (styleValue !== nodeStyleValue) {
				styleValue = "";
				break;
			}
		}
	}
	return styleValue === null ? defaultValue : styleValue;
}
//#endregion
//#region ../lexical-utils/dist/LexicalUtils.dev.js
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
function px(value) {
	return `${value}px`;
}
var mutationObserverConfig = {
	attributes: true,
	characterData: true,
	childList: true,
	subtree: true
};
function prependDOMNode(parent, node) {
	parent.insertBefore(node, parent.firstChild);
}
function dedupeHighlightRects(rects) {
	const kept = [];
	for (const rect of rects) {
		if (rect.width < .5 || rect.height < .5) continue;
		if (kept.some((prev) => Math.abs(prev.left - rect.left) <= 1 && Math.abs(prev.top - rect.top) <= 1 && Math.abs(prev.right - rect.right) <= 1 && Math.abs(prev.bottom - rect.bottom) <= 1)) continue;
		kept.push(rect);
	}
	return kept;
}
/**
* Place one or multiple newly created Nodes at the passed Range's position.
* Multiple nodes will only be created when the Range spans multiple lines (aka
* client rects).
*
* This function can come particularly useful to highlight particular parts of
* the text without interfering with the EditorState, that will often replicate
* the state across collab and clipboard.
*
* This function accounts for DOM updates which can modify the passed Range.
* Hence, the function return to remove the listener.
*/
function mlcPositionNodeOnRange(editor, range, onReposition) {
	let rootDOMNode = null;
	let parentDOMNode = null;
	let observer = null;
	let lastNodes = [];
	const wrapperNode = getRootOwnerDocument(editor.getRootElement()).createElement("div");
	wrapperNode.style.position = "relative";
	function position() {
		if (!(rootDOMNode !== null)) formatDevErrorMessage$2(`Unexpected null rootDOMNode`);
		if (!(parentDOMNode !== null)) formatDevErrorMessage$2(`Unexpected null parentDOMNode`);
		const { left: parentLeft, top: parentTop } = parentDOMNode.getBoundingClientRect();
		const rects = dedupeHighlightRects(createRectsFromDOMRange(editor, range));
		if (!wrapperNode.isConnected) prependDOMNode(parentDOMNode, wrapperNode);
		let hasRepositioned = false;
		for (let i = 0; i < rects.length; i++) {
			const rect = rects[i];
			const rectNode = lastNodes[i] || getRootOwnerDocument(rootDOMNode).createElement("div");
			const rectNodeStyle = rectNode.style;
			if (rectNodeStyle.position !== "absolute") {
				rectNodeStyle.position = "absolute";
				hasRepositioned = true;
			}
			const left = px(rect.left - parentLeft);
			if (rectNodeStyle.left !== left) {
				rectNodeStyle.left = left;
				hasRepositioned = true;
			}
			const top = px(rect.top - parentTop);
			if (rectNodeStyle.top !== top) {
				rectNode.style.top = top;
				hasRepositioned = true;
			}
			const width = px(rect.width);
			if (rectNodeStyle.width !== width) {
				rectNode.style.width = width;
				hasRepositioned = true;
			}
			const height = px(rect.height);
			if (rectNodeStyle.height !== height) {
				rectNode.style.height = height;
				hasRepositioned = true;
			}
			if (rectNode.parentNode !== wrapperNode) {
				wrapperNode.append(rectNode);
				hasRepositioned = true;
			}
			lastNodes[i] = rectNode;
		}
		while (lastNodes.length > rects.length) {
			const node = lastNodes.pop();
			if (node != null) {
				node.remove();
				hasRepositioned = true;
			}
		}
		if (hasRepositioned) onReposition(lastNodes);
	}
	function stop() {
		parentDOMNode = null;
		rootDOMNode = null;
		if (observer !== null) observer.disconnect();
		observer = null;
		wrapperNode.remove();
		for (const node of lastNodes) node.remove();
		lastNodes = [];
	}
	function restart() {
		const currentRootDOMNode = editor.getRootElement();
		if (currentRootDOMNode === null) return stop();
		const currentParentDOMNode = currentRootDOMNode.parentElement;
		if (!isHTMLElement(currentParentDOMNode)) return stop();
		stop();
		rootDOMNode = currentRootDOMNode;
		parentDOMNode = currentParentDOMNode;
		observer = new MutationObserver((mutations) => {
			const nextRootDOMNode = editor.getRootElement();
			const nextParentDOMNode = nextRootDOMNode && nextRootDOMNode.parentElement;
			if (nextRootDOMNode !== rootDOMNode || nextParentDOMNode !== parentDOMNode) return restart();
			for (const mutation of mutations) if (!wrapperNode.contains(mutation.target)) return position();
		});
		observer.observe(currentParentDOMNode, mutationObserverConfig);
		position();
	}
	const removeRootListener = editor.registerRootListener(() => {
		restart();
		return stop;
	});
	return () => {
		removeRootListener();
		stop();
	};
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function $getOrderedSelectionPoints(selection) {
	const points = selection.getStartEndPoints();
	return selection.isBackward() ? [points[1], points[0]] : points;
}
function $rangeTargetFromPoint(editor, point, node, dom) {
	if (point.type === "text" || !$isElementNode(node)) return [($isTextNode(node) ? $getDOMTextNode(node, dom, editor) : getDOMTextNode$1(dom)) || dom, point.offset];
	else {
		const slot = $getDOMSlot(node, dom, editor);
		return [slot.element, slot.getFirstChildOffset() + point.offset];
	}
}
function $rangeFromPoints(editor, start, startNode, startDOM, end, endNode, endDOM) {
	const range = (editor._window ? editor._window.document : document).createRange();
	range.setStart(...$rangeTargetFromPoint(editor, start, startNode, startDOM));
	range.setEnd(...$rangeTargetFromPoint(editor, end, endNode, endDOM));
	return range;
}
function defaultOnReposition(domNodes) {
	for (const domNode of domNodes) {
		const domNodeStyle = domNode.style;
		if (domNodeStyle.background !== "Highlight") domNodeStyle.background = "Highlight";
		if (domNodeStyle.color !== "HighlightText") domNodeStyle.color = "HighlightText";
		if (domNodeStyle.marginTop !== px(-1.5)) domNodeStyle.marginTop = px(-1.5);
		if (domNodeStyle.paddingTop !== px(4)) domNodeStyle.paddingTop = px(4);
		if (domNodeStyle.paddingBottom !== px(0)) domNodeStyle.paddingBottom = px(0);
	}
}
/**
* Place one or multiple newly created Nodes at the current selection. Multiple
* nodes will only be created when the selection spans multiple lines (aka
* client rects).
*
* This function can come useful when you want to show the selection but the
* editor has been focused away.
*/
function markSelection(editor, onReposition = defaultOnReposition) {
	let previousAnchorNode = null;
	let previousAnchorNodeDOM = null;
	let previousAnchorOffset = null;
	let previousFocusNode = null;
	let previousFocusNodeDOM = null;
	let previousFocusOffset = null;
	let removeRangeListener = () => {};
	function compute(editorState) {
		editorState.read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) {
				previousAnchorNode = null;
				previousAnchorOffset = null;
				previousFocusNode = null;
				previousFocusOffset = null;
				removeRangeListener();
				removeRangeListener = () => {};
				return;
			}
			const [start, end] = $getOrderedSelectionPoints(selection);
			const currentStartNode = start.getNode();
			const currentStartNodeKey = currentStartNode.getKey();
			const currentStartOffset = start.offset;
			const currentEndNode = end.getNode();
			const currentEndNodeKey = currentEndNode.getKey();
			const currentEndOffset = end.offset;
			const currentStartNodeDOM = editor.getElementByKey(currentStartNodeKey);
			const currentEndNodeDOM = editor.getElementByKey(currentEndNodeKey);
			const differentStartDOM = previousAnchorNode === null || currentStartNodeDOM !== previousAnchorNodeDOM || currentStartOffset !== previousAnchorOffset || currentStartNodeKey !== previousAnchorNode.getKey();
			const differentEndDOM = previousFocusNode === null || currentEndNodeDOM !== previousFocusNodeDOM || currentEndOffset !== previousFocusOffset || currentEndNodeKey !== previousFocusNode.getKey();
			if ((differentStartDOM || differentEndDOM) && currentStartNodeDOM !== null && currentEndNodeDOM !== null) {
				const range = $rangeFromPoints(editor, start, currentStartNode, currentStartNodeDOM, end, currentEndNode, currentEndNodeDOM);
				removeRangeListener();
				removeRangeListener = mlcPositionNodeOnRange(editor, range, onReposition);
			}
			previousAnchorNode = currentStartNode;
			previousAnchorNodeDOM = currentStartNodeDOM;
			previousAnchorOffset = currentStartOffset;
			previousFocusNode = currentEndNode;
			previousFocusNodeDOM = currentEndNodeDOM;
			previousFocusOffset = currentEndOffset;
		}, { editor });
	}
	compute(editor.getEditorState());
	return mergeRegister(editor.registerUpdateListener(({ editorState }) => compute(editorState)), () => {
		removeRangeListener();
	});
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
function selectionAlwaysOnDisplay(editor, onReposition) {
	let removeSelectionMark = null;
	const onSelectionChange = () => {
		const editorRootElement = editor.getRootElement();
		const targetWindow = editorRootElement !== null ? editorRootElement.ownerDocument.defaultView : null;
		const domSelection = targetWindow !== null ? targetWindow.getSelection() : null;
		const domAnchorNode = domSelection !== null ? getDOMSelectionPoints(domSelection, editorRootElement).anchorNode : null;
		if (domAnchorNode !== null && editorRootElement !== null && editorRootElement.contains(domAnchorNode)) {
			if (removeSelectionMark !== null) {
				removeSelectionMark();
				removeSelectionMark = null;
			}
		} else if (removeSelectionMark === null) removeSelectionMark = markSelection(editor, onReposition);
	};
	return editor.registerRootListener((rootElement) => {
		if (rootElement) {
			const document = rootElement.ownerDocument;
			const cleanup = mergeRegister(registerEventListener(document, "selectionchange", onSelectionChange), () => {
				if (removeSelectionMark !== null) removeSelectionMark();
			});
			onSelectionChange();
			return cleanup;
		}
	});
}
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Walks up from `element` and returns the nearest scrollable ancestor (or
* `ownerDocument.body` if none is found), used to keep the active typeahead
* option scrolled into view. Set `includeHidden` to also treat
* `overflow: hidden` ancestors as scroll parents.
*
* The walk crosses ShadowRoot→host (via `getParentElement`) so a
* shadow-mounted editor's scroll parent is found in the enclosing light-DOM
* ancestor chain, and the styles / body are resolved through the element's
* own realm so an iframe-mounted editor stays inside its document.
*/
function getScrollParent(element, includeHidden) {
	const ownerDocument = element.ownerDocument;
	const win = ownerDocument.defaultView || window;
	let style = win.getComputedStyle(element);
	const excludeStaticParent = style.position === "absolute";
	const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
	if (style.position === "fixed") return ownerDocument.body;
	for (let parent = element; parent = getParentElement(parent);) {
		style = win.getComputedStyle(parent);
		if (excludeStaticParent && style.position === "static") continue;
		if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
	}
	return ownerDocument.body;
}
/**
* Returns true if the file type matches the types passed within the acceptableMimeTypes array, false otherwise.
* The types passed must be strings and are CASE-SENSITIVE.
* eg. if file is of type 'text' and acceptableMimeTypes = ['TEXT', 'IMAGE'] the function will return false.
* @param file - The file you want to type check.
* @param acceptableMimeTypes - An array of strings of types which the file is checked against.
* @returns true if the file is an acceptable mime type, false otherwise.
*/
function isMimeType(file, acceptableMimeTypes) {
	for (const acceptableType of acceptableMimeTypes) if (file.type.startsWith(acceptableType)) return true;
	return false;
}
/**
* Lexical File Reader with:
*  1. MIME type support
*  2. batched results (HistoryPlugin compatibility)
*  3. Order aware (respects the order when multiple Files are passed)
*
* const filesResult = await mediaFileReader(files, ['image/']);
* filesResult.forEach(file => editor.dispatchCommand('INSERT_IMAGE', \\{
*   src: file.result,
* \\}));
*/
function mediaFileReader(files, acceptableMimeTypes) {
	const filesIterator = files[Symbol.iterator]();
	return new Promise((resolve, reject) => {
		const processed = [];
		const handleNextFile = () => {
			const { done, value: file } = filesIterator.next();
			if (done) return resolve(processed);
			const fileReader = new FileReader();
			fileReader.addEventListener("error", reject);
			fileReader.addEventListener("load", () => {
				const result = fileReader.result;
				if (typeof result === "string") processed.push({
					file,
					result
				});
				handleNextFile();
			});
			if (isMimeType(file, acceptableMimeTypes)) fileReader.readAsDataURL(file);
			else handleNextFile();
		};
		handleNextFile();
	});
}
/**
* "Depth-First Search" starts at the root/top node of a tree and goes as far as it can down a branch end
* before backtracking and finding a new path. Consider solving a maze by hugging either wall, moving down a
* branch until you hit a dead-end (leaf) and backtracking to find the nearest branching path and repeat.
* It will then return all the nodes found in the search in an array of objects.
* Preorder traversal is used, meaning that nodes are listed in the order of when they are FIRST encountered.
*
* Children-only spine: named slot subtrees are skipped. Use {@link $dfsWithSlots}
* when you need to descend into slots (e.g. character counting, slot-aware
* content extraction).
*
* @param startNode - The node to start the search (inclusive), if omitted, it will start at the root node.
* @param endNode - The node to end the search (inclusive), if omitted, it will find all descendants of the startingNode. If endNode
* is an ElementNode, it will stop before visiting any of its children.
* @returns An array of objects of all the nodes found by the search, including their depth into the tree.
* \\{depth: number, node: LexicalNode\\} It will always return at least 1 node (the start node).
*/
function $dfs(startNode, endNode) {
	return Array.from($dfsIterator(startNode, endNode));
}
/**
* $dfs iterator (left to right). Tree traversal is done on the fly as new values are requested with O(1) memory.
* Preorder traversal is used, meaning that nodes are iterated over in the order of when they are FIRST encountered.
*
* Children-only spine: named slot subtrees are skipped. Use {@link $dfsWithSlotsIterator}
* (or {@link $dfsWithSlots}) when you need to descend into slots — e.g. character
* counting, content extraction, or any cross-tree analysis where slotted content
* should be visited.
*
* @param startNode - The node to start the search (inclusive), if omitted, it will start at the root node.
* @param endNode - The node to end the search (inclusive), if omitted, it will find all descendants of the startingNode.
* If endNode is an ElementNode, the iterator will end as soon as it reaches the endNode (no children will be visited).
* @returns An iterator, each yielded value is a DFSNode. It will always return at least 1 node (the start node).
*/
function $dfsIterator(startNode, endNode) {
	return $dfsCaretIterator("next", startNode, endNode);
}
/**
* Like {@link $dfs}, but also descends into named slots. Slots are not on the
* linked-list spine, so each host's slot subtrees are emitted slots-first,
* right after the host node and before its linked-list children.
* @experimental
* @param startNode - The node to start the search (inclusive), defaults to the root node.
* @param endNode - The node to end the search (inclusive), defaults to all descendants of startNode.
* Like {@link $dfs}, reaching endNode stops the traversal before visiting any of its
* children — including its slot subtrees. An endNode strictly inside a slot subtree
* is never reached (slot subtrees are spliced in whole), so it does not truncate
* the traversal.
* @returns An array of DFSNodes. It will always return at least 1 node (the start node).
*/
function $dfsWithSlots(startNode, endNode) {
	return Array.from($dfsWithSlotsIterator(startNode, endNode));
}
/**
* Slot-aware {@link $dfsIterator}: a host's slot subtrees are emitted
* slots-first, right after the host node and before its linked-list children.
* The caret iterator drives the linked-list spine untouched.
* @experimental
* @param startNode - The node to start the search (inclusive), defaults to the root node.
* @param endNode - The node to end the search (inclusive), defaults to all descendants of startNode.
* Like {@link $dfs}, reaching endNode stops the traversal before visiting any of its
* children — including its slot subtrees. An endNode strictly inside a slot subtree
* is never reached (slot subtrees are spliced in whole), so it does not truncate
* the traversal.
* @returns An iterator, each yielded value is a DFSNode. It will always return at least 1 node (the start node).
*/
function* $dfsWithSlotsIterator(startNode, endNode) {
	for (const dfsNode of $dfsCaretIterator("next", startNode, endNode)) {
		yield dfsNode;
		const { node, depth } = dfsNode;
		if ($isSlotHost(node) && !node.is(endNode)) for (const name of $getSlotNames(node)) {
			const slot = $getSlot(node, name);
			if (slot !== null) yield* $dfsSubtreeIterator(slot, depth + 1);
		}
	}
}
/**
* Slots-first preorder traversal of a self-contained subtree (a slot node and
* everything it owns). Used to splice slot subtrees into $dfsWithSlotsIterator.
*/
function* $dfsSubtreeIterator(node, depth) {
	yield {
		depth,
		node
	};
	const childDepth = depth + 1;
	if ($isSlotHost(node)) for (const name of $getSlotNames(node)) {
		const slot = $getSlot(node, name);
		if (slot !== null) yield* $dfsSubtreeIterator(slot, childDepth);
	}
	if ($isElementNode(node)) for (const child of node.getChildren()) yield* $dfsSubtreeIterator(child, childDepth);
}
function $getEndCaret(startNode, direction) {
	const rval = $getAdjacentSiblingOrParentSiblingCaret($getSiblingCaret(startNode, direction));
	return rval && rval[0];
}
function $dfsCaretIterator(direction, startNode, endNode) {
	const root = $getRoot();
	const start = startNode || root;
	const startCaret = $isElementNode(start) ? $getChildCaret(start, direction) : $getSiblingCaret(start, direction);
	const startDepth = $getDepth(start);
	const endCaret = endNode ? $getAdjacentChildCaret($getChildCaretOrSelf($getSiblingCaret(endNode, direction))) || $getEndCaret(endNode, direction) : $getEndCaret(start, direction);
	let depth = startDepth;
	return makeStepwiseIterator({
		hasNext: (state) => state !== null,
		initial: startCaret,
		map: (state) => ({
			depth,
			node: state.origin
		}),
		step: (state) => {
			if (state.isSameNodeCaret(endCaret)) return null;
			if ($isChildCaret(state)) depth++;
			const rval = $getAdjacentSiblingOrParentSiblingCaret(state);
			if (!rval || rval[0].isSameNodeCaret(endCaret)) return null;
			depth += rval[1];
			return rval[0];
		}
	});
}
function $getDepth(node) {
	let depth = -1;
	for (let innerNode = node; innerNode !== null; innerNode = innerNode.getParent() ?? $getSlotHost(innerNode)) depth++;
	return depth;
}
/**
* Performs a right-to-left preorder tree traversal.
* From the starting node it goes to the rightmost child, than backtracks to parent and finds new rightmost path.
* It will return the next node in traversal sequence after the startingNode.
* The traversal is similar to $dfs functions above, but the nodes are visited right-to-left, not left-to-right.
* @param startingNode - The node to start the search.
* @returns The next node in pre-order right to left traversal sequence or `null`, if the node does not exist
*/
function $getNextRightPreorderNode(startingNode) {
	const startCaret = $getChildCaretOrSelf($getSiblingCaret(startingNode, "previous"));
	const next = $getAdjacentSiblingOrParentSiblingCaret(startCaret, "root");
	return next && next[0].origin;
}
/**
* Takes a node and traverses up its ancestors (toward the root node)
* in order to find a specific type of node.
* @param node - the node to begin searching.
* @param klass - an instance of the type of node to look for.
* @returns the node of type klass that was passed, or null if none exist.
*/
function $getNearestNodeOfType(node, klass) {
	let parent = node;
	while (parent != null) {
		if (parent instanceof klass) return parent;
		parent = parent.getParent();
	}
	return null;
}
/**
* Returns the element node of the nearest ancestor, otherwise throws an error.
* @param startNode - The starting node of the search
* @returns The ancestor node found
*/
function $getNearestBlockElementAncestorOrThrow(startNode) {
	const blockNode = $findMatchingParent(startNode, (node) => $isElementNode(node) && !node.isInline());
	if (!$isElementNode(blockNode)) formatDevErrorMessage$2(`Expected node ${startNode.__key} to have closest block element node.`);
	return blockNode;
}
/**
* Attempts to resolve nested element nodes of the same type into a single node of that type.
* It is generally used for marks/commenting
* @param editor - The lexical editor
* @param targetNode - The target for the nested element to be extracted from.
* @param cloneNode - See {@link $createMarkNode}
* @param handleOverlap - Handles any overlap between the node to extract and the targetNode
* @returns The lexical editor
*/
function registerNestedElementResolver(editor, targetNode, cloneNode, handleOverlap) {
	const $isTargetNode = (node) => {
		return node instanceof targetNode;
	};
	const $findMatch = (node) => {
		const children = node.getChildren();
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if ($isTargetNode(child)) return null;
		}
		let parentNode = node;
		let childNode = node;
		while (parentNode !== null) {
			childNode = parentNode;
			parentNode = parentNode.getParent();
			if ($isTargetNode(parentNode)) return {
				child: childNode,
				parent: parentNode
			};
		}
		return null;
	};
	const $elementNodeTransform = (node) => {
		const match = $findMatch(node);
		if (match !== null) {
			const { child, parent } = match;
			if (child.is(node)) {
				handleOverlap(parent, node);
				const nextSiblings = child.getNextSiblings();
				const nextSiblingsLength = nextSiblings.length;
				parent.insertAfter(child);
				if (nextSiblingsLength !== 0) {
					const newParent = cloneNode(parent);
					child.insertAfter(newParent);
					for (let i = 0; i < nextSiblingsLength; i++) newParent.append(nextSiblings[i]);
				}
				if (!parent.canBeEmpty() && parent.getChildrenSize() === 0) parent.remove();
			}
		}
	};
	return editor.registerNodeTransform(targetNode, $elementNodeTransform);
}
/**
* Clones the editor and marks it as dirty to be reconciled. If there was a selection,
* it would be set back to its previous state, or null otherwise.
* @param editor - The lexical editor
* @param editorState - The editor's state
*/
function $restoreEditorState(editor, editorState) {
	const nodeMap = /* @__PURE__ */ new Map();
	const activeEditorState = editor._pendingEditorState;
	for (const [key, node] of editorState._nodeMap) nodeMap.set(key, $cloneWithProperties(node));
	if (activeEditorState) activeEditorState._nodeMap = nodeMap;
	$fullReconcile();
	const selection = editorState._selection;
	$setSelection(selection === null ? null : selection.clone());
}
/**
* Determine whether anything follows the given caret before the end of its
* nearest root (see {@link lexical!$isRootOrShadowRoot}).
*/
function $hasContentAfter(caret) {
	return $isExtendableTextPointCaret(caret) || $getAdjacentSiblingOrParentSiblingCaret($isTextPointCaret(caret) ? caret.getSiblingCaret() : caret, "shadowRoot") !== null;
}
/**
* If the selected insertion area is the root/shadow root node (see {@link lexical!$isRootOrShadowRoot}),
* the node will be appended there, otherwise, it will be inserted before the insertion area.
* If there is no selection where the node is to be inserted, it will be appended after any current nodes
* within the tree, as a child of the root node. A paragraph will then be added after the inserted node and selected.
* @param node - The node to be inserted
* @returns The node after its insertion
*/
function $insertNodeToNearestRoot(node) {
	const selection = $getSelection() || $getPreviousSelection();
	let initialCaret;
	if ($isRangeSelection(selection)) initialCaret = $caretFromPoint(selection.focus, "next");
	else {
		if (selection != null) {
			const nodes = selection.getNodes();
			const lastNode = nodes[nodes.length - 1];
			if (lastNode) initialCaret = $getSiblingCaret(lastNode, "next");
		}
		initialCaret = initialCaret || $getChildCaret($getRoot(), "previous").getFlipped().insert($createParagraphNode());
	}
	const insertCaret = $insertNodeToNearestRootAtCaret(node, initialCaret, $hasContentAfter(initialCaret) ? { $shouldSplit: (_node, edge) => edge !== "last" } : void 0);
	const adjacent = $getAdjacentChildCaret(insertCaret);
	const selectionCaret = $isChildCaret(adjacent) ? $normalizeCaret(adjacent) : insertCaret;
	$setSelectionFromCaretRange($getCollapsedCaretRange(selectionCaret));
	return node.getLatest();
}
/**
* Inserts a node into leaf — the deepest accessible node at the carriage position
* @param node - The node to be inserted
*/
function $insertNodeIntoLeaf(node) {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) {
		if (selection) selection.insertNodes([node]);
		return;
	}
	const caretRange = $caretRangeFromSelection(selection);
	let insertCaret = $getCaretRangeInDirection($removeTextFromCaretRange(caretRange), "next").anchor;
	if ($isTextPointCaret(insertCaret)) {
		const nextAnchor = $splitAtPointCaretNext(insertCaret);
		if (!nextAnchor) return;
		insertCaret = nextAnchor;
	}
	const focus = insertCaret.getFlipped();
	focus.insert(node);
	$setSelectionFromCaretRange($getCaretRange(focus, focus));
}
/**
* Wraps the node into another node created from a createElementNode function, eg. $createParagraphNode
* @param node - Node to be wrapped.
* @param createElementNode - Creates a new lexical element to wrap the to-be-wrapped node and returns it.
* @returns A new lexical element with the previous node appended within (as a child, including its children).
*/
function $wrapNodeInElement(node, createElementNode) {
	const elementNode = createElementNode();
	node.replace(elementNode);
	elementNode.append(node);
	return elementNode;
}
/**
* @param object = The instance of the type
* @param objectClass = The class of the type
* @returns Whether the object is has the same Klass of the objectClass, ignoring the difference across window (e.g. different iframes)
*/
function objectKlassEquals(object, objectClass) {
	if (object == null) return false;
	const prototype = Object.getPrototypeOf(object);
	if (prototype == null || prototype.constructor == null) return false;
	return prototype.constructor.name === objectClass.name;
}
function eventFiles(event) {
	let dataTransfer = null;
	if (objectKlassEquals(event, DragEvent)) dataTransfer = event.dataTransfer;
	else if (objectKlassEquals(event, ClipboardEvent)) dataTransfer = event.clipboardData;
	if (dataTransfer === null) return [
		false,
		[],
		false
	];
	const types = dataTransfer.types;
	const hasFiles = types.includes("Files");
	const hasContent = types.includes("text/html") || types.includes("text/plain");
	return [
		hasFiles,
		Array.from(dataTransfer.files),
		hasContent
	];
}
/**
* Applies the provided callback to each indentable block element in the Selection
*
* @param indentOrOutdent callback for performing the indent or outdent action
* on a given block element.
* @returns true if at least one block was handled, false otherwise.
*/
function $handleIndentAndOutdent(indentOrOutdent) {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return false;
	const alreadyHandled = /* @__PURE__ */ new Set();
	const nodes = selection.getNodes();
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const key = node.getKey();
		if (alreadyHandled.has(key)) continue;
		const parentBlock = $findMatchingParent(node, (parentNode) => $isElementNode(parentNode) && !parentNode.isInline());
		if (parentBlock === null) continue;
		const parentKey = parentBlock.getKey();
		if (parentBlock.canIndent() && !alreadyHandled.has(parentKey)) {
			alreadyHandled.add(parentKey);
			indentOrOutdent(parentBlock);
		}
	}
	return alreadyHandled.size > 0;
}
/**
* Appends the node before the first child of the parent node
* @param parent A parent node
* @param node Node that needs to be appended
*/
function $insertFirst(parent, node) {
	$getChildCaret(parent, "next").insert(node);
}
var NEEDS_MANUAL_ZOOM = IS_FIREFOX || !CAN_USE_DOM ? false : void 0;
function needsManualZoom() {
	if (NEEDS_MANUAL_ZOOM === void 0) {
		const div = document.createElement("div");
		div.style.position = "absolute";
		div.style.opacity = "0";
		div.style.width = "100px";
		div.style.left = "-1000px";
		document.body.appendChild(div);
		const noZoom = div.getBoundingClientRect();
		div.style.setProperty("zoom", "2");
		NEEDS_MANUAL_ZOOM = div.getBoundingClientRect().width === noZoom.width;
		document.body.removeChild(div);
	}
	return NEEDS_MANUAL_ZOOM;
}
/**
* Calculates the zoom level of an element as a result of using
* css zoom property. For browsers that implement standardized CSS
* zoom (Firefox, Chrome >= 128), this will always return 1.
* @param element
* @param useManualZoom - If true, always use zoom level will be calculated manually, otherwise it will be calculated on as needed basis.
*/
function calculateZoomLevel(element, useManualZoom = false) {
	let zoom = 1;
	if (needsManualZoom() || useManualZoom) {
		const win = element && element.ownerDocument.defaultView || window;
		while (element) {
			zoom *= Number(win.getComputedStyle(element).getPropertyValue("zoom"));
			element = getParentElement(element);
		}
	}
	return zoom;
}
/**
* Checks if the editor is a nested editor created by LexicalNestedComposer
*/
function $isEditorIsNestedEditor(editor) {
	return editor._parentEditor !== null;
}
/**
* A depth first last-to-first traversal of root that stops at each node that matches
* $predicate and ensures that its parent is root. This is typically used to discard
* invalid or unsupported wrapping nodes. For example, a TableNode must only have
* TableRowNode as children, but an importer might add invalid nodes based on
* caption, tbody, thead, etc. and this will unwrap and discard those.
*
* @param root The root to start the traversal
* @param $predicate Should return true for nodes that are permitted to be children of root
* @returns true if this unwrapped or removed any nodes
*/
function $unwrapAndFilterDescendants(root, $predicate) {
	return $unwrapAndFilterDescendantsImpl(root, $predicate, null);
}
function $unwrapAndFilterDescendantsImpl(root, $predicate, $onSuccess) {
	let didMutate = false;
	for (const node of $lastToFirstIterator(root)) {
		if ($predicate(node)) {
			if ($onSuccess !== null) $onSuccess(node);
			continue;
		}
		didMutate = true;
		if ($isElementNode(node)) $unwrapAndFilterDescendantsImpl(node, $predicate, $onSuccess || ((child) => node.insertAfter(child)));
		node.remove();
	}
	return didMutate;
}
/**
* A depth first traversal of the children array that stops at and collects
* each node that `$predicate` matches. This is typically used to discard
* invalid or unsupported wrapping nodes on a children array in the `after`
* of an {@link lexical!DOMConversionOutput}. For example, a TableNode must only have
* TableRowNode as children, but an importer might add invalid nodes based on
* caption, tbody, thead, etc. and this will unwrap and discard those.
*
* This function is read-only and performs no mutation operations, which makes
* it suitable for import and export purposes but likely not for any in-place
* mutation. You should use {@link $unwrapAndFilterDescendants} for in-place
* mutations such as node transforms.
*
* @param children The children to traverse
* @param $predicate Should return true for nodes that are permitted to be children of root
* @returns The children or their descendants that match $predicate
*/
function $descendantsMatching(children, $predicate) {
	const result = [];
	const stack = Array.from(children).reverse();
	for (let child = stack.pop(); child !== void 0; child = stack.pop()) if ($predicate(child)) result.push(child);
	else if ($isElementNode(child)) for (const grandchild of $lastToFirstIterator(child)) stack.push(grandchild);
	return result;
}
/**
* Return an iterator that yields each child of node from last to first, taking
* care to preserve the previous sibling before yielding the value in case the caller
* removes the yielded node.
*
* @param node The node whose children to iterate
* @returns An iterator of the node's children
*/
function $lastToFirstIterator(node) {
	return $childIterator($getChildCaret(node, "previous"));
}
function $childIterator(startCaret) {
	const seen = /* @__PURE__ */ new Set();
	return makeStepwiseIterator({
		hasNext: $isSiblingCaret,
		initial: startCaret.getAdjacentCaret(),
		map: (caret) => {
			const origin = caret.origin.getLatest();
			if (seen !== null) {
				const key = origin.getKey();
				if (!!seen.has(key)) formatDevErrorMessage$2(`$childIterator: Cycle detected, node with key ${String(key)} has already been traversed`);
				seen.add(key);
			}
			return origin;
		},
		step: (caret) => caret.getAdjacentCaret()
	});
}
/**
* Replace this node with its children
*
* @param node The ElementNode to unwrap and remove
*/
function $unwrapNode(node) {
	$rewindSiblingCaret($getSiblingCaret(node, "next")).splice(1, node.getChildren());
}
/**
* Inserts a new paragraph before a container node when the cursor moves outside the container element
*
* Intended for use ArrowLeft/ArrowUp keyboard handlers to allow the user to break out
* of a container node by creating a new paragraph before it.
*
* A paragraph is inserted if that the cursor is positioned at the beginning inside the container,
* and the container itself is the first element in the document and has no preceding sibling
*
* When a paragraph is inserted the selection is moved to it and, if the
* triggering keyboard event is provided, its default action is prevented so
* the browser does not additionally move the selection. Relying on the native
* caret movement is not portable: Chromium moves into the freshly inserted
* paragraph while Firefox leaves the caret inside the container.
*
* @param $isContainerNode - Type guard identifying the container node type to escape from.
* @param event - The keyboard event that triggered the escape, if any. Its
*   default action is prevented when a paragraph is inserted.
* @returns `true` if a paragraph was inserted, `false` otherwise.
*/
function $onEscapeUp($isContainerNode, event) {
	const selection = $getSelection();
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		const containerNode = $findMatchingParent(selection.anchor.getNode(), $isContainerNode);
		if (containerNode) {
			const parent = containerNode.getParent();
			if (parent !== null && parent.getFirstChild() === containerNode && $isAtStartOfNode(selection.anchor, containerNode)) {
				containerNode.insertBefore($createParagraphNode()).selectEnd();
				if (event) event.preventDefault();
				return true;
			}
		}
	}
	return false;
}
/**
* Inserts a new paragraph after a container node when the cursor moves outside the container element
*
* Intended for use ArrowRight/ArrowDown keyboard handlers to allow the user to break out
* of a container node by creating a new paragraph after it.
*
* A paragraph is inserted if that the cursor is positioned at the ending inside the container,
* and the container itself is the last element in the document and has no next sibling
*
* When a paragraph is inserted the selection is moved to it and, if the
* triggering keyboard event is provided, its default action is prevented so
* the browser does not additionally move the selection. Relying on the native
* caret movement is not portable: Chromium moves into the freshly inserted
* paragraph while Firefox leaves the caret inside the container.
*
* @param $isContainerNode - Type guard identifying the container node type to escape from.
* @param event - The keyboard event that triggered the escape, if any. Its
*   default action is prevented when a paragraph is inserted.
* @returns `true` if a paragraph was inserted, `false` otherwise.
*/
function $onEscapeDown($isContainerNode, event) {
	const selection = $getSelection();
	if ($isRangeSelection(selection) && selection.isCollapsed()) {
		const containerNode = $findMatchingParent(selection.anchor.getNode(), $isContainerNode);
		if (containerNode) {
			const parent = containerNode.getParent();
			if (parent !== null && parent.getLastChild() === containerNode && $isAtEndOfNode(selection.anchor, containerNode)) {
				containerNode.insertAfter($createParagraphNode()).selectEnd();
				if (event) event.preventDefault();
				return true;
			}
		}
	}
	return false;
}
/**
* Whether the collapsed `point` sits at the very start of `node`'s content —
* on its first descendant (or on the empty node itself) at offset 0. Shared by
* {@link $onEscapeUp} and slot-aware variants so the "at the leading edge of a
* container" test stays in one place.
*/
function $isAtStartOfNode(point, node) {
	return $isAtEdgeOfElement(point, node, "previous");
}
/**
* Whether the collapsed `point` sits at the very end of `node`'s content — on
* its last descendant (or on the empty node itself) at that node's end. Shared
* by {@link $onEscapeDown} and slot-aware variants so the "at the trailing edge
* of a container" test stays in one place.
*/
function $isAtEndOfNode(point, node) {
	return $isAtEdgeOfElement(point, node, "next");
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionConfig.dev.js
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
* Get the sets of nodes and types registered in the
* {@link InitialEditorConfig}. This is to be used when an extension
* needs to register optional behavior if some node or type is present.
*
* @param config The InitialEditorConfig (accessible from an extension's init)
* @returns The known types and nodes as Sets
*/
function getKnownTypesAndNodes(config) {
	const types = /* @__PURE__ */ new Set();
	const nodes = /* @__PURE__ */ new Set();
	for (const klassOrReplacement of getNodeConfig(config)) {
		const klass = typeof klassOrReplacement === "function" ? klassOrReplacement : klassOrReplacement.replace;
		getStaticNodeConfig(klass);
		types.add(klass.getType());
		nodes.add(klass);
	}
	return {
		nodes,
		types
	};
}
function getNodeConfig(config) {
	return (typeof config.nodes === "function" ? config.nodes() : config.nodes) || [];
}
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionInitialStateExtension.dev.js
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
var HISTORY_MERGE_OPTIONS = { tag: HISTORY_MERGE_TAG };
function $defaultInitializer() {
	const root = $getRoot();
	if (root.isEmpty()) root.append($createParagraphNode());
}
/**
* An extension to set the initial state of the editor from
* a function or serialized JSON EditorState. This is
* implicitly included with all editors built with
* Lexical Extension. This happens in the `afterRegistration`
* phase so your initial state may depend on registered commands,
* but you should not call `editor.setRootElement` earlier than
* this phase to avoid rendering an empty editor first.
*/
var InitialStateExtension = {
	config: {
		setOptions: HISTORY_MERGE_OPTIONS,
		updateOptions: HISTORY_MERGE_OPTIONS
	},
	init({ $initialEditorState = $defaultInitializer }) {
		return {
			$initialEditorState,
			initialized: false
		};
	},
	afterRegistration(editor, { updateOptions, setOptions }, state) {
		const initResult = state.getInitResult();
		if (!initResult.initialized) {
			initResult.initialized = true;
			const { $initialEditorState } = initResult;
			if ($isEditorState($initialEditorState)) editor.setEditorState($initialEditorState, setOptions);
			else if (typeof $initialEditorState === "function") editor.update(() => {
				$initialEditorState(editor);
			}, updateOptions);
			else if ($initialEditorState && (typeof $initialEditorState === "string" || typeof $initialEditorState === "object")) {
				const parsedEditorState = editor.parseEditorState($initialEditorState);
				editor.setEditorState(parsedEditorState, setOptions);
			}
		}
		return () => {};
	},
	name: "@lexical/extension/InitialState",
	nodes: [
		RootNode,
		TextNode,
		LineBreakNode,
		TabNode,
		ParagraphNode
	]
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionLexicalBuilder.dev.js
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
/**
* `"0.52.0+dev.esm"` is statically replaced with the build-specific
* version string in a Rollup build, and a consumer's bundler `define` can
* inject it the same way — so the exact `"0.52.0+dev.esm"` member
* expression must be preserved for that substitution to match. Reading it
* inside a try/catch lets the source be consumed directly (via the `source`
* export condition) in a browser bundle, where `process` is undefined and
* nothing replaced the reference, without throwing a ReferenceError; it falls
* back to the literal below instead. The literal is regenerated by
* `pnpm run update-version`.
*
* The read lives in a function rather than at module scope because a
* module-scope `try` statement is retained by every bundler, and with it
* everything the module exports; a call to a function declared side-effect
* free is annotated by the build and dropped when its result is unused.
*
* @__NO_SIDE_EFFECTS__
*/
function readLexicalVersion() {
	let envLexicalVersion;
	try {
		envLexicalVersion = "0.52.0+dev.esm";
	} catch {}
	return envLexicalVersion ?? "\"<unknown>+source\"";
}
var LEXICAL_VERSION = /* @__PURE__ */ readLexicalVersion();
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
/**
* Recursively merge the given theme configuration in-place.
*
* @returns If `a` and `b` are both objects (and `b` is not an Array) then
* all keys in `b` are merged into `a` then `a` is returned.
* Otherwise `b` is returned.
*
* @example
* ```ts
* const a = { a: "a", nested: { a: 1 } };
* const b = { b: "b", nested: { b: 2 } };
* const rval = deepThemeMergeInPlace(a, b);
* expect(a).toBe(rval);
* expect(a).toEqual({ a: "a", b: "b", nested: { a: 1, b: 2 } });
* ```
*/
var UNSAFE_KEYS = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
function deepThemeMergeInPlace(a, b) {
	if (a && b && !Array.isArray(b) && typeof a === "object" && typeof b === "object") {
		const aObj = a;
		const bObj = b;
		for (const k in bObj) {
			if (UNSAFE_KEYS.has(k) || !Object.prototype.hasOwnProperty.call(bObj, k)) continue;
			aObj[k] = deepThemeMergeInPlace(aObj[k], bObj[k]);
		}
		return a;
	}
	return b;
}
var ExtensionRepStateIds = {
	unmarked: 0,
	temporary: 1,
	permanent: 2,
	configured: 3,
	initialized: 4,
	built: 5,
	registered: 6,
	afterRegistration: 7
};
function isExactlyUnmarkedExtensionRepState(state) {
	return state.id === ExtensionRepStateIds.unmarked;
}
function isExactlyTemporaryExtensionRepState(state) {
	return state.id === ExtensionRepStateIds.temporary;
}
function isExactlyPermanentExtensionRepState(state) {
	return state.id === ExtensionRepStateIds.permanent;
}
function isConfiguredExtensionRepState(state) {
	return state.id >= ExtensionRepStateIds.configured;
}
function isInitializedExtensionRepState(state) {
	return state.id >= ExtensionRepStateIds.initialized;
}
function isBuiltExtensionRepState(state) {
	return state.id >= ExtensionRepStateIds.built;
}
function isAfterRegistrationState(state) {
	return state.id >= ExtensionRepStateIds.afterRegistration;
}
function applyTemporaryMark(state) {
	if (!isExactlyUnmarkedExtensionRepState(state)) formatDevErrorMessage$1(`LexicalBuilder: Can not apply a temporary mark from state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.unmarked)} unmarked)`);
	return Object.assign(state, { id: ExtensionRepStateIds.temporary });
}
function applyPermanentMark(state) {
	if (!isExactlyTemporaryExtensionRepState(state)) formatDevErrorMessage$1(`LexicalBuilder: Can not apply a permanent mark from state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.temporary)} temporary)`);
	return Object.assign(state, { id: ExtensionRepStateIds.permanent });
}
function applyConfiguredState(state, config, registerState) {
	return Object.assign(state, {
		config,
		id: ExtensionRepStateIds.configured,
		registerState
	});
}
function applyInitializedState(state, initResult, registerState) {
	return Object.assign(state, {
		id: ExtensionRepStateIds.initialized,
		initResult,
		registerState
	});
}
function applyBuiltState(state, output, registerState) {
	return Object.assign(state, {
		id: ExtensionRepStateIds.built,
		output,
		registerState
	});
}
function applyRegisteredState(state) {
	return Object.assign(state, { id: ExtensionRepStateIds.registered });
}
function applyAfterRegistrationState(state) {
	return Object.assign(state, { id: ExtensionRepStateIds.afterRegistration });
}
function rollbackToBuiltState(state) {
	return Object.assign(state, { id: ExtensionRepStateIds.built });
}
var emptySet = /* @__PURE__ */ new Set();
/**
* @internal
*/
var ExtensionRep = class {
	builder;
	configs;
	_dependency;
	_peerNameSet;
	extension;
	state;
	_signal;
	constructor(builder, extension) {
		this.builder = builder;
		this.extension = extension;
		this.configs = /* @__PURE__ */ new Set();
		this.state = { id: ExtensionRepStateIds.unmarked };
	}
	mergeConfigs() {
		let config = this.extension.config || {};
		const mergeConfig = this.extension.mergeConfig ? this.extension.mergeConfig.bind(this.extension) : shallowMergeConfig;
		for (const cfg of this.configs) config = mergeConfig(config, cfg);
		return config;
	}
	init(editorConfig) {
		const initialState = this.state;
		if (!isExactlyPermanentExtensionRepState(initialState)) formatDevErrorMessage$1(`ExtensionRep: Can not configure from state id ${String(initialState.id)}`);
		const initState = {
			getDependency: this.getInitDependency.bind(this),
			getDirectDependentNames: this.getDirectDependentNames.bind(this),
			getPeer: this.getInitPeer.bind(this),
			getPeerNameSet: this.getPeerNameSet.bind(this)
		};
		const buildState = {
			...initState,
			getDependency: this.getDependency.bind(this),
			getInitResult: this.getInitResult.bind(this),
			getPeer: this.getPeer.bind(this)
		};
		const state = applyConfiguredState(initialState, this.mergeConfigs(), initState);
		this.state = state;
		let initResult;
		if (this.extension.init) initResult = this.extension.init(editorConfig, state.config, initState);
		this.state = applyInitializedState(state, initResult, buildState);
	}
	build(editor) {
		const state = this.state;
		if (!(state.id === ExtensionRepStateIds.initialized)) formatDevErrorMessage$1(`ExtensionRep: register called in state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.built)} initialized)`);
		let output;
		if (this.extension.build) output = this.extension.build(editor, state.config, state.registerState);
		const registerState = {
			...state.registerState,
			getOutput: () => output,
			getSignal: this.getSignal.bind(this)
		};
		this.state = applyBuiltState(state, output, registerState);
	}
	register(editor, signal) {
		this._signal = signal;
		const state = this.state;
		if (!(state.id === ExtensionRepStateIds.built)) formatDevErrorMessage$1(`ExtensionRep: register called in state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.built)} built)`);
		const cleanup = this.extension.register && this.extension.register(editor, state.config, state.registerState);
		this.state = applyRegisteredState(state);
		return () => {
			const afterRegistrationState = this.state;
			if (!(afterRegistrationState.id === ExtensionRepStateIds.afterRegistration)) formatDevErrorMessage$1(`ExtensionRep: rollbackToBuiltState called in state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.afterRegistration)} afterRegistration)`);
			this.state = rollbackToBuiltState(afterRegistrationState);
			if (cleanup) cleanup();
		};
	}
	afterRegistration(editor) {
		const state = this.state;
		if (!(state.id === ExtensionRepStateIds.registered)) formatDevErrorMessage$1(`ExtensionRep: afterRegistration called in state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.registered)} registered)`);
		let rval;
		if (this.extension.afterRegistration) rval = this.extension.afterRegistration(editor, state.config, state.registerState);
		this.state = applyAfterRegistrationState(state);
		return rval;
	}
	getSignal() {
		if (!(this._signal !== void 0)) formatDevErrorMessage$1(`ExtensionRep.getSignal() called before register`);
		return this._signal;
	}
	getInitResult() {
		if (!(this.extension.init !== void 0)) formatDevErrorMessage$1(`ExtensionRep: getInitResult() called for Extension ${this.extension.name} that does not define init`);
		const state = this.state;
		if (!isInitializedExtensionRepState(state)) formatDevErrorMessage$1(`ExtensionRep: getInitResult() called for ExtensionRep in state id ${String(state.id)} < ${String(ExtensionRepStateIds.initialized)} (initialized)`);
		return state.initResult;
	}
	getInitPeer(name) {
		const rep = this.builder.extensionNameMap.get(name);
		return rep ? rep.getExtensionInitDependency() : void 0;
	}
	getExtensionInitDependency() {
		const state = this.state;
		if (!isConfiguredExtensionRepState(state)) formatDevErrorMessage$1(`ExtensionRep: getExtensionInitDependency called in state id ${String(state.id)} (expected >= ${String(ExtensionRepStateIds.configured)} configured)`);
		return { config: state.config };
	}
	getPeer(name) {
		const rep = this.builder.extensionNameMap.get(name);
		return rep ? rep.getExtensionDependency() : void 0;
	}
	getInitDependency(dep) {
		const rep = this.builder.getExtensionRep(dep);
		if (!(rep !== void 0)) formatDevErrorMessage$1(`LexicalExtensionBuilder: Extension ${this.extension.name} missing dependency extension ${dep.name} to be in registry`);
		return rep.getExtensionInitDependency();
	}
	getDependency(dep) {
		const rep = this.builder.getExtensionRep(dep);
		if (!(rep !== void 0)) formatDevErrorMessage$1(`LexicalExtensionBuilder: Extension ${this.extension.name} missing dependency extension ${dep.name} to be in registry`);
		return rep.getExtensionDependency();
	}
	getState() {
		const state = this.state;
		if (!isAfterRegistrationState(state)) formatDevErrorMessage$1(`ExtensionRep getState called in state id ${String(state.id)} (expected ${String(ExtensionRepStateIds.afterRegistration)} afterRegistration)`);
		return state;
	}
	getDirectDependentNames() {
		return this.builder.incomingEdges.get(this.extension.name) || emptySet;
	}
	getPeerNameSet() {
		let s = this._peerNameSet;
		if (!s) {
			s = new Set((this.extension.peerDependencies || []).map(([name]) => name));
			this._peerNameSet = s;
		}
		return s;
	}
	getExtensionDependency() {
		if (!this._dependency) {
			const state = this.state;
			if (!isBuiltExtensionRepState(state)) formatDevErrorMessage$1(`Extension ${this.extension.name} used as a dependency before build`);
			this._dependency = {
				config: state.config,
				init: state.initResult,
				output: state.output
			};
		}
		return this._dependency;
	}
};
/** @internal Use a well-known symbol for dev tools purposes */
var builderSymbol = Symbol.for("@lexical/extension/LexicalBuilder");
/**
* Build a LexicalEditor by combining together one or more extensions, optionally
* overriding some of their configuration.
*
* @param extensions - Extension arguments (extensions or extensions with config overrides)
* @returns An editor handle
*
* @example
* A single root extension with multiple dependencies
*
* ```ts
* const editor = buildEditorFromExtensions(
*   defineExtension({
*     name: "[root]",
*     dependencies: [
*       RichTextExtension,
*       configExtension(EmojiExtension, { emojiBaseUrl: "/assets/emoji" }),
*     ],
*     register: (editor: LexicalEditor) => {
*       console.log("Editor Created");
*       return () => console.log("Editor Disposed");
*     },
*   }),
* );
* ```
*
* @example
* A very similar minimal configuration without the register hook
*
* ```ts
* const editor = buildEditorFromExtensions(
*   RichTextExtension,
*   configExtension(EmojiExtension, { emojiBaseUrl: "/assets/emoji" }),
* );
* ```
*/
function buildEditorFromExtensions(...extensions) {
	return LexicalBuilder.fromExtensions(extensions).buildEditor();
}
/** @internal */
function noop() {}
/** Throw the given Error */
function defaultOnError(err) {
	throw err;
}
/** @internal */
function maybeWithBuilder(editor) {
	return editor;
}
function normalizeExtensionArgument(arg) {
	return Array.isArray(arg) ? arg : [arg];
}
var PACKAGE_VERSION = LEXICAL_VERSION;
/** @internal */
var LexicalBuilder = class LexicalBuilder {
	roots;
	extensionNameMap;
	outgoingConfigEdges;
	incomingEdges;
	conflicts;
	_sortedExtensionReps;
	PACKAGE_VERSION;
	constructor(roots) {
		this.outgoingConfigEdges = /* @__PURE__ */ new Map();
		this.incomingEdges = /* @__PURE__ */ new Map();
		this.extensionNameMap = /* @__PURE__ */ new Map();
		this.conflicts = /* @__PURE__ */ new Map();
		this.PACKAGE_VERSION = PACKAGE_VERSION;
		this.roots = roots;
		for (const extension of roots) this.addExtension(extension);
	}
	static fromExtensions(extensions) {
		const roots = [normalizeExtensionArgument(InitialStateExtension)];
		for (const extension of extensions) roots.push(normalizeExtensionArgument(extension));
		return new LexicalBuilder(roots);
	}
	static maybeFromEditor(editor) {
		const builder = maybeWithBuilder(editor)[builderSymbol];
		if (builder) {
			if (!(builder.PACKAGE_VERSION === PACKAGE_VERSION)) formatDevErrorMessage$1(`LexicalBuilder.fromEditor: The given editor was created with LexicalBuilder ${builder.PACKAGE_VERSION} but this version is ${PACKAGE_VERSION}. A project should have exactly one copy of LexicalBuilder`);
			if (!(builder instanceof LexicalBuilder)) formatDevErrorMessage$1(`LexicalBuilder.fromEditor: There are multiple copies of the same version of LexicalBuilder in your project, and this editor was created with another one. Your project, or one of its dependencies, has its package.json and/or bundler configured incorrectly.`);
		}
		return builder;
	}
	/** Look up the editor that was created by this LexicalBuilder or throw */
	static fromEditor(editor) {
		const builder = LexicalBuilder.maybeFromEditor(editor);
		if (!(builder !== void 0)) formatDevErrorMessage$1(`LexicalBuilder.fromEditor: The given editor was not created with LexicalBuilder`);
		return builder;
	}
	constructEditor() {
		const { $initialEditorState: _$initialEditorState, onError, onWarn, ...editorConfig } = this.buildCreateEditorArgs();
		const editor = Object.assign(createEditor({
			...editorConfig,
			...onError ? { onError: (err) => {
				onError(err, editor);
			} } : {},
			...onWarn ? { onWarn: (err) => {
				onWarn(err, editor);
			} } : {}
		}), { [builderSymbol]: this });
		for (const extensionRep of this.sortedExtensionReps()) extensionRep.build(editor);
		return editor;
	}
	buildEditor() {
		let disposeOnce = noop;
		function dispose() {
			try {
				disposeOnce();
			} finally {
				disposeOnce = noop;
			}
		}
		const editor = Object.assign(this.constructEditor(), {
			dispose,
			[Symbol.dispose]: dispose
		});
		disposeOnce = mergeRegister(this.registerEditor(editor), () => editor.setRootElement(null));
		return editor;
	}
	hasExtensionByName(name) {
		return this.extensionNameMap.has(name);
	}
	getExtensionRep(extension) {
		const rep = this.extensionNameMap.get(extension.name);
		if (rep) {
			if (!(rep.extension === extension)) formatDevErrorMessage$1(`LexicalBuilder: A registered extension with name ${extension.name} exists but does not match the given extension`);
			return rep;
		}
	}
	/**
	* @param configs - Ownership passes to the builder, which retains the array
	*   and may append to it. Callers must pass an array nobody else holds.
	*/
	addEdge(fromExtensionName, toExtensionName, configs) {
		const outgoing = this.outgoingConfigEdges.get(fromExtensionName);
		if (outgoing) {
			const existing = outgoing.get(toExtensionName);
			if (existing) existing.push(...configs);
			else outgoing.set(toExtensionName, configs);
		} else this.outgoingConfigEdges.set(fromExtensionName, /* @__PURE__ */ new Map([[toExtensionName, configs]]));
		const incoming = this.incomingEdges.get(toExtensionName);
		if (incoming) incoming.add(fromExtensionName);
		else this.incomingEdges.set(toExtensionName, /* @__PURE__ */ new Set([fromExtensionName]));
	}
	addExtension(arg) {
		if (!(this._sortedExtensionReps === void 0)) formatDevErrorMessage$1(`LexicalBuilder: addExtension called after finalization`);
		const [extension] = normalizeExtensionArgument(arg);
		if (!(typeof extension.name === "string")) formatDevErrorMessage$1(`LexicalBuilder: extension name must be string, not ${typeof extension.name}`);
		let extensionRep = this.extensionNameMap.get(extension.name);
		if (!(extensionRep === void 0 || extensionRep.extension === extension)) formatDevErrorMessage$1(`LexicalBuilder: Multiple extensions registered with name ${extension.name}, names must be unique`);
		if (!extensionRep) {
			extensionRep = new ExtensionRep(this, extension);
			this.extensionNameMap.set(extension.name, extensionRep);
			const hasConflict = this.conflicts.get(extension.name);
			if (typeof hasConflict === "string") formatDevErrorMessage$1(`LexicalBuilder: extension ${extension.name} conflicts with ${hasConflict}`);
			for (const name of extension.conflictsWith || []) {
				if (!!this.extensionNameMap.has(name)) formatDevErrorMessage$1(`LexicalBuilder: extension ${extension.name} conflicts with ${name}`);
				this.conflicts.set(name, extension.name);
			}
			for (const dep of extension.dependencies || []) {
				const normDep = normalizeExtensionArgument(dep);
				this.addEdge(extension.name, normDep[0].name, normDep.slice(1));
				this.addExtension(normDep);
			}
			for (const [depName, config] of extension.peerDependencies || []) this.addEdge(extension.name, depName, config ? [config] : []);
		}
	}
	sortedExtensionReps() {
		if (this._sortedExtensionReps) return this._sortedExtensionReps;
		const sortedExtensionReps = [];
		const visit = (rep, fromExtensionName) => {
			let mark = rep.state;
			if (isExactlyPermanentExtensionRepState(mark)) return;
			const extensionName = rep.extension.name;
			if (!isExactlyUnmarkedExtensionRepState(mark)) formatDevErrorMessage$1(`LexicalBuilder: Circular dependency detected for Extension ${extensionName} from ${fromExtensionName || "[unknown]"}`);
			mark = applyTemporaryMark(mark);
			rep.state = mark;
			const outgoingConfigEdges = this.outgoingConfigEdges.get(extensionName);
			if (outgoingConfigEdges) for (const toExtensionName of outgoingConfigEdges.keys()) {
				const toRep = this.extensionNameMap.get(toExtensionName);
				if (toRep) visit(toRep, extensionName);
			}
			mark = applyPermanentMark(mark);
			rep.state = mark;
			sortedExtensionReps.push(rep);
		};
		for (const rep of this.extensionNameMap.values()) if (isExactlyUnmarkedExtensionRepState(rep.state)) visit(rep);
		for (const rep of sortedExtensionReps) for (const [toExtensionName, configs] of this.outgoingConfigEdges.get(rep.extension.name) || []) if (configs.length > 0) {
			const toRep = this.extensionNameMap.get(toExtensionName);
			if (toRep) for (const config of configs) toRep.configs.add(config);
		}
		for (const [extension, ...configs] of this.roots) if (configs.length > 0) {
			const toRep = this.extensionNameMap.get(extension.name);
			if (!(toRep !== void 0)) formatDevErrorMessage$1(`LexicalBuilder: Expecting existing ExtensionRep for ${extension.name}`);
			for (const config of configs) toRep.configs.add(config);
		}
		this._sortedExtensionReps = sortedExtensionReps;
		return this._sortedExtensionReps;
	}
	registerEditor(editor) {
		const extensionReps = this.sortedExtensionReps();
		const controller = new AbortController();
		const cleanups = [() => controller.abort()];
		const signal = controller.signal;
		for (const extensionRep of extensionReps) {
			const cleanup = extensionRep.register(editor, signal);
			if (cleanup) cleanups.push(cleanup);
		}
		for (const extensionRep of extensionReps) {
			const cleanup = extensionRep.afterRegistration(editor);
			if (cleanup) cleanups.push(cleanup);
		}
		return mergeRegister(...cleanups);
	}
	buildCreateEditorArgs() {
		const config = {};
		const nodes = /* @__PURE__ */ new Set();
		const replacedNodes = /* @__PURE__ */ new Map();
		const htmlExport = /* @__PURE__ */ new Map();
		const htmlImport = {};
		const theme = {};
		const extensionReps = this.sortedExtensionReps();
		for (const extensionRep of extensionReps) {
			const { extension } = extensionRep;
			if (extension.onError !== void 0) config.onError = extension.onError;
			if (extension.onWarn !== void 0) config.onWarn = extension.onWarn;
			if (extension.disableEvents !== void 0) config.disableEvents = extension.disableEvents;
			if (extension.parentEditor !== void 0) config.parentEditor = extension.parentEditor;
			if (extension.editable !== void 0) config.editable = extension.editable;
			if (extension.namespace !== void 0) config.namespace = extension.namespace;
			if (extension.$initialEditorState !== void 0) config.$initialEditorState = extension.$initialEditorState;
			if (extension.nodes) for (const node of getNodeConfig(extension)) {
				if (typeof node !== "function") {
					const conflictExtension = replacedNodes.get(node.replace);
					if (conflictExtension) formatDevErrorMessage$1(`LexicalBuilder: Extension ${extension.name} can not register replacement for node ${node.replace.name} because ${conflictExtension.extension.name} already did`);
					replacedNodes.set(node.replace, extensionRep);
				}
				nodes.add(node);
			}
			if (extension.html) {
				if (extension.html.export) for (const [k, v] of extension.html.export.entries()) htmlExport.set(k, v);
				if (extension.html.import) Object.assign(htmlImport, extension.html.import);
			}
			if (extension.theme) deepThemeMergeInPlace(theme, extension.theme);
		}
		if (Object.keys(theme).length > 0) config.theme = theme;
		if (nodes.size) config.nodes = Array.from(nodes);
		const hasImport = Object.keys(htmlImport).length > 0;
		const hasExport = htmlExport.size > 0;
		if (hasImport || hasExport) {
			config.html = {};
			if (hasImport) config.html.import = htmlImport;
			if (hasExport) config.html.export = htmlExport;
		}
		for (const extensionRep of extensionReps) extensionRep.init(config);
		if (!config.onError) config.onError = defaultOnError;
		return config;
	}
};
//#endregion
//#region ../lexical-extension/dist/LexicalExtensionGetExtensionDependencyFromEditor.dev.js
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
* Get the finalized config and output of an Extension that was used to build the editor.
*
* This is useful in the implementation of a LexicalNode or in other
* situations where you have an editor reference but it's not easy to
* pass the config or {@link ExtensionRegisterState} around.
*
* It will throw if the Editor was not built using this Extension.
*
* Inside an editor read/update, prefer {@link $getExtensionDependency} or
* {@link $getExtensionOutput} — they resolve the editor via `$getEditor()`
* so you don't have to thread it through.
*
* @param editor - The editor that was built using extension
* @param extension - The concrete reference to an Extension used to build this editor
* @returns The config and output for that Extension
*/
function getExtensionDependencyFromEditor(editor, extension) {
	const rep = LexicalBuilder.fromEditor(editor).getExtensionRep(extension);
	if (!(rep !== void 0)) formatDevErrorMessage(`getExtensionDependencyFromEditor: Extension ${extension.name} was not built when creating this editor`);
	return rep.getExtensionDependency();
}
//#endregion
export { objectKlassEquals as A, $shouldOverrideDefaultCharacterSelection as B, $unwrapNode as C, getScrollParent as D, eventFiles as E, $isParentElementRTL as F, watchedSignal as G, $trimTextContentFromAnchor as H, $isParentRTL as I, j as J, namedSignals as K, $moveCharacter as L, selectionAlwaysOnDisplay as M, $getSelectionStyleValueForProperty as N, isMimeType as O, $isAtNodeEnd as P, $patchStyleText as R, $unwrapAndFilterDescendants as S, calculateZoomLevel as T, createDOMRange as U, $sliceSelectedTextNodeContent as V, createRectsFromDOMRange as W, y as X, n as Y, $isAtStartOfNode as _, $descendantsMatching as a, $onEscapeUp as b, $dfsWithSlotsIterator as c, $getNextRightPreorderNode as d, $handleIndentAndOutdent as f, $isAtEndOfNode as g, $insertNodeToNearestRoot as h, getKnownTypesAndNodes as i, registerNestedElementResolver as j, mediaFileReader as k, $getNearestBlockElementAncestorOrThrow as l, $insertNodeIntoLeaf as m, LexicalBuilder as n, $dfs as o, $insertFirst as p, g as q, buildEditorFromExtensions as r, $dfsWithSlots as s, getExtensionDependencyFromEditor as t, $getNearestNodeOfType as u, $isEditorIsNestedEditor as v, $wrapNodeInElement as w, $restoreEditorState as x, $onEscapeDown as y, $setBlocksType as z };
