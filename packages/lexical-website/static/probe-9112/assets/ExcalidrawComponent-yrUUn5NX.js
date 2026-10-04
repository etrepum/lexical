import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { Pi as mergeRegister, _i as isDOMNode, gn as CLICK_COMMAND, q as $getNodeByKey, r as useLexicalComposerContext } from "./LexicalComposerContext.dev-D4J9Kczj.js";
import { $ as useLexicalEditable, J as r9, X as $isExcalidrawNode, a as ExcalidrawModal, nt as useLexicalNodeSelection } from "./main-CQSahKyu.js";
import { t as ImageResizer } from "./ImageResizer-BZAGsVU4.js";
//#region src/nodes/ExcalidrawNode/ExcalidrawImage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var removeStyleFromSvg_HACK = (svg) => {
	const styleTag = svg?.firstElementChild?.firstElementChild;
	const viewBox = svg.getAttribute("viewBox");
	if (viewBox != null) {
		const viewBoxDimensions = viewBox.split(" ");
		svg.setAttribute("width", viewBoxDimensions[2]);
		svg.setAttribute("height", viewBoxDimensions[3]);
	}
	if (styleTag && styleTag.tagName === "style") styleTag.remove();
};
/**
* @explorer-desc
* A component for rendering Excalidraw elements as a static image
*/
function ExcalidrawImage({ elements, files, imageContainerRef, appState, rootClassName = null, width = "inherit", height = "inherit" }) {
	const [Svg, setSvg] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const setContent = async () => {
			const svg = await r9({
				appState,
				elements,
				files
			});
			removeStyleFromSvg_HACK(svg);
			svg.setAttribute("display", "block");
			setSvg(svg);
		};
		setContent().catch(console.error);
	}, [
		elements,
		files,
		appState
	]);
	const svgHtml = (0, import_react.useMemo)(() => {
		if (Svg == null) return "";
		const clone = Svg.cloneNode(true);
		if (width === "inherit" && height === "inherit") {
			clone.style.maxWidth = "100%";
			clone.style.height = "auto";
		} else {
			clone.setAttribute("width", "100%");
			clone.setAttribute("height", "100%");
		}
		return clone.outerHTML;
	}, [
		Svg,
		width,
		height
	]);
	const containerStyle = {};
	if (width !== "inherit") containerStyle.width = `${width}px`;
	if (height !== "inherit") containerStyle.height = `${height}px`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: (node) => {
			if (node) {
				if (imageContainerRef) imageContainerRef.current = node;
			}
		},
		className: rootClassName ?? "",
		style: containerStyle,
		dangerouslySetInnerHTML: { __html: svgHtml }
	});
}
//#endregion
//#region src/nodes/ExcalidrawNode/ExcalidrawComponent.tsx
function ExcalidrawComponent({ nodeKey, data, width, height }) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [isModalOpen, setModalOpen] = (0, import_react.useState)(data === "[]" && editor.isEditable());
	const imageContainerRef = (0, import_react.useRef)(null);
	const buttonRef = (0, import_react.useRef)(null);
	const captionButtonRef = (0, import_react.useRef)(null);
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!isEditable) {
			if (isSelected) clearSelection();
			return;
		}
		return mergeRegister(editor.registerCommand(CLICK_COMMAND, (event) => {
			const buttonElem = buttonRef.current;
			const eventTarget = event.target;
			if (isResizing) return true;
			if (buttonElem !== null && isDOMNode(eventTarget) && buttonElem.contains(eventTarget)) {
				if (!event.shiftKey) clearSelection();
				setSelected(!isSelected);
				if (event.detail > 1) setModalOpen(true);
				return true;
			}
			return false;
		}, 1));
	}, [
		clearSelection,
		editor,
		isSelected,
		isResizing,
		setSelected,
		isEditable
	]);
	const deleteNode = (0, import_react.useCallback)(() => {
		setModalOpen(false);
		return editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if (node) node.remove();
		});
	}, [editor, nodeKey]);
	const setData = (els, aps, fls) => {
		return editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isExcalidrawNode(node)) {
				if (els && els.length > 0 || Object.keys(fls).length > 0) node.setData(JSON.stringify({
					appState: aps,
					elements: els,
					files: fls
				}));
				else node.remove();
			}
		});
	};
	const onResizeStart = () => {
		setIsResizing(true);
	};
	const onResizeEnd = (nextWidth, nextHeight) => {
		setTimeout(() => {
			setIsResizing(false);
		}, 200);
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isExcalidrawNode(node)) {
				node.setWidth(nextWidth);
				node.setHeight(nextHeight);
			}
		});
	};
	const openModal = (0, import_react.useCallback)(() => {
		setModalOpen(true);
	}, []);
	const { elements = [], files = {}, appState = {} } = (0, import_react.useMemo)(() => JSON.parse(data), [data]);
	const closeModal = (0, import_react.useCallback)(() => {
		setModalOpen(false);
		if (elements.length === 0) editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if (node) node.remove();
		});
	}, [
		editor,
		nodeKey,
		elements.length
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isEditable && isModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcalidrawModal, {
		initialElements: elements,
		initialFiles: files,
		initialAppState: appState,
		isShown: isModalOpen,
		onDelete: deleteNode,
		onClose: closeModal,
		onSave: (els, aps, fls) => {
			setData(els, aps, fls);
			setModalOpen(false);
		},
		closeOnClickOutside: false
	}), elements.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref: buttonRef,
		className: `excalidraw-button ${isSelected ? "selected" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcalidrawImage, {
				imageContainerRef,
				className: "image",
				elements,
				files,
				appState,
				width,
				height
			}),
			isSelected && isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "image-edit-button",
				role: "button",
				tabIndex: 0,
				onMouseDown: (event) => event.preventDefault(),
				onClick: openModal
			}),
			(isSelected || isResizing) && isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageResizer, {
				buttonRef: captionButtonRef,
				showCaption: true,
				setShowCaption: () => null,
				imageRef: imageContainerRef,
				editor,
				onResizeStart,
				onResizeEnd,
				captionsEnabled: true
			})
		]
	})] });
}
//#endregion
export { ExcalidrawComponent as default };
