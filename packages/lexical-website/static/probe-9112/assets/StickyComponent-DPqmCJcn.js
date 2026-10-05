import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { T as calculateZoomLevel } from "./LexicalExtensionGetExtensionDependencyFromEditor.dev-5kBKX_Y_.js";
import { Hi as registerEventListener, Pi as mergeRegister, Ui as registerEventListeners, q as $getNodeByKey, r as useLexicalComposerContext } from "./LexicalComposerContext.dev-CmGTZccv.js";
import { i as skipCollaborationInit, n as createWebsocketProvider, s as CollaborationPlugin } from "./ContentEditable-D6t5RD05.js";
import { r as useCollaborationContext } from "./LexicalCollaborationContextUtils.dev-ZncfwcJz.js";
import { n as $isStickyNode } from "./main-1utKk6XK.js";
import { t as LexicalExtensionEditorComposer } from "./LexicalExtensionEditorComposer.dev-EKgduCdO.js";
//#region src/nodes/StickyComponent.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function positionSticky(stickyElem, positioning) {
	const style = stickyElem.style;
	const rootElementRect = positioning.rootElementRect;
	const rectLeft = rootElementRect !== null ? rootElementRect.left : 0;
	style.top = (rootElementRect !== null ? rootElementRect.top : 0) + positioning.y + "px";
	style.left = rectLeft + positioning.x + "px";
}
function StickyComponent({ x, y, nodeKey, color, caption }) {
	const [editor] = useLexicalComposerContext();
	const stickyContainerRef = (0, import_react.useRef)(null);
	const dragCleanupRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => dragCleanupRef.current?.(), []);
	const positioningRef = (0, import_react.useRef)({
		isDragging: false,
		offsetX: 0,
		offsetY: 0,
		rootElementRect: null,
		x: 0,
		y: 0
	});
	const { isCollabActive } = useCollaborationContext();
	(0, import_react.useEffect)(() => {
		const position = positioningRef.current;
		position.x = x;
		position.y = y;
		const stickyContainer = stickyContainerRef.current;
		if (stickyContainer !== null) positionSticky(stickyContainer, position);
	}, [x, y]);
	(0, import_react.useLayoutEffect)(() => {
		const position = positioningRef.current;
		const resizeObserver = new ResizeObserver((entries) => {
			for (let i = 0; i < entries.length; i++) {
				const { target } = entries[i];
				position.rootElementRect = target.getBoundingClientRect();
				const stickyContainer = stickyContainerRef.current;
				if (stickyContainer !== null) positionSticky(stickyContainer, position);
			}
		});
		const handleWindowResize = () => {
			const rootElement = editor.getRootElement();
			const stickyContainer = stickyContainerRef.current;
			if (rootElement !== null && stickyContainer !== null) {
				position.rootElementRect = rootElement.getBoundingClientRect();
				positionSticky(stickyContainer, position);
			}
		};
		return mergeRegister(editor.registerRootListener((nextRootElem) => {
			if (nextRootElem !== null) {
				resizeObserver.observe(nextRootElem);
				return () => resizeObserver.unobserve(nextRootElem);
			}
		}), registerEventListener(window, "resize", handleWindowResize));
	}, [editor]);
	(0, import_react.useEffect)(() => {
		const stickyContainer = stickyContainerRef.current;
		if (stickyContainer !== null) setTimeout(() => {
			stickyContainer.style.setProperty("transition", "top 0.3s ease 0s, left 0.3s ease 0s");
		}, 500);
	}, []);
	const handlePointerMove = (event) => {
		const stickyContainer = stickyContainerRef.current;
		const positioning = positioningRef.current;
		const rootElementRect = positioning.rootElementRect;
		const zoom = calculateZoomLevel(stickyContainer);
		if (stickyContainer !== null && positioning.isDragging && rootElementRect !== null) {
			positioning.x = event.pageX / zoom - positioning.offsetX - rootElementRect.left;
			positioning.y = event.pageY / zoom - positioning.offsetY - rootElementRect.top;
			positionSticky(stickyContainer, positioning);
		}
	};
	const handlePointerUp = (event) => {
		const stickyContainer = stickyContainerRef.current;
		const positioning = positioningRef.current;
		if (stickyContainer !== null) {
			positioning.isDragging = false;
			stickyContainer.classList.remove("dragging");
			editor.update(() => {
				const node = $getNodeByKey(nodeKey);
				if ($isStickyNode(node)) node.setPosition(positioning.x, positioning.y);
			});
		}
		dragCleanupRef.current?.();
		dragCleanupRef.current = null;
	};
	const handleDelete = () => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isStickyNode(node)) node.remove();
		});
	};
	const handleColorChange = () => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isStickyNode(node)) node.toggleColor();
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: stickyContainerRef,
		className: "sticky-note-container",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `sticky-note ${color}`,
			onPointerDown: (event) => {
				const stickyContainer = stickyContainerRef.current;
				if (stickyContainer == null || event.button === 2 || event.target !== stickyContainer.firstChild) return;
				const stickContainer = stickyContainer;
				const positioning = positioningRef.current;
				if (stickContainer !== null) {
					const { top, left } = stickContainer.getBoundingClientRect();
					const zoom = calculateZoomLevel(stickContainer);
					positioning.offsetX = event.clientX / zoom - left;
					positioning.offsetY = event.clientY / zoom - top;
					positioning.isDragging = true;
					stickContainer.classList.add("dragging");
					const doc = stickContainer.ownerDocument;
					dragCleanupRef.current?.();
					dragCleanupRef.current = registerEventListeners(doc, {
						pointermove: handlePointerMove,
						pointerup: handlePointerUp
					});
					event.preventDefault();
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleDelete,
					className: "delete",
					"aria-label": "Delete sticky note",
					title: "Delete",
					children: "X"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleColorChange,
					className: "color",
					"aria-label": "Change sticky note color",
					title: "Color",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bucket" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LexicalExtensionEditorComposer, {
					initialEditor: caption,
					children: isCollabActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationPlugin, {
						id: caption.getKey(),
						providerFactory: createWebsocketProvider,
						shouldBootstrap: !skipCollaborationInit,
						selectionHighlight: true
					}) : null
				})
			]
		})
	});
}
//#endregion
export { StickyComponent as default };
