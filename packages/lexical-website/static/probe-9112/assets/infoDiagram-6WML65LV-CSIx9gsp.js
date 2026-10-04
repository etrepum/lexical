import { n as __name } from "./chunk-Y2CYZVJY-U2gPMgME.js";
import { m as log } from "./src-CuHlePyC.js";
import { c as configureSvgSize } from "./chunk-I66GZJ75-BsCHy0-s.js";
import { o as selectSvgElement } from "./dist-7efRXTui.js";
import { n as parse } from "./mermaid-parser.core-DbmT21Yy.js";
//#region ../../node_modules/.pnpm/mermaid@11.16.1/node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-6WML65LV.mjs
var parser = { parse: /* @__PURE__ */ __name(async (input) => {
	const ast = await parse("info", input);
	log.debug(ast);
}, "parse") };
var DEFAULT_INFO_DB = { version: "11.16.1" };
var diagram = {
	parser,
	db: { getVersion: /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion") },
	renderer: { draw: /* @__PURE__ */ __name((text, id, version) => {
		log.debug("rendering info diagram\n" + text);
		const svg = selectSvgElement(id);
		configureSvgSize(svg, 100, 400, true);
		svg.append("g").append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
	}, "draw") }
};
//#endregion
export { diagram };
