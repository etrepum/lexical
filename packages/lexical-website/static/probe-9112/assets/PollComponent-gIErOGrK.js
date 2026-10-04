import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BFBPYi8m.js";
import { Pi as mergeRegister, Q as $getSelection, Tt as $isNodeSelection, gn as CLICK_COMMAND, q as $getNodeByKey, r as useLexicalComposerContext } from "./LexicalComposerContext.dev-D4J9Kczj.js";
import { r as useCollaborationContext } from "./LexicalCollaborationContextUtils.dev-ZncfwcJz.js";
import { i as createPollOption, nt as useLexicalNodeSelection, ot as Button, r as $isPollNode, st as joinClasses } from "./main-CQSahKyu.js";
//#region src/nodes/PollComponent.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function getTotalVotes(options) {
	return options.reduce((totalVotes, next) => {
		return totalVotes + next.votes.length;
	}, 0);
}
function PollOptionComponent({ option, index, options, totalVotes, withPollNode }) {
	const { name: username } = useCollaborationContext();
	const checkboxRef = (0, import_react.useRef)(null);
	const votesArray = option.votes;
	const checked = votesArray.indexOf(username) !== -1;
	const votes = votesArray.length;
	const text = option.text;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "PollNode__optionContainer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: joinClasses("PollNode__optionCheckboxWrapper", checked && "PollNode__optionCheckboxChecked"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: checkboxRef,
					className: "PollNode__optionCheckbox",
					type: "checkbox",
					onChange: (e) => {
						withPollNode((node) => {
							node.toggleVote(option, username);
						});
					},
					checked
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "PollNode__optionInputWrapper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "PollNode__optionInputVotes",
						style: { width: `${votes === 0 ? 0 : votes / totalVotes * 100}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "PollNode__optionInputVotesCount",
						children: votes > 0 && (votes === 1 ? "1 vote" : `${votes} votes`)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "PollNode__optionInput",
						type: "text",
						value: text,
						onChange: (e) => {
							const target = e.target;
							const value = target.value;
							const { selectionStart, selectionEnd } = target;
							withPollNode((node) => {
								node.setOptionText(option, value);
							}, () => {
								target.selectionStart = selectionStart;
								target.selectionEnd = selectionEnd;
							});
						},
						placeholder: `Option ${index + 1}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: options.length < 3,
				className: joinClasses("PollNode__optionDelete", options.length < 3 && "PollNode__optionDeleteDisabled"),
				"aria-label": "Remove",
				onClick: () => {
					withPollNode((node) => {
						node.deleteOption(option);
					});
				}
			})
		]
	});
}
function PollComponent({ question, options, nodeKey }) {
	const [editor] = useLexicalComposerContext();
	const totalVotes = (0, import_react.useMemo)(() => getTotalVotes(options), [options]);
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
	const [selection, setSelection] = (0, import_react.useState)(null);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		return mergeRegister(editor.registerUpdateListener(({ editorState }) => {
			setSelection(editorState.read(() => $getSelection()));
		}), editor.registerCommand(CLICK_COMMAND, (payload) => {
			const event = payload;
			if (event.target === ref.current) {
				if (!event.shiftKey) clearSelection();
				setSelected(!isSelected);
				return true;
			}
			return false;
		}, 1));
	}, [
		clearSelection,
		editor,
		isSelected,
		nodeKey,
		setSelected
	]);
	const withPollNode = (cb, onUpdate) => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isPollNode(node)) cb(node);
		}, { onUpdate });
	};
	const addOption = () => {
		withPollNode((node) => {
			node.addOption(createPollOption());
		});
	};
	const isFocused = $isNodeSelection(selection) && isSelected;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `PollNode__container ${isFocused ? "focused" : ""}`,
		ref,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "PollNode__inner",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "PollNode__heading",
					children: question
				}),
				options.map((option, index) => {
					const key = option.uid;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollOptionComponent, {
						withPollNode,
						option,
						index,
						options,
						totalVotes
					}, key);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "PollNode__footer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: addOption,
						small: true,
						children: "Add Option"
					})
				})
			]
		})
	});
}
//#endregion
export { PollComponent as default };
