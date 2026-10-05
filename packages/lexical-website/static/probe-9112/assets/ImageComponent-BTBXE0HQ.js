import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { $t as $setSelection, An as DRAGSTART_COMMAND, Br as createCommand, Dt as $isRangeSelection, Hi as registerEventListener, Jr as getActiveElement, Pi as mergeRegister, Q as $getSelection, Tt as $isNodeSelection, Z as $getRoot, ar as KEY_ENTER_COMMAND, br as SELECTION_CHANGE_COMMAND, gn as CLICK_COMMAND, ln as BLUR_COMMAND, or as KEY_ESCAPE_COMMAND, q as $getNodeByKey, r as useLexicalComposerContext } from "./LexicalComposerContext.dev-CmGTZccv.js";
import { i as skipCollaborationInit, n as createWebsocketProvider, s as CollaborationPlugin } from "./ContentEditable-D6t5RD05.js";
import { r as useCollaborationContext } from "./LexicalCollaborationContextUtils.dev-ZncfwcJz.js";
import { $ as useLexicalEditable, it as $isImageNode, nt as useLexicalNodeSelection, rt as $isCaptionEditorEmpty, t as TreeViewPlugin, yt as useSettings } from "./main-BzFV8ErT.js";
import { t as ImageResizer } from "./ImageResizer-D5txpYRX.js";
import { t as LexicalExtensionEditorComposer } from "./LexicalExtensionEditorComposer.dev-EKgduCdO.js";
//#region src/images/image-broken.svg
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var image_broken_default = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M22%203H2v18h20v-2h-2v-2h2v-2h-2v-2h2v-2h-2V9h2V7h-2V5h2V3zm-2%204v2h-2v2h2v2h-2v2h2v2h-2v2H4V5h14v2h2zm-6%202h-2v2h-2v2H8v2H6v2h2v-2h2v-2h2v-2h2v2h2v-2h-2V9zM6%207h2v2H6V7z'%20fill='%23000000'/%3e%3c/svg%3e";
//#endregion
//#region src/nodes/ImageComponent.tsx
var import_jsx_runtime = require_jsx_runtime();
var imageCache = /* @__PURE__ */ new Map();
var RIGHT_CLICK_IMAGE_COMMAND = /* @__PURE__ */ createCommand("RIGHT_CLICK_IMAGE_COMMAND");
function DisableCaptionOnBlur({ setShowCaption }) {
	const [editor] = useLexicalComposerContext();
	(0, import_react.useEffect)(() => editor.registerCommand(BLUR_COMMAND, () => {
		if ($isCaptionEditorEmpty()) setShowCaption(false);
		return false;
	}, 0));
	return null;
}
function useSuspenseImage(src) {
	let cached = imageCache.get(src);
	if (cached && "error" in cached && typeof cached.error === "boolean") return cached;
	else if (!cached) {
		cached = new Promise((resolve) => {
			const img = new Image();
			img.src = src;
			img.onload = () => resolve({
				error: false,
				height: img.naturalHeight,
				width: img.naturalWidth
			});
			img.onerror = () => resolve({ error: true });
		}).then((rval) => {
			imageCache.set(src, rval);
			return rval;
		});
		imageCache.set(src, cached);
		throw cached;
	}
	throw cached;
}
function isSVG(src) {
	const lowerCaseSrc = src.toLowerCase();
	return lowerCaseSrc.endsWith(".svg") || lowerCaseSrc.startsWith("data:image/svg+xml");
}
function LazyImage({ altText, className, imageRef, src, width, height, maxWidth, onError }) {
	const status = useSuspenseImage(src);
	(0, import_react.useEffect)(() => {
		if (status.error) onError();
	}, [status.error, onError]);
	if (status.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrokenImage, {});
	const calculateDimensions = () => {
		if (width !== "inherit" && height !== "inherit") return {
			height,
			maxWidth,
			width
		};
		if (!isSVG(src)) return {
			height,
			maxWidth,
			width
		};
		const naturalWidth = status.width;
		const naturalHeight = status.height;
		let finalWidth = naturalWidth || maxWidth;
		let finalHeight = naturalHeight || finalWidth;
		if (finalWidth > maxWidth) {
			const scale = maxWidth / finalWidth;
			finalWidth = maxWidth;
			finalHeight = Math.round(finalHeight * scale);
		}
		const maxHeight = 500;
		if (finalHeight > maxHeight) {
			const scale = maxHeight / finalHeight;
			finalHeight = maxHeight;
			finalWidth = Math.round(finalWidth * scale);
		}
		return {
			height: finalHeight,
			maxWidth,
			width: finalWidth
		};
	};
	const imageStyle = calculateDimensions();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		className: className || void 0,
		src,
		alt: altText,
		ref: imageRef,
		style: imageStyle,
		onError,
		draggable: "false"
	});
}
function BrokenImage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: image_broken_default,
		style: {
			height: 200,
			opacity: .2,
			width: 200
		},
		draggable: "false",
		alt: "Broken image"
	});
}
function ImageComponent({ src, altText, nodeKey, width, height, maxWidth, resizable, showCaption, caption, captionsEnabled }) {
	const imageRef = (0, import_react.useRef)(null);
	const buttonRef = (0, import_react.useRef)(null);
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = (0, import_react.useState)(false);
	const { isCollabActive } = useCollaborationContext();
	const [editor] = useLexicalComposerContext();
	const activeEditorRef = (0, import_react.useRef)(null);
	const [isLoadError, setIsLoadError] = (0, import_react.useState)(false);
	const isEditable = useLexicalEditable();
	const isInNodeSelection = (0, import_react.useMemo)(() => isSelected && editor.read("latest", () => {
		const selection = $getSelection();
		return $isNodeSelection(selection) && selection.has(nodeKey);
	}), [
		editor,
		isSelected,
		nodeKey
	]);
	const $onEnter = (0, import_react.useCallback)((event) => {
		const latestSelection = $getSelection();
		const buttonElem = buttonRef.current;
		if ($isNodeSelection(latestSelection) && latestSelection.has(nodeKey) && latestSelection.getNodes().length === 1) {
			if (showCaption) {
				$setSelection(null);
				if (event !== null) event.preventDefault();
				caption.focus();
				return true;
			} else if (buttonElem !== null && buttonElem !== getActiveElement(buttonElem)) {
				if (event !== null) event.preventDefault();
				buttonElem.focus();
				return true;
			}
		}
		return false;
	}, [
		caption,
		nodeKey,
		showCaption
	]);
	const $onEscape = (0, import_react.useCallback)((event) => {
		if (activeEditorRef.current === caption || buttonRef.current === event.target) {
			$setSelection(null);
			editor.update(() => {
				setSelected(true);
				const parentRootElement = editor.getRootElement();
				if (parentRootElement !== null) parentRootElement.focus();
			});
			return true;
		}
		return false;
	}, [
		caption,
		editor,
		setSelected
	]);
	const onClick = (0, import_react.useCallback)((payload) => {
		const event = payload;
		if (isResizing) return true;
		if (event.target === imageRef.current) {
			if (event.shiftKey) setSelected(!isSelected);
			else {
				clearSelection();
				setSelected(true);
			}
			return true;
		}
		return false;
	}, [
		isResizing,
		isSelected,
		setSelected,
		clearSelection
	]);
	const onRightClick = (0, import_react.useCallback)((event) => {
		editor.read("latest", () => {
			const latestSelection = $getSelection();
			if (event.target.tagName === "IMG" && $isRangeSelection(latestSelection) && latestSelection.getNodes().length === 1) editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
		});
	}, [editor]);
	(0, import_react.useEffect)(() => {
		return mergeRegister(editor.registerCommand(SELECTION_CHANGE_COMMAND, (_, activeEditor) => {
			activeEditorRef.current = activeEditor;
			return false;
		}, 1), editor.registerCommand(DRAGSTART_COMMAND, (event) => {
			if (event.target === imageRef.current) {
				event.preventDefault();
				return true;
			}
			return false;
		}, 1));
	}, [editor]);
	(0, import_react.useEffect)(() => {
		return mergeRegister(editor.registerCommand(CLICK_COMMAND, onClick, 1), editor.registerCommand(RIGHT_CLICK_IMAGE_COMMAND, onClick, 1), editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, 1), editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, 1), editor.registerRootListener((rootElement) => {
			if (rootElement) return registerEventListener(rootElement, "contextmenu", onRightClick);
		}));
	}, [
		editor,
		$onEnter,
		$onEscape,
		onClick,
		onRightClick
	]);
	const setShowCaption = (show) => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setShowCaption(show);
				if (show) node.__caption.update(() => {
					if (!$getSelection()) $getRoot().selectEnd();
				});
			}
		});
	};
	const onResizeEnd = (nextWidth, nextHeight) => {
		setTimeout(() => {
			setIsResizing(false);
		}, 200);
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) node.setWidthAndHeight(nextWidth, nextHeight);
		});
	};
	const onResizeStart = () => {
		setIsResizing(true);
	};
	const { settings: { showNestedEditorTreeView } } = useSettings();
	const draggable = isInNodeSelection && !isResizing;
	const isFocused = (isSelected || isResizing) && isEditable;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				draggable,
				children: isLoadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrokenImage, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
					className: isFocused ? `focused ${isInNodeSelection ? "draggable" : ""}` : null,
					src,
					altText,
					imageRef,
					width,
					height,
					maxWidth,
					onError: () => setIsLoadError(true)
				})
			}),
			showCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-caption-container",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LexicalExtensionEditorComposer, {
					initialEditor: caption,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisableCaptionOnBlur, { setShowCaption }),
						isCollabActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationPlugin, {
							id: caption.getKey(),
							providerFactory: createWebsocketProvider,
							shouldBootstrap: !skipCollaborationInit,
							selectionHighlight: true
						}) : null,
						showNestedEditorTreeView === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeViewPlugin, {}) : null
					]
				})
			}),
			resizable && isInNodeSelection && isFocused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageResizer, {
				showCaption,
				setShowCaption,
				editor,
				buttonRef,
				imageRef,
				maxWidth,
				onResizeStart,
				onResizeEnd,
				captionsEnabled: !isLoadError && captionsEnabled
			})
		] })
	});
}
//#endregion
export { RIGHT_CLICK_IMAGE_COMMAND, ImageComponent as default };
