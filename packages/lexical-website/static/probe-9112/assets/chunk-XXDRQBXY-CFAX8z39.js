import { n as __name } from "./chunk-Y2CYZVJY-U2gPMgME.js";
import { p as select_default } from "./src-CuHlePyC.js";
//#region ../../node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/chunk-XXDRQBXY.mjs
var getDiagramElement = /* @__PURE__ */ __name((id, securityLevel) => {
	let sandboxElement;
	if (securityLevel === "sandbox") sandboxElement = select_default("#i" + id);
	return (securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body")).select(`[id="${id}"]`);
}, "getDiagramElement");
//#endregion
export { getDiagramElement as t };
