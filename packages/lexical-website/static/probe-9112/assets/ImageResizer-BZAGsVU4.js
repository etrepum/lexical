import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { T as calculateZoomLevel } from "./LexicalExtensionGetExtensionDependencyFromEditor.dev-CiIhv3wn.js";
import { Ui as registerEventListeners } from "./LexicalComposerContext.dev-D4J9Kczj.js";
//#region src/ui/ImageResizer.tsx
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
*/
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
var Direction = {
	east: 1,
	north: 8,
	south: 2,
	west: 4
};
function ImageResizer({ onResizeStart, onResizeEnd, buttonRef, imageRef, maxWidth, editor, showCaption, setShowCaption, captionsEnabled }) {
	const controlWrapperRef = (0, import_react.useRef)(null);
	const resizeCleanupRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => resizeCleanupRef.current?.(), []);
	const userSelect = (0, import_react.useRef)({
		priority: "",
		value: "default"
	});
	const positioningRef = (0, import_react.useRef)({
		currentHeight: 0,
		currentWidth: 0,
		direction: 0,
		isResizing: false,
		ratio: 0,
		startHeight: 0,
		startWidth: 0,
		startX: 0,
		startY: 0
	});
	const editorRootElement = editor.getRootElement();
	const maxWidthContainer = maxWidth ? maxWidth : editorRootElement !== null ? editorRootElement.getBoundingClientRect().width - 20 : 100;
	const maxHeightContainer = editorRootElement !== null ? editorRootElement.getBoundingClientRect().height - 20 : 100;
	const minWidth = 100;
	const minHeight = 100;
	const setStartCursor = (direction) => {
		const ew = direction === Direction.east || direction === Direction.west;
		const ns = direction === Direction.north || direction === Direction.south;
		const nwse = direction & Direction.north && direction & Direction.west || direction & Direction.south && direction & Direction.east;
		const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";
		if (editorRootElement !== null) editorRootElement.style.setProperty("cursor", `${cursorDir}-resize`, "important");
		const body = imageRef.current?.ownerDocument?.body;
		if (body != null) {
			body.style.setProperty("cursor", `${cursorDir}-resize`, "important");
			userSelect.current.value = body.style.getPropertyValue("-webkit-user-select");
			userSelect.current.priority = body.style.getPropertyPriority("-webkit-user-select");
			body.style.setProperty("-webkit-user-select", `none`, "important");
		}
	};
	const setEndCursor = () => {
		if (editorRootElement !== null) editorRootElement.style.setProperty("cursor", "text");
		const body = imageRef.current?.ownerDocument?.body;
		if (body != null) {
			body.style.setProperty("cursor", "default");
			body.style.setProperty("-webkit-user-select", userSelect.current.value, userSelect.current.priority);
		}
	};
	const handlePointerDown = (event, direction) => {
		if (!editor.isEditable()) return;
		const image = imageRef.current;
		const controlWrapper = controlWrapperRef.current;
		if (image !== null && controlWrapper !== null) {
			event.preventDefault();
			const { width, height } = image.getBoundingClientRect();
			const zoom = calculateZoomLevel(image);
			const positioning = positioningRef.current;
			positioning.startWidth = width;
			positioning.startHeight = height;
			positioning.ratio = width / height;
			positioning.currentWidth = width;
			positioning.currentHeight = height;
			positioning.startX = event.clientX / zoom;
			positioning.startY = event.clientY / zoom;
			positioning.isResizing = true;
			positioning.direction = direction;
			setStartCursor(direction);
			onResizeStart();
			controlWrapper.classList.add("image-control-wrapper--resizing");
			image.style.height = `${height}px`;
			image.style.width = `${width}px`;
			const doc = image.ownerDocument;
			resizeCleanupRef.current?.();
			resizeCleanupRef.current = registerEventListeners(doc, {
				pointermove: handlePointerMove,
				pointerup: handlePointerUp
			});
		}
	};
	const handlePointerMove = (event) => {
		const image = imageRef.current;
		const positioning = positioningRef.current;
		const isHorizontal = positioning.direction & (Direction.east | Direction.west);
		const isVertical = positioning.direction & (Direction.south | Direction.north);
		if (image !== null && positioning.isResizing) {
			const zoom = calculateZoomLevel(image);
			if (isHorizontal && isVertical) {
				let diff = Math.floor(positioning.startX - event.clientX / zoom);
				diff = positioning.direction & Direction.east ? -diff : diff;
				const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer);
				const height = width / positioning.ratio;
				image.style.width = `${width}px`;
				image.style.height = `${height}px`;
				positioning.currentHeight = height;
				positioning.currentWidth = width;
			} else if (isVertical) {
				let diff = Math.floor(positioning.startY - event.clientY / zoom);
				diff = positioning.direction & Direction.south ? -diff : diff;
				const height = clamp(positioning.startHeight + diff, minHeight, maxHeightContainer);
				image.style.height = `${height}px`;
				positioning.currentHeight = height;
			} else {
				let diff = Math.floor(positioning.startX - event.clientX / zoom);
				diff = positioning.direction & Direction.east ? -diff : diff;
				const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer);
				image.style.width = `${width}px`;
				positioning.currentWidth = width;
			}
		}
	};
	const handlePointerUp = () => {
		const image = imageRef.current;
		const positioning = positioningRef.current;
		const controlWrapper = controlWrapperRef.current;
		if (image !== null && controlWrapper !== null && positioning.isResizing) {
			const width = positioning.currentWidth;
			const height = positioning.currentHeight;
			positioning.startWidth = 0;
			positioning.startHeight = 0;
			positioning.ratio = 0;
			positioning.startX = 0;
			positioning.startY = 0;
			positioning.currentWidth = 0;
			positioning.currentHeight = 0;
			positioning.isResizing = false;
			controlWrapper.classList.remove("image-control-wrapper--resizing");
			setEndCursor();
			onResizeEnd(width, height);
			resizeCleanupRef.current?.();
			resizeCleanupRef.current = null;
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: controlWrapperRef,
		children: [
			!showCaption && captionsEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "image-caption-button",
				ref: buttonRef,
				onClick: () => {
					setShowCaption(!showCaption);
				},
				children: "Add Caption"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-n",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.north);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-ne",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.north | Direction.east);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-e",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.east);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-se",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.south | Direction.east);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-s",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.south);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-sw",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.south | Direction.west);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-w",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.west);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-resizer image-resizer-nw",
				onPointerDown: (event) => {
					handlePointerDown(event, Direction.north | Direction.west);
				}
			})
		]
	});
}
//#endregion
export { ImageResizer as t };
