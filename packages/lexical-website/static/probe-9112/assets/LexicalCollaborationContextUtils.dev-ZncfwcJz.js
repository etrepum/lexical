import { i as __toESM } from "./rolldown-runtime-B-lAHAz2.js";
import { n as require_react } from "./jsx-runtime-BFBPYi8m.js";
//#region ../lexical-react/dist/LexicalCollaborationContextUtils.dev.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
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
* The value stored in the {@link CollaborationContext}: the local user's
* display `name` and cursor `color`, whether collaboration is currently active,
* and the map of Yjs documents shared by the editors under this provider.
*/
var entries = [
	["Cat", "rgb(125, 50, 0)"],
	["Dog", "rgb(100, 0, 0)"],
	["Rabbit", "rgb(150, 0, 0)"],
	["Frog", "rgb(200, 0, 0)"],
	["Fox", "rgb(200, 75, 0)"],
	["Hedgehog", "rgb(0, 75, 0)"],
	["Pigeon", "rgb(0, 125, 0)"],
	["Squirrel", "rgb(75, 100, 0)"],
	["Bear", "rgb(125, 100, 0)"],
	["Tiger", "rgb(0, 0, 150)"],
	["Leopard", "rgb(0, 0, 200)"],
	["Zebra", "rgb(0, 0, 250)"],
	["Wolf", "rgb(0, 100, 150)"],
	["Owl", "rgb(0, 100, 100)"],
	["Gull", "rgb(100, 0, 100)"],
	["Squid", "rgb(150, 0, 150)"]
];
var randomEntry;
function getRandomEntry() {
	if (randomEntry === void 0) randomEntry = entries[Math.floor(Math.random() * entries.length)];
	return randomEntry;
}
/**
* The React context that holds the shared {@link CollaborationContextType} for
* collaborative editors. Provide it with {@link LexicalCollaboration} and read
* it with {@link useCollaborationContext}.
*/
var CollaborationContext = /* @__PURE__ */ (0, import_react.createContext)(null);
/**
* @internal
* @__NO_SIDE_EFFECTS__
*/
function newContext() {
	const [name, color] = getRandomEntry();
	return {
		color,
		isCollabActive: false,
		name,
		yjsDocMap: /* @__PURE__ */ new Map()
	};
}
var UNSAFE_GLOBAL_CONTEXT = /* @__PURE__ */ newContext();
/**
* Reads the current {@link CollaborationContextType} from the nearest
* {@link LexicalCollaboration} provider. Optionally pass `username` and `color`
* to set the local user's display name and cursor color.
*
* @returns The active collaboration context.
*/
function useCollaborationContext(username, color) {
	let collabContext = (0, import_react.useContext)(CollaborationContext);
	if (!(collabContext != null)) formatDevErrorMessage(`useCollaborationContext: no context provider found`);
	collabContext = collabContext ?? UNSAFE_GLOBAL_CONTEXT;
	if (username != null) collabContext.name = username;
	if (color != null) collabContext.color = color;
	return collabContext;
}
//#endregion
export { newContext as n, useCollaborationContext as r, CollaborationContext as t };
