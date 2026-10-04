import "./main-DHT2OJmi.js";
import { n as CB, r as NQ } from "./chunk-EIO257PC-BrwzN6QO.js";
//#region ../../node_modules/.pnpm/@excalidraw+excalidraw@0.18.1_@types+react-dom@19.2.3_@types+react@19.2.18__@types+reac_4e7e9e6fe544602d786c3fcb6d0eccb2/node_modules/@excalidraw/excalidraw/dist/prod/subset-worker.chunk.js
var s = import.meta.url ? new URL(import.meta.url) : void 0;
typeof window > "u" && typeof self < "u" && (self.onmessage = async (e) => {
	switch (e.data.command) {
		case CB.Subset:
			let a = await NQ(e.data.arrayBuffer, e.data.codePoints);
			self.postMessage(a, { transfer: [a] });
	}
});
//#endregion
export { s as WorkerUrl };
