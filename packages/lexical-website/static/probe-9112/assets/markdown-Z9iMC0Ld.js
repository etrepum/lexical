import { t as __commonJSMin } from "./rolldown-runtime-B-lAHAz2.js";
//#region ../../node_modules/.pnpm/prettier@3.8.5/node_modules/prettier/plugins/markdown.js
var require_markdown = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(n) {
		function e() {
			var i = n();
			return i.default || i;
		}
		if (typeof exports == "object" && typeof module == "object") module.exports = e();
		else if (typeof define == "function" && define.amd) define(e);
		else {
			var t = typeof globalThis < "u" ? globalThis : typeof global < "u" ? global : typeof self < "u" ? self : this || {};
			t.prettierPlugins = t.prettierPlugins || {}, t.prettierPlugins.markdown = e();
		}
	})(function() {
		"use strict";
		var El = Object.create;
		var Tr = Object.defineProperty;
		var Cl = Object.getOwnPropertyDescriptor;
		var vl = Object.getOwnPropertyNames;
		var Al = Object.getPrototypeOf, bl = Object.prototype.hasOwnProperty;
		var x = (e, r) => () => (r || e((r = { exports: {} }).exports, r), r.exports), Vn = (e, r) => {
			for (var t in r) Tr(e, t, {
				get: r[t],
				enumerable: !0
			});
		}, jn = (e, r, t, n) => {
			if (r && typeof r == "object" || typeof r == "function") for (let i of vl(r)) !bl.call(e, i) && i !== t && Tr(e, i, {
				get: () => r[i],
				enumerable: !(n = Cl(r, i)) || n.enumerable
			});
			return e;
		};
		var Re = (e, r, t) => (t = e != null ? El(Al(e)) : {}, jn(r || !e || !e.__esModule ? Tr(t, "default", {
			value: e,
			enumerable: !0
		}) : t, e)), xl = (e) => jn(Tr({}, "__esModule", { value: !0 }), e);
		var Br = x((EF, $n) => {
			"use strict";
			$n.exports = Bl;
			function Bl(e) {
				return String(e).replace(/\s+/g, " ");
			}
		});
		var Zi = x((XC, Qi) => {
			"use strict";
			Qi.exports = Qf;
			var pr = 9, Vr = 10, Ve = 32, Hf = 33, Kf = 58, je = 91, Xf = 92, St = 93, hr = 94, jr = 96, $r = 4, Jf = 1024;
			function Qf(e) {
				var r = this.Parser, t = this.Compiler;
				Zf(r) && rD(r, e), eD(t) && tD(t);
			}
			function Zf(e) {
				return !!(e && e.prototype && e.prototype.blockTokenizers);
			}
			function eD(e) {
				return !!(e && e.prototype && e.prototype.visitors);
			}
			function rD(e, r) {
				for (var t = r || {}, n = e.prototype, i = n.blockTokenizers, u = n.inlineTokenizers, a = n.blockMethods, o = n.inlineMethods, s = i.definition, l = u.reference, c = [], f = -1, D = a.length, m; ++f < D;) m = a[f], m !== "newline" && m !== "indentedCode" && m !== "paragraph" && m !== "footnoteDefinition" && c.push([m]);
				c.push(["footnoteDefinition"]), t.inlineNotes && (Lt(o, "reference", "inlineNote"), u.inlineNote = F), Lt(a, "definition", "footnoteDefinition"), Lt(o, "reference", "footnoteCall"), i.definition = E, i.footnoteDefinition = p, u.footnoteCall = h, u.reference = g, n.interruptFootnoteDefinition = c, g.locator = l.locator, h.locator = v, F.locator = A;
				function p(b, d, y) {
					for (var w = this, C = w.interruptFootnoteDefinition, k = w.offset, T = d.length + 1, B = 0, _ = [], S, P, N, O, I, le, K, L, ie, Z, ve, Ae, G; B < T && (O = d.charCodeAt(B), !(O !== pr && O !== Ve));) B++;
					if (d.charCodeAt(B++) === je && d.charCodeAt(B++) === hr) {
						for (P = B; B < T;) {
							if (O = d.charCodeAt(B), O !== O || O === Vr || O === pr || O === Ve) return;
							if (O === St) {
								N = B, B++;
								break;
							}
							B++;
						}
						if (!(N === void 0 || P === N || d.charCodeAt(B++) !== Kf)) {
							if (y) return !0;
							for (S = d.slice(P, N), I = b.now(), ie = 0, Z = 0, ve = B, Ae = []; B < T;) {
								if (O = d.charCodeAt(B), O !== O || O === Vr) G = {
									start: ie,
									contentStart: ve || B,
									contentEnd: B,
									end: B
								}, Ae.push(G), O === Vr && (ie = B + 1, Z = 0, ve = void 0, G.end = ie);
								else if (Z !== void 0) if (O === Ve || O === pr) Z += O === Ve ? 1 : $r - Z % $r, Z > $r && (Z = void 0, ve = B);
								else {
									if (Z < $r && G && (G.contentStart === G.contentEnd || nD(C, i, w, [
										b,
										d.slice(B, Jf),
										!0
									]))) break;
									Z = void 0, ve = B;
								}
								B++;
							}
							for (B = -1, T = Ae.length; T > 0 && (G = Ae[T - 1], G.contentStart === G.contentEnd);) T--;
							for (le = b(d.slice(0, G.contentEnd)); ++B < T;) G = Ae[B], k[I.line + B] = (k[I.line + B] || 0) + (G.contentStart - G.start), _.push(d.slice(G.contentStart, G.end));
							return K = w.enterBlock(), L = w.tokenizeBlock(_.join(""), I), K(), le({
								type: "footnoteDefinition",
								identifier: S.toLowerCase(),
								label: S,
								children: L
							});
						}
					}
				}
				function h(b, d, y) {
					var w = d.length + 1, C = 0, k, T, B, _;
					if (d.charCodeAt(C++) === je && d.charCodeAt(C++) === hr) {
						for (T = C; C < w;) {
							if (_ = d.charCodeAt(C), _ !== _ || _ === Vr || _ === pr || _ === Ve) return;
							if (_ === St) {
								B = C, C++;
								break;
							}
							C++;
						}
						if (!(B === void 0 || T === B)) return y ? !0 : (k = d.slice(T, B), b(d.slice(0, C))({
							type: "footnoteReference",
							identifier: k.toLowerCase(),
							label: k
						}));
					}
				}
				function F(b, d, y) {
					var w = this, C = d.length + 1, k = 0, T = 0, B, _, S, P, N, O, I;
					if (d.charCodeAt(k++) === hr && d.charCodeAt(k++) === je) {
						for (S = k; k < C;) {
							if (_ = d.charCodeAt(k), _ !== _) return;
							if (O === void 0) if (_ === Xf) k += 2;
							else if (_ === je) T++, k++;
							else if (_ === St) if (T === 0) {
								P = k, k++;
								break;
							} else T--, k++;
							else if (_ === jr) {
								for (N = k, O = 1; d.charCodeAt(N + O) === jr;) O++;
								k += O;
							} else k++;
							else if (_ === jr) {
								for (N = k, I = 1; d.charCodeAt(N + I) === jr;) I++;
								k += I, O === I && (O = void 0), I = void 0;
							} else k++;
						}
						if (P !== void 0) return y ? !0 : (B = b.now(), B.column += 2, B.offset += 2, b(d.slice(0, k))({
							type: "footnote",
							children: w.tokenizeInline(d.slice(S, P), B)
						}));
					}
				}
				function g(b, d, y) {
					var w = 0;
					if (d.charCodeAt(w) === Hf && w++, d.charCodeAt(w) === je && d.charCodeAt(w + 1) !== hr) return l.call(this, b, d, y);
				}
				function E(b, d, y) {
					for (var w = 0, C = d.charCodeAt(w); C === Ve || C === pr;) C = d.charCodeAt(++w);
					if (C === je && d.charCodeAt(w + 1) !== hr) return s.call(this, b, d, y);
				}
				function v(b, d) {
					return b.indexOf("[", d);
				}
				function A(b, d) {
					return b.indexOf("^[", d);
				}
			}
			function tD(e) {
				var r = e.prototype.visitors, t = "    ";
				r.footnote = n, r.footnoteReference = i, r.footnoteDefinition = u;
				function n(a) {
					return "^[" + this.all(a).join("") + "]";
				}
				function i(a) {
					return "[^" + (a.label || a.identifier) + "]";
				}
				function u(a) {
					for (var o = this.all(a).join(`

`).split(`
`), s = 0, l = o.length, c; ++s < l;) c = o[s], c !== "" && (o[s] = t + c);
					return "[^" + (a.label || a.identifier) + "]: " + o.join(`
`);
				}
			}
			function Lt(e, r, t) {
				e.splice(e.indexOf(r), 0, t);
			}
			function nD(e, r, t, n) {
				for (var i = e.length, u = -1; ++u < i;) if (r[e[u][0]].apply(t, n)) return !0;
				return !1;
			}
		});
		var Mt = x((Rt) => {
			Rt.isRemarkParser = iD;
			Rt.isRemarkCompiler = uD;
			function iD(e) {
				return !!(e && e.prototype && e.prototype.blockTokenizers);
			}
			function uD(e) {
				return !!(e && e.prototype && e.prototype.visitors);
			}
		});
		var au = x((QC, uu) => {
			var eu = Mt();
			uu.exports = cD;
			var ru = 9, tu = 32, Hr = 36, aD = 48, oD = 57, nu = 92, sD = ["math", "math-inline"], iu = "math-display";
			function cD(e) {
				let r = this.Parser, t = this.Compiler;
				eu.isRemarkParser(r) && lD(r, e), eu.isRemarkCompiler(t) && fD(t, e);
			}
			function lD(e, r) {
				let t = e.prototype, n = t.inlineMethods;
				u.locator = i, t.inlineTokenizers.math = u, n.splice(n.indexOf("text"), 0, "math");
				function i(a, o) {
					return a.indexOf("$", o);
				}
				function u(a, o, s) {
					let l = o.length, c = !1, f = !1, D = 0, m, p, h, F, g, E, v;
					if (o.charCodeAt(D) === nu && (f = !0, D++), o.charCodeAt(D) === Hr) {
						if (D++, f) return s ? !0 : a(o.slice(0, D))({
							type: "text",
							value: "$"
						});
						if (o.charCodeAt(D) === Hr && (c = !0, D++), h = o.charCodeAt(D), !(h === tu || h === ru)) {
							for (F = D; D < l;) {
								if (p = h, h = o.charCodeAt(D + 1), p === Hr) {
									if (m = o.charCodeAt(D - 1), m !== tu && m !== ru && (h !== h || h < aD || h > oD) && (!c || h === Hr)) {
										g = D - 1, D++, c && D++, E = D;
										break;
									}
								} else p === nu && (D++, h = o.charCodeAt(D + 1));
								D++;
							}
							if (E !== void 0) return s ? !0 : (v = o.slice(F, g + 1), a(o.slice(0, E))({
								type: "inlineMath",
								value: v,
								data: {
									hName: "span",
									hProperties: { className: sD.concat(c && r.inlineMathDouble ? [iu] : []) },
									hChildren: [{
										type: "text",
										value: v
									}]
								}
							}));
						}
					}
				}
			}
			function fD(e) {
				let r = e.prototype;
				r.visitors.inlineMath = t;
				function t(n) {
					let i = "$";
					return (n.data && n.data.hProperties && n.data.hProperties.className || []).includes(iu) && (i = "$$"), i + n.value + i;
				}
			}
		});
		var fu = x((ZC, lu) => {
			var ou = Mt();
			lu.exports = dD;
			var su = 10, dr = 32, Ut = 36, cu = `
`, DD = "$", pD = 2, hD = ["math", "math-display"];
			function dD() {
				let e = this.Parser, r = this.Compiler;
				ou.isRemarkParser(e) && mD(e), ou.isRemarkCompiler(r) && FD(r);
			}
			function mD(e) {
				let r = e.prototype, t = r.blockMethods, n = r.interruptParagraph, i = r.interruptList, u = r.interruptBlockquote;
				r.blockTokenizers.math = a, t.splice(t.indexOf("fencedCode") + 1, 0, "math"), n.splice(n.indexOf("fencedCode") + 1, 0, ["math"]), i.splice(i.indexOf("fencedCode") + 1, 0, ["math"]), u.splice(u.indexOf("fencedCode") + 1, 0, ["math"]);
				function a(o, s, l) {
					var c = s.length, f = 0;
					let D, m, p, h, F, g, E, v, A, b, d;
					for (; f < c && s.charCodeAt(f) === dr;) f++;
					for (F = f; f < c && s.charCodeAt(f) === Ut;) f++;
					if (g = f - F, !(g < pD)) {
						for (; f < c && s.charCodeAt(f) === dr;) f++;
						for (E = f; f < c;) {
							if (D = s.charCodeAt(f), D === Ut) return;
							if (D === su) break;
							f++;
						}
						if (s.charCodeAt(f) === su) {
							if (l) return !0;
							for (m = [], E !== f && m.push(s.slice(E, f)), f++, p = s.indexOf(cu, f + 1), p = p === -1 ? c : p; f < c;) {
								for (v = !1, b = f, d = p, h = p, A = 0; h > b && s.charCodeAt(h - 1) === dr;) h--;
								for (; h > b && s.charCodeAt(h - 1) === Ut;) A++, h--;
								for (g <= A && s.indexOf(DD, b) === h && (v = !0, d = h); b <= d && b - f < F && s.charCodeAt(b) === dr;) b++;
								if (v) for (; d > b && s.charCodeAt(d - 1) === dr;) d--;
								if ((!v || b !== d) && m.push(s.slice(b, d)), v) break;
								f = p + 1, p = s.indexOf(cu, f + 1), p = p === -1 ? c : p;
							}
							return m = m.join(`
`), o(s.slice(0, p))({
								type: "math",
								value: m,
								data: {
									hName: "div",
									hProperties: { className: hD.concat() },
									hChildren: [{
										type: "text",
										value: m
									}]
								}
							});
						}
					}
				}
			}
			function FD(e) {
				let r = e.prototype;
				r.visitors.math = t;
				function t(n) {
					return `$$
` + n.value + `
$$`;
				}
			}
		});
		var pu = x((ev, Du) => {
			var gD = au(), ED = fu();
			Du.exports = CD;
			function CD(e) {
				var r = e || {};
				ED.call(this, r), gD.call(this, r);
			}
		});
		var Ie = x((rv, hu) => {
			hu.exports = AD;
			var vD = Object.prototype.hasOwnProperty;
			function AD() {
				for (var e = {}, r = 0; r < arguments.length; r++) {
					var t = arguments[r];
					for (var n in t) vD.call(t, n) && (e[n] = t[n]);
				}
				return e;
			}
		});
		var du = x((tv, Yt) => {
			typeof Object.create == "function" ? Yt.exports = function(r, t) {
				t && (r.super_ = t, r.prototype = Object.create(t.prototype, { constructor: {
					value: r,
					enumerable: !1,
					writable: !0,
					configurable: !0
				} }));
			} : Yt.exports = function(r, t) {
				if (t) {
					r.super_ = t;
					var n = function() {};
					n.prototype = t.prototype, r.prototype = new n(), r.prototype.constructor = r;
				}
			};
		});
		var gu = x((nv, Fu) => {
			"use strict";
			var bD = Ie(), mu = du();
			Fu.exports = xD;
			function xD(e) {
				var r, t, n;
				mu(u, e), mu(i, u), r = u.prototype;
				for (t in r) n = r[t], n && typeof n == "object" && (r[t] = "concat" in n ? n.concat() : bD(n));
				return u;
				function i(a) {
					return e.apply(this, a);
				}
				function u() {
					return this instanceof u ? e.apply(this, arguments) : new i(arguments);
				}
			}
		});
		var Cu = x((iv, Eu) => {
			"use strict";
			Eu.exports = yD;
			function yD(e, r, t) {
				return n;
				function n() {
					var i = t || this, u = i[e];
					return i[e] = !r, a;
					function a() {
						i[e] = u;
					}
				}
			}
		});
		var Au = x((uv, vu) => {
			"use strict";
			vu.exports = wD;
			function wD(e) {
				for (var r = String(e), t = [], n = /\r?\n|\r/g; n.exec(r);) t.push(n.lastIndex);
				return t.push(r.length + 1), {
					toPoint: i,
					toPosition: i,
					toOffset: u
				};
				function i(a) {
					var o = -1;
					if (a > -1 && a < t[t.length - 1]) {
						for (; ++o < t.length;) if (t[o] > a) return {
							line: o + 1,
							column: a - (t[o - 1] || 0) + 1,
							offset: a
						};
					}
					return {};
				}
				function u(a) {
					var o = a && a.line, s = a && a.column, l;
					return !isNaN(o) && !isNaN(s) && o - 1 in t && (l = (t[o - 2] || 0) + s - 1 || 0), l > -1 && l < t[t.length - 1] ? l : -1;
				}
			}
		});
		var xu = x((av, bu) => {
			"use strict";
			bu.exports = kD;
			var Gt = "\\";
			function kD(e, r) {
				return t;
				function t(n) {
					for (var i = 0, u = n.indexOf(Gt), a = e[r], o = [], s; u !== -1;) o.push(n.slice(i, u)), i = u + 1, s = n.charAt(i), (!s || a.indexOf(s) === -1) && o.push(Gt), u = n.indexOf(Gt, i + 1);
					return o.push(n.slice(i)), o.join("");
				}
			}
		});
		var yu = x((ov, TD) => {
			TD.exports = {
				AElig: "Æ",
				AMP: "&",
				Aacute: "Á",
				Acirc: "Â",
				Agrave: "À",
				Aring: "Å",
				Atilde: "Ã",
				Auml: "Ä",
				COPY: "©",
				Ccedil: "Ç",
				ETH: "Ð",
				Eacute: "É",
				Ecirc: "Ê",
				Egrave: "È",
				Euml: "Ë",
				GT: ">",
				Iacute: "Í",
				Icirc: "Î",
				Igrave: "Ì",
				Iuml: "Ï",
				LT: "<",
				Ntilde: "Ñ",
				Oacute: "Ó",
				Ocirc: "Ô",
				Ograve: "Ò",
				Oslash: "Ø",
				Otilde: "Õ",
				Ouml: "Ö",
				QUOT: "\"",
				REG: "®",
				THORN: "Þ",
				Uacute: "Ú",
				Ucirc: "Û",
				Ugrave: "Ù",
				Uuml: "Ü",
				Yacute: "Ý",
				aacute: "á",
				acirc: "â",
				acute: "´",
				aelig: "æ",
				agrave: "à",
				amp: "&",
				aring: "å",
				atilde: "ã",
				auml: "ä",
				brvbar: "¦",
				ccedil: "ç",
				cedil: "¸",
				cent: "¢",
				copy: "©",
				curren: "¤",
				deg: "°",
				divide: "÷",
				eacute: "é",
				ecirc: "ê",
				egrave: "è",
				eth: "ð",
				euml: "ë",
				frac12: "½",
				frac14: "¼",
				frac34: "¾",
				gt: ">",
				iacute: "í",
				icirc: "î",
				iexcl: "¡",
				igrave: "ì",
				iquest: "¿",
				iuml: "ï",
				laquo: "«",
				lt: "<",
				macr: "¯",
				micro: "µ",
				middot: "·",
				nbsp: "\xA0",
				not: "¬",
				ntilde: "ñ",
				oacute: "ó",
				ocirc: "ô",
				ograve: "ò",
				ordf: "ª",
				ordm: "º",
				oslash: "ø",
				otilde: "õ",
				ouml: "ö",
				para: "¶",
				plusmn: "±",
				pound: "£",
				quot: "\"",
				raquo: "»",
				reg: "®",
				sect: "§",
				shy: "­",
				sup1: "¹",
				sup2: "²",
				sup3: "³",
				szlig: "ß",
				thorn: "þ",
				times: "×",
				uacute: "ú",
				ucirc: "û",
				ugrave: "ù",
				uml: "¨",
				uuml: "ü",
				yacute: "ý",
				yen: "¥",
				yuml: "ÿ"
			};
		});
		var wu = x((sv, BD) => {
			BD.exports = {
				"0": "�",
				"128": "€",
				"130": "‚",
				"131": "ƒ",
				"132": "„",
				"133": "…",
				"134": "†",
				"135": "‡",
				"136": "ˆ",
				"137": "‰",
				"138": "Š",
				"139": "‹",
				"140": "Œ",
				"142": "Ž",
				"145": "‘",
				"146": "’",
				"147": "“",
				"148": "”",
				"149": "•",
				"150": "–",
				"151": "—",
				"152": "˜",
				"153": "™",
				"154": "š",
				"155": "›",
				"156": "œ",
				"158": "ž",
				"159": "Ÿ"
			};
		});
		var Se = x((cv, ku) => {
			"use strict";
			ku.exports = _D;
			function _D(e) {
				var r = typeof e == "string" ? e.charCodeAt(0) : e;
				return r >= 48 && r <= 57;
			}
		});
		var Bu = x((lv, Tu) => {
			"use strict";
			Tu.exports = OD;
			function OD(e) {
				var r = typeof e == "string" ? e.charCodeAt(0) : e;
				return r >= 97 && r <= 102 || r >= 65 && r <= 70 || r >= 48 && r <= 57;
			}
		});
		var $e = x((fv, _u) => {
			"use strict";
			_u.exports = qD;
			function qD(e) {
				var r = typeof e == "string" ? e.charCodeAt(0) : e;
				return r >= 97 && r <= 122 || r >= 65 && r <= 90;
			}
		});
		var qu = x((Dv, Ou) => {
			"use strict";
			var ND = $e(), PD = Se();
			Ou.exports = ID;
			function ID(e) {
				return ND(e) || PD(e);
			}
		});
		var Nu = x((pv, SD) => {
			SD.exports = {
				AEli: "Æ",
				AElig: "Æ",
				AM: "&",
				AMP: "&",
				Aacut: "Á",
				Aacute: "Á",
				Abreve: "Ă",
				Acir: "Â",
				Acirc: "Â",
				Acy: "А",
				Afr: "𝔄",
				Agrav: "À",
				Agrave: "À",
				Alpha: "Α",
				Amacr: "Ā",
				And: "⩓",
				Aogon: "Ą",
				Aopf: "𝔸",
				ApplyFunction: "⁡",
				Arin: "Å",
				Aring: "Å",
				Ascr: "𝒜",
				Assign: "≔",
				Atild: "Ã",
				Atilde: "Ã",
				Aum: "Ä",
				Auml: "Ä",
				Backslash: "∖",
				Barv: "⫧",
				Barwed: "⌆",
				Bcy: "Б",
				Because: "∵",
				Bernoullis: "ℬ",
				Beta: "Β",
				Bfr: "𝔅",
				Bopf: "𝔹",
				Breve: "˘",
				Bscr: "ℬ",
				Bumpeq: "≎",
				CHcy: "Ч",
				COP: "©",
				COPY: "©",
				Cacute: "Ć",
				Cap: "⋒",
				CapitalDifferentialD: "ⅅ",
				Cayleys: "ℭ",
				Ccaron: "Č",
				Ccedi: "Ç",
				Ccedil: "Ç",
				Ccirc: "Ĉ",
				Cconint: "∰",
				Cdot: "Ċ",
				Cedilla: "¸",
				CenterDot: "·",
				Cfr: "ℭ",
				Chi: "Χ",
				CircleDot: "⊙",
				CircleMinus: "⊖",
				CirclePlus: "⊕",
				CircleTimes: "⊗",
				ClockwiseContourIntegral: "∲",
				CloseCurlyDoubleQuote: "”",
				CloseCurlyQuote: "’",
				Colon: "∷",
				Colone: "⩴",
				Congruent: "≡",
				Conint: "∯",
				ContourIntegral: "∮",
				Copf: "ℂ",
				Coproduct: "∐",
				CounterClockwiseContourIntegral: "∳",
				Cross: "⨯",
				Cscr: "𝒞",
				Cup: "⋓",
				CupCap: "≍",
				DD: "ⅅ",
				DDotrahd: "⤑",
				DJcy: "Ђ",
				DScy: "Ѕ",
				DZcy: "Џ",
				Dagger: "‡",
				Darr: "↡",
				Dashv: "⫤",
				Dcaron: "Ď",
				Dcy: "Д",
				Del: "∇",
				Delta: "Δ",
				Dfr: "𝔇",
				DiacriticalAcute: "´",
				DiacriticalDot: "˙",
				DiacriticalDoubleAcute: "˝",
				DiacriticalGrave: "`",
				DiacriticalTilde: "˜",
				Diamond: "⋄",
				DifferentialD: "ⅆ",
				Dopf: "𝔻",
				Dot: "¨",
				DotDot: "⃜",
				DotEqual: "≐",
				DoubleContourIntegral: "∯",
				DoubleDot: "¨",
				DoubleDownArrow: "⇓",
				DoubleLeftArrow: "⇐",
				DoubleLeftRightArrow: "⇔",
				DoubleLeftTee: "⫤",
				DoubleLongLeftArrow: "⟸",
				DoubleLongLeftRightArrow: "⟺",
				DoubleLongRightArrow: "⟹",
				DoubleRightArrow: "⇒",
				DoubleRightTee: "⊨",
				DoubleUpArrow: "⇑",
				DoubleUpDownArrow: "⇕",
				DoubleVerticalBar: "∥",
				DownArrow: "↓",
				DownArrowBar: "⤓",
				DownArrowUpArrow: "⇵",
				DownBreve: "̑",
				DownLeftRightVector: "⥐",
				DownLeftTeeVector: "⥞",
				DownLeftVector: "↽",
				DownLeftVectorBar: "⥖",
				DownRightTeeVector: "⥟",
				DownRightVector: "⇁",
				DownRightVectorBar: "⥗",
				DownTee: "⊤",
				DownTeeArrow: "↧",
				Downarrow: "⇓",
				Dscr: "𝒟",
				Dstrok: "Đ",
				ENG: "Ŋ",
				ET: "Ð",
				ETH: "Ð",
				Eacut: "É",
				Eacute: "É",
				Ecaron: "Ě",
				Ecir: "Ê",
				Ecirc: "Ê",
				Ecy: "Э",
				Edot: "Ė",
				Efr: "𝔈",
				Egrav: "È",
				Egrave: "È",
				Element: "∈",
				Emacr: "Ē",
				EmptySmallSquare: "◻",
				EmptyVerySmallSquare: "▫",
				Eogon: "Ę",
				Eopf: "𝔼",
				Epsilon: "Ε",
				Equal: "⩵",
				EqualTilde: "≂",
				Equilibrium: "⇌",
				Escr: "ℰ",
				Esim: "⩳",
				Eta: "Η",
				Eum: "Ë",
				Euml: "Ë",
				Exists: "∃",
				ExponentialE: "ⅇ",
				Fcy: "Ф",
				Ffr: "𝔉",
				FilledSmallSquare: "◼",
				FilledVerySmallSquare: "▪",
				Fopf: "𝔽",
				ForAll: "∀",
				Fouriertrf: "ℱ",
				Fscr: "ℱ",
				GJcy: "Ѓ",
				G: ">",
				GT: ">",
				Gamma: "Γ",
				Gammad: "Ϝ",
				Gbreve: "Ğ",
				Gcedil: "Ģ",
				Gcirc: "Ĝ",
				Gcy: "Г",
				Gdot: "Ġ",
				Gfr: "𝔊",
				Gg: "⋙",
				Gopf: "𝔾",
				GreaterEqual: "≥",
				GreaterEqualLess: "⋛",
				GreaterFullEqual: "≧",
				GreaterGreater: "⪢",
				GreaterLess: "≷",
				GreaterSlantEqual: "⩾",
				GreaterTilde: "≳",
				Gscr: "𝒢",
				Gt: "≫",
				HARDcy: "Ъ",
				Hacek: "ˇ",
				Hat: "^",
				Hcirc: "Ĥ",
				Hfr: "ℌ",
				HilbertSpace: "ℋ",
				Hopf: "ℍ",
				HorizontalLine: "─",
				Hscr: "ℋ",
				Hstrok: "Ħ",
				HumpDownHump: "≎",
				HumpEqual: "≏",
				IEcy: "Е",
				IJlig: "Ĳ",
				IOcy: "Ё",
				Iacut: "Í",
				Iacute: "Í",
				Icir: "Î",
				Icirc: "Î",
				Icy: "И",
				Idot: "İ",
				Ifr: "ℑ",
				Igrav: "Ì",
				Igrave: "Ì",
				Im: "ℑ",
				Imacr: "Ī",
				ImaginaryI: "ⅈ",
				Implies: "⇒",
				Int: "∬",
				Integral: "∫",
				Intersection: "⋂",
				InvisibleComma: "⁣",
				InvisibleTimes: "⁢",
				Iogon: "Į",
				Iopf: "𝕀",
				Iota: "Ι",
				Iscr: "ℐ",
				Itilde: "Ĩ",
				Iukcy: "І",
				Ium: "Ï",
				Iuml: "Ï",
				Jcirc: "Ĵ",
				Jcy: "Й",
				Jfr: "𝔍",
				Jopf: "𝕁",
				Jscr: "𝒥",
				Jsercy: "Ј",
				Jukcy: "Є",
				KHcy: "Х",
				KJcy: "Ќ",
				Kappa: "Κ",
				Kcedil: "Ķ",
				Kcy: "К",
				Kfr: "𝔎",
				Kopf: "𝕂",
				Kscr: "𝒦",
				LJcy: "Љ",
				L: "<",
				LT: "<",
				Lacute: "Ĺ",
				Lambda: "Λ",
				Lang: "⟪",
				Laplacetrf: "ℒ",
				Larr: "↞",
				Lcaron: "Ľ",
				Lcedil: "Ļ",
				Lcy: "Л",
				LeftAngleBracket: "⟨",
				LeftArrow: "←",
				LeftArrowBar: "⇤",
				LeftArrowRightArrow: "⇆",
				LeftCeiling: "⌈",
				LeftDoubleBracket: "⟦",
				LeftDownTeeVector: "⥡",
				LeftDownVector: "⇃",
				LeftDownVectorBar: "⥙",
				LeftFloor: "⌊",
				LeftRightArrow: "↔",
				LeftRightVector: "⥎",
				LeftTee: "⊣",
				LeftTeeArrow: "↤",
				LeftTeeVector: "⥚",
				LeftTriangle: "⊲",
				LeftTriangleBar: "⧏",
				LeftTriangleEqual: "⊴",
				LeftUpDownVector: "⥑",
				LeftUpTeeVector: "⥠",
				LeftUpVector: "↿",
				LeftUpVectorBar: "⥘",
				LeftVector: "↼",
				LeftVectorBar: "⥒",
				Leftarrow: "⇐",
				Leftrightarrow: "⇔",
				LessEqualGreater: "⋚",
				LessFullEqual: "≦",
				LessGreater: "≶",
				LessLess: "⪡",
				LessSlantEqual: "⩽",
				LessTilde: "≲",
				Lfr: "𝔏",
				Ll: "⋘",
				Lleftarrow: "⇚",
				Lmidot: "Ŀ",
				LongLeftArrow: "⟵",
				LongLeftRightArrow: "⟷",
				LongRightArrow: "⟶",
				Longleftarrow: "⟸",
				Longleftrightarrow: "⟺",
				Longrightarrow: "⟹",
				Lopf: "𝕃",
				LowerLeftArrow: "↙",
				LowerRightArrow: "↘",
				Lscr: "ℒ",
				Lsh: "↰",
				Lstrok: "Ł",
				Lt: "≪",
				Map: "⤅",
				Mcy: "М",
				MediumSpace: " ",
				Mellintrf: "ℳ",
				Mfr: "𝔐",
				MinusPlus: "∓",
				Mopf: "𝕄",
				Mscr: "ℳ",
				Mu: "Μ",
				NJcy: "Њ",
				Nacute: "Ń",
				Ncaron: "Ň",
				Ncedil: "Ņ",
				Ncy: "Н",
				NegativeMediumSpace: "​",
				NegativeThickSpace: "​",
				NegativeThinSpace: "​",
				NegativeVeryThinSpace: "​",
				NestedGreaterGreater: "≫",
				NestedLessLess: "≪",
				NewLine: `
`,
				Nfr: "𝔑",
				NoBreak: "⁠",
				NonBreakingSpace: "\xA0",
				Nopf: "ℕ",
				Not: "⫬",
				NotCongruent: "≢",
				NotCupCap: "≭",
				NotDoubleVerticalBar: "∦",
				NotElement: "∉",
				NotEqual: "≠",
				NotEqualTilde: "≂̸",
				NotExists: "∄",
				NotGreater: "≯",
				NotGreaterEqual: "≱",
				NotGreaterFullEqual: "≧̸",
				NotGreaterGreater: "≫̸",
				NotGreaterLess: "≹",
				NotGreaterSlantEqual: "⩾̸",
				NotGreaterTilde: "≵",
				NotHumpDownHump: "≎̸",
				NotHumpEqual: "≏̸",
				NotLeftTriangle: "⋪",
				NotLeftTriangleBar: "⧏̸",
				NotLeftTriangleEqual: "⋬",
				NotLess: "≮",
				NotLessEqual: "≰",
				NotLessGreater: "≸",
				NotLessLess: "≪̸",
				NotLessSlantEqual: "⩽̸",
				NotLessTilde: "≴",
				NotNestedGreaterGreater: "⪢̸",
				NotNestedLessLess: "⪡̸",
				NotPrecedes: "⊀",
				NotPrecedesEqual: "⪯̸",
				NotPrecedesSlantEqual: "⋠",
				NotReverseElement: "∌",
				NotRightTriangle: "⋫",
				NotRightTriangleBar: "⧐̸",
				NotRightTriangleEqual: "⋭",
				NotSquareSubset: "⊏̸",
				NotSquareSubsetEqual: "⋢",
				NotSquareSuperset: "⊐̸",
				NotSquareSupersetEqual: "⋣",
				NotSubset: "⊂⃒",
				NotSubsetEqual: "⊈",
				NotSucceeds: "⊁",
				NotSucceedsEqual: "⪰̸",
				NotSucceedsSlantEqual: "⋡",
				NotSucceedsTilde: "≿̸",
				NotSuperset: "⊃⃒",
				NotSupersetEqual: "⊉",
				NotTilde: "≁",
				NotTildeEqual: "≄",
				NotTildeFullEqual: "≇",
				NotTildeTilde: "≉",
				NotVerticalBar: "∤",
				Nscr: "𝒩",
				Ntild: "Ñ",
				Ntilde: "Ñ",
				Nu: "Ν",
				OElig: "Œ",
				Oacut: "Ó",
				Oacute: "Ó",
				Ocir: "Ô",
				Ocirc: "Ô",
				Ocy: "О",
				Odblac: "Ő",
				Ofr: "𝔒",
				Ograv: "Ò",
				Ograve: "Ò",
				Omacr: "Ō",
				Omega: "Ω",
				Omicron: "Ο",
				Oopf: "𝕆",
				OpenCurlyDoubleQuote: "“",
				OpenCurlyQuote: "‘",
				Or: "⩔",
				Oscr: "𝒪",
				Oslas: "Ø",
				Oslash: "Ø",
				Otild: "Õ",
				Otilde: "Õ",
				Otimes: "⨷",
				Oum: "Ö",
				Ouml: "Ö",
				OverBar: "‾",
				OverBrace: "⏞",
				OverBracket: "⎴",
				OverParenthesis: "⏜",
				PartialD: "∂",
				Pcy: "П",
				Pfr: "𝔓",
				Phi: "Φ",
				Pi: "Π",
				PlusMinus: "±",
				Poincareplane: "ℌ",
				Popf: "ℙ",
				Pr: "⪻",
				Precedes: "≺",
				PrecedesEqual: "⪯",
				PrecedesSlantEqual: "≼",
				PrecedesTilde: "≾",
				Prime: "″",
				Product: "∏",
				Proportion: "∷",
				Proportional: "∝",
				Pscr: "𝒫",
				Psi: "Ψ",
				QUO: "\"",
				QUOT: "\"",
				Qfr: "𝔔",
				Qopf: "ℚ",
				Qscr: "𝒬",
				RBarr: "⤐",
				RE: "®",
				REG: "®",
				Racute: "Ŕ",
				Rang: "⟫",
				Rarr: "↠",
				Rarrtl: "⤖",
				Rcaron: "Ř",
				Rcedil: "Ŗ",
				Rcy: "Р",
				Re: "ℜ",
				ReverseElement: "∋",
				ReverseEquilibrium: "⇋",
				ReverseUpEquilibrium: "⥯",
				Rfr: "ℜ",
				Rho: "Ρ",
				RightAngleBracket: "⟩",
				RightArrow: "→",
				RightArrowBar: "⇥",
				RightArrowLeftArrow: "⇄",
				RightCeiling: "⌉",
				RightDoubleBracket: "⟧",
				RightDownTeeVector: "⥝",
				RightDownVector: "⇂",
				RightDownVectorBar: "⥕",
				RightFloor: "⌋",
				RightTee: "⊢",
				RightTeeArrow: "↦",
				RightTeeVector: "⥛",
				RightTriangle: "⊳",
				RightTriangleBar: "⧐",
				RightTriangleEqual: "⊵",
				RightUpDownVector: "⥏",
				RightUpTeeVector: "⥜",
				RightUpVector: "↾",
				RightUpVectorBar: "⥔",
				RightVector: "⇀",
				RightVectorBar: "⥓",
				Rightarrow: "⇒",
				Ropf: "ℝ",
				RoundImplies: "⥰",
				Rrightarrow: "⇛",
				Rscr: "ℛ",
				Rsh: "↱",
				RuleDelayed: "⧴",
				SHCHcy: "Щ",
				SHcy: "Ш",
				SOFTcy: "Ь",
				Sacute: "Ś",
				Sc: "⪼",
				Scaron: "Š",
				Scedil: "Ş",
				Scirc: "Ŝ",
				Scy: "С",
				Sfr: "𝔖",
				ShortDownArrow: "↓",
				ShortLeftArrow: "←",
				ShortRightArrow: "→",
				ShortUpArrow: "↑",
				Sigma: "Σ",
				SmallCircle: "∘",
				Sopf: "𝕊",
				Sqrt: "√",
				Square: "□",
				SquareIntersection: "⊓",
				SquareSubset: "⊏",
				SquareSubsetEqual: "⊑",
				SquareSuperset: "⊐",
				SquareSupersetEqual: "⊒",
				SquareUnion: "⊔",
				Sscr: "𝒮",
				Star: "⋆",
				Sub: "⋐",
				Subset: "⋐",
				SubsetEqual: "⊆",
				Succeeds: "≻",
				SucceedsEqual: "⪰",
				SucceedsSlantEqual: "≽",
				SucceedsTilde: "≿",
				SuchThat: "∋",
				Sum: "∑",
				Sup: "⋑",
				Superset: "⊃",
				SupersetEqual: "⊇",
				Supset: "⋑",
				THOR: "Þ",
				THORN: "Þ",
				TRADE: "™",
				TSHcy: "Ћ",
				TScy: "Ц",
				Tab: "	",
				Tau: "Τ",
				Tcaron: "Ť",
				Tcedil: "Ţ",
				Tcy: "Т",
				Tfr: "𝔗",
				Therefore: "∴",
				Theta: "Θ",
				ThickSpace: "  ",
				ThinSpace: " ",
				Tilde: "∼",
				TildeEqual: "≃",
				TildeFullEqual: "≅",
				TildeTilde: "≈",
				Topf: "𝕋",
				TripleDot: "⃛",
				Tscr: "𝒯",
				Tstrok: "Ŧ",
				Uacut: "Ú",
				Uacute: "Ú",
				Uarr: "↟",
				Uarrocir: "⥉",
				Ubrcy: "Ў",
				Ubreve: "Ŭ",
				Ucir: "Û",
				Ucirc: "Û",
				Ucy: "У",
				Udblac: "Ű",
				Ufr: "𝔘",
				Ugrav: "Ù",
				Ugrave: "Ù",
				Umacr: "Ū",
				UnderBar: "_",
				UnderBrace: "⏟",
				UnderBracket: "⎵",
				UnderParenthesis: "⏝",
				Union: "⋃",
				UnionPlus: "⊎",
				Uogon: "Ų",
				Uopf: "𝕌",
				UpArrow: "↑",
				UpArrowBar: "⤒",
				UpArrowDownArrow: "⇅",
				UpDownArrow: "↕",
				UpEquilibrium: "⥮",
				UpTee: "⊥",
				UpTeeArrow: "↥",
				Uparrow: "⇑",
				Updownarrow: "⇕",
				UpperLeftArrow: "↖",
				UpperRightArrow: "↗",
				Upsi: "ϒ",
				Upsilon: "Υ",
				Uring: "Ů",
				Uscr: "𝒰",
				Utilde: "Ũ",
				Uum: "Ü",
				Uuml: "Ü",
				VDash: "⊫",
				Vbar: "⫫",
				Vcy: "В",
				Vdash: "⊩",
				Vdashl: "⫦",
				Vee: "⋁",
				Verbar: "‖",
				Vert: "‖",
				VerticalBar: "∣",
				VerticalLine: "|",
				VerticalSeparator: "❘",
				VerticalTilde: "≀",
				VeryThinSpace: " ",
				Vfr: "𝔙",
				Vopf: "𝕍",
				Vscr: "𝒱",
				Vvdash: "⊪",
				Wcirc: "Ŵ",
				Wedge: "⋀",
				Wfr: "𝔚",
				Wopf: "𝕎",
				Wscr: "𝒲",
				Xfr: "𝔛",
				Xi: "Ξ",
				Xopf: "𝕏",
				Xscr: "𝒳",
				YAcy: "Я",
				YIcy: "Ї",
				YUcy: "Ю",
				Yacut: "Ý",
				Yacute: "Ý",
				Ycirc: "Ŷ",
				Ycy: "Ы",
				Yfr: "𝔜",
				Yopf: "𝕐",
				Yscr: "𝒴",
				Yuml: "Ÿ",
				ZHcy: "Ж",
				Zacute: "Ź",
				Zcaron: "Ž",
				Zcy: "З",
				Zdot: "Ż",
				ZeroWidthSpace: "​",
				Zeta: "Ζ",
				Zfr: "ℨ",
				Zopf: "ℤ",
				Zscr: "𝒵",
				aacut: "á",
				aacute: "á",
				abreve: "ă",
				ac: "∾",
				acE: "∾̳",
				acd: "∿",
				acir: "â",
				acirc: "â",
				acut: "´",
				acute: "´",
				acy: "а",
				aeli: "æ",
				aelig: "æ",
				af: "⁡",
				afr: "𝔞",
				agrav: "à",
				agrave: "à",
				alefsym: "ℵ",
				aleph: "ℵ",
				alpha: "α",
				amacr: "ā",
				amalg: "⨿",
				am: "&",
				amp: "&",
				and: "∧",
				andand: "⩕",
				andd: "⩜",
				andslope: "⩘",
				andv: "⩚",
				ang: "∠",
				ange: "⦤",
				angle: "∠",
				angmsd: "∡",
				angmsdaa: "⦨",
				angmsdab: "⦩",
				angmsdac: "⦪",
				angmsdad: "⦫",
				angmsdae: "⦬",
				angmsdaf: "⦭",
				angmsdag: "⦮",
				angmsdah: "⦯",
				angrt: "∟",
				angrtvb: "⊾",
				angrtvbd: "⦝",
				angsph: "∢",
				angst: "Å",
				angzarr: "⍼",
				aogon: "ą",
				aopf: "𝕒",
				ap: "≈",
				apE: "⩰",
				apacir: "⩯",
				ape: "≊",
				apid: "≋",
				apos: "'",
				approx: "≈",
				approxeq: "≊",
				arin: "å",
				aring: "å",
				ascr: "𝒶",
				ast: "*",
				asymp: "≈",
				asympeq: "≍",
				atild: "ã",
				atilde: "ã",
				aum: "ä",
				auml: "ä",
				awconint: "∳",
				awint: "⨑",
				bNot: "⫭",
				backcong: "≌",
				backepsilon: "϶",
				backprime: "‵",
				backsim: "∽",
				backsimeq: "⋍",
				barvee: "⊽",
				barwed: "⌅",
				barwedge: "⌅",
				bbrk: "⎵",
				bbrktbrk: "⎶",
				bcong: "≌",
				bcy: "б",
				bdquo: "„",
				becaus: "∵",
				because: "∵",
				bemptyv: "⦰",
				bepsi: "϶",
				bernou: "ℬ",
				beta: "β",
				beth: "ℶ",
				between: "≬",
				bfr: "𝔟",
				bigcap: "⋂",
				bigcirc: "◯",
				bigcup: "⋃",
				bigodot: "⨀",
				bigoplus: "⨁",
				bigotimes: "⨂",
				bigsqcup: "⨆",
				bigstar: "★",
				bigtriangledown: "▽",
				bigtriangleup: "△",
				biguplus: "⨄",
				bigvee: "⋁",
				bigwedge: "⋀",
				bkarow: "⤍",
				blacklozenge: "⧫",
				blacksquare: "▪",
				blacktriangle: "▴",
				blacktriangledown: "▾",
				blacktriangleleft: "◂",
				blacktriangleright: "▸",
				blank: "␣",
				blk12: "▒",
				blk14: "░",
				blk34: "▓",
				block: "█",
				bne: "=⃥",
				bnequiv: "≡⃥",
				bnot: "⌐",
				bopf: "𝕓",
				bot: "⊥",
				bottom: "⊥",
				bowtie: "⋈",
				boxDL: "╗",
				boxDR: "╔",
				boxDl: "╖",
				boxDr: "╓",
				boxH: "═",
				boxHD: "╦",
				boxHU: "╩",
				boxHd: "╤",
				boxHu: "╧",
				boxUL: "╝",
				boxUR: "╚",
				boxUl: "╜",
				boxUr: "╙",
				boxV: "║",
				boxVH: "╬",
				boxVL: "╣",
				boxVR: "╠",
				boxVh: "╫",
				boxVl: "╢",
				boxVr: "╟",
				boxbox: "⧉",
				boxdL: "╕",
				boxdR: "╒",
				boxdl: "┐",
				boxdr: "┌",
				boxh: "─",
				boxhD: "╥",
				boxhU: "╨",
				boxhd: "┬",
				boxhu: "┴",
				boxminus: "⊟",
				boxplus: "⊞",
				boxtimes: "⊠",
				boxuL: "╛",
				boxuR: "╘",
				boxul: "┘",
				boxur: "└",
				boxv: "│",
				boxvH: "╪",
				boxvL: "╡",
				boxvR: "╞",
				boxvh: "┼",
				boxvl: "┤",
				boxvr: "├",
				bprime: "‵",
				breve: "˘",
				brvba: "¦",
				brvbar: "¦",
				bscr: "𝒷",
				bsemi: "⁏",
				bsim: "∽",
				bsime: "⋍",
				bsol: "\\",
				bsolb: "⧅",
				bsolhsub: "⟈",
				bull: "•",
				bullet: "•",
				bump: "≎",
				bumpE: "⪮",
				bumpe: "≏",
				bumpeq: "≏",
				cacute: "ć",
				cap: "∩",
				capand: "⩄",
				capbrcup: "⩉",
				capcap: "⩋",
				capcup: "⩇",
				capdot: "⩀",
				caps: "∩︀",
				caret: "⁁",
				caron: "ˇ",
				ccaps: "⩍",
				ccaron: "č",
				ccedi: "ç",
				ccedil: "ç",
				ccirc: "ĉ",
				ccups: "⩌",
				ccupssm: "⩐",
				cdot: "ċ",
				cedi: "¸",
				cedil: "¸",
				cemptyv: "⦲",
				cen: "¢",
				cent: "¢",
				centerdot: "·",
				cfr: "𝔠",
				chcy: "ч",
				check: "✓",
				checkmark: "✓",
				chi: "χ",
				cir: "○",
				cirE: "⧃",
				circ: "ˆ",
				circeq: "≗",
				circlearrowleft: "↺",
				circlearrowright: "↻",
				circledR: "®",
				circledS: "Ⓢ",
				circledast: "⊛",
				circledcirc: "⊚",
				circleddash: "⊝",
				cire: "≗",
				cirfnint: "⨐",
				cirmid: "⫯",
				cirscir: "⧂",
				clubs: "♣",
				clubsuit: "♣",
				colon: ":",
				colone: "≔",
				coloneq: "≔",
				comma: ",",
				commat: "@",
				comp: "∁",
				compfn: "∘",
				complement: "∁",
				complexes: "ℂ",
				cong: "≅",
				congdot: "⩭",
				conint: "∮",
				copf: "𝕔",
				coprod: "∐",
				cop: "©",
				copy: "©",
				copysr: "℗",
				crarr: "↵",
				cross: "✗",
				cscr: "𝒸",
				csub: "⫏",
				csube: "⫑",
				csup: "⫐",
				csupe: "⫒",
				ctdot: "⋯",
				cudarrl: "⤸",
				cudarrr: "⤵",
				cuepr: "⋞",
				cuesc: "⋟",
				cularr: "↶",
				cularrp: "⤽",
				cup: "∪",
				cupbrcap: "⩈",
				cupcap: "⩆",
				cupcup: "⩊",
				cupdot: "⊍",
				cupor: "⩅",
				cups: "∪︀",
				curarr: "↷",
				curarrm: "⤼",
				curlyeqprec: "⋞",
				curlyeqsucc: "⋟",
				curlyvee: "⋎",
				curlywedge: "⋏",
				curre: "¤",
				curren: "¤",
				curvearrowleft: "↶",
				curvearrowright: "↷",
				cuvee: "⋎",
				cuwed: "⋏",
				cwconint: "∲",
				cwint: "∱",
				cylcty: "⌭",
				dArr: "⇓",
				dHar: "⥥",
				dagger: "†",
				daleth: "ℸ",
				darr: "↓",
				dash: "‐",
				dashv: "⊣",
				dbkarow: "⤏",
				dblac: "˝",
				dcaron: "ď",
				dcy: "д",
				dd: "ⅆ",
				ddagger: "‡",
				ddarr: "⇊",
				ddotseq: "⩷",
				de: "°",
				deg: "°",
				delta: "δ",
				demptyv: "⦱",
				dfisht: "⥿",
				dfr: "𝔡",
				dharl: "⇃",
				dharr: "⇂",
				diam: "⋄",
				diamond: "⋄",
				diamondsuit: "♦",
				diams: "♦",
				die: "¨",
				digamma: "ϝ",
				disin: "⋲",
				div: "÷",
				divid: "÷",
				divide: "÷",
				divideontimes: "⋇",
				divonx: "⋇",
				djcy: "ђ",
				dlcorn: "⌞",
				dlcrop: "⌍",
				dollar: "$",
				dopf: "𝕕",
				dot: "˙",
				doteq: "≐",
				doteqdot: "≑",
				dotminus: "∸",
				dotplus: "∔",
				dotsquare: "⊡",
				doublebarwedge: "⌆",
				downarrow: "↓",
				downdownarrows: "⇊",
				downharpoonleft: "⇃",
				downharpoonright: "⇂",
				drbkarow: "⤐",
				drcorn: "⌟",
				drcrop: "⌌",
				dscr: "𝒹",
				dscy: "ѕ",
				dsol: "⧶",
				dstrok: "đ",
				dtdot: "⋱",
				dtri: "▿",
				dtrif: "▾",
				duarr: "⇵",
				duhar: "⥯",
				dwangle: "⦦",
				dzcy: "џ",
				dzigrarr: "⟿",
				eDDot: "⩷",
				eDot: "≑",
				eacut: "é",
				eacute: "é",
				easter: "⩮",
				ecaron: "ě",
				ecir: "ê",
				ecirc: "ê",
				ecolon: "≕",
				ecy: "э",
				edot: "ė",
				ee: "ⅇ",
				efDot: "≒",
				efr: "𝔢",
				eg: "⪚",
				egrav: "è",
				egrave: "è",
				egs: "⪖",
				egsdot: "⪘",
				el: "⪙",
				elinters: "⏧",
				ell: "ℓ",
				els: "⪕",
				elsdot: "⪗",
				emacr: "ē",
				empty: "∅",
				emptyset: "∅",
				emptyv: "∅",
				emsp13: " ",
				emsp14: " ",
				emsp: " ",
				eng: "ŋ",
				ensp: " ",
				eogon: "ę",
				eopf: "𝕖",
				epar: "⋕",
				eparsl: "⧣",
				eplus: "⩱",
				epsi: "ε",
				epsilon: "ε",
				epsiv: "ϵ",
				eqcirc: "≖",
				eqcolon: "≕",
				eqsim: "≂",
				eqslantgtr: "⪖",
				eqslantless: "⪕",
				equals: "=",
				equest: "≟",
				equiv: "≡",
				equivDD: "⩸",
				eqvparsl: "⧥",
				erDot: "≓",
				erarr: "⥱",
				escr: "ℯ",
				esdot: "≐",
				esim: "≂",
				eta: "η",
				et: "ð",
				eth: "ð",
				eum: "ë",
				euml: "ë",
				euro: "€",
				excl: "!",
				exist: "∃",
				expectation: "ℰ",
				exponentiale: "ⅇ",
				fallingdotseq: "≒",
				fcy: "ф",
				female: "♀",
				ffilig: "ﬃ",
				fflig: "ﬀ",
				ffllig: "ﬄ",
				ffr: "𝔣",
				filig: "ﬁ",
				fjlig: "fj",
				flat: "♭",
				fllig: "ﬂ",
				fltns: "▱",
				fnof: "ƒ",
				fopf: "𝕗",
				forall: "∀",
				fork: "⋔",
				forkv: "⫙",
				fpartint: "⨍",
				frac1: "¼",
				frac12: "½",
				frac13: "⅓",
				frac14: "¼",
				frac15: "⅕",
				frac16: "⅙",
				frac18: "⅛",
				frac23: "⅔",
				frac25: "⅖",
				frac3: "¾",
				frac34: "¾",
				frac35: "⅗",
				frac38: "⅜",
				frac45: "⅘",
				frac56: "⅚",
				frac58: "⅝",
				frac78: "⅞",
				frasl: "⁄",
				frown: "⌢",
				fscr: "𝒻",
				gE: "≧",
				gEl: "⪌",
				gacute: "ǵ",
				gamma: "γ",
				gammad: "ϝ",
				gap: "⪆",
				gbreve: "ğ",
				gcirc: "ĝ",
				gcy: "г",
				gdot: "ġ",
				ge: "≥",
				gel: "⋛",
				geq: "≥",
				geqq: "≧",
				geqslant: "⩾",
				ges: "⩾",
				gescc: "⪩",
				gesdot: "⪀",
				gesdoto: "⪂",
				gesdotol: "⪄",
				gesl: "⋛︀",
				gesles: "⪔",
				gfr: "𝔤",
				gg: "≫",
				ggg: "⋙",
				gimel: "ℷ",
				gjcy: "ѓ",
				gl: "≷",
				glE: "⪒",
				gla: "⪥",
				glj: "⪤",
				gnE: "≩",
				gnap: "⪊",
				gnapprox: "⪊",
				gne: "⪈",
				gneq: "⪈",
				gneqq: "≩",
				gnsim: "⋧",
				gopf: "𝕘",
				grave: "`",
				gscr: "ℊ",
				gsim: "≳",
				gsime: "⪎",
				gsiml: "⪐",
				g: ">",
				gt: ">",
				gtcc: "⪧",
				gtcir: "⩺",
				gtdot: "⋗",
				gtlPar: "⦕",
				gtquest: "⩼",
				gtrapprox: "⪆",
				gtrarr: "⥸",
				gtrdot: "⋗",
				gtreqless: "⋛",
				gtreqqless: "⪌",
				gtrless: "≷",
				gtrsim: "≳",
				gvertneqq: "≩︀",
				gvnE: "≩︀",
				hArr: "⇔",
				hairsp: " ",
				half: "½",
				hamilt: "ℋ",
				hardcy: "ъ",
				harr: "↔",
				harrcir: "⥈",
				harrw: "↭",
				hbar: "ℏ",
				hcirc: "ĥ",
				hearts: "♥",
				heartsuit: "♥",
				hellip: "…",
				hercon: "⊹",
				hfr: "𝔥",
				hksearow: "⤥",
				hkswarow: "⤦",
				hoarr: "⇿",
				homtht: "∻",
				hookleftarrow: "↩",
				hookrightarrow: "↪",
				hopf: "𝕙",
				horbar: "―",
				hscr: "𝒽",
				hslash: "ℏ",
				hstrok: "ħ",
				hybull: "⁃",
				hyphen: "‐",
				iacut: "í",
				iacute: "í",
				ic: "⁣",
				icir: "î",
				icirc: "î",
				icy: "и",
				iecy: "е",
				iexc: "¡",
				iexcl: "¡",
				iff: "⇔",
				ifr: "𝔦",
				igrav: "ì",
				igrave: "ì",
				ii: "ⅈ",
				iiiint: "⨌",
				iiint: "∭",
				iinfin: "⧜",
				iiota: "℩",
				ijlig: "ĳ",
				imacr: "ī",
				image: "ℑ",
				imagline: "ℐ",
				imagpart: "ℑ",
				imath: "ı",
				imof: "⊷",
				imped: "Ƶ",
				in: "∈",
				incare: "℅",
				infin: "∞",
				infintie: "⧝",
				inodot: "ı",
				int: "∫",
				intcal: "⊺",
				integers: "ℤ",
				intercal: "⊺",
				intlarhk: "⨗",
				intprod: "⨼",
				iocy: "ё",
				iogon: "į",
				iopf: "𝕚",
				iota: "ι",
				iprod: "⨼",
				iques: "¿",
				iquest: "¿",
				iscr: "𝒾",
				isin: "∈",
				isinE: "⋹",
				isindot: "⋵",
				isins: "⋴",
				isinsv: "⋳",
				isinv: "∈",
				it: "⁢",
				itilde: "ĩ",
				iukcy: "і",
				ium: "ï",
				iuml: "ï",
				jcirc: "ĵ",
				jcy: "й",
				jfr: "𝔧",
				jmath: "ȷ",
				jopf: "𝕛",
				jscr: "𝒿",
				jsercy: "ј",
				jukcy: "є",
				kappa: "κ",
				kappav: "ϰ",
				kcedil: "ķ",
				kcy: "к",
				kfr: "𝔨",
				kgreen: "ĸ",
				khcy: "х",
				kjcy: "ќ",
				kopf: "𝕜",
				kscr: "𝓀",
				lAarr: "⇚",
				lArr: "⇐",
				lAtail: "⤛",
				lBarr: "⤎",
				lE: "≦",
				lEg: "⪋",
				lHar: "⥢",
				lacute: "ĺ",
				laemptyv: "⦴",
				lagran: "ℒ",
				lambda: "λ",
				lang: "⟨",
				langd: "⦑",
				langle: "⟨",
				lap: "⪅",
				laqu: "«",
				laquo: "«",
				larr: "←",
				larrb: "⇤",
				larrbfs: "⤟",
				larrfs: "⤝",
				larrhk: "↩",
				larrlp: "↫",
				larrpl: "⤹",
				larrsim: "⥳",
				larrtl: "↢",
				lat: "⪫",
				latail: "⤙",
				late: "⪭",
				lates: "⪭︀",
				lbarr: "⤌",
				lbbrk: "❲",
				lbrace: "{",
				lbrack: "[",
				lbrke: "⦋",
				lbrksld: "⦏",
				lbrkslu: "⦍",
				lcaron: "ľ",
				lcedil: "ļ",
				lceil: "⌈",
				lcub: "{",
				lcy: "л",
				ldca: "⤶",
				ldquo: "“",
				ldquor: "„",
				ldrdhar: "⥧",
				ldrushar: "⥋",
				ldsh: "↲",
				le: "≤",
				leftarrow: "←",
				leftarrowtail: "↢",
				leftharpoondown: "↽",
				leftharpoonup: "↼",
				leftleftarrows: "⇇",
				leftrightarrow: "↔",
				leftrightarrows: "⇆",
				leftrightharpoons: "⇋",
				leftrightsquigarrow: "↭",
				leftthreetimes: "⋋",
				leg: "⋚",
				leq: "≤",
				leqq: "≦",
				leqslant: "⩽",
				les: "⩽",
				lescc: "⪨",
				lesdot: "⩿",
				lesdoto: "⪁",
				lesdotor: "⪃",
				lesg: "⋚︀",
				lesges: "⪓",
				lessapprox: "⪅",
				lessdot: "⋖",
				lesseqgtr: "⋚",
				lesseqqgtr: "⪋",
				lessgtr: "≶",
				lesssim: "≲",
				lfisht: "⥼",
				lfloor: "⌊",
				lfr: "𝔩",
				lg: "≶",
				lgE: "⪑",
				lhard: "↽",
				lharu: "↼",
				lharul: "⥪",
				lhblk: "▄",
				ljcy: "љ",
				ll: "≪",
				llarr: "⇇",
				llcorner: "⌞",
				llhard: "⥫",
				lltri: "◺",
				lmidot: "ŀ",
				lmoust: "⎰",
				lmoustache: "⎰",
				lnE: "≨",
				lnap: "⪉",
				lnapprox: "⪉",
				lne: "⪇",
				lneq: "⪇",
				lneqq: "≨",
				lnsim: "⋦",
				loang: "⟬",
				loarr: "⇽",
				lobrk: "⟦",
				longleftarrow: "⟵",
				longleftrightarrow: "⟷",
				longmapsto: "⟼",
				longrightarrow: "⟶",
				looparrowleft: "↫",
				looparrowright: "↬",
				lopar: "⦅",
				lopf: "𝕝",
				loplus: "⨭",
				lotimes: "⨴",
				lowast: "∗",
				lowbar: "_",
				loz: "◊",
				lozenge: "◊",
				lozf: "⧫",
				lpar: "(",
				lparlt: "⦓",
				lrarr: "⇆",
				lrcorner: "⌟",
				lrhar: "⇋",
				lrhard: "⥭",
				lrm: "‎",
				lrtri: "⊿",
				lsaquo: "‹",
				lscr: "𝓁",
				lsh: "↰",
				lsim: "≲",
				lsime: "⪍",
				lsimg: "⪏",
				lsqb: "[",
				lsquo: "‘",
				lsquor: "‚",
				lstrok: "ł",
				l: "<",
				lt: "<",
				ltcc: "⪦",
				ltcir: "⩹",
				ltdot: "⋖",
				lthree: "⋋",
				ltimes: "⋉",
				ltlarr: "⥶",
				ltquest: "⩻",
				ltrPar: "⦖",
				ltri: "◃",
				ltrie: "⊴",
				ltrif: "◂",
				lurdshar: "⥊",
				luruhar: "⥦",
				lvertneqq: "≨︀",
				lvnE: "≨︀",
				mDDot: "∺",
				mac: "¯",
				macr: "¯",
				male: "♂",
				malt: "✠",
				maltese: "✠",
				map: "↦",
				mapsto: "↦",
				mapstodown: "↧",
				mapstoleft: "↤",
				mapstoup: "↥",
				marker: "▮",
				mcomma: "⨩",
				mcy: "м",
				mdash: "—",
				measuredangle: "∡",
				mfr: "𝔪",
				mho: "℧",
				micr: "µ",
				micro: "µ",
				mid: "∣",
				midast: "*",
				midcir: "⫰",
				middo: "·",
				middot: "·",
				minus: "−",
				minusb: "⊟",
				minusd: "∸",
				minusdu: "⨪",
				mlcp: "⫛",
				mldr: "…",
				mnplus: "∓",
				models: "⊧",
				mopf: "𝕞",
				mp: "∓",
				mscr: "𝓂",
				mstpos: "∾",
				mu: "μ",
				multimap: "⊸",
				mumap: "⊸",
				nGg: "⋙̸",
				nGt: "≫⃒",
				nGtv: "≫̸",
				nLeftarrow: "⇍",
				nLeftrightarrow: "⇎",
				nLl: "⋘̸",
				nLt: "≪⃒",
				nLtv: "≪̸",
				nRightarrow: "⇏",
				nVDash: "⊯",
				nVdash: "⊮",
				nabla: "∇",
				nacute: "ń",
				nang: "∠⃒",
				nap: "≉",
				napE: "⩰̸",
				napid: "≋̸",
				napos: "ŉ",
				napprox: "≉",
				natur: "♮",
				natural: "♮",
				naturals: "ℕ",
				nbs: "\xA0",
				nbsp: "\xA0",
				nbump: "≎̸",
				nbumpe: "≏̸",
				ncap: "⩃",
				ncaron: "ň",
				ncedil: "ņ",
				ncong: "≇",
				ncongdot: "⩭̸",
				ncup: "⩂",
				ncy: "н",
				ndash: "–",
				ne: "≠",
				neArr: "⇗",
				nearhk: "⤤",
				nearr: "↗",
				nearrow: "↗",
				nedot: "≐̸",
				nequiv: "≢",
				nesear: "⤨",
				nesim: "≂̸",
				nexist: "∄",
				nexists: "∄",
				nfr: "𝔫",
				ngE: "≧̸",
				nge: "≱",
				ngeq: "≱",
				ngeqq: "≧̸",
				ngeqslant: "⩾̸",
				nges: "⩾̸",
				ngsim: "≵",
				ngt: "≯",
				ngtr: "≯",
				nhArr: "⇎",
				nharr: "↮",
				nhpar: "⫲",
				ni: "∋",
				nis: "⋼",
				nisd: "⋺",
				niv: "∋",
				njcy: "њ",
				nlArr: "⇍",
				nlE: "≦̸",
				nlarr: "↚",
				nldr: "‥",
				nle: "≰",
				nleftarrow: "↚",
				nleftrightarrow: "↮",
				nleq: "≰",
				nleqq: "≦̸",
				nleqslant: "⩽̸",
				nles: "⩽̸",
				nless: "≮",
				nlsim: "≴",
				nlt: "≮",
				nltri: "⋪",
				nltrie: "⋬",
				nmid: "∤",
				nopf: "𝕟",
				no: "¬",
				not: "¬",
				notin: "∉",
				notinE: "⋹̸",
				notindot: "⋵̸",
				notinva: "∉",
				notinvb: "⋷",
				notinvc: "⋶",
				notni: "∌",
				notniva: "∌",
				notnivb: "⋾",
				notnivc: "⋽",
				npar: "∦",
				nparallel: "∦",
				nparsl: "⫽⃥",
				npart: "∂̸",
				npolint: "⨔",
				npr: "⊀",
				nprcue: "⋠",
				npre: "⪯̸",
				nprec: "⊀",
				npreceq: "⪯̸",
				nrArr: "⇏",
				nrarr: "↛",
				nrarrc: "⤳̸",
				nrarrw: "↝̸",
				nrightarrow: "↛",
				nrtri: "⋫",
				nrtrie: "⋭",
				nsc: "⊁",
				nsccue: "⋡",
				nsce: "⪰̸",
				nscr: "𝓃",
				nshortmid: "∤",
				nshortparallel: "∦",
				nsim: "≁",
				nsime: "≄",
				nsimeq: "≄",
				nsmid: "∤",
				nspar: "∦",
				nsqsube: "⋢",
				nsqsupe: "⋣",
				nsub: "⊄",
				nsubE: "⫅̸",
				nsube: "⊈",
				nsubset: "⊂⃒",
				nsubseteq: "⊈",
				nsubseteqq: "⫅̸",
				nsucc: "⊁",
				nsucceq: "⪰̸",
				nsup: "⊅",
				nsupE: "⫆̸",
				nsupe: "⊉",
				nsupset: "⊃⃒",
				nsupseteq: "⊉",
				nsupseteqq: "⫆̸",
				ntgl: "≹",
				ntild: "ñ",
				ntilde: "ñ",
				ntlg: "≸",
				ntriangleleft: "⋪",
				ntrianglelefteq: "⋬",
				ntriangleright: "⋫",
				ntrianglerighteq: "⋭",
				nu: "ν",
				num: "#",
				numero: "№",
				numsp: " ",
				nvDash: "⊭",
				nvHarr: "⤄",
				nvap: "≍⃒",
				nvdash: "⊬",
				nvge: "≥⃒",
				nvgt: ">⃒",
				nvinfin: "⧞",
				nvlArr: "⤂",
				nvle: "≤⃒",
				nvlt: "<⃒",
				nvltrie: "⊴⃒",
				nvrArr: "⤃",
				nvrtrie: "⊵⃒",
				nvsim: "∼⃒",
				nwArr: "⇖",
				nwarhk: "⤣",
				nwarr: "↖",
				nwarrow: "↖",
				nwnear: "⤧",
				oS: "Ⓢ",
				oacut: "ó",
				oacute: "ó",
				oast: "⊛",
				ocir: "ô",
				ocirc: "ô",
				ocy: "о",
				odash: "⊝",
				odblac: "ő",
				odiv: "⨸",
				odot: "⊙",
				odsold: "⦼",
				oelig: "œ",
				ofcir: "⦿",
				ofr: "𝔬",
				ogon: "˛",
				ograv: "ò",
				ograve: "ò",
				ogt: "⧁",
				ohbar: "⦵",
				ohm: "Ω",
				oint: "∮",
				olarr: "↺",
				olcir: "⦾",
				olcross: "⦻",
				oline: "‾",
				olt: "⧀",
				omacr: "ō",
				omega: "ω",
				omicron: "ο",
				omid: "⦶",
				ominus: "⊖",
				oopf: "𝕠",
				opar: "⦷",
				operp: "⦹",
				oplus: "⊕",
				or: "∨",
				orarr: "↻",
				ord: "º",
				order: "ℴ",
				orderof: "ℴ",
				ordf: "ª",
				ordm: "º",
				origof: "⊶",
				oror: "⩖",
				orslope: "⩗",
				orv: "⩛",
				oscr: "ℴ",
				oslas: "ø",
				oslash: "ø",
				osol: "⊘",
				otild: "õ",
				otilde: "õ",
				otimes: "⊗",
				otimesas: "⨶",
				oum: "ö",
				ouml: "ö",
				ovbar: "⌽",
				par: "¶",
				para: "¶",
				parallel: "∥",
				parsim: "⫳",
				parsl: "⫽",
				part: "∂",
				pcy: "п",
				percnt: "%",
				period: ".",
				permil: "‰",
				perp: "⊥",
				pertenk: "‱",
				pfr: "𝔭",
				phi: "φ",
				phiv: "ϕ",
				phmmat: "ℳ",
				phone: "☎",
				pi: "π",
				pitchfork: "⋔",
				piv: "ϖ",
				planck: "ℏ",
				planckh: "ℎ",
				plankv: "ℏ",
				plus: "+",
				plusacir: "⨣",
				plusb: "⊞",
				pluscir: "⨢",
				plusdo: "∔",
				plusdu: "⨥",
				pluse: "⩲",
				plusm: "±",
				plusmn: "±",
				plussim: "⨦",
				plustwo: "⨧",
				pm: "±",
				pointint: "⨕",
				popf: "𝕡",
				poun: "£",
				pound: "£",
				pr: "≺",
				prE: "⪳",
				prap: "⪷",
				prcue: "≼",
				pre: "⪯",
				prec: "≺",
				precapprox: "⪷",
				preccurlyeq: "≼",
				preceq: "⪯",
				precnapprox: "⪹",
				precneqq: "⪵",
				precnsim: "⋨",
				precsim: "≾",
				prime: "′",
				primes: "ℙ",
				prnE: "⪵",
				prnap: "⪹",
				prnsim: "⋨",
				prod: "∏",
				profalar: "⌮",
				profline: "⌒",
				profsurf: "⌓",
				prop: "∝",
				propto: "∝",
				prsim: "≾",
				prurel: "⊰",
				pscr: "𝓅",
				psi: "ψ",
				puncsp: " ",
				qfr: "𝔮",
				qint: "⨌",
				qopf: "𝕢",
				qprime: "⁗",
				qscr: "𝓆",
				quaternions: "ℍ",
				quatint: "⨖",
				quest: "?",
				questeq: "≟",
				quo: "\"",
				quot: "\"",
				rAarr: "⇛",
				rArr: "⇒",
				rAtail: "⤜",
				rBarr: "⤏",
				rHar: "⥤",
				race: "∽̱",
				racute: "ŕ",
				radic: "√",
				raemptyv: "⦳",
				rang: "⟩",
				rangd: "⦒",
				range: "⦥",
				rangle: "⟩",
				raqu: "»",
				raquo: "»",
				rarr: "→",
				rarrap: "⥵",
				rarrb: "⇥",
				rarrbfs: "⤠",
				rarrc: "⤳",
				rarrfs: "⤞",
				rarrhk: "↪",
				rarrlp: "↬",
				rarrpl: "⥅",
				rarrsim: "⥴",
				rarrtl: "↣",
				rarrw: "↝",
				ratail: "⤚",
				ratio: "∶",
				rationals: "ℚ",
				rbarr: "⤍",
				rbbrk: "❳",
				rbrace: "}",
				rbrack: "]",
				rbrke: "⦌",
				rbrksld: "⦎",
				rbrkslu: "⦐",
				rcaron: "ř",
				rcedil: "ŗ",
				rceil: "⌉",
				rcub: "}",
				rcy: "р",
				rdca: "⤷",
				rdldhar: "⥩",
				rdquo: "”",
				rdquor: "”",
				rdsh: "↳",
				real: "ℜ",
				realine: "ℛ",
				realpart: "ℜ",
				reals: "ℝ",
				rect: "▭",
				re: "®",
				reg: "®",
				rfisht: "⥽",
				rfloor: "⌋",
				rfr: "𝔯",
				rhard: "⇁",
				rharu: "⇀",
				rharul: "⥬",
				rho: "ρ",
				rhov: "ϱ",
				rightarrow: "→",
				rightarrowtail: "↣",
				rightharpoondown: "⇁",
				rightharpoonup: "⇀",
				rightleftarrows: "⇄",
				rightleftharpoons: "⇌",
				rightrightarrows: "⇉",
				rightsquigarrow: "↝",
				rightthreetimes: "⋌",
				ring: "˚",
				risingdotseq: "≓",
				rlarr: "⇄",
				rlhar: "⇌",
				rlm: "‏",
				rmoust: "⎱",
				rmoustache: "⎱",
				rnmid: "⫮",
				roang: "⟭",
				roarr: "⇾",
				robrk: "⟧",
				ropar: "⦆",
				ropf: "𝕣",
				roplus: "⨮",
				rotimes: "⨵",
				rpar: ")",
				rpargt: "⦔",
				rppolint: "⨒",
				rrarr: "⇉",
				rsaquo: "›",
				rscr: "𝓇",
				rsh: "↱",
				rsqb: "]",
				rsquo: "’",
				rsquor: "’",
				rthree: "⋌",
				rtimes: "⋊",
				rtri: "▹",
				rtrie: "⊵",
				rtrif: "▸",
				rtriltri: "⧎",
				ruluhar: "⥨",
				rx: "℞",
				sacute: "ś",
				sbquo: "‚",
				sc: "≻",
				scE: "⪴",
				scap: "⪸",
				scaron: "š",
				sccue: "≽",
				sce: "⪰",
				scedil: "ş",
				scirc: "ŝ",
				scnE: "⪶",
				scnap: "⪺",
				scnsim: "⋩",
				scpolint: "⨓",
				scsim: "≿",
				scy: "с",
				sdot: "⋅",
				sdotb: "⊡",
				sdote: "⩦",
				seArr: "⇘",
				searhk: "⤥",
				searr: "↘",
				searrow: "↘",
				sec: "§",
				sect: "§",
				semi: ";",
				seswar: "⤩",
				setminus: "∖",
				setmn: "∖",
				sext: "✶",
				sfr: "𝔰",
				sfrown: "⌢",
				sharp: "♯",
				shchcy: "щ",
				shcy: "ш",
				shortmid: "∣",
				shortparallel: "∥",
				sh: "­",
				shy: "­",
				sigma: "σ",
				sigmaf: "ς",
				sigmav: "ς",
				sim: "∼",
				simdot: "⩪",
				sime: "≃",
				simeq: "≃",
				simg: "⪞",
				simgE: "⪠",
				siml: "⪝",
				simlE: "⪟",
				simne: "≆",
				simplus: "⨤",
				simrarr: "⥲",
				slarr: "←",
				smallsetminus: "∖",
				smashp: "⨳",
				smeparsl: "⧤",
				smid: "∣",
				smile: "⌣",
				smt: "⪪",
				smte: "⪬",
				smtes: "⪬︀",
				softcy: "ь",
				sol: "/",
				solb: "⧄",
				solbar: "⌿",
				sopf: "𝕤",
				spades: "♠",
				spadesuit: "♠",
				spar: "∥",
				sqcap: "⊓",
				sqcaps: "⊓︀",
				sqcup: "⊔",
				sqcups: "⊔︀",
				sqsub: "⊏",
				sqsube: "⊑",
				sqsubset: "⊏",
				sqsubseteq: "⊑",
				sqsup: "⊐",
				sqsupe: "⊒",
				sqsupset: "⊐",
				sqsupseteq: "⊒",
				squ: "□",
				square: "□",
				squarf: "▪",
				squf: "▪",
				srarr: "→",
				sscr: "𝓈",
				ssetmn: "∖",
				ssmile: "⌣",
				sstarf: "⋆",
				star: "☆",
				starf: "★",
				straightepsilon: "ϵ",
				straightphi: "ϕ",
				strns: "¯",
				sub: "⊂",
				subE: "⫅",
				subdot: "⪽",
				sube: "⊆",
				subedot: "⫃",
				submult: "⫁",
				subnE: "⫋",
				subne: "⊊",
				subplus: "⪿",
				subrarr: "⥹",
				subset: "⊂",
				subseteq: "⊆",
				subseteqq: "⫅",
				subsetneq: "⊊",
				subsetneqq: "⫋",
				subsim: "⫇",
				subsub: "⫕",
				subsup: "⫓",
				succ: "≻",
				succapprox: "⪸",
				succcurlyeq: "≽",
				succeq: "⪰",
				succnapprox: "⪺",
				succneqq: "⪶",
				succnsim: "⋩",
				succsim: "≿",
				sum: "∑",
				sung: "♪",
				sup: "⊃",
				sup1: "¹",
				sup2: "²",
				sup3: "³",
				supE: "⫆",
				supdot: "⪾",
				supdsub: "⫘",
				supe: "⊇",
				supedot: "⫄",
				suphsol: "⟉",
				suphsub: "⫗",
				suplarr: "⥻",
				supmult: "⫂",
				supnE: "⫌",
				supne: "⊋",
				supplus: "⫀",
				supset: "⊃",
				supseteq: "⊇",
				supseteqq: "⫆",
				supsetneq: "⊋",
				supsetneqq: "⫌",
				supsim: "⫈",
				supsub: "⫔",
				supsup: "⫖",
				swArr: "⇙",
				swarhk: "⤦",
				swarr: "↙",
				swarrow: "↙",
				swnwar: "⤪",
				szli: "ß",
				szlig: "ß",
				target: "⌖",
				tau: "τ",
				tbrk: "⎴",
				tcaron: "ť",
				tcedil: "ţ",
				tcy: "т",
				tdot: "⃛",
				telrec: "⌕",
				tfr: "𝔱",
				there4: "∴",
				therefore: "∴",
				theta: "θ",
				thetasym: "ϑ",
				thetav: "ϑ",
				thickapprox: "≈",
				thicksim: "∼",
				thinsp: " ",
				thkap: "≈",
				thksim: "∼",
				thor: "þ",
				thorn: "þ",
				tilde: "˜",
				time: "×",
				times: "×",
				timesb: "⊠",
				timesbar: "⨱",
				timesd: "⨰",
				tint: "∭",
				toea: "⤨",
				top: "⊤",
				topbot: "⌶",
				topcir: "⫱",
				topf: "𝕥",
				topfork: "⫚",
				tosa: "⤩",
				tprime: "‴",
				trade: "™",
				triangle: "▵",
				triangledown: "▿",
				triangleleft: "◃",
				trianglelefteq: "⊴",
				triangleq: "≜",
				triangleright: "▹",
				trianglerighteq: "⊵",
				tridot: "◬",
				trie: "≜",
				triminus: "⨺",
				triplus: "⨹",
				trisb: "⧍",
				tritime: "⨻",
				trpezium: "⏢",
				tscr: "𝓉",
				tscy: "ц",
				tshcy: "ћ",
				tstrok: "ŧ",
				twixt: "≬",
				twoheadleftarrow: "↞",
				twoheadrightarrow: "↠",
				uArr: "⇑",
				uHar: "⥣",
				uacut: "ú",
				uacute: "ú",
				uarr: "↑",
				ubrcy: "ў",
				ubreve: "ŭ",
				ucir: "û",
				ucirc: "û",
				ucy: "у",
				udarr: "⇅",
				udblac: "ű",
				udhar: "⥮",
				ufisht: "⥾",
				ufr: "𝔲",
				ugrav: "ù",
				ugrave: "ù",
				uharl: "↿",
				uharr: "↾",
				uhblk: "▀",
				ulcorn: "⌜",
				ulcorner: "⌜",
				ulcrop: "⌏",
				ultri: "◸",
				umacr: "ū",
				um: "¨",
				uml: "¨",
				uogon: "ų",
				uopf: "𝕦",
				uparrow: "↑",
				updownarrow: "↕",
				upharpoonleft: "↿",
				upharpoonright: "↾",
				uplus: "⊎",
				upsi: "υ",
				upsih: "ϒ",
				upsilon: "υ",
				upuparrows: "⇈",
				urcorn: "⌝",
				urcorner: "⌝",
				urcrop: "⌎",
				uring: "ů",
				urtri: "◹",
				uscr: "𝓊",
				utdot: "⋰",
				utilde: "ũ",
				utri: "▵",
				utrif: "▴",
				uuarr: "⇈",
				uum: "ü",
				uuml: "ü",
				uwangle: "⦧",
				vArr: "⇕",
				vBar: "⫨",
				vBarv: "⫩",
				vDash: "⊨",
				vangrt: "⦜",
				varepsilon: "ϵ",
				varkappa: "ϰ",
				varnothing: "∅",
				varphi: "ϕ",
				varpi: "ϖ",
				varpropto: "∝",
				varr: "↕",
				varrho: "ϱ",
				varsigma: "ς",
				varsubsetneq: "⊊︀",
				varsubsetneqq: "⫋︀",
				varsupsetneq: "⊋︀",
				varsupsetneqq: "⫌︀",
				vartheta: "ϑ",
				vartriangleleft: "⊲",
				vartriangleright: "⊳",
				vcy: "в",
				vdash: "⊢",
				vee: "∨",
				veebar: "⊻",
				veeeq: "≚",
				vellip: "⋮",
				verbar: "|",
				vert: "|",
				vfr: "𝔳",
				vltri: "⊲",
				vnsub: "⊂⃒",
				vnsup: "⊃⃒",
				vopf: "𝕧",
				vprop: "∝",
				vrtri: "⊳",
				vscr: "𝓋",
				vsubnE: "⫋︀",
				vsubne: "⊊︀",
				vsupnE: "⫌︀",
				vsupne: "⊋︀",
				vzigzag: "⦚",
				wcirc: "ŵ",
				wedbar: "⩟",
				wedge: "∧",
				wedgeq: "≙",
				weierp: "℘",
				wfr: "𝔴",
				wopf: "𝕨",
				wp: "℘",
				wr: "≀",
				wreath: "≀",
				wscr: "𝓌",
				xcap: "⋂",
				xcirc: "◯",
				xcup: "⋃",
				xdtri: "▽",
				xfr: "𝔵",
				xhArr: "⟺",
				xharr: "⟷",
				xi: "ξ",
				xlArr: "⟸",
				xlarr: "⟵",
				xmap: "⟼",
				xnis: "⋻",
				xodot: "⨀",
				xopf: "𝕩",
				xoplus: "⨁",
				xotime: "⨂",
				xrArr: "⟹",
				xrarr: "⟶",
				xscr: "𝓍",
				xsqcup: "⨆",
				xuplus: "⨄",
				xutri: "△",
				xvee: "⋁",
				xwedge: "⋀",
				yacut: "ý",
				yacute: "ý",
				yacy: "я",
				ycirc: "ŷ",
				ycy: "ы",
				ye: "¥",
				yen: "¥",
				yfr: "𝔶",
				yicy: "ї",
				yopf: "𝕪",
				yscr: "𝓎",
				yucy: "ю",
				yum: "ÿ",
				yuml: "ÿ",
				zacute: "ź",
				zcaron: "ž",
				zcy: "з",
				zdot: "ż",
				zeetrf: "ℨ",
				zeta: "ζ",
				zfr: "𝔷",
				zhcy: "ж",
				zigrarr: "⇝",
				zopf: "𝕫",
				zscr: "𝓏",
				zwj: "‍",
				zwnj: "‌"
			};
		});
		var Su = x((hv, Iu) => {
			"use strict";
			var Pu = Nu();
			Iu.exports = RD;
			var LD = {}.hasOwnProperty;
			function RD(e) {
				return LD.call(Pu, e) ? Pu[e] : !1;
			}
		});
		var mr = x((dv, Ku) => {
			"use strict";
			var Lu = yu(), Ru = wu(), MD = Se(), UD = Bu(), Gu = qu(), YD = Su();
			Ku.exports = ep;
			var GD = {}.hasOwnProperty, He = String.fromCharCode, zD = Function.prototype, Mu = {
				warning: null,
				reference: null,
				text: null,
				warningContext: null,
				referenceContext: null,
				textContext: null,
				position: {},
				additional: null,
				attribute: !1,
				nonTerminated: !0
			}, WD = 9, Uu = 10, VD = 12, jD = 32, Yu = 38, $D = 59, HD = 60, KD = 61, XD = 35, JD = 88, QD = 120, ZD = 65533, Ke = "named", Wt = "hexadecimal", Vt = "decimal", jt = {};
			jt[Wt] = 16;
			jt[Vt] = 10;
			var Kr = {};
			Kr[Ke] = Gu;
			Kr[Vt] = MD;
			Kr[Wt] = UD;
			var zu = 1, Wu = 2, Vu = 3, ju = 4, $u = 5, zt = 6, Hu = 7, we = {};
			we[zu] = "Named character references must be terminated by a semicolon";
			we[Wu] = "Numeric character references must be terminated by a semicolon";
			we[Vu] = "Named character references cannot be empty";
			we[ju] = "Numeric character references cannot be empty";
			we[$u] = "Named character references must be known";
			we[zt] = "Numeric character references cannot be disallowed";
			we[Hu] = "Numeric character references cannot be outside the permissible Unicode range";
			function ep(e, r) {
				var t = {}, n, i;
				r || (r = {});
				for (i in Mu) n = r[i], t[i] = n ?? Mu[i];
				return (t.position.indent || t.position.start) && (t.indent = t.position.indent || [], t.position = t.position.start), rp(e, t);
			}
			function rp(e, r) {
				var t = r.additional, n = r.nonTerminated, i = r.text, u = r.reference, a = r.warning, o = r.textContext, s = r.referenceContext, l = r.warningContext, c = r.position, f = r.indent || [], D = e.length, m = 0, p = -1, h = c.column || 1, F = c.line || 1, g = "", E = [], v, A, b, d, y, w, C, k, T, B, _, S, P, N, O, I, le, K, L;
				for (typeof t == "string" && (t = t.charCodeAt(0)), I = ie(), k = a ? Z : zD, m--, D++; ++m < D;) if (y === Uu && (h = f[p] || 1), y = e.charCodeAt(m), y === Yu) {
					if (C = e.charCodeAt(m + 1), C === WD || C === Uu || C === VD || C === jD || C === Yu || C === HD || C !== C || t && C === t) {
						g += He(y), h++;
						continue;
					}
					for (P = m + 1, S = P, L = P, C === XD ? (L = ++S, C = e.charCodeAt(L), C === JD || C === QD ? (N = Wt, L = ++S) : N = Vt) : N = Ke, v = "", _ = "", d = "", O = Kr[N], L--; ++L < D && (C = e.charCodeAt(L), !!O(C));) d += He(C), N === Ke && GD.call(Lu, d) && (v = d, _ = Lu[d]);
					b = e.charCodeAt(L) === $D, b && (L++, A = N === Ke ? YD(d) : !1, A && (v = d, _ = A)), K = 1 + L - P, !b && !n || (d ? N === Ke ? (b && !_ ? k($u, 1) : (v !== d && (L = S + v.length, K = 1 + L - S, b = !1), b || (T = v ? zu : Vu, r.attribute ? (C = e.charCodeAt(L), C === KD ? (k(T, K), _ = null) : Gu(C) ? _ = null : k(T, K)) : k(T, K))), w = _) : (b || k(Wu, K), w = parseInt(d, jt[N]), tp(w) ? (k(Hu, K), w = He(ZD)) : w in Ru ? (k(zt, K), w = Ru[w]) : (B = "", np(w) && k(zt, K), w > 65535 && (w -= 65536, B += He(w >>> 10 | 55296), w = 56320 | w & 1023), w = B + He(w))) : N !== Ke && k(ju, K)), w ? (ve(), I = ie(), m = L - 1, h += L - P + 1, E.push(w), le = ie(), le.offset++, u && u.call(s, w, {
						start: I,
						end: le
					}, e.slice(P - 1, L)), I = le) : (d = e.slice(P - 1, L), g += d, h += d.length, m = L - 1);
				} else y === 10 && (F++, p++, h = 0), y === y ? (g += He(y), h++) : ve();
				return E.join("");
				function ie() {
					return {
						line: F,
						column: h,
						offset: m + (c.offset || 0)
					};
				}
				function Z(Ae, G) {
					var Ft = ie();
					Ft.column += G, Ft.offset += G, a.call(l, we[Ae], Ft, Ae);
				}
				function ve() {
					g && (E.push(g), i && i.call(o, g, {
						start: I,
						end: ie()
					}), g = "");
				}
			}
			function tp(e) {
				return e >= 55296 && e <= 57343 || e > 1114111;
			}
			function np(e) {
				return e >= 1 && e <= 8 || e === 11 || e >= 13 && e <= 31 || e >= 127 && e <= 159 || e >= 64976 && e <= 65007 || (e & 65535) === 65535 || (e & 65535) === 65534;
			}
		});
		var Qu = x((mv, Ju) => {
			"use strict";
			var ip = Ie(), Xu = mr();
			Ju.exports = up;
			function up(e) {
				return t.raw = n, t;
				function r(u) {
					for (var a = e.offset, o = u.line, s = []; ++o && o in a;) s.push((a[o] || 0) + 1);
					return {
						start: u,
						indent: s
					};
				}
				function t(u, a, o) {
					Xu(u, {
						position: r(a),
						warning: i,
						text: o,
						reference: o,
						textContext: e,
						referenceContext: e
					});
				}
				function n(u, a, o) {
					return Xu(u, ip(o, {
						position: r(a),
						warning: i
					}));
				}
				function i(u, a, o) {
					o !== 3 && e.file.message(u, a);
				}
			}
		});
		var ra = x((Fv, ea) => {
			"use strict";
			ea.exports = ap;
			function ap(e) {
				return r;
				function r(t, n) {
					var i = this, u = i.offset, a = [], o = i[e + "Methods"], s = i[e + "Tokenizers"], l = n.line, c = n.column, f, D, m, p, h, F;
					if (!t) return a;
					for (w.now = v, w.file = i.file, g(""); t;) {
						for (f = -1, D = o.length, h = !1; ++f < D && (p = o[f], m = s[p], !(m && (!m.onlyAtStart || i.atStart) && (!m.notInList || !i.inList) && (!m.notInBlock || !i.inBlock) && (!m.notInLink || !i.inLink) && (F = t.length, m.apply(i, [w, t]), h = F !== t.length, h))););
						h || i.file.fail(/* @__PURE__ */ new Error("Infinite loop"), w.now());
					}
					return i.eof = v(), a;
					function g(C) {
						for (var k = -1, T = C.indexOf(`
`); T !== -1;) l++, k = T, T = C.indexOf(`
`, T + 1);
						k === -1 ? c += C.length : c = C.length - k, l in u && (k !== -1 ? c += u[l] : c <= u[l] && (c = u[l] + 1));
					}
					function E() {
						var C = [], k = l + 1;
						return function() {
							for (var T = l + 1; k < T;) C.push((u[k] || 0) + 1), k++;
							return C;
						};
					}
					function v() {
						var C = {
							line: l,
							column: c
						};
						return C.offset = i.toOffset(C), C;
					}
					function A(C) {
						this.start = C, this.end = v();
					}
					function b(C) {
						t.slice(0, C.length) !== C && i.file.fail(/* @__PURE__ */ new Error("Incorrectly eaten value: please report this warning on https://git.io/vg5Ft"), v());
					}
					function d() {
						var C = v();
						return k;
						function k(T, B) {
							var _ = T.position, S = _ ? _.start : C, P = [], N = _ && _.end.line, O = C.line;
							if (T.position = new A(S), _ && B && _.indent) {
								if (P = _.indent, N < O) {
									for (; ++N < O;) P.push((u[N] || 0) + 1);
									P.push(C.column);
								}
								B = P.concat(B);
							}
							return T.position.indent = B || [], T;
						}
					}
					function y(C, k) {
						var T = k ? k.children : a, B = T[T.length - 1], _;
						return B && C.type === B.type && (C.type === "text" || C.type === "blockquote") && Zu(B) && Zu(C) && (_ = C.type === "text" ? op : sp, C = _.call(i, B, C)), C !== B && T.push(C), i.atStart && a.length !== 0 && i.exitStart(), C;
					}
					function w(C) {
						var k = E(), T = d(), B = v();
						return b(C), _.reset = S, S.test = P, _.test = P, t = t.slice(C.length), g(C), k = k(), _;
						function _(N, O) {
							return T(y(T(N), O), k);
						}
						function S() {
							var N = _.apply(null, arguments);
							return l = B.line, c = B.column, t = C + t, N;
						}
						function P() {
							var N = T({});
							return l = B.line, c = B.column, t = C + t, N.position;
						}
					}
				}
			}
			function Zu(e) {
				var r, t;
				return e.type !== "text" || !e.position ? !0 : (r = e.position.start, t = e.position.end, r.line !== t.line || t.column - r.column === e.value.length);
			}
			function op(e, r) {
				return e.value += r.value, e;
			}
			function sp(e, r) {
				return this.options.commonmark || this.options.gfm ? r : (e.children = e.children.concat(r.children), e);
			}
		});
		var ia = x((gv, na) => {
			"use strict";
			na.exports = Xr;
			var $t = [
				"\\",
				"`",
				"*",
				"{",
				"}",
				"[",
				"]",
				"(",
				")",
				"#",
				"+",
				"-",
				".",
				"!",
				"_",
				">"
			], Ht = $t.concat(["~", "|"]), ta = Ht.concat([
				`
`,
				"\"",
				"$",
				"%",
				"&",
				"'",
				",",
				"/",
				":",
				";",
				"<",
				"=",
				"?",
				"@",
				"^"
			]);
			Xr.default = $t;
			Xr.gfm = Ht;
			Xr.commonmark = ta;
			function Xr(e) {
				var r = e || {};
				return r.commonmark ? ta : r.gfm ? Ht : $t;
			}
		});
		var aa = x((Ev, ua) => {
			"use strict";
			ua.exports = [
				"address",
				"article",
				"aside",
				"base",
				"basefont",
				"blockquote",
				"body",
				"caption",
				"center",
				"col",
				"colgroup",
				"dd",
				"details",
				"dialog",
				"dir",
				"div",
				"dl",
				"dt",
				"fieldset",
				"figcaption",
				"figure",
				"footer",
				"form",
				"frame",
				"frameset",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"head",
				"header",
				"hgroup",
				"hr",
				"html",
				"iframe",
				"legend",
				"li",
				"link",
				"main",
				"menu",
				"menuitem",
				"meta",
				"nav",
				"noframes",
				"ol",
				"optgroup",
				"option",
				"p",
				"param",
				"pre",
				"section",
				"source",
				"title",
				"summary",
				"table",
				"tbody",
				"td",
				"tfoot",
				"th",
				"thead",
				"title",
				"tr",
				"track",
				"ul"
			];
		});
		var Kt = x((Cv, oa) => {
			"use strict";
			oa.exports = {
				position: !0,
				gfm: !0,
				commonmark: !1,
				pedantic: !1,
				blocks: aa()
			};
		});
		var ca = x((vv, sa) => {
			"use strict";
			var cp = Ie(), lp = ia(), fp = Kt();
			sa.exports = Dp;
			function Dp(e) {
				var r = this, t = r.options, n, i;
				if (e == null) e = {};
				else if (typeof e == "object") e = cp(e);
				else throw new Error("Invalid value `" + e + "` for setting `options`");
				for (n in fp) {
					if (i = e[n], i ??= t[n], n !== "blocks" && typeof i != "boolean" || n === "blocks" && typeof i != "object") throw new Error("Invalid value `" + i + "` for setting `options." + n + "`");
					e[n] = i;
				}
				return r.options = e, r.escape = lp(e), r;
			}
		});
		var Da = x((Av, fa) => {
			"use strict";
			fa.exports = la;
			function la(e) {
				if (e == null) return mp;
				if (typeof e == "string") return dp(e);
				if (typeof e == "object") return "length" in e ? hp(e) : pp(e);
				if (typeof e == "function") return e;
				throw new Error("Expected function, string, or object as test");
			}
			function pp(e) {
				return r;
				function r(t) {
					var n;
					for (n in e) if (t[n] !== e[n]) return !1;
					return !0;
				}
			}
			function hp(e) {
				for (var r = [], t = -1; ++t < e.length;) r[t] = la(e[t]);
				return n;
				function n() {
					for (var i = -1; ++i < r.length;) if (r[i].apply(this, arguments)) return !0;
					return !1;
				}
			}
			function dp(e) {
				return r;
				function r(t) {
					return !!(t && t.type === e);
				}
			}
			function mp() {
				return !0;
			}
		});
		var ha = x((bv, pa) => {
			pa.exports = Fp;
			function Fp(e) {
				return e;
			}
		});
		var ga = x((xv, Fa) => {
			"use strict";
			Fa.exports = Jr;
			var gp = Da(), Ep = ha(), da = !0, ma = "skip", Xt = !1;
			Jr.CONTINUE = da;
			Jr.SKIP = ma;
			Jr.EXIT = Xt;
			function Jr(e, r, t, n) {
				var i, u;
				typeof r == "function" && typeof t != "function" && (n = t, t = r, r = null), u = gp(r), i = n ? -1 : 1, a(e, null, [])();
				function a(o, s, l) {
					var c = typeof o == "object" && o !== null ? o : {}, f;
					return typeof c.type == "string" && (f = typeof c.tagName == "string" ? c.tagName : typeof c.name == "string" ? c.name : void 0, D.displayName = "node (" + Ep(c.type + (f ? "<" + f + ">" : "")) + ")"), D;
					function D() {
						var m = l.concat(o), p = [], h, F;
						if ((!r || u(o, s, l[l.length - 1] || null)) && (p = Cp(t(o, l)), p[0] === Xt)) return p;
						if (o.children && p[0] !== ma) for (F = (n ? o.children.length : -1) + i; F > -1 && F < o.children.length;) {
							if (h = a(o.children[F], F, m)(), h[0] === Xt) return h;
							F = typeof h[1] == "number" ? h[1] : F + i;
						}
						return p;
					}
				}
			}
			function Cp(e) {
				return e !== null && typeof e == "object" && "length" in e ? e : typeof e == "number" ? [da, e] : [e];
			}
		});
		var Ca = x((yv, Ea) => {
			"use strict";
			Ea.exports = Zr;
			var Qr = ga(), vp = Qr.CONTINUE, Ap = Qr.SKIP, bp = Qr.EXIT;
			Zr.CONTINUE = vp;
			Zr.SKIP = Ap;
			Zr.EXIT = bp;
			function Zr(e, r, t, n) {
				typeof r == "function" && typeof t != "function" && (n = t, t = r, r = null), Qr(e, r, i, n);
				function i(u, a) {
					var o = a[a.length - 1], s = o ? o.children.indexOf(u) : null;
					return t(u, s, o);
				}
			}
		});
		var Aa = x((wv, va) => {
			"use strict";
			var xp = Ca();
			va.exports = yp;
			function yp(e, r) {
				return xp(e, r ? wp : kp), e;
			}
			function wp(e) {
				delete e.position;
			}
			function kp(e) {
				e.position = void 0;
			}
		});
		var ya = x((kv, xa) => {
			"use strict";
			var ba = Ie(), Tp = Aa();
			xa.exports = Op;
			var Bp = `
`, _p = /\r\n|\r/g;
			function Op() {
				var e = this, r = String(e.file), t = {
					line: 1,
					column: 1,
					offset: 0
				}, n = ba(t), i;
				return r = r.replace(_p, Bp), r.charCodeAt(0) === 65279 && (r = r.slice(1), n.column++, n.offset++), i = {
					type: "root",
					children: e.tokenizeBlock(r, n),
					position: {
						start: t,
						end: e.eof || ba(t)
					}
				}, e.options.position || Tp(i, !0), i;
			}
		});
		var ka = x((Tv, wa) => {
			"use strict";
			var qp = /^[ \t]*(\n|$)/;
			wa.exports = Np;
			function Np(e, r, t) {
				for (var n, i = "", u = 0, a = r.length; u < a && (n = qp.exec(r.slice(u)), n != null);) u += n[0].length, i += n[0];
				if (i !== "") {
					if (t) return !0;
					e(i);
				}
			}
		});
		var et = x((Bv, Ta) => {
			"use strict";
			var ge = "", Jt;
			Ta.exports = Pp;
			function Pp(e, r) {
				if (typeof e != "string") throw new TypeError("expected a string");
				if (r === 1) return e;
				if (r === 2) return e + e;
				var t = e.length * r;
				if (Jt !== e || typeof Jt > "u") Jt = e, ge = "";
				else if (ge.length >= t) return ge.substr(0, t);
				for (; t > ge.length && r > 1;) r & 1 && (ge += e), r >>= 1, e += e;
				return ge += e, ge = ge.substr(0, t), ge;
			}
		});
		var Qt = x((_v, Ba) => {
			"use strict";
			Ba.exports = Ip;
			function Ip(e) {
				return String(e).replace(/\n+$/, "");
			}
		});
		var qa = x((Ov, Oa) => {
			"use strict";
			var Sp = et(), Lp = Qt();
			Oa.exports = Up;
			var Zt = `
`, _a = "	", en = " ", Mp = Sp(en, 4);
			function Up(e, r, t) {
				for (var n = -1, i = r.length, u = "", a = "", o = "", s = "", l, c, f; ++n < i;) if (l = r.charAt(n), f) if (f = !1, u += o, a += s, o = "", s = "", l === Zt) o = l, s = l;
				else for (u += l, a += l; ++n < i;) {
					if (l = r.charAt(n), !l || l === Zt) {
						s = l, o = l;
						break;
					}
					u += l, a += l;
				}
				else if (l === en && r.charAt(n + 1) === l && r.charAt(n + 2) === l && r.charAt(n + 3) === l) o += Mp, n += 3, f = !0;
				else if (l === _a) o += l, f = !0;
				else {
					for (c = ""; l === _a || l === en;) c += l, l = r.charAt(++n);
					if (l !== Zt) break;
					o += c + l, s += l;
				}
				if (a) return t ? !0 : e(u)({
					type: "code",
					lang: null,
					meta: null,
					value: Lp(a)
				});
			}
		});
		var Ia = x((qv, Pa) => {
			"use strict";
			Pa.exports = Wp;
			var rt = `
`, Fr = "	", Xe = " ", Yp = "~", Na = "`", Gp = 3, zp = 4;
			function Wp(e, r, t) {
				var n = this, i = n.options.gfm, u = r.length + 1, a = 0, o = "", s, l, c, f, D, m, p, h, F, g, E, v, A;
				if (i) {
					for (; a < u && (c = r.charAt(a), !(c !== Xe && c !== Fr));) o += c, a++;
					if (v = a, c = r.charAt(a), !(c !== Yp && c !== Na)) {
						for (a++, l = c, s = 1, o += c; a < u && (c = r.charAt(a), c === l);) o += c, s++, a++;
						if (!(s < Gp)) {
							for (; a < u && (c = r.charAt(a), !(c !== Xe && c !== Fr));) o += c, a++;
							for (f = "", p = ""; a < u && (c = r.charAt(a), !(c === rt || l === Na && c === l));) c === Xe || c === Fr ? p += c : (f += p + c, p = ""), a++;
							if (c = r.charAt(a), !(c && c !== rt)) {
								if (t) return !0;
								A = e.now(), A.column += o.length, A.offset += o.length, o += f, f = n.decode.raw(n.unescape(f), A), p && (o += p), p = "", g = "", E = "", h = "", F = "";
								for (var b = !0; a < u;) {
									if (c = r.charAt(a), h += g, F += E, g = "", E = "", c !== rt) {
										h += c, E += c, a++;
										continue;
									}
									for (b ? (o += c, b = !1) : (g += c, E += c), p = "", a++; a < u && (c = r.charAt(a), c === Xe);) p += c, a++;
									if (g += p, E += p.slice(v), !(p.length >= zp)) {
										for (p = ""; a < u && (c = r.charAt(a), c === l);) p += c, a++;
										if (g += p, E += p, !(p.length < s)) {
											for (p = ""; a < u && (c = r.charAt(a), !(c !== Xe && c !== Fr));) g += c, E += c, a++;
											if (!c || c === rt) break;
										}
									}
								}
								for (o += h + g, a = -1, u = f.length; ++a < u;) if (c = f.charAt(a), c === Xe || c === Fr) D || (D = f.slice(0, a));
								else if (D) {
									m = f.slice(a);
									break;
								}
								return e(o)({
									type: "code",
									lang: D || f || null,
									meta: m || null,
									value: F
								});
							}
						}
					}
				}
			}
		});
		var Le = x((Je, Sa) => {
			Je = Sa.exports = Vp;
			function Vp(e) {
				return e.trim ? e.trim() : Je.right(Je.left(e));
			}
			Je.left = function(e) {
				return e.trimLeft ? e.trimLeft() : e.replace(/^\s\s*/, "");
			};
			Je.right = function(e) {
				if (e.trimRight) return e.trimRight();
				for (var r = /\s/, t = e.length; r.test(e.charAt(--t)););
				return e.slice(0, t + 1);
			};
		});
		var tt = x((Nv, La) => {
			"use strict";
			La.exports = jp;
			function jp(e, r, t, n) {
				for (var i = e.length, u = -1, a, o; ++u < i;) if (a = e[u], o = a[1] || {}, !(o.pedantic !== void 0 && o.pedantic !== t.options.pedantic) && !(o.commonmark !== void 0 && o.commonmark !== t.options.commonmark) && r[a[0]].apply(t, n)) return !0;
				return !1;
			}
		});
		var Ya = x((Pv, Ua) => {
			"use strict";
			var $p = Le(), Hp = tt();
			Ua.exports = Kp;
			var rn = `
`, Ra = "	", tn = " ", Ma = ">";
			function Kp(e, r, t) {
				for (var n = this, i = n.offset, u = n.blockTokenizers, a = n.interruptBlockquote, o = e.now(), s = o.line, l = r.length, c = [], f = [], D = [], m, p = 0, h, F, g, E, v, A, b, d; p < l && (h = r.charAt(p), !(h !== tn && h !== Ra));) p++;
				if (r.charAt(p) === Ma) {
					if (t) return !0;
					for (p = 0; p < l;) {
						for (g = r.indexOf(rn, p), A = p, b = !1, g === -1 && (g = l); p < l && (h = r.charAt(p), !(h !== tn && h !== Ra));) p++;
						if (r.charAt(p) === Ma ? (p++, b = !0, r.charAt(p) === tn && p++) : p = A, E = r.slice(p, g), !b && !$p(E)) {
							p = A;
							break;
						}
						if (!b && (F = r.slice(p), Hp(a, u, n, [
							e,
							F,
							!0
						]))) break;
						v = A === p ? E : r.slice(A, g), D.push(p - A), c.push(v), f.push(E), p = g + 1;
					}
					for (p = -1, l = D.length, m = e(c.join(rn)); ++p < l;) i[s] = (i[s] || 0) + D[p], s++;
					return d = n.enterBlock(), f = n.tokenizeBlock(f.join(rn), o), d(), m({
						type: "blockquote",
						children: f
					});
				}
			}
		});
		var Wa = x((Iv, za) => {
			"use strict";
			za.exports = Jp;
			var Ga = `
`, gr = "	", Er = " ", Cr = "#", Xp = 6;
			function Jp(e, r, t) {
				for (var n = this, i = n.options.pedantic, u = r.length + 1, a = -1, o = e.now(), s = "", l = "", c, f, D; ++a < u;) {
					if (c = r.charAt(a), c !== Er && c !== gr) {
						a--;
						break;
					}
					s += c;
				}
				for (D = 0; ++a <= u;) {
					if (c = r.charAt(a), c !== Cr) {
						a--;
						break;
					}
					s += c, D++;
				}
				if (!(D > Xp) && !(!D || !i && r.charAt(a + 1) === Cr)) {
					for (u = r.length + 1, f = ""; ++a < u;) {
						if (c = r.charAt(a), c !== Er && c !== gr) {
							a--;
							break;
						}
						f += c;
					}
					if (!(!i && f.length === 0 && c && c !== Ga)) {
						if (t) return !0;
						for (s += f, f = "", l = ""; ++a < u && (c = r.charAt(a), !(!c || c === Ga));) {
							if (c !== Er && c !== gr && c !== Cr) {
								l += f + c, f = "";
								continue;
							}
							for (; c === Er || c === gr;) f += c, c = r.charAt(++a);
							if (!i && l && !f && c === Cr) {
								l += c;
								continue;
							}
							for (; c === Cr;) f += c, c = r.charAt(++a);
							for (; c === Er || c === gr;) f += c, c = r.charAt(++a);
							a--;
						}
						return o.column += s.length, o.offset += s.length, s += l + f, e(s)({
							type: "heading",
							depth: D,
							children: n.tokenizeInline(l, o)
						});
					}
				}
			}
		});
		var $a = x((Sv, ja) => {
			"use strict";
			ja.exports = ih;
			var Qp = "	", Zp = `
`, Va = " ", eh = "*", rh = "-", th = "_", nh = 3;
			function ih(e, r, t) {
				for (var n = -1, i = r.length + 1, u = "", a, o, s, l; ++n < i && (a = r.charAt(n), !(a !== Qp && a !== Va));) u += a;
				if (!(a !== eh && a !== rh && a !== th)) for (o = a, u += a, s = 1, l = ""; ++n < i;) if (a = r.charAt(n), a === o) s++, u += l + o, l = "";
				else if (a === Va) l += a;
				else return s >= nh && (!a || a === Zp) ? (u += l, t ? !0 : e(u)({ type: "thematicBreak" })) : void 0;
			}
		});
		var nn = x((Lv, Ka) => {
			"use strict";
			Ka.exports = sh;
			var Ha = "	", uh = " ", ah = 1, oh = 4;
			function sh(e) {
				for (var r = 0, t = 0, n = e.charAt(r), i = {}, u, a = 0; n === Ha || n === uh;) {
					for (u = n === Ha ? oh : ah, t += u, u > 1 && (t = Math.floor(t / u) * u); a < t;) i[++a] = r;
					n = e.charAt(++r);
				}
				return {
					indent: t,
					stops: i
				};
			}
		});
		var Qa = x((Rv, Ja) => {
			"use strict";
			var ch = Le(), lh = et(), fh = nn();
			Ja.exports = hh;
			var Xa = `
`, Dh = " ", ph = "!";
			function hh(e, r) {
				var t = e.split(Xa), n = t.length + 1, i = 1 / 0, u = [], a, o, s;
				for (t.unshift(lh(Dh, r) + ph); n--;) if (o = fh(t[n]), u[n] = o.stops, ch(t[n]).length !== 0) if (o.indent) o.indent > 0 && o.indent < i && (i = o.indent);
				else {
					i = 1 / 0;
					break;
				}
				if (i !== 1 / 0) for (n = t.length; n--;) {
					for (s = u[n], a = i; a && !(a in s);) a--;
					t[n] = t[n].slice(s[a] + 1);
				}
				return t.shift(), t.join(Xa);
			}
		});
		var io = x((Mv, no) => {
			"use strict";
			var dh = Le(), mh = et(), Za = Se(), Fh = nn(), gh = Qa(), Eh = tt();
			no.exports = kh;
			var un = "*", Ch = "_", eo = "+", an = "-", ro = ".", Ee = " ", oe = `
`, nt = "	", to = ")", vh = "x", ke = 4, Ah = /\n\n(?!\s*$)/, bh = /^\[([ X\tx])][ \t]/, xh = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/, yh = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/, wh = /^( {1,4}|\t)?/gm;
			function kh(e, r, t) {
				for (var n = this, i = n.options.commonmark, u = n.options.pedantic, a = n.blockTokenizers, o = n.interruptList, s = 0, l = r.length, c = null, f, D, m, p, h, F, g, E, v, A, b, d, y, w, C, k, T, B, _, S = !1, P, N, O, I; s < l && (p = r.charAt(s), !(p !== nt && p !== Ee));) s++;
				if (p = r.charAt(s), p === un || p === eo || p === an) h = p, m = !1;
				else {
					for (m = !0, D = ""; s < l && (p = r.charAt(s), !!Za(p));) D += p, s++;
					if (p = r.charAt(s), !D || !(p === ro || i && p === to) || t && D !== "1") return;
					c = parseInt(D, 10), h = p;
				}
				if (p = r.charAt(++s), !(p !== Ee && p !== nt && (u || p !== oe && p !== ""))) {
					if (t) return !0;
					for (s = 0, w = [], C = [], k = []; s < l;) {
						for (F = r.indexOf(oe, s), g = s, E = !1, I = !1, F === -1 && (F = l), f = 0; s < l;) {
							if (p = r.charAt(s), p === nt) f += ke - f % ke;
							else if (p === Ee) f++;
							else break;
							s++;
						}
						if (T && f >= T.indent && (I = !0), p = r.charAt(s), v = null, !I) {
							if (p === un || p === eo || p === an) v = p, s++, f++;
							else {
								for (D = ""; s < l && (p = r.charAt(s), !!Za(p));) D += p, s++;
								p = r.charAt(s), s++, D && (p === ro || i && p === to) && (v = p, f += D.length + 1);
							}
							if (v) if (p = r.charAt(s), p === nt) f += ke - f % ke, s++;
							else if (p === Ee) {
								for (O = s + ke; s < O && r.charAt(s) === Ee;) s++, f++;
								s === O && r.charAt(s) === Ee && (s -= ke - 1, f -= ke - 1);
							} else p !== oe && p !== "" && (v = null);
						}
						if (v) {
							if (!u && h !== v) break;
							E = !0;
						} else !i && !I && r.charAt(g) === Ee ? I = !0 : i && T && (I = f >= T.indent || f > ke), E = !1, s = g;
						if (b = r.slice(g, F), A = g === s ? b : r.slice(s, F), (v === un || v === Ch || v === an) && a.thematicBreak.call(n, e, b, !0)) break;
						if (d = y, y = !E && !dh(A).length, I && T) T.value = T.value.concat(k, b), C = C.concat(k, b), k = [];
						else if (E) k.length !== 0 && (S = !0, T.value.push(""), T.trail = k.concat()), T = {
							value: [b],
							indent: f,
							trail: []
						}, w.push(T), C = C.concat(k, b), k = [];
						else if (y) {
							if (d && !i) break;
							k.push(b);
						} else {
							if (d || Eh(o, a, n, [
								e,
								b,
								!0
							])) break;
							T.value = T.value.concat(k, b), C = C.concat(k, b), k = [];
						}
						s = F + 1;
					}
					for (P = e(C.join(oe)).reset({
						type: "list",
						ordered: m,
						start: c,
						spread: S,
						children: []
					}), B = n.enterList(), _ = n.enterBlock(), s = -1, l = w.length; ++s < l;) T = w[s].value.join(oe), N = e.now(), e(T)(Th(n, T, N), P), T = w[s].trail.join(oe), s !== l - 1 && (T += oe), e(T);
					return B(), _(), P;
				}
			}
			function Th(e, r, t) {
				var n = e.offset, i = e.options.pedantic ? Bh : _h, u = null, a, o;
				return r = i.apply(null, arguments), e.options.gfm && (a = r.match(bh), a && (o = a[0].length, u = a[1].toLowerCase() === vh, n[t.line] += o, r = r.slice(o))), {
					type: "listItem",
					spread: Ah.test(r),
					checked: u,
					children: e.tokenizeBlock(r, t)
				};
			}
			function Bh(e, r, t) {
				var n = e.offset, i = t.line;
				return r = r.replace(yh, u), i = t.line, r.replace(wh, u);
				function u(a) {
					return n[i] = (n[i] || 0) + a.length, i++, "";
				}
			}
			function _h(e, r, t) {
				var n = e.offset, i = t.line, u, a, o, s, l, c, f;
				for (r = r.replace(xh, D), s = r.split(oe), l = gh(r, Fh(u).indent).split(oe), l[0] = o, n[i] = (n[i] || 0) + a.length, i++, c = 0, f = s.length; ++c < f;) n[i] = (n[i] || 0) + s[c].length - l[c].length, i++;
				return l.join(oe);
				function D(m, p, h, F, g) {
					return a = p + h + F, o = g, Number(h) < 10 && a.length % 2 === 1 && (h = Ee + h), u = p + mh(Ee, h.length) + F, u + o;
				}
			}
		});
		var so = x((Uv, oo) => {
			"use strict";
			oo.exports = Sh;
			var on = `
`, Oh = "	", uo = " ", ao = "=", qh = "-", Nh = 3, Ph = 1, Ih = 2;
			function Sh(e, r, t) {
				for (var n = this, i = e.now(), u = r.length, a = -1, o = "", s, l, c, f, D; ++a < u;) {
					if (c = r.charAt(a), c !== uo || a >= Nh) {
						a--;
						break;
					}
					o += c;
				}
				for (s = "", l = ""; ++a < u;) {
					if (c = r.charAt(a), c === on) {
						a--;
						break;
					}
					c === uo || c === Oh ? l += c : (s += l + c, l = "");
				}
				if (i.column += o.length, i.offset += o.length, o += s + l, c = r.charAt(++a), f = r.charAt(++a), !(c !== on || f !== ao && f !== qh)) {
					for (o += c, l = f, D = f === ao ? Ph : Ih; ++a < u;) {
						if (c = r.charAt(a), c !== f) {
							if (c !== on) return;
							a--;
							break;
						}
						l += c;
					}
					return t ? !0 : e(o + l)({
						type: "heading",
						depth: D,
						children: n.tokenizeInline(s, i)
					});
				}
			}
		});
		var cn = x((sn) => {
			"use strict";
			var co = "<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^\"'=<>`\\u0000-\\u0020]+|'[^']*'|\"[^\"]*\"))?)*\\s*\\/?>", lo = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", zh = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->", Wh = "<[?].*?[?]>", Vh = "<![A-Za-z]+\\s+[^>]*>", jh = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
			sn.openCloseTag = new RegExp("^(?:" + co + "|" + lo + ")");
			sn.tag = new RegExp("^(?:" + co + "|" + lo + "|" + zh + "|" + Wh + "|" + Vh + "|" + jh + ")");
		});
		var ho = x((Gv, po) => {
			"use strict";
			var $h = cn().openCloseTag;
			po.exports = sd;
			var Hh = "	", Kh = " ", fo = `
`, Xh = "<", Jh = /^<(script|pre|style)(?=(\s|>|$))/i, Qh = /<\/(script|pre|style)>/i, Zh = /^<!--/, ed = /-->/, rd = /^<\?/, td = /\?>/, nd = /^<![A-Za-z]/, id = />/, ud = /^<!\[CDATA\[/, ad = /]]>/, Do = /^$/, od = new RegExp($h.source + "\\s*$");
			function sd(e, r, t) {
				for (var i = this.options.blocks.join("|"), u = new RegExp("^</?(" + i + ")(?=(\\s|/?>|$))", "i"), a = r.length, o = 0, s, l, c, f, D, m, p, h = [
					[
						Jh,
						Qh,
						!0
					],
					[
						Zh,
						ed,
						!0
					],
					[
						rd,
						td,
						!0
					],
					[
						nd,
						id,
						!0
					],
					[
						ud,
						ad,
						!0
					],
					[
						u,
						Do,
						!0
					],
					[
						od,
						Do,
						!1
					]
				]; o < a && (f = r.charAt(o), !(f !== Hh && f !== Kh));) o++;
				if (r.charAt(o) === Xh) {
					for (s = r.indexOf(fo, o + 1), s = s === -1 ? a : s, l = r.slice(o, s), c = -1, D = h.length; ++c < D;) if (h[c][0].test(l)) {
						m = h[c];
						break;
					}
					if (m) {
						if (t) return m[2];
						if (o = s, !m[1].test(l)) for (; o < a;) {
							if (s = r.indexOf(fo, o + 1), s = s === -1 ? a : s, l = r.slice(o + 1, s), m[1].test(l)) {
								l && (o = s);
								break;
							}
							o = s;
						}
						return p = r.slice(0, o), e(p)({
							type: "html",
							value: p
						});
					}
				}
			}
		});
		var se = x((zv, mo) => {
			"use strict";
			mo.exports = fd;
			var cd = String.fromCharCode, ld = /\s/;
			function fd(e) {
				return ld.test(typeof e == "number" ? cd(e) : e.charAt(0));
			}
		});
		var ln = x((Wv, Fo) => {
			"use strict";
			var Dd = Br();
			Fo.exports = pd;
			function pd(e) {
				return Dd(e).toLowerCase();
			}
		});
		var xo = x((Vv, bo) => {
			"use strict";
			var hd = se(), dd = ln();
			bo.exports = Ed;
			var go = "\"", Eo = "'", md = "\\", Qe = `
`, it = "	", ut = " ", Dn = "[", vr = "]", Fd = "(", gd = ")", Co = ":", vo = "<", Ao = ">";
			function Ed(e, r, t) {
				for (var n = this, i = n.options.commonmark, u = 0, a = r.length, o = "", s, l, c, f, D, m, p, h; u < a && (f = r.charAt(u), !(f !== ut && f !== it));) o += f, u++;
				if (f = r.charAt(u), f === Dn) {
					for (u++, o += f, c = ""; u < a && (f = r.charAt(u), f !== vr);) f === md && (c += f, u++, f = r.charAt(u)), c += f, u++;
					if (!(!c || r.charAt(u) !== vr || r.charAt(u + 1) !== Co)) {
						for (m = c, o += c + vr + Co, u = o.length, c = ""; u < a && (f = r.charAt(u), !(f !== it && f !== ut && f !== Qe));) o += f, u++;
						if (f = r.charAt(u), c = "", s = o, f === vo) {
							for (u++; u < a && (f = r.charAt(u), !!fn(f));) c += f, u++;
							if (f = r.charAt(u), f === fn.delimiter) o += vo + c + f, u++;
							else {
								if (i) return;
								u -= c.length + 1, c = "";
							}
						}
						if (!c) {
							for (; u < a && (f = r.charAt(u), !!Cd(f));) c += f, u++;
							o += c;
						}
						if (c) {
							for (p = c, c = ""; u < a && (f = r.charAt(u), !(f !== it && f !== ut && f !== Qe));) c += f, u++;
							if (f = r.charAt(u), D = null, f === go ? D = go : f === Eo ? D = Eo : f === Fd && (D = gd), !D) c = "", u = o.length;
							else if (c) {
								for (o += c + f, u = o.length, c = ""; u < a && (f = r.charAt(u), f !== D);) {
									if (f === Qe) {
										if (u++, f = r.charAt(u), f === Qe || f === D) return;
										c += Qe;
									}
									c += f, u++;
								}
								if (f = r.charAt(u), f !== D) return;
								l = o, o += c + f, u++, h = c, c = "";
							} else return;
							for (; u < a && (f = r.charAt(u), !(f !== it && f !== ut));) o += f, u++;
							if (f = r.charAt(u), !f || f === Qe) return t ? !0 : (s = e(s).test().end, p = n.decode.raw(n.unescape(p), s, { nonTerminated: !1 }), h && (l = e(l).test().end, h = n.decode.raw(n.unescape(h), l)), e(o)({
								type: "definition",
								identifier: dd(m),
								label: m,
								title: h || null,
								url: p
							}));
						}
					}
				}
			}
			function fn(e) {
				return e !== Ao && e !== Dn && e !== vr;
			}
			fn.delimiter = Ao;
			function Cd(e) {
				return e !== Dn && e !== vr && !hd(e);
			}
		});
		var ko = x((jv, wo) => {
			"use strict";
			var vd = se();
			wo.exports = Od;
			var Ad = "	", at = `
`, bd = " ", xd = "-", yd = ":", wd = "\\", pn = "|", kd = 1, Td = 2, yo = "left", Bd = "center", _d = "right";
			function Od(e, r, t) {
				var n = this, i, u, a, o, s, l, c, f, D, m, p, h, F, g, E, v, A, b, d, y, w, C;
				if (n.options.gfm) {
					for (i = 0, v = 0, l = r.length + 1, c = []; i < l;) {
						if (y = r.indexOf(at, i), w = r.indexOf(pn, i + 1), y === -1 && (y = r.length), w === -1 || w > y) {
							if (v < Td) return;
							break;
						}
						c.push(r.slice(i, y)), v++, i = y + 1;
					}
					for (o = c.join(at), u = c.splice(1, 1)[0] || [], i = 0, l = u.length, v--, a = !1, p = []; i < l;) {
						if (D = u.charAt(i), D === pn) {
							if (m = null, a === !1) {
								if (C === !1) return;
							} else p.push(a), a = !1;
							C = !1;
						} else if (D === xd) m = !0, a = a || null;
						else if (D === yd) a === yo ? a = Bd : m && a === null ? a = _d : a = yo;
						else if (!vd(D)) return;
						i++;
					}
					if (a !== !1 && p.push(a), !(p.length < kd)) {
						if (t) return !0;
						for (E = -1, b = [], d = e(o).reset({
							type: "table",
							align: p,
							children: b
						}); ++E < v;) {
							for (A = c[E], s = {
								type: "tableRow",
								children: []
							}, E && e(at), e(A).reset(s, d), l = A.length + 1, i = 0, f = "", h = "", F = !0; i < l;) {
								if (D = A.charAt(i), D === Ad || D === bd) {
									h ? f += D : e(D), i++;
									continue;
								}
								D === "" || D === pn ? F ? e(D) : ((h || D) && !F && (o = h, f.length > 1 && (D ? (o += f.slice(0, -1), f = f.charAt(f.length - 1)) : (o += f, f = "")), g = e.now(), e(o)({
									type: "tableCell",
									children: n.tokenizeInline(h, g)
								}, s)), e(f + D), f = "", h = "") : (f && (h += f, f = ""), h += D, D === wd && i !== l - 2 && (h += A.charAt(i + 1), i++)), F = !1, i++;
							}
							E || e(at + u);
						}
						return d;
					}
				}
			}
		});
		var _o = x(($v, Bo) => {
			"use strict";
			var qd = Le(), Nd = Qt(), Pd = tt();
			Bo.exports = Ld;
			var Id = "	", Ar = `
`, Sd = " ", To = 4;
			function Ld(e, r, t) {
				for (var n = this, u = n.options.commonmark, a = n.blockTokenizers, o = n.interruptParagraph, s = r.indexOf(Ar), l = r.length, c, f, D, m, p; s < l;) {
					if (s === -1) {
						s = l;
						break;
					}
					if (r.charAt(s + 1) === Ar) break;
					if (u) {
						for (m = 0, c = s + 1; c < l;) {
							if (D = r.charAt(c), D === Id) {
								m = To;
								break;
							} else if (D === Sd) m++;
							else break;
							c++;
						}
						if (m >= To && D !== Ar) {
							s = r.indexOf(Ar, s + 1);
							continue;
						}
					}
					if (f = r.slice(s + 1), Pd(o, a, n, [
						e,
						f,
						!0
					])) break;
					if (c = s, s = r.indexOf(Ar, s + 1), s !== -1 && qd(r.slice(c, s)) === "") {
						s = c;
						break;
					}
				}
				return f = r.slice(0, s), t ? !0 : (p = e.now(), f = Nd(f), e(f)({
					type: "paragraph",
					children: n.tokenizeInline(f, p)
				}));
			}
		});
		var qo = x((Hv, Oo) => {
			"use strict";
			Oo.exports = Rd;
			function Rd(e, r) {
				return e.indexOf("\\", r);
			}
		});
		var So = x((Kv, Io) => {
			"use strict";
			var Md = qo();
			Io.exports = Po;
			Po.locator = Md;
			var Ud = `
`, No = "\\";
			function Po(e, r, t) {
				var n = this, i, u;
				if (r.charAt(0) === No && (i = r.charAt(1), n.escape.indexOf(i) !== -1)) return t ? !0 : (i === Ud ? u = { type: "break" } : u = {
					type: "text",
					value: i
				}, e(No + i)(u));
			}
		});
		var hn = x((Xv, Lo) => {
			"use strict";
			Lo.exports = Yd;
			function Yd(e, r) {
				return e.indexOf("<", r);
			}
		});
		var Go = x((Jv, Yo) => {
			"use strict";
			var Ro = se(), Gd = mr(), zd = hn();
			Yo.exports = gn;
			gn.locator = zd;
			gn.notInLink = !0;
			var Mo = "<", dn = ">", Uo = "@", mn = "/", Fn = "mailto:", ot = Fn.length;
			function gn(e, r, t) {
				var n = this, i = "", u = r.length, a = 0, o = "", s = !1, l = "", c, f, D, m, p;
				if (r.charAt(0) === Mo) {
					for (a++, i = Mo; a < u && (c = r.charAt(a), !(Ro(c) || c === dn || c === Uo || c === ":" && r.charAt(a + 1) === mn));) o += c, a++;
					if (o) {
						if (l += o, o = "", c = r.charAt(a), l += c, a++, c === Uo) s = !0;
						else {
							if (c !== ":" || r.charAt(a + 1) !== mn) return;
							l += mn, a++;
						}
						for (; a < u && (c = r.charAt(a), !(Ro(c) || c === dn));) o += c, a++;
						if (c = r.charAt(a), !(!o || c !== dn)) return t ? !0 : (l += o, D = l, i += l + c, f = e.now(), f.column++, f.offset++, s && (l.slice(0, ot).toLowerCase() === Fn ? (D = D.slice(ot), f.column += ot, f.offset += ot) : l = Fn + l), m = n.inlineTokenizers, n.inlineTokenizers = { text: m.text }, p = n.enterLink(), D = n.tokenizeInline(D, f), n.inlineTokenizers = m, p(), e(i)({
							type: "link",
							title: null,
							url: Gd(l, { nonTerminated: !1 }),
							children: D
						}));
					}
				}
			}
		});
		var Wo = x((Qv, zo) => {
			"use strict";
			zo.exports = Wd;
			function Wd(e, r) {
				var t = String(e), n = 0, i;
				if (typeof r != "string") throw new Error("Expected character");
				for (i = t.indexOf(r); i !== -1;) n++, i = t.indexOf(r, i + r.length);
				return n;
			}
		});
		var $o = x((Zv, jo) => {
			"use strict";
			jo.exports = Vd;
			var Vo = [
				"www.",
				"http://",
				"https://"
			];
			function Vd(e, r) {
				var t = -1, n, i, u;
				if (!this.options.gfm) return t;
				for (i = Vo.length, n = -1; ++n < i;) u = e.indexOf(Vo[n], r), u !== -1 && (t === -1 || u < t) && (t = u);
				return t;
			}
		});
		var Qo = x((e2, Jo) => {
			"use strict";
			var Ho = Wo(), jd = mr(), $d = Se(), En = $e(), Hd = se(), Kd = $o();
			Jo.exports = vn;
			vn.locator = Kd;
			vn.notInLink = !0;
			var Xd = 33, Jd = 38, Qd = 41, Zd = 42, e0 = 44, r0 = 45, Cn = 46, t0 = 58, n0 = 59, i0 = 63, u0 = 60, Ko = 95, a0 = 126, o0 = "(", Xo = ")";
			function vn(e, r, t) {
				var n = this, i = n.options.gfm, u = n.inlineTokenizers, a = r.length, o = -1, s = !1, l, c, f, D, m, p, h, F, g, E, v, A, b, d;
				if (i) {
					if (r.slice(0, 4) === "www.") s = !0, D = 4;
					else if (r.slice(0, 7).toLowerCase() === "http://") D = 7;
					else if (r.slice(0, 8).toLowerCase() === "https://") D = 8;
					else return;
					for (o = D - 1, f = D, l = []; D < a;) {
						if (h = r.charCodeAt(D), h === Cn) {
							if (o === D - 1) break;
							l.push(D), o = D, D++;
							continue;
						}
						if ($d(h) || En(h) || h === r0 || h === Ko) {
							D++;
							continue;
						}
						break;
					}
					if (h === Cn && (l.pop(), D--), l[0] !== void 0 && (c = l.length < 2 ? f : l[l.length - 2] + 1, r.slice(c, D).indexOf("_") === -1)) {
						if (t) return !0;
						for (F = D, m = D; D < a && (h = r.charCodeAt(D), !(Hd(h) || h === u0));) D++, h === Xd || h === Zd || h === e0 || h === Cn || h === t0 || h === i0 || h === Ko || h === a0 || (F = D);
						if (D = F, r.charCodeAt(D - 1) === Qd) for (p = r.slice(m, D), g = Ho(p, o0), E = Ho(p, Xo); E > g;) D = m + p.lastIndexOf(Xo), p = r.slice(m, D), E--;
						if (r.charCodeAt(D - 1) === n0 && (D--, En(r.charCodeAt(D - 1)))) {
							for (F = D - 2; En(r.charCodeAt(F));) F--;
							r.charCodeAt(F) === Jd && (D = F);
						}
						return v = r.slice(0, D), b = jd(v, { nonTerminated: !1 }), s && (b = "http://" + b), d = n.enterLink(), n.inlineTokenizers = { text: u.text }, A = n.tokenizeInline(v, e.now()), n.inlineTokenizers = u, d(), e(v)({
							type: "link",
							title: null,
							url: b,
							children: A
						});
					}
				}
			}
		});
		var ts = x((r2, rs) => {
			"use strict";
			var s0 = Se(), c0 = $e(), l0 = 43, f0 = 45, D0 = 46, p0 = 95;
			rs.exports = es;
			function es(e, r) {
				var t = this, n, i;
				if (!this.options.gfm || (n = e.indexOf("@", r), n === -1)) return -1;
				if (i = n, i === r || !Zo(e.charCodeAt(i - 1))) return es.call(t, e, n + 1);
				for (; i > r && Zo(e.charCodeAt(i - 1));) i--;
				return i;
			}
			function Zo(e) {
				return s0(e) || c0(e) || e === l0 || e === f0 || e === D0 || e === p0;
			}
		});
		var as = x((t2, us) => {
			"use strict";
			var h0 = mr(), ns = Se(), is = $e(), d0 = ts();
			us.exports = xn;
			xn.locator = d0;
			xn.notInLink = !0;
			var m0 = 43, An = 45, st = 46, F0 = 64, bn = 95;
			function xn(e, r, t) {
				var n = this, i = n.options.gfm, u = n.inlineTokenizers, a = 0, o = r.length, s = -1, l, c, f, D;
				if (i) {
					for (l = r.charCodeAt(a); ns(l) || is(l) || l === m0 || l === An || l === st || l === bn;) l = r.charCodeAt(++a);
					if (a !== 0 && l === F0) {
						for (a++; a < o;) {
							if (l = r.charCodeAt(a), ns(l) || is(l) || l === An || l === st || l === bn) {
								a++, s === -1 && l === st && (s = a);
								continue;
							}
							break;
						}
						if (!(s === -1 || s === a || l === An || l === bn)) return l === st && a--, c = r.slice(0, a), t ? !0 : (D = n.enterLink(), n.inlineTokenizers = { text: u.text }, f = n.tokenizeInline(c, e.now()), n.inlineTokenizers = u, D(), e(c)({
							type: "link",
							title: null,
							url: "mailto:" + h0(c, { nonTerminated: !1 }),
							children: f
						}));
					}
				}
			}
		});
		var cs = x((n2, ss) => {
			"use strict";
			var g0 = $e(), E0 = hn(), C0 = cn().tag;
			ss.exports = os;
			os.locator = E0;
			var v0 = "<", A0 = "?", b0 = "!", x0 = "/", y0 = /^<a /i, w0 = /^<\/a>/i;
			function os(e, r, t) {
				var n = this, i = r.length, u, a;
				if (!(r.charAt(0) !== v0 || i < 3) && (u = r.charAt(1), !(!g0(u) && u !== A0 && u !== b0 && u !== x0) && (a = r.match(C0), !!a))) return t ? !0 : (a = a[0], !n.inLink && y0.test(a) ? n.inLink = !0 : n.inLink && w0.test(a) && (n.inLink = !1), e(a)({
					type: "html",
					value: a
				}));
			}
		});
		var yn = x((i2, ls) => {
			"use strict";
			ls.exports = k0;
			function k0(e, r) {
				var t = e.indexOf("[", r), n = e.indexOf("![", r);
				return n === -1 || t < n ? t : n;
			}
		});
		var Fs = x((u2, ms) => {
			"use strict";
			var br = se(), T0 = yn();
			ms.exports = ds;
			ds.locator = T0;
			var B0 = `
`, _0 = "!", fs = "\"", Ds = "'", Ze = "(", xr = ")", wn = "<", kn = ">", ps = "[", yr = "\\", O0 = "]", hs = "`";
			function ds(e, r, t) {
				var n = this, i = "", u = 0, a = r.charAt(0), o = n.options.pedantic, s = n.options.commonmark, l = n.options.gfm, c, f, D, m, p, h, F, g, E, v, A, b, d, y, w, C, k, T;
				if (a === _0 && (g = !0, i = a, a = r.charAt(++u)), a === ps && !(!g && n.inLink)) {
					for (i += a, y = "", u++, A = r.length, C = e.now(), d = 0, C.column += u, C.offset += u; u < A;) {
						if (a = r.charAt(u), h = a, a === hs) {
							for (f = 1; r.charAt(u + 1) === hs;) h += a, u++, f++;
							D ? f >= D && (D = 0) : D = f;
						} else if (a === yr) u++, h += r.charAt(u);
						else if ((!D || l) && a === ps) d++;
						else if ((!D || l) && a === O0) if (d) d--;
						else {
							if (r.charAt(u + 1) !== Ze) return;
							h += Ze, c = !0, u++;
							break;
						}
						y += h, h = "", u++;
					}
					if (c) {
						for (E = y, i += y + h, u++; u < A && (a = r.charAt(u), !!br(a));) i += a, u++;
						if (a = r.charAt(u), y = "", m = i, a === wn) {
							for (u++, m += wn; u < A && (a = r.charAt(u), a !== kn);) {
								if (s && a === B0) return;
								y += a, u++;
							}
							if (r.charAt(u) !== kn) return;
							i += wn + y + kn, w = y, u++;
						} else {
							for (a = null, h = ""; u < A && (a = r.charAt(u), !(h && (a === fs || a === Ds || s && a === Ze)));) {
								if (br(a)) {
									if (!o) break;
									h += a;
								} else {
									if (a === Ze) d++;
									else if (a === xr) {
										if (d === 0) break;
										d--;
									}
									y += h, h = "", a === yr && (y += yr, a = r.charAt(++u)), y += a;
								}
								u++;
							}
							i += y, w = y, u = i.length;
						}
						for (y = ""; u < A && (a = r.charAt(u), !!br(a));) y += a, u++;
						if (a = r.charAt(u), i += y, y && (a === fs || a === Ds || s && a === Ze)) if (u++, i += a, y = "", v = a === Ze ? xr : a, p = i, s) {
							for (; u < A && (a = r.charAt(u), a !== v);) a === yr && (y += yr, a = r.charAt(++u)), u++, y += a;
							if (a = r.charAt(u), a !== v) return;
							for (b = y, i += y + a, u++; u < A && (a = r.charAt(u), !!br(a));) i += a, u++;
						} else for (h = ""; u < A;) {
							if (a = r.charAt(u), a === v) F && (y += v + h, h = ""), F = !0;
							else if (!F) y += a;
							else if (a === xr) {
								i += y + v + h, b = y;
								break;
							} else br(a) ? h += a : (y += v + h + a, h = "", F = !1);
							u++;
						}
						if (r.charAt(u) === xr) return t ? !0 : (i += xr, w = n.decode.raw(n.unescape(w), e(m).test().end, { nonTerminated: !1 }), b && (p = e(p).test().end, b = n.decode.raw(n.unescape(b), p)), T = {
							type: g ? "image" : "link",
							title: b || null,
							url: w
						}, g ? T.alt = n.decode.raw(n.unescape(E), C) || null : (k = n.enterLink(), T.children = n.tokenizeInline(E, C), k()), e(i)(T));
					}
				}
			}
		});
		var Cs = x((a2, Es) => {
			"use strict";
			var q0 = se(), N0 = yn(), P0 = ln();
			Es.exports = gs;
			gs.locator = N0;
			var Tn = "link", I0 = "image", S0 = "shortcut", L0 = "collapsed", Bn = "full", R0 = "!", ct = "[", lt = "\\", ft = "]";
			function gs(e, r, t) {
				var n = this, i = n.options.commonmark, u = r.charAt(0), a = 0, o = r.length, s = "", l = "", c = Tn, f = S0, D, m, p, h, F, g, E, v;
				if (u === R0 && (c = I0, l = u, u = r.charAt(++a)), u === ct) {
					for (a++, l += u, g = "", v = 0; a < o;) {
						if (u = r.charAt(a), u === ct) E = !0, v++;
						else if (u === ft) {
							if (!v) break;
							v--;
						}
						u === lt && (g += lt, u = r.charAt(++a)), g += u, a++;
					}
					if (s = g, D = g, u = r.charAt(a), u === ft) {
						if (a++, s += u, g = "", !i) for (; a < o && (u = r.charAt(a), !!q0(u));) g += u, a++;
						if (u = r.charAt(a), u === ct) {
							for (m = "", g += u, a++; a < o && (u = r.charAt(a), !(u === ct || u === ft));) u === lt && (m += lt, u = r.charAt(++a)), m += u, a++;
							u = r.charAt(a), u === ft ? (f = m ? Bn : L0, g += m + u, a++) : m = "", s += g, g = "";
						} else {
							if (!D) return;
							m = D;
						}
						if (!(f !== Bn && E)) return s = l + s, c === Tn && n.inLink ? null : t ? !0 : (p = e.now(), p.column += l.length, p.offset += l.length, m = f === Bn ? m : D, h = {
							type: c + "Reference",
							identifier: P0(m),
							label: m,
							referenceType: f
						}, c === Tn ? (F = n.enterLink(), h.children = n.tokenizeInline(D, p), F()) : h.alt = n.decode.raw(n.unescape(D), p) || null, e(s)(h));
					}
				}
			}
		});
		var As = x((o2, vs) => {
			"use strict";
			vs.exports = M0;
			function M0(e, r) {
				var t = e.indexOf("**", r), n = e.indexOf("__", r);
				return n === -1 ? t : t === -1 || n < t ? n : t;
			}
		});
		var ws = x((s2, ys) => {
			"use strict";
			var U0 = Le(), bs = se(), Y0 = As();
			ys.exports = xs;
			xs.locator = Y0;
			var G0 = "\\", z0 = "*", W0 = "_";
			function xs(e, r, t) {
				var n = this, i = 0, u = r.charAt(i), a, o, s, l, c, f, D;
				if (!(u !== z0 && u !== W0 || r.charAt(++i) !== u) && (o = n.options.pedantic, s = u, c = s + s, f = r.length, i++, l = "", u = "", !(o && bs(r.charAt(i))))) for (; i < f;) {
					if (D = u, u = r.charAt(i), u === s && r.charAt(i + 1) === s && (!o || !bs(D)) && (u = r.charAt(i + 2), u !== s)) return U0(l) ? t ? !0 : (a = e.now(), a.column += 2, a.offset += 2, e(c + l + c)({
						type: "strong",
						children: n.tokenizeInline(l, a)
					})) : void 0;
					!o && u === G0 && (l += u, u = r.charAt(++i)), l += u, i++;
				}
			}
		});
		var Ts = x((c2, ks) => {
			"use strict";
			ks.exports = $0;
			var V0 = String.fromCharCode, j0 = /\w/;
			function $0(e) {
				return j0.test(typeof e == "number" ? V0(e) : e.charAt(0));
			}
		});
		var _s = x((l2, Bs) => {
			"use strict";
			Bs.exports = H0;
			function H0(e, r) {
				var t = e.indexOf("*", r), n = e.indexOf("_", r);
				return n === -1 ? t : t === -1 || n < t ? n : t;
			}
		});
		var Is = x((f2, Ps) => {
			"use strict";
			var K0 = Le(), X0 = Ts(), Os = se(), J0 = _s();
			Ps.exports = Ns;
			Ns.locator = J0;
			var Q0 = "*", qs = "_", Z0 = "\\";
			function Ns(e, r, t) {
				var n = this, i = 0, u = r.charAt(i), a, o, s, l, c, f, D;
				if (!(u !== Q0 && u !== qs) && (o = n.options.pedantic, c = u, s = u, f = r.length, i++, l = "", u = "", !(o && Os(r.charAt(i))))) for (; i < f;) {
					if (D = u, u = r.charAt(i), u === s && (!o || !Os(D))) {
						if (u = r.charAt(++i), u !== s) {
							if (!K0(l) || D === s) return;
							if (!o && s === qs && X0(u)) {
								l += s;
								continue;
							}
							return t ? !0 : (a = e.now(), a.column++, a.offset++, e(c + l + s)({
								type: "emphasis",
								children: n.tokenizeInline(l, a)
							}));
						}
						l += s;
					}
					!o && u === Z0 && (l += u, u = r.charAt(++i)), l += u, i++;
				}
			}
		});
		var Ls = x((D2, Ss) => {
			"use strict";
			Ss.exports = em;
			function em(e, r) {
				return e.indexOf("~~", r);
			}
		});
		var Gs = x((p2, Ys) => {
			"use strict";
			var Rs = se(), rm = Ls();
			Ys.exports = Us;
			Us.locator = rm;
			var Dt = "~", Ms = "~~";
			function Us(e, r, t) {
				var n = this, i = "", u = "", a = "", o = "", s, l, c;
				if (!(!n.options.gfm || r.charAt(0) !== Dt || r.charAt(1) !== Dt || Rs(r.charAt(2)))) for (s = 1, l = r.length, c = e.now(), c.column += 2, c.offset += 2; ++s < l;) {
					if (i = r.charAt(s), i === Dt && u === Dt && (!a || !Rs(a))) return t ? !0 : e(Ms + o + Ms)({
						type: "delete",
						children: n.tokenizeInline(o, c)
					});
					o += u, a = u, u = i;
				}
			}
		});
		var Ws = x((h2, zs) => {
			"use strict";
			zs.exports = tm;
			function tm(e, r) {
				return e.indexOf("`", r);
			}
		});
		var $s = x((d2, js) => {
			"use strict";
			var nm = Ws();
			js.exports = Vs;
			Vs.locator = nm;
			var _n = 10, On = 32, qn = 96;
			function Vs(e, r, t) {
				for (var n = r.length, i = 0, u, a, o, s, l, c; i < n && r.charCodeAt(i) === qn;) i++;
				if (!(i === 0 || i === n)) {
					for (u = i, l = r.charCodeAt(i); i < n;) {
						if (s = l, l = r.charCodeAt(i + 1), s === qn) {
							if (a === void 0 && (a = i), o = i + 1, l !== qn && o - a === u) {
								c = !0;
								break;
							}
						} else a !== void 0 && (a = void 0, o = void 0);
						i++;
					}
					if (c) {
						if (t) return !0;
						if (i = u, n = a, s = r.charCodeAt(i), l = r.charCodeAt(n - 1), c = !1, n - i > 2 && (s === On || s === _n) && (l === On || l === _n)) {
							for (i++, n--; i < n;) {
								if (s = r.charCodeAt(i), s !== On && s !== _n) {
									c = !0;
									break;
								}
								i++;
							}
							c === !0 && (u++, a--);
						}
						return e(r.slice(0, o))({
							type: "inlineCode",
							value: r.slice(u, a)
						});
					}
				}
			}
		});
		var Ks = x((m2, Hs) => {
			"use strict";
			Hs.exports = im;
			function im(e, r) {
				for (var t = e.indexOf(`
`, r); t > r && e.charAt(t - 1) === " ";) t--;
				return t;
			}
		});
		var Qs = x((F2, Js) => {
			"use strict";
			var um = Ks();
			Js.exports = Xs;
			Xs.locator = um;
			var am = " ", om = `
`, sm = 2;
			function Xs(e, r, t) {
				for (var n = r.length, i = -1, u = "", a; ++i < n;) {
					if (a = r.charAt(i), a === om) return i < sm ? void 0 : t ? !0 : (u += a, e(u)({ type: "break" }));
					if (a !== am) return;
					u += a;
				}
			}
		});
		var ec = x((g2, Zs) => {
			"use strict";
			Zs.exports = cm;
			function cm(e, r, t) {
				var n = this, i, u, a, o, s, l, c, f, D, m;
				if (t) return !0;
				for (i = n.inlineMethods, o = i.length, u = n.inlineTokenizers, a = -1, D = r.length; ++a < o;) f = i[a], f !== "text" && u[f] && (c = u[f].locator, c || e.file.fail("Missing locator: `" + f + "`"), l = c.call(n, r, 1), l !== -1 && l < D && (D = l));
				s = r.slice(0, D), m = e.now(), n.decode(s, m, p);
				function p(h, F, g) {
					e(g || h)({
						type: "text",
						value: h
					});
				}
			}
		});
		var ic = x((E2, nc) => {
			"use strict";
			var lm = Ie(), pt = Cu(), fm = Au(), Dm = xu(), pm = Qu(), Nn = ra();
			nc.exports = rc;
			function rc(e, r) {
				this.file = r, this.offset = {}, this.options = lm(this.options), this.setOptions({}), this.inList = !1, this.inBlock = !1, this.inLink = !1, this.atStart = !0, this.toOffset = fm(r).toOffset, this.unescape = Dm(this, "escape"), this.decode = pm(this);
			}
			var Y = rc.prototype;
			Y.setOptions = ca();
			Y.parse = ya();
			Y.options = Kt();
			Y.exitStart = pt("atStart", !0);
			Y.enterList = pt("inList", !1);
			Y.enterLink = pt("inLink", !1);
			Y.enterBlock = pt("inBlock", !1);
			Y.interruptParagraph = [
				["thematicBreak"],
				["list"],
				["atxHeading"],
				["fencedCode"],
				["blockquote"],
				["html"],
				["setextHeading", { commonmark: !1 }],
				["definition", { commonmark: !1 }]
			];
			Y.interruptList = [
				["atxHeading", { pedantic: !1 }],
				["fencedCode", { pedantic: !1 }],
				["thematicBreak", { pedantic: !1 }],
				["definition", { commonmark: !1 }]
			];
			Y.interruptBlockquote = [
				["indentedCode", { commonmark: !0 }],
				["fencedCode", { commonmark: !0 }],
				["atxHeading", { commonmark: !0 }],
				["setextHeading", { commonmark: !0 }],
				["thematicBreak", { commonmark: !0 }],
				["html", { commonmark: !0 }],
				["list", { commonmark: !0 }],
				["definition", { commonmark: !1 }]
			];
			Y.blockTokenizers = {
				blankLine: ka(),
				indentedCode: qa(),
				fencedCode: Ia(),
				blockquote: Ya(),
				atxHeading: Wa(),
				thematicBreak: $a(),
				list: io(),
				setextHeading: so(),
				html: ho(),
				definition: xo(),
				table: ko(),
				paragraph: _o()
			};
			Y.inlineTokenizers = {
				escape: So(),
				autoLink: Go(),
				url: Qo(),
				email: as(),
				html: cs(),
				link: Fs(),
				reference: Cs(),
				strong: ws(),
				emphasis: Is(),
				deletion: Gs(),
				code: $s(),
				break: Qs(),
				text: ec()
			};
			Y.blockMethods = tc(Y.blockTokenizers);
			Y.inlineMethods = tc(Y.inlineTokenizers);
			Y.tokenizeBlock = Nn("block");
			Y.tokenizeInline = Nn("inline");
			Y.tokenizeFactory = Nn;
			function tc(e) {
				var r = [], t;
				for (t in e) r.push(t);
				return r;
			}
		});
		var sc = x((C2, oc) => {
			"use strict";
			var hm = gu(), dm = Ie(), uc = ic();
			oc.exports = ac;
			ac.Parser = uc;
			function ac(e) {
				var r = this.data("settings"), t = hm(uc);
				t.prototype.options = dm(t.prototype.options, r, e), this.Parser = t;
			}
		});
		var lc = x((v2, cc) => {
			"use strict";
			cc.exports = mm;
			function mm(e) {
				if (e) throw e;
			}
		});
		var Pn = x((A2, fc) => {
			fc.exports = function(r) {
				return r != null && r.constructor != null && typeof r.constructor.isBuffer == "function" && r.constructor.isBuffer(r);
			};
		});
		var Cc = x((b2, Ec) => {
			"use strict";
			var ht = Object.prototype.hasOwnProperty, gc = Object.prototype.toString, Dc = Object.defineProperty, pc = Object.getOwnPropertyDescriptor, hc = function(r) {
				return typeof Array.isArray == "function" ? Array.isArray(r) : gc.call(r) === "[object Array]";
			}, dc = function(r) {
				if (!r || gc.call(r) !== "[object Object]") return !1;
				var t = ht.call(r, "constructor"), n = r.constructor && r.constructor.prototype && ht.call(r.constructor.prototype, "isPrototypeOf");
				if (r.constructor && !t && !n) return !1;
				var i;
				for (i in r);
				return typeof i > "u" || ht.call(r, i);
			}, mc = function(r, t) {
				Dc && t.name === "__proto__" ? Dc(r, t.name, {
					enumerable: !0,
					configurable: !0,
					value: t.newValue,
					writable: !0
				}) : r[t.name] = t.newValue;
			}, Fc = function(r, t) {
				if (t === "__proto__") if (ht.call(r, t)) {
					if (pc) return pc(r, t).value;
				} else return;
				return r[t];
			};
			Ec.exports = function e() {
				var r, t, n, i, u, a, o = arguments[0], s = 1, l = arguments.length, c = !1;
				for (typeof o == "boolean" && (c = o, o = arguments[1] || {}, s = 2), (o == null || typeof o != "object" && typeof o != "function") && (o = {}); s < l; ++s) if (r = arguments[s], r != null) for (t in r) n = Fc(o, t), i = Fc(r, t), o !== i && (c && i && (dc(i) || (u = hc(i))) ? (u ? (u = !1, a = n && hc(n) ? n : []) : a = n && dc(n) ? n : {}, mc(o, {
					name: t,
					newValue: e(c, a, i)
				})) : typeof i < "u" && mc(o, {
					name: t,
					newValue: i
				}));
				return o;
			};
		});
		var Ac = x((x2, vc) => {
			"use strict";
			vc.exports = (e) => {
				if (Object.prototype.toString.call(e) !== "[object Object]") return !1;
				let r = Object.getPrototypeOf(e);
				return r === null || r === Object.prototype;
			};
		});
		var xc = x((y2, bc) => {
			"use strict";
			var Fm = [].slice;
			bc.exports = gm;
			function gm(e, r) {
				var t;
				return n;
				function n() {
					var a = Fm.call(arguments, 0), o = e.length > a.length, s;
					o && a.push(i);
					try {
						s = e.apply(null, a);
					} catch (l) {
						if (o && t) throw l;
						return i(l);
					}
					o || (s && typeof s.then == "function" ? s.then(u, i) : s instanceof Error ? i(s) : u(s));
				}
				function i() {
					t || (t = !0, r.apply(null, arguments));
				}
				function u(a) {
					i(null, a);
				}
			}
		});
		var Bc = x((w2, Tc) => {
			"use strict";
			var wc = xc();
			Tc.exports = kc;
			kc.wrap = wc;
			var yc = [].slice;
			function kc() {
				var e = [], r = {};
				return r.run = t, r.use = n, r;
				function t() {
					var i = -1, u = yc.call(arguments, 0, -1), a = arguments[arguments.length - 1];
					if (typeof a != "function") throw new Error("Expected function as last argument, not " + a);
					o.apply(null, [null].concat(u));
					function o(s) {
						var l = e[++i], f = yc.call(arguments, 0).slice(1), D = u.length, m = -1;
						if (s) {
							a(s);
							return;
						}
						for (; ++m < D;) (f[m] === null || f[m] === void 0) && (f[m] = u[m]);
						u = f, l ? wc(l, o).apply(null, u) : a.apply(null, [null].concat(u));
					}
				}
				function n(i) {
					if (typeof i != "function") throw new Error("Expected `fn` to be a function, not " + i);
					return e.push(i), r;
				}
			}
		});
		var Nc = x((k2, qc) => {
			"use strict";
			var er = {}.hasOwnProperty;
			qc.exports = Em;
			function Em(e) {
				return !e || typeof e != "object" ? "" : er.call(e, "position") || er.call(e, "type") ? _c(e.position) : er.call(e, "start") || er.call(e, "end") ? _c(e) : er.call(e, "line") || er.call(e, "column") ? In(e) : "";
			}
			function In(e) {
				return (!e || typeof e != "object") && (e = {}), Oc(e.line) + ":" + Oc(e.column);
			}
			function _c(e) {
				return (!e || typeof e != "object") && (e = {}), In(e.start) + "-" + In(e.end);
			}
			function Oc(e) {
				return e && typeof e == "number" ? e : 1;
			}
		});
		var Sc = x((T2, Ic) => {
			"use strict";
			var Cm = Nc();
			Ic.exports = Sn;
			function Pc() {}
			Pc.prototype = Error.prototype;
			Sn.prototype = new Pc();
			var Te = Sn.prototype;
			Te.file = "";
			Te.name = "";
			Te.reason = "";
			Te.message = "";
			Te.stack = "";
			Te.fatal = null;
			Te.column = null;
			Te.line = null;
			function Sn(e, r, t) {
				var n, i, u;
				typeof r == "string" && (t = r, r = null), n = vm(t), i = Cm(r) || "1:1", u = {
					start: {
						line: null,
						column: null
					},
					end: {
						line: null,
						column: null
					}
				}, r && r.position && (r = r.position), r && (r.start ? (u = r, r = r.start) : u.start = r), e.stack && (this.stack = e.stack, e = e.message), this.message = e, this.name = i, this.reason = e, this.line = r ? r.line : null, this.column = r ? r.column : null, this.location = u, this.source = n[0], this.ruleId = n[1];
			}
			function vm(e) {
				var r = [null, null], t;
				return typeof e == "string" && (t = e.indexOf(":"), t === -1 ? r[1] = e : (r[0] = e.slice(0, t), r[1] = e.slice(t + 1))), r;
			}
		});
		var Lc = x((rr) => {
			"use strict";
			rr.basename = Am;
			rr.dirname = bm;
			rr.extname = xm;
			rr.join = ym;
			rr.sep = "/";
			function Am(e, r) {
				var t = 0, n = -1, i, u, a, o;
				if (r !== void 0 && typeof r != "string") throw new TypeError("\"ext\" argument must be a string");
				if (wr(e), i = e.length, r === void 0 || !r.length || r.length > e.length) {
					for (; i--;) if (e.charCodeAt(i) === 47) {
						if (a) {
							t = i + 1;
							break;
						}
					} else n < 0 && (a = !0, n = i + 1);
					return n < 0 ? "" : e.slice(t, n);
				}
				if (r === e) return "";
				for (u = -1, o = r.length - 1; i--;) if (e.charCodeAt(i) === 47) {
					if (a) {
						t = i + 1;
						break;
					}
				} else u < 0 && (a = !0, u = i + 1), o > -1 && (e.charCodeAt(i) === r.charCodeAt(o--) ? o < 0 && (n = i) : (o = -1, n = u));
				return t === n ? n = u : n < 0 && (n = e.length), e.slice(t, n);
			}
			function bm(e) {
				var r, t, n;
				if (wr(e), !e.length) return ".";
				for (r = -1, n = e.length; --n;) if (e.charCodeAt(n) === 47) {
					if (t) {
						r = n;
						break;
					}
				} else t || (t = !0);
				return r < 0 ? e.charCodeAt(0) === 47 ? "/" : "." : r === 1 && e.charCodeAt(0) === 47 ? "//" : e.slice(0, r);
			}
			function xm(e) {
				var r = -1, t = 0, n = -1, i = 0, u, a, o;
				for (wr(e), o = e.length; o--;) {
					if (a = e.charCodeAt(o), a === 47) {
						if (u) {
							t = o + 1;
							break;
						}
						continue;
					}
					n < 0 && (u = !0, n = o + 1), a === 46 ? r < 0 ? r = o : i !== 1 && (i = 1) : r > -1 && (i = -1);
				}
				return r < 0 || n < 0 || i === 0 || i === 1 && r === n - 1 && r === t + 1 ? "" : e.slice(r, n);
			}
			function ym() {
				for (var e = -1, r; ++e < arguments.length;) wr(arguments[e]), arguments[e] && (r = r === void 0 ? arguments[e] : r + "/" + arguments[e]);
				return r === void 0 ? "." : wm(r);
			}
			function wm(e) {
				var r, t;
				return wr(e), r = e.charCodeAt(0) === 47, t = km(e, !r), !t.length && !r && (t = "."), t.length && e.charCodeAt(e.length - 1) === 47 && (t += "/"), r ? "/" + t : t;
			}
			function km(e, r) {
				for (var t = "", n = 0, i = -1, u = 0, a = -1, o, s; ++a <= e.length;) {
					if (a < e.length) o = e.charCodeAt(a);
					else {
						if (o === 47) break;
						o = 47;
					}
					if (o === 47) {
						if (!(i === a - 1 || u === 1)) if (i !== a - 1 && u === 2) {
							if (t.length < 2 || n !== 2 || t.charCodeAt(t.length - 1) !== 46 || t.charCodeAt(t.length - 2) !== 46) {
								if (t.length > 2) {
									if (s = t.lastIndexOf("/"), s !== t.length - 1) {
										s < 0 ? (t = "", n = 0) : (t = t.slice(0, s), n = t.length - 1 - t.lastIndexOf("/")), i = a, u = 0;
										continue;
									}
								} else if (t.length) {
									t = "", n = 0, i = a, u = 0;
									continue;
								}
							}
							r && (t = t.length ? t + "/.." : "..", n = 2);
						} else t.length ? t += "/" + e.slice(i + 1, a) : t = e.slice(i + 1, a), n = a - i - 1;
						i = a, u = 0;
					} else o === 46 && u > -1 ? u++ : u = -1;
				}
				return t;
			}
			function wr(e) {
				if (typeof e != "string") throw new TypeError("Path must be a string. Received " + JSON.stringify(e));
			}
		});
		var Mc = x((Rc) => {
			"use strict";
			Rc.cwd = Tm;
			function Tm() {
				return "/";
			}
		});
		var Gc = x((O2, Yc) => {
			"use strict";
			var ce = Lc(), Bm = Mc(), _m = Pn();
			Yc.exports = Ce;
			var Om = {}.hasOwnProperty, Ln = [
				"history",
				"path",
				"basename",
				"stem",
				"extname",
				"dirname"
			];
			Ce.prototype.toString = Gm;
			Object.defineProperty(Ce.prototype, "path", {
				get: qm,
				set: Nm
			});
			Object.defineProperty(Ce.prototype, "dirname", {
				get: Pm,
				set: Im
			});
			Object.defineProperty(Ce.prototype, "basename", {
				get: Sm,
				set: Lm
			});
			Object.defineProperty(Ce.prototype, "extname", {
				get: Rm,
				set: Mm
			});
			Object.defineProperty(Ce.prototype, "stem", {
				get: Um,
				set: Ym
			});
			function Ce(e) {
				var r, t;
				if (!e) e = {};
				else if (typeof e == "string" || _m(e)) e = { contents: e };
				else if ("message" in e && "messages" in e) return e;
				if (!(this instanceof Ce)) return new Ce(e);
				for (this.data = {}, this.messages = [], this.history = [], this.cwd = Bm.cwd(), t = -1; ++t < Ln.length;) r = Ln[t], Om.call(e, r) && (this[r] = e[r]);
				for (r in e) Ln.indexOf(r) < 0 && (this[r] = e[r]);
			}
			function qm() {
				return this.history[this.history.length - 1];
			}
			function Nm(e) {
				Mn(e, "path"), this.path !== e && this.history.push(e);
			}
			function Pm() {
				return typeof this.path == "string" ? ce.dirname(this.path) : void 0;
			}
			function Im(e) {
				Uc(this.path, "dirname"), this.path = ce.join(e || "", this.basename);
			}
			function Sm() {
				return typeof this.path == "string" ? ce.basename(this.path) : void 0;
			}
			function Lm(e) {
				Mn(e, "basename"), Rn(e, "basename"), this.path = ce.join(this.dirname || "", e);
			}
			function Rm() {
				return typeof this.path == "string" ? ce.extname(this.path) : void 0;
			}
			function Mm(e) {
				if (Rn(e, "extname"), Uc(this.path, "extname"), e) {
					if (e.charCodeAt(0) !== 46) throw new Error("`extname` must start with `.`");
					if (e.indexOf(".", 1) > -1) throw new Error("`extname` cannot contain multiple dots");
				}
				this.path = ce.join(this.dirname, this.stem + (e || ""));
			}
			function Um() {
				return typeof this.path == "string" ? ce.basename(this.path, this.extname) : void 0;
			}
			function Ym(e) {
				Mn(e, "stem"), Rn(e, "stem"), this.path = ce.join(this.dirname || "", e + (this.extname || ""));
			}
			function Gm(e) {
				return (this.contents || "").toString(e);
			}
			function Rn(e, r) {
				if (e && e.indexOf(ce.sep) > -1) throw new Error("`" + r + "` cannot be a path: did not expect `" + ce.sep + "`");
			}
			function Mn(e, r) {
				if (!e) throw new Error("`" + r + "` cannot be empty");
			}
			function Uc(e, r) {
				if (!e) throw new Error("Setting `" + r + "` requires `path` to be set too");
			}
		});
		var Wc = x((q2, zc) => {
			"use strict";
			var zm = Sc(), dt = Gc();
			zc.exports = dt;
			dt.prototype.message = Wm;
			dt.prototype.info = jm;
			dt.prototype.fail = Vm;
			function Wm(e, r, t) {
				var n = new zm(e, r, t);
				return this.path && (n.name = this.path + ":" + n.name, n.file = this.path), n.fatal = !1, this.messages.push(n), n;
			}
			function Vm() {
				var e = this.message.apply(this, arguments);
				throw e.fatal = !0, e;
			}
			function jm() {
				var e = this.message.apply(this, arguments);
				return e.fatal = null, e;
			}
		});
		var jc = x((N2, Vc) => {
			"use strict";
			Vc.exports = Wc();
		});
		var rl = x((P2, el) => {
			"use strict";
			var $c = lc(), $m = Pn(), mt = Cc(), Hc = Ac(), Qc = Bc(), kr = jc();
			el.exports = Zc().freeze();
			var Hm = [].slice, Km = {}.hasOwnProperty, Xm = Qc().use(Jm).use(Qm).use(Zm);
			function Jm(e, r) {
				r.tree = e.parse(r.file);
			}
			function Qm(e, r, t) {
				e.run(r.tree, r.file, n);
				function n(i, u, a) {
					i ? t(i) : (r.tree = u, r.file = a, t());
				}
			}
			function Zm(e, r) {
				var t = e.stringify(r.tree, r.file);
				t == null || (typeof t == "string" || $m(t) ? ("value" in r.file && (r.file.value = t), r.file.contents = t) : r.file.result = t);
			}
			function Zc() {
				var e = [], r = Qc(), t = {}, n = -1, i;
				return u.data = o, u.freeze = a, u.attachers = e, u.use = s, u.parse = c, u.stringify = m, u.run = f, u.runSync = D, u.process = p, u.processSync = h, u;
				function u() {
					for (var F = Zc(), g = -1; ++g < e.length;) F.use.apply(null, e[g]);
					return F.data(mt(!0, {}, t)), F;
				}
				function a() {
					var F, g;
					if (i) return u;
					for (; ++n < e.length;) F = e[n], F[1] !== !1 && (F[1] === !0 && (F[1] = void 0), g = F[0].apply(u, F.slice(1)), typeof g == "function" && r.use(g));
					return i = !0, n = 1 / 0, u;
				}
				function o(F, g) {
					return typeof F == "string" ? arguments.length === 2 ? (Gn("data", i), t[F] = g, u) : Km.call(t, F) && t[F] || null : F ? (Gn("data", i), t = F, u) : t;
				}
				function s(F) {
					var g;
					if (Gn("use", i), F != null) if (typeof F == "function") b.apply(null, arguments);
					else if (typeof F == "object") "length" in F ? A(F) : E(F);
					else throw new Error("Expected usable value, not `" + F + "`");
					return g && (t.settings = mt(t.settings || {}, g)), u;
					function E(d) {
						A(d.plugins), d.settings && (g = mt(g || {}, d.settings));
					}
					function v(d) {
						if (typeof d == "function") b(d);
						else if (typeof d == "object") "length" in d ? b.apply(null, d) : E(d);
						else throw new Error("Expected usable value, not `" + d + "`");
					}
					function A(d) {
						var y = -1;
						if (d != null) if (typeof d == "object" && "length" in d) for (; ++y < d.length;) v(d[y]);
						else throw new Error("Expected a list of plugins, not `" + d + "`");
					}
					function b(d, y) {
						var w = l(d);
						w ? (Hc(w[1]) && Hc(y) && (y = mt(!0, w[1], y)), w[1] = y) : e.push(Hm.call(arguments));
					}
				}
				function l(F) {
					for (var g = -1; ++g < e.length;) if (e[g][0] === F) return e[g];
				}
				function c(F) {
					var g = kr(F), E;
					return a(), E = u.Parser, Un("parse", E), Kc(E, "parse") ? new E(String(g), g).parse() : E(String(g), g);
				}
				function f(F, g, E) {
					if (Xc(F), a(), !E && typeof g == "function" && (E = g, g = null), !E) return new Promise(v);
					v(null, E);
					function v(A, b) {
						r.run(F, kr(g), d);
						function d(y, w, C) {
							w = w || F, y ? b(y) : A ? A(w) : E(null, w, C);
						}
					}
				}
				function D(F, g) {
					var E, v;
					return f(F, g, A), Jc("runSync", "run", v), E;
					function A(b, d) {
						v = !0, E = d, $c(b);
					}
				}
				function m(F, g) {
					var E = kr(g), v;
					return a(), v = u.Compiler, Yn("stringify", v), Xc(F), Kc(v, "compile") ? new v(F, E).compile() : v(F, E);
				}
				function p(F, g) {
					if (a(), Un("process", u.Parser), Yn("process", u.Compiler), !g) return new Promise(E);
					E(null, g);
					function E(v, A) {
						var b = kr(F);
						Xm.run(u, { file: b }, d);
						function d(y) {
							y ? A(y) : v ? v(b) : g(null, b);
						}
					}
				}
				function h(F) {
					var g, E;
					return a(), Un("processSync", u.Parser), Yn("processSync", u.Compiler), g = kr(F), p(g, v), Jc("processSync", "process", E), g;
					function v(A) {
						E = !0, $c(A);
					}
				}
			}
			function Kc(e, r) {
				return typeof e == "function" && e.prototype && (eF(e.prototype) || r in e.prototype);
			}
			function eF(e) {
				var r;
				for (r in e) return !0;
				return !1;
			}
			function Un(e, r) {
				if (typeof r != "function") throw new Error("Cannot `" + e + "` without `Parser`");
			}
			function Yn(e, r) {
				if (typeof r != "function") throw new Error("Cannot `" + e + "` without `Compiler`");
			}
			function Gn(e, r) {
				if (r) throw new Error("Cannot invoke `" + e + "` on a frozen processor.\nCreate a new processor first, by invoking it: use `processor()` instead of `processor`.");
			}
			function Xc(e) {
				if (!e || typeof e.type != "string") throw new Error("Expected node, got `" + e + "`");
			}
			function Jc(e, r, t) {
				if (!t) throw new Error("`" + e + "` finished async. Use `" + r + "` instead");
			}
		});
		var DF = {};
		Vn(DF, {
			languages: () => Xi,
			options: () => Ji,
			parsers: () => Wn,
			printers: () => fF
		});
		var Me = (e, r) => (t, n, ...i) => t | 1 && n == null ? void 0 : (r.call(n) ?? n[e]).apply(n, i);
		function yl(e) {
			return this[e < 0 ? this.length + e : e];
		}
		var U = Me("at", function() {
			if (Array.isArray(this) || typeof this == "string") return yl;
		});
		var kl = String.prototype.replaceAll ?? function(e, r) {
			return e.global ? this.replace(e, r) : this.split(e).join(r);
		}, R = Me("replaceAll", function() {
			if (typeof this == "string") return kl;
		});
		var Hi = Re(Br(), 1);
		function fe(e) {
			if (typeof e != "string") throw new TypeError("Expected a string");
			return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
		}
		var _l = () => {}, tr = _l;
		var V = "string", j = "array", be = "cursor", ee = "indent", re = "align", De = "trim", X = "group", J = "fill", Q = "if-break", pe = "indent-if-break", he = "line-suffix", de = "line-suffix-boundary", $ = "line", me = "label", te = "break-parent", _r = /* @__PURE__ */ new Set([
			be,
			ee,
			re,
			De,
			X,
			J,
			Q,
			pe,
			he,
			de,
			$,
			me,
			te
		]);
		function Ol(e) {
			if (typeof e == "string") return V;
			if (Array.isArray(e)) return j;
			if (!e) return;
			let { type: r } = e;
			if (_r.has(r)) return r;
		}
		var W = Ol;
		var ql = (e) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e);
		function Nl(e) {
			let r = e === null ? "null" : typeof e;
			if (r !== "string" && r !== "object") return `Unexpected doc '${r}', 
Expected it to be 'string' or 'object'.`;
			if (W(e)) throw new Error("doc is valid.");
			let t = Object.prototype.toString.call(e);
			if (t !== "[object Object]") return `Unexpected doc '${t}'.`;
			let n = ql([..._r].map((i) => `'${i}'`));
			return `Unexpected doc.type '${e.type}'.
Expected it to be ${n}.`;
		}
		var gt = class extends Error {
			name = "InvalidDocError";
			constructor(r) {
				super(Nl(r)), this.doc = r;
			}
		}, Be = gt;
		var Hn = {};
		function Pl(e, r, t, n) {
			let i = [e];
			for (; i.length > 0;) {
				let u = i.pop();
				if (u === Hn) {
					t(i.pop());
					continue;
				}
				t && i.push(u, Hn);
				let a = W(u);
				if (!a) throw new Be(u);
				if (r?.(u) !== !1) switch (a) {
					case j:
					case J: {
						let o = a === j ? u : u.parts;
						for (let l = o.length - 1; l >= 0; --l) i.push(o[l]);
						break;
					}
					case Q:
						i.push(u.flatContents, u.breakContents);
						break;
					case X:
						if (n && u.expandedStates) for (let o = u.expandedStates.length, s = o - 1; s >= 0; --s) i.push(u.expandedStates[s]);
						else i.push(u.contents);
						break;
					case re:
					case ee:
					case pe:
					case me:
					case he:
						i.push(u.contents);
						break;
					case V:
					case be:
					case De:
					case de:
					case $:
					case te: break;
					default: throw new Be(u);
				}
			}
		}
		var Kn = Pl;
		function Il(e, r) {
			if (typeof e == "string") return r(e);
			let t = /* @__PURE__ */ new Map();
			return n(e);
			function n(u) {
				if (t.has(u)) return t.get(u);
				let a = i(u);
				return t.set(u, a), a;
			}
			function i(u) {
				switch (W(u)) {
					case j: return r(u.map(n));
					case J: return r({
						...u,
						parts: u.parts.map(n)
					});
					case Q: return r({
						...u,
						breakContents: n(u.breakContents),
						flatContents: n(u.flatContents)
					});
					case X: {
						let { expandedStates: a, contents: o } = u;
						return a ? (a = a.map(n), o = a[0]) : o = n(o), r({
							...u,
							contents: o,
							expandedStates: a
						});
					}
					case re:
					case ee:
					case pe:
					case me:
					case he: return r({
						...u,
						contents: n(u.contents)
					});
					case V:
					case be:
					case De:
					case de:
					case $:
					case te: return r(u);
					default: throw new Be(u);
				}
			}
		}
		function Xn(e) {
			if (e.length > 0) {
				let r = U(0, e, -1);
				!r.expandedStates && !r.break && (r.break = "propagated");
			}
			return null;
		}
		function Jn(e) {
			let r = /* @__PURE__ */ new Set(), t = [];
			function n(u) {
				if (u.type === te && Xn(t), u.type === X) {
					if (t.push(u), r.has(u)) return !1;
					r.add(u);
				}
			}
			function i(u) {
				u.type === X && t.pop().break && Xn(t);
			}
			Kn(e, n, i, !0);
		}
		function xe(e, r = nr) {
			return Il(e, (t) => typeof t == "string" ? Or(r, t.split(`
`)) : t);
		}
		var ne = tr, qr = tr, Qn = tr, Zn = tr;
		function ir(e) {
			return ne(e), {
				type: ee,
				contents: e
			};
		}
		function Fe(e, r) {
			return Zn(e), ne(r), {
				type: re,
				contents: r,
				n: e
			};
		}
		function ur(e) {
			return Fe({ type: "root" }, e);
		}
		var Ue = { type: te };
		function Ye(e) {
			return Qn(e), {
				type: J,
				parts: e
			};
		}
		function Ge(e, r = {}) {
			return ne(e), qr(r.expandedStates, !0), {
				type: X,
				id: r.id,
				contents: e,
				break: !!r.shouldBreak,
				expandedStates: r.expandedStates
			};
		}
		function ei(e, r = "", t = {}) {
			return ne(e), r !== "" && ne(r), {
				type: Q,
				breakContents: e,
				flatContents: r,
				groupId: t.groupId
			};
		}
		function Or(e, r) {
			ne(e), qr(r);
			let t = [];
			for (let n = 0; n < r.length; n++) n !== 0 && t.push(e), t.push(r[n]);
			return t;
		}
		var Nr = { type: $ }, Pr = {
			type: $,
			soft: !0
		}, ar = {
			type: $,
			hard: !0
		}, M = [ar, Ue], nr = [{
			type: $,
			hard: !0,
			literal: !0
		}, Ue];
		var Ll = "cr", Rl = "crlf";
		var Ml = "\r", Ul = `\r
`, Gl = `
`;
		function ri(e) {
			return e === Ll ? Ml : e === Rl ? Ul : Gl;
		}
		var ti = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
		function Et(e) {
			return e === 12288 || e >= 65281 && e <= 65376 || e >= 65504 && e <= 65510;
		}
		function Ct(e) {
			return e >= 4352 && e <= 4447 || e === 8986 || e === 8987 || e === 9001 || e === 9002 || e >= 9193 && e <= 9196 || e === 9200 || e === 9203 || e === 9725 || e === 9726 || e === 9748 || e === 9749 || e >= 9776 && e <= 9783 || e >= 9800 && e <= 9811 || e === 9855 || e >= 9866 && e <= 9871 || e === 9875 || e === 9889 || e === 9898 || e === 9899 || e === 9917 || e === 9918 || e === 9924 || e === 9925 || e === 9934 || e === 9940 || e === 9962 || e === 9970 || e === 9971 || e === 9973 || e === 9978 || e === 9981 || e === 9989 || e === 9994 || e === 9995 || e === 10024 || e === 10060 || e === 10062 || e >= 10067 && e <= 10069 || e === 10071 || e >= 10133 && e <= 10135 || e === 10160 || e === 10175 || e === 11035 || e === 11036 || e === 11088 || e === 11093 || e >= 11904 && e <= 11929 || e >= 11931 && e <= 12019 || e >= 12032 && e <= 12245 || e >= 12272 && e <= 12287 || e >= 12289 && e <= 12350 || e >= 12353 && e <= 12438 || e >= 12441 && e <= 12543 || e >= 12549 && e <= 12591 || e >= 12593 && e <= 12686 || e >= 12688 && e <= 12773 || e >= 12783 && e <= 12830 || e >= 12832 && e <= 12871 || e >= 12880 && e <= 42124 || e >= 42128 && e <= 42182 || e >= 43360 && e <= 43388 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65040 && e <= 65049 || e >= 65072 && e <= 65106 || e >= 65108 && e <= 65126 || e >= 65128 && e <= 65131 || e >= 94176 && e <= 94180 || e >= 94192 && e <= 94198 || e >= 94208 && e <= 101589 || e >= 101631 && e <= 101662 || e >= 101760 && e <= 101874 || e >= 110576 && e <= 110579 || e >= 110581 && e <= 110587 || e === 110589 || e === 110590 || e >= 110592 && e <= 110882 || e === 110898 || e >= 110928 && e <= 110930 || e === 110933 || e >= 110948 && e <= 110951 || e >= 110960 && e <= 111355 || e >= 119552 && e <= 119638 || e >= 119648 && e <= 119670 || e === 126980 || e === 127183 || e === 127374 || e >= 127377 && e <= 127386 || e >= 127488 && e <= 127490 || e >= 127504 && e <= 127547 || e >= 127552 && e <= 127560 || e === 127568 || e === 127569 || e >= 127584 && e <= 127589 || e >= 127744 && e <= 127776 || e >= 127789 && e <= 127797 || e >= 127799 && e <= 127868 || e >= 127870 && e <= 127891 || e >= 127904 && e <= 127946 || e >= 127951 && e <= 127955 || e >= 127968 && e <= 127984 || e === 127988 || e >= 127992 && e <= 128062 || e === 128064 || e >= 128066 && e <= 128252 || e >= 128255 && e <= 128317 || e >= 128331 && e <= 128334 || e >= 128336 && e <= 128359 || e === 128378 || e === 128405 || e === 128406 || e === 128420 || e >= 128507 && e <= 128591 || e >= 128640 && e <= 128709 || e === 128716 || e >= 128720 && e <= 128722 || e >= 128725 && e <= 128728 || e >= 128732 && e <= 128735 || e === 128747 || e === 128748 || e >= 128756 && e <= 128764 || e >= 128992 && e <= 129003 || e === 129008 || e >= 129292 && e <= 129338 || e >= 129340 && e <= 129349 || e >= 129351 && e <= 129535 || e >= 129648 && e <= 129660 || e >= 129664 && e <= 129674 || e >= 129678 && e <= 129734 || e === 129736 || e >= 129741 && e <= 129756 || e >= 129759 && e <= 129770 || e >= 129775 && e <= 129784 || e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141;
		}
		var ni = "©®‼⁉™ℹ↔↕↖↗↘↙↩↪⌨⏏⏱⏲⏸⏹⏺▪▫▶◀◻◼☀☁☂☃☄☎☑☘☝☠☢☣☦☪☮☯☸☹☺♀♂♟♠♣♥♦♨♻♾⚒⚔⚕⚖⚗⚙⚛⚜⚠⚧⚰⚱⛈⛏⛑⛓⛩⛱⛷⛸⛹✂✈✉✌✍✏✒✔✖✝✡✳✴❄❇❣❤➡⤴⤵⬅⬆⬇";
		var zl = /[^\x20-\x7F]/u, Wl = new Set(ni);
		function Vl(e) {
			if (!e) return 0;
			if (!zl.test(e)) return e.length;
			e = e.replace(ti(), (t) => Wl.has(t) ? " " : "  ");
			let r = 0;
			for (let t of e) {
				let n = t.codePointAt(0);
				n <= 31 || n >= 127 && n <= 159 || n >= 768 && n <= 879 || n >= 65024 && n <= 65039 || (r += Et(n) || Ct(n) ? 2 : 1);
			}
			return r;
		}
		var or = Vl;
		var jl = { type: 0 }, $l = { type: 1 }, vt = {
			value: "",
			length: 0,
			queue: [],
			get root() {
				return vt;
			}
		};
		function ii(e, r, t) {
			let n = r.type === 1 ? e.queue.slice(0, -1) : [...e.queue, r], i = "", u = 0, a = 0, o = 0;
			for (let p of n) switch (p.type) {
				case 0:
					c(), t.useTabs ? s(1) : l(t.tabWidth);
					break;
				case 3: {
					let { string: h } = p;
					c(), i += h, u += h.length;
					break;
				}
				case 2: {
					let { width: h } = p;
					a += 1, o += h;
					break;
				}
				default: throw new Error(`Unexpected indent comment '${p.type}'.`);
			}
			return D(), {
				...e,
				value: i,
				length: u,
				queue: n
			};
			function s(p) {
				i += "	".repeat(p), u += t.tabWidth * p;
			}
			function l(p) {
				i += " ".repeat(p), u += p;
			}
			function c() {
				t.useTabs ? f() : D();
			}
			function f() {
				a > 0 && s(a), m();
			}
			function D() {
				o > 0 && l(o), m();
			}
			function m() {
				a = 0, o = 0;
			}
		}
		function ui(e, r, t) {
			if (!r) return e;
			if (r.type === "root") return {
				...e,
				root: e
			};
			if (r === Number.NEGATIVE_INFINITY) return e.root;
			let n;
			return typeof r == "number" ? r < 0 ? n = $l : n = {
				type: 2,
				width: r
			} : n = {
				type: 3,
				string: r
			}, ii(e, n, t);
		}
		function ai(e, r) {
			return ii(e, jl, r);
		}
		function Hl(e) {
			let r = 0;
			for (let t = e.length - 1; t >= 0; t--) {
				let n = e[t];
				if (n === " " || n === "	") r++;
				else break;
			}
			return r;
		}
		function At(e) {
			let r = Hl(e);
			return {
				text: r === 0 ? e : e.slice(0, e.length - r),
				count: r
			};
		}
		var H = Symbol("MODE_BREAK"), ue = Symbol("MODE_FLAT"), bt = Symbol("DOC_FILL_PRINTED_LENGTH");
		function Ir(e, r, t, n, i, u) {
			if (t === Number.POSITIVE_INFINITY) return !0;
			let a = r.length, o = !1, s = [e], l = "";
			for (; t >= 0;) {
				if (s.length === 0) {
					if (a === 0) return !0;
					s.push(r[--a]);
					continue;
				}
				let { mode: c, doc: f } = s.pop(), D = W(f);
				switch (D) {
					case V:
						f && (o && (l += " ", t -= 1, o = !1), l += f, t -= or(f));
						break;
					case j:
					case J: {
						let m = D === j ? f : f.parts, p = f[bt] ?? 0;
						for (let h = m.length - 1; h >= p; h--) s.push({
							mode: c,
							doc: m[h]
						});
						break;
					}
					case ee:
					case re:
					case pe:
					case me:
						s.push({
							mode: c,
							doc: f.contents
						});
						break;
					case De: {
						let { text: m, count: p } = At(l);
						l = m, t += p;
						break;
					}
					case X: {
						if (u && f.break) return !1;
						let m = f.break ? H : c, p = f.expandedStates && m === H ? U(0, f.expandedStates, -1) : f.contents;
						s.push({
							mode: m,
							doc: p
						});
						break;
					}
					case Q: {
						let p = (f.groupId ? i[f.groupId] || ue : c) === H ? f.breakContents : f.flatContents;
						p && s.push({
							mode: c,
							doc: p
						});
						break;
					}
					case $:
						if (c === H || f.hard) return !0;
						f.soft || (o = !0);
						break;
					case he:
						n = !0;
						break;
					case de: if (n) return !1;
				}
			}
			return !1;
		}
		function oi(e, r) {
			let t = Object.create(null), n = r.printWidth, i = ri(r.endOfLine), u = 0, a = [{
				indent: vt,
				mode: H,
				doc: e
			}], o = "", s = !1, l = [], c = [], f = [], D = [], m = 0;
			for (Jn(e); a.length > 0;) {
				let { indent: E, mode: v, doc: A } = a.pop();
				switch (W(A)) {
					case V: {
						let b = i !== `
` ? R(0, A, `
`, i) : A;
						b && (o += b, a.length > 0 && (u += or(b)));
						break;
					}
					case j:
						for (let b = A.length - 1; b >= 0; b--) a.push({
							indent: E,
							mode: v,
							doc: A[b]
						});
						break;
					case be:
						if (c.length >= 2) throw new Error("There are too many 'cursor' in doc.");
						c.push(m + o.length);
						break;
					case ee:
						a.push({
							indent: ai(E, r),
							mode: v,
							doc: A.contents
						});
						break;
					case re:
						a.push({
							indent: ui(E, A.n, r),
							mode: v,
							doc: A.contents
						});
						break;
					case De:
						g();
						break;
					case X:
						switch (v) {
							case ue: if (!s) {
								a.push({
									indent: E,
									mode: A.break ? H : ue,
									doc: A.contents
								});
								break;
							}
							case H: {
								s = !1;
								let b = {
									indent: E,
									mode: ue,
									doc: A.contents
								}, d = n - u, y = l.length > 0;
								if (!A.break && Ir(b, a, d, y, t)) a.push(b);
								else if (A.expandedStates) {
									let w = U(0, A.expandedStates, -1);
									if (A.break) {
										a.push({
											indent: E,
											mode: H,
											doc: w
										});
										break;
									} else for (let C = 1; C < A.expandedStates.length + 1; C++) if (C >= A.expandedStates.length) {
										a.push({
											indent: E,
											mode: H,
											doc: w
										});
										break;
									} else {
										let T = {
											indent: E,
											mode: ue,
											doc: A.expandedStates[C]
										};
										if (Ir(T, a, d, y, t)) {
											a.push(T);
											break;
										}
									}
								} else a.push({
									indent: E,
									mode: H,
									doc: A.contents
								});
								break;
							}
						}
						A.id && (t[A.id] = U(0, a, -1).mode);
						break;
					case J: {
						let b = n - u, d = A[bt] ?? 0, { parts: y } = A, w = y.length - d;
						if (w === 0) break;
						let C = y[d + 0], k = y[d + 1], T = {
							indent: E,
							mode: ue,
							doc: C
						}, B = {
							indent: E,
							mode: H,
							doc: C
						}, _ = Ir(T, [], b, l.length > 0, t, !0);
						if (w === 1) {
							_ ? a.push(T) : a.push(B);
							break;
						}
						let S = {
							indent: E,
							mode: ue,
							doc: k
						}, P = {
							indent: E,
							mode: H,
							doc: k
						};
						if (w === 2) {
							_ ? a.push(S, T) : a.push(P, B);
							break;
						}
						let N = y[d + 2], O = {
							indent: E,
							mode: v,
							doc: {
								...A,
								[bt]: d + 2
							}
						}, le = Ir({
							indent: E,
							mode: ue,
							doc: [
								C,
								k,
								N
							]
						}, [], b, l.length > 0, t, !0);
						a.push(O), le ? a.push(S, T) : _ ? a.push(P, T) : a.push(P, B);
						break;
					}
					case Q:
					case pe: {
						let b = A.groupId ? t[A.groupId] : v;
						if (b === H) {
							let d = A.type === Q ? A.breakContents : A.negate ? A.contents : ir(A.contents);
							d && a.push({
								indent: E,
								mode: v,
								doc: d
							});
						}
						if (b === ue) {
							let d = A.type === Q ? A.flatContents : A.negate ? ir(A.contents) : A.contents;
							d && a.push({
								indent: E,
								mode: v,
								doc: d
							});
						}
						break;
					}
					case he:
						l.push({
							indent: E,
							mode: v,
							doc: A.contents
						});
						break;
					case de:
						l.length > 0 && a.push({
							indent: E,
							mode: v,
							doc: ar
						});
						break;
					case $:
						switch (v) {
							case ue: if (A.hard) s = !0;
							else {
								A.soft || (o += " ", u += 1);
								break;
							}
							case H:
								if (l.length > 0) {
									a.push({
										indent: E,
										mode: v,
										doc: A
									}, ...l.reverse()), l.length = 0;
									break;
								}
								A.literal ? (o += i, u = 0, E.root && (E.root.value && (o += E.root.value), u = E.root.length)) : (g(), o += i + E.value, u = E.length);
						}
						break;
					case me:
						a.push({
							indent: E,
							mode: v,
							doc: A.contents
						});
						break;
					case te: break;
					default: throw new Be(A);
				}
				a.length === 0 && l.length > 0 && (a.push(...l.reverse()), l.length = 0);
			}
			let p = f.join("") + o, h = [...D, ...c];
			if (h.length !== 2) return { formatted: p };
			let F = h[0];
			return {
				formatted: p,
				cursorNodeStart: F,
				cursorNodeText: p.slice(F, U(0, h, -1))
			};
			function g() {
				let { text: E, count: v } = At(o);
				E && (f.push(E), m += E.length), o = "", u -= v, c.length > 0 && (D.push(...c.map((A) => Math.min(A, m))), c.length = 0);
			}
		}
		function Kl(e, r) {
			let t = e.matchAll(new RegExp(`(?:${fe(r)})+`, "gu"));
			return t.reduce || (t = [...t]), t.reduce((n, [i]) => Math.max(n, i.length), 0) / r.length;
		}
		var Sr = Kl;
		function Xl(e, r) {
			let t = e.match(new RegExp(`(${fe(r)})+`, "gu"));
			if (t === null) return 1;
			let n = /* @__PURE__ */ new Map(), i = 0;
			for (let u of t) {
				let a = u.length / r.length;
				n.set(a, !0), a > i && (i = a);
			}
			for (let u = 1; u < i; u++) if (!n.get(u)) return u;
			return i + 1;
		}
		var si = Xl;
		var ci = Object.freeze({
			character: "'",
			codePoint: 39
		}), li = Object.freeze({
			character: "\"",
			codePoint: 34
		}), Jl = Object.freeze({
			preferred: ci,
			alternate: li
		}), Ql = Object.freeze({
			preferred: li,
			alternate: ci
		});
		function Zl(e, r) {
			let { preferred: t, alternate: n } = r === !0 || r === "'" ? Jl : Ql, { length: i } = e, u = 0, a = 0;
			for (let o = 0; o < i; o++) {
				let s = e.charCodeAt(o);
				s === t.codePoint ? u++ : s === n.codePoint && a++;
			}
			return (u > a ? n : t).character;
		}
		var fi = Zl;
		var xt = class extends Error {
			name = "UnexpectedNodeError";
			constructor(r, t, n = "type") {
				super(`Unexpected ${t} node ${n}: ${JSON.stringify(r[n])}.`), this.node = r;
			}
		}, Di = xt;
		var xi = Re(Br(), 1);
		var ef = Array.prototype.toReversed ?? function() {
			return [...this].reverse();
		}, pi = Me("toReversed", function() {
			if (Array.isArray(this)) return ef;
		});
		function tf() {
			let e = globalThis, r = e.Deno?.build?.os;
			return typeof r == "string" ? r === "windows" : e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? !1;
		}
		var nf = tf();
		function hi(e) {
			if (e = e instanceof URL ? e : new URL(e), e.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
			return e;
		}
		function uf(e) {
			return e = hi(e), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
		}
		function af(e) {
			e = hi(e);
			let r = decodeURIComponent(e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
			return e.hostname !== "" && (r = `\\\\${e.hostname}${r}`), r;
		}
		function yt(e) {
			return nf ? af(e) : uf(e);
		}
		var di = (e) => String(e).split(/[/\\]/u).pop(), mi = (e) => String(e).startsWith("file:");
		function Fi(e, r) {
			if (!r) return;
			let t = di(r).toLowerCase();
			return e.find(({ filenames: n }) => n?.some((i) => i.toLowerCase() === t)) ?? e.find(({ extensions: n }) => n?.some((i) => t.endsWith(i)));
		}
		function of(e, r) {
			if (r) return e.find(({ name: t }) => t.toLowerCase() === r) ?? e.find(({ aliases: t }) => t?.includes(r)) ?? e.find(({ extensions: t }) => t?.includes(`.${r}`));
		}
		var sf = void 0;
		function gi(e, r) {
			if (r) {
				if (mi(r)) try {
					r = yt(r);
				} catch {
					return;
				}
				if (typeof r == "string") return e.find(({ isSupported: t }) => t?.({ filepath: r }));
			}
		}
		function cf(e, r) {
			let t = pi(0, e.plugins).flatMap((i) => i.languages ?? []);
			return (of(t, r.language) ?? Fi(t, r.physicalFile) ?? Fi(t, r.file) ?? gi(t, r.physicalFile) ?? gi(t, r.file) ?? sf?.(t, r.physicalFile))?.parsers[0];
		}
		var wt = cf;
		var Lr = Symbol.for("PRETTIER_IS_FRONT_MATTER");
		function lf(e) {
			return !!e?.[Lr];
		}
		var kt = lf;
		var sr = 3;
		function ff(e) {
			let r = e.slice(0, sr);
			if (r !== "---" && r !== "+++") return;
			let t = e.indexOf(`
`, sr);
			if (t === -1) return;
			let n = e.slice(sr, t).trim(), i = e.indexOf(`
${r}`, t), u = n;
			if (u || (u = r === "+++" ? "toml" : "yaml"), i === -1 && r === "---" && u === "yaml" && (i = e.indexOf(`
...`, t)), i === -1) return;
			let a = i + 1 + sr, o = e.charAt(a + 1);
			if (!/\s?/u.test(o)) return;
			let s = e.slice(0, a), l;
			return {
				language: u,
				explicitLanguage: n || null,
				value: e.slice(t + 1, i),
				startDelimiter: r,
				endDelimiter: s.slice(-sr),
				raw: s,
				start: {
					line: 1,
					column: 0,
					index: 0
				},
				end: {
					index: s.length,
					get line() {
						return l ?? (l = s.split(`
`)), l.length;
					},
					get column() {
						return l ?? (l = s.split(`
`)), U(0, l, -1).length;
					}
				},
				[Lr]: !0
			};
		}
		function Df(e) {
			let r = ff(e);
			return r ? {
				frontMatter: r,
				get content() {
					let { raw: t } = r;
					return R(0, t, /[^\n]/gu, " ") + e.slice(t.length);
				}
			} : { content: e };
		}
		var _e = Df;
		var Ei = "format";
		var Ci = /<!--\s*@(?:noformat|noprettier)\s*-->|\{\s*\/\*\s*@(?:noformat|noprettier)\s*\*\/\s*\}|<!--.*\r?\n[\s\S]*(^|\n)[^\S\n]*@(?:noformat|noprettier)[^\S\n]*($|\n)[\s\S]*\n.*-->/mu, vi = /<!--\s*@(?:format|prettier)\s*-->|\{\s*\/\*\s*@(?:format|prettier)\s*\*\/\s*\}|<!--.*\r?\n[\s\S]*(^|\n)[^\S\n]*@(?:format|prettier)[^\S\n]*($|\n)[\s\S]*\n.*-->/mu;
		var Rr = (e) => _e(e).content.trimStart().match(vi)?.index === 0, Ai = (e) => _e(e).content.trimStart().match(Ci)?.index === 0, bi = (e) => {
			let { frontMatter: r } = _e(e), t = `<!-- @${Ei} -->`;
			return r ? `${r.raw}

${t}

${e.slice(r.end.index)}` : `${t}

${e}`;
		};
		var pf = /* @__PURE__ */ new Set(["position", "raw"]);
		function yi(e, r, t) {
			if ((e.type === "code" || e.type === "yaml" || e.type === "import" || e.type === "export" || e.type === "jsx") && delete r.value, e.type === "list" && delete r.isAligned, (e.type === "list" || e.type === "listItem") && delete r.spread, e.type === "text") return null;
			if (e.type === "inlineCode" && (r.value = R(0, e.value, `
`, " ")), e.type === "wikiLink" && (r.value = R(0, e.value.trim(), /[\t\n]+/gu, " ")), (e.type === "definition" || e.type === "linkReference" || e.type === "imageReference") && (r.label = (0, xi.default)(e.label)), (e.type === "link" || e.type === "image") && e.url && e.url.includes("(")) for (let n of "<>") r.url = R(0, e.url, n, encodeURIComponent(n));
			if ((e.type === "definition" || e.type === "link" || e.type === "image") && e.title && (r.title = R(0, e.title, /\\(?=["')])/gu, "")), t?.type === "root" && t.children.length > 0 && (t.children[0] === e || kt(t.children[0]) && t.children[1] === e) && e.type === "html" && Rr(e.value)) return null;
		}
		yi.ignoredProperties = pf;
		var wi = yi;
		var ki = /(?:[\u{2c7}\u{2c9}-\u{2cb}\u{2d9}\u{2ea}-\u{2eb}\u{305}\u{323}\u{1100}-\u{11ff}\u{2e80}-\u{2e99}\u{2e9b}-\u{2ef3}\u{2f00}-\u{2fd5}\u{2ff0}-\u{303f}\u{3041}-\u{3096}\u{3099}-\u{30ff}\u{3105}-\u{312f}\u{3131}-\u{318e}\u{3190}-\u{4dbf}\u{4e00}-\u{9fff}\u{a700}-\u{a707}\u{a960}-\u{a97c}\u{ac00}-\u{d7a3}\u{d7b0}-\u{d7c6}\u{d7cb}-\u{d7fb}\u{f900}-\u{fa6d}\u{fa70}-\u{fad9}\u{fe10}-\u{fe1f}\u{fe30}-\u{fe6f}\u{ff00}-\u{ffef}\u{16fe3}\u{16ff2}-\u{16ff6}\u{1aff0}-\u{1aff3}\u{1aff5}-\u{1affb}\u{1affd}-\u{1affe}\u{1b000}-\u{1b122}\u{1b132}\u{1b150}-\u{1b152}\u{1b155}\u{1b164}-\u{1b167}\u{1f200}\u{1f250}-\u{1f251}\u{20000}-\u{2a6df}\u{2a700}-\u{2b81d}\u{2b820}-\u{2cead}\u{2ceb0}-\u{2ebe0}\u{2ebf0}-\u{2ee5d}\u{2f800}-\u{2fa1d}\u{30000}-\u{3134a}\u{31350}-\u{33479}])(?:[\u{fe00}-\u{fe0f}\u{e0100}-\u{e01ef}])?/u, Oe = /(?:[\u{21}-\u{2f}\u{3a}-\u{40}\u{5b}-\u{60}\u{7b}-\u{7e}]|\p{General_Category=Connector_Punctuation}|\p{General_Category=Dash_Punctuation}|\p{General_Category=Close_Punctuation}|\p{General_Category=Final_Punctuation}|\p{General_Category=Initial_Punctuation}|\p{General_Category=Other_Punctuation}|\p{General_Category=Open_Punctuation})/u;
		var qe = (e) => e.position.start.offset, Ne = (e) => e.position.end.offset;
		var Tt = /* @__PURE__ */ new Set([
			"liquidNode",
			"inlineCode",
			"emphasis",
			"esComment",
			"strong",
			"delete",
			"wikiLink",
			"link",
			"linkReference",
			"image",
			"imageReference",
			"footnote",
			"footnoteReference",
			"sentence",
			"whitespace",
			"word",
			"break",
			"inlineMath"
		]), Mr = /* @__PURE__ */ new Set([
			...Tt,
			"tableCell",
			"paragraph",
			"heading"
		]), We = "non-cjk", ae = "cj-letter", Pe = "k-letter", cr = "cjk-punctuation", hf = /\p{Script_Extensions=Hangul}/u;
		function Ur(e) {
			let r = [], t = e.split(/([\t\n ]+)/u);
			for (let [i, u] of t.entries()) {
				if (i % 2 === 1) {
					r.push({
						type: "whitespace",
						value: /\n/u.test(u) ? `
` : " "
					});
					continue;
				}
				if ((i === 0 || i === t.length - 1) && u === "") continue;
				let a = u.split(new RegExp(`(${ki.source})`, "u"));
				for (let [o, s] of a.entries()) if (!((o === 0 || o === a.length - 1) && s === "")) {
					if (o % 2 === 0) {
						s !== "" && n({
							type: "word",
							value: s,
							kind: We,
							isCJ: !1,
							hasLeadingPunctuation: Oe.test(s[0]),
							hasTrailingPunctuation: Oe.test(U(0, s, -1))
						});
						continue;
					}
					if (Oe.test(s)) {
						n({
							type: "word",
							value: s,
							kind: cr,
							isCJ: !0,
							hasLeadingPunctuation: !0,
							hasTrailingPunctuation: !0
						});
						continue;
					}
					if (hf.test(s)) {
						n({
							type: "word",
							value: s,
							kind: Pe,
							isCJ: !1,
							hasLeadingPunctuation: !1,
							hasTrailingPunctuation: !1
						});
						continue;
					}
					n({
						type: "word",
						value: s,
						kind: ae,
						isCJ: !0,
						hasLeadingPunctuation: !1,
						hasTrailingPunctuation: !1
					});
				}
			}
			return r;
			function n(i) {
				let u = U(0, r, -1);
				u?.type === "word" && !a(We, cr) && ![u.value, i.value].some((o) => /\u3000/u.test(o)) && r.push({
					type: "whitespace",
					value: ""
				}), r.push(i);
				function a(o, s) {
					return u.kind === o && i.kind === s || u.kind === s && i.kind === o;
				}
			}
		}
		function ze(e, r) {
			let { numberText: n, leadingSpaces: i } = r.originalText.slice(e.position.start.offset, e.position.end.offset).match(/^\s*(?<numberText>\d+)(\.|\))(?<leadingSpaces>\s*)/u).groups;
			return {
				number: Number(n),
				leadingSpaces: i
			};
		}
		function Ti(e, r) {
			return !e.ordered || e.children.length < 2 || ze(e.children[1], r).number !== 1 ? !1 : ze(e.children[0], r).number !== 0 ? !0 : e.children.length > 2 && ze(e.children[2], r).number === 1;
		}
		function Yr(e, r) {
			let { value: t } = e;
			return e.position.end.offset === r.length && t.endsWith(`
`) && r.endsWith(`
`) ? t.slice(0, -1) : t;
		}
		function ye(e, r) {
			return (function t(n, i, u) {
				let a = { ...r(n, i, u) };
				return a.children && (a.children = a.children.map((o, s) => t(o, s, [a, ...u]))), a;
			})(e, null, []);
		}
		function Gr(e) {
			if (e?.type !== "link" || e.children.length !== 1) return !1;
			let [r] = e.children;
			return qe(e) === qe(r) && Ne(e) === Ne(r);
		}
		function lr(e) {
			let r;
			if (e.type === "html") r = e.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/u);
			else {
				let t;
				e.type === "esComment" ? t = e : e.type === "paragraph" && e.children.length === 1 && e.children[0].type === "esComment" && (t = e.children[0]), t && (r = t.value.match(/^prettier-ignore(?:-(start|end))?$/u));
			}
			return r ? r[1] || "next" : !1;
		}
		function zr(e, r) {
			return t(e, r, (n) => n.ordered === e.ordered);
			function t(n, i, u) {
				let a = -1;
				for (let o of i.children) if (o.type === n.type && u(o) ? a++ : a = -1, o === n) return a;
			}
		}
		function df(e, r) {
			let { node: t } = e;
			switch (t.type) {
				case "code": {
					let { lang: n } = t;
					if (!n) return;
					let i;
					return n === "angular-ts" ? i = wt(r, { language: "typescript" }) : n === "angular-html" ? i = "angular" : i = wt(r, { language: n }), i ? async (u) => {
						let a = { parser: i };
						n === "ts" || n === "typescript" ? a.filepath = "dummy.ts" : n === "tsx" && (a.filepath = "dummy.tsx");
						let o = await u(Yr(t, r.originalText), a), s = r.__inJsTemplate ? "~" : "`", l = s.repeat(Math.max(3, Sr(t.value, s) + 1));
						return ur([
							l,
							t.lang,
							t.meta ? " " + t.meta : "",
							M,
							xe(o),
							M,
							l
						]);
					} : void 0;
				}
				case "import":
				case "export": return (n) => n(t.value, {
					__onHtmlBindingRoot: (i) => mf(i, t.type),
					parser: "babel"
				});
				case "jsx": return (n) => n(`<$>${t.value}</$>`, {
					parser: "__js_expression",
					rootMarker: "mdx"
				});
			}
			return null;
		}
		function mf(e, r) {
			let { program: { body: t } } = e;
			if (!t.every((n) => n.type === "ImportDeclaration" || n.type === "ExportDefaultDeclaration" || n.type === "ExportNamedDeclaration")) throw new Error(`Unexpected '${r}' in MDX.`);
		}
		var Bi = df;
		var fr = null;
		function Dr(e) {
			if (fr !== null && typeof fr.property) {
				let r = fr;
				return fr = Dr.prototype = null, r;
			}
			return fr = Dr.prototype = e ?? Object.create(null), new Dr();
		}
		var Ff = 10;
		for (let e = 0; e <= Ff; e++) Dr();
		function Bt(e) {
			return Dr(e);
		}
		function gf(e, r = "type") {
			Bt(e);
			function t(n) {
				let i = n[r], u = e[i];
				if (!Array.isArray(u)) throw Object.assign(/* @__PURE__ */ new Error(`Missing visitor keys for '${i}'.`), { node: n });
				return u;
			}
			return t;
		}
		var _i = gf;
		var q = [["children"], []];
		var qi = _i({
			root: q[0],
			paragraph: q[0],
			sentence: q[0],
			word: q[1],
			whitespace: q[1],
			emphasis: q[0],
			strong: q[0],
			delete: q[0],
			inlineCode: q[1],
			wikiLink: q[1],
			link: q[0],
			image: q[1],
			blockquote: q[0],
			heading: q[0],
			code: q[1],
			html: q[1],
			list: q[0],
			thematicBreak: q[1],
			linkReference: q[0],
			imageReference: q[1],
			definition: q[1],
			footnote: q[0],
			footnoteReference: q[1],
			footnoteDefinition: q[0],
			table: q[0],
			tableCell: q[0],
			break: q[1],
			liquidNode: q[1],
			import: q[1],
			export: q[1],
			esComment: q[1],
			jsx: q[1],
			math: q[1],
			inlineMath: q[1],
			tableRow: q[0],
			listItem: q[0],
			text: q[1]
		});
		function z(e, r, t, n = {}) {
			let { processor: i = t } = n, u = [];
			return e.each(() => {
				let a = i(e);
				a !== !1 && (u.length > 0 && Cf(e) && (u.push(M), (Af(e, r) || Ni(e)) && u.push(M), Ni(e) && u.push(M)), u.push(a));
			}, "children"), u;
		}
		function Cf({ node: e, parent: r }) {
			let t = Tt.has(e.type), n = e.type === "html" && Mr.has(r.type);
			return !t && !n;
		}
		var vf = /* @__PURE__ */ new Set(["listItem", "definition"]);
		function Af({ node: e, previous: r, parent: t }, n) {
			if (Pi(r, n) || e.type === "list" && t.type === "listItem" && (r.type === "code" || r.type === "paragraph") && r.position.end.line + 1 < e.position.start.line) return !0;
			let u = r.type === e.type && vf.has(e.type), a = t.type === "listItem" && (e.type === "list" || !Pi(t, n)), o = lr(r) === "next", s = e.type === "html" && r.type === "html" && r.position.end.line + 1 === e.position.start.line, l = e.type === "html" && t.type === "listItem" && r.type === "paragraph" && r.position.end.line + 1 === e.position.start.line;
			return !(u || a || o || s || l);
		}
		function Ni({ node: e, previous: r }) {
			let t = r.type === "list", n = e.type === "code" && e.isIndented;
			return t && n;
		}
		function Pi(e, r) {
			return e.type === "listItem" && (e.spread || r.originalText.charAt(e.position.end.offset - 1) === `
`);
		}
		function Si(e, r, t) {
			let { node: n } = e, i = zr(n, e.parent), u = Ti(n, r);
			return z(e, r, t, { processor() {
				let a = s(), { node: o } = e;
				if (o.children.length === 2 && o.children[1].type === "html" && o.children[0].position.start.column !== o.children[1].position.start.column) return [a, Ii(e, r, t, a)];
				return [a, Fe(" ".repeat(a.length), Ii(e, r, t, a))];
				function s() {
					let l = n.ordered ? (e.isFirst ? n.start : u ? 1 : n.start + e.index) + (i % 2 === 0 ? ". " : ") ") : i % 2 === 0 ? "- " : "* ";
					return (n.isAligned || n.hasIndentedCodeblock) && n.ordered ? bf(l, r) : l;
				}
			} });
		}
		function Ii(e, r, t, n) {
			let { node: i } = e, u = i.checked === null ? "" : i.checked ? "[x] " : "[ ] ";
			return [u, z(e, r, t, { processor({ node: a, isFirst: o }) {
				if (o && a.type !== "list") return Fe(" ".repeat(u.length), t());
				let s = " ".repeat(xf(r.tabWidth - n.length, 0, 3));
				return [s, Fe(s, t())];
			} })];
		}
		function bf(e, r) {
			let t = n();
			return e + " ".repeat(t >= 4 ? 0 : t);
			function n() {
				let i = e.length % r.tabWidth;
				return i === 0 ? 0 : r.tabWidth - i;
			}
		}
		function xf(e, r, t) {
			return Math.max(r, Math.min(e, t));
		}
		function Li(e, r, t) {
			let { node: n } = e, i = [], u = e.map(() => e.map(({ index: f }) => {
				let D = oi(t(), r).formatted, m = or(D);
				return i[f] = Math.max(i[f] ?? 3, m), {
					text: D,
					width: m
				};
			}, "children"), "children"), a = s(!1);
			if (r.proseWrap !== "never") return [Ue, a];
			return [Ue, Ge(ei(s(!0), a))];
			function s(f) {
				return Or(ar, [
					c(u[0], f),
					l(f),
					...u.slice(1).map((D) => c(D, f))
				].map((D) => `| ${D.join(" | ")} |`));
			}
			function l(f) {
				return i.map((D, m) => {
					let p = n.align[m], h = p === "center" || p === "left" ? ":" : "-", F = p === "center" || p === "right" ? ":" : "-";
					return `${h}${f ? "-" : "-".repeat(D - 2)}${F}`;
				});
			}
			function c(f, D) {
				return f.map(({ text: m, width: p }, h) => {
					if (D) return m;
					let F = i[h] - p, g = n.align[h], E = 0;
					g === "right" ? E = F : g === "center" && (E = Math.floor(F / 2));
					let v = F - E;
					return `${" ".repeat(E)}${m}${" ".repeat(v)}`;
				});
			}
		}
		function Ri(e) {
			let { node: r } = e, t = R(0, R(0, r.value, "*", "\\*"), new RegExp([`(^|${Oe.source})(_+)`, `(_+)(${Oe.source}|$)`].join("|"), "gu"), (u, a, o, s, l) => R(0, o ? `${a}${o}` : `${s}${l}`, "_", "\\_")), n = (u, a, o) => u.type === "sentence" && o === 0, i = (u, a, o) => Gr(u.children[o - 1]);
			return t !== r.value && (e.match(void 0, n, i) || e.match(void 0, n, (u, a, o) => u.type === "emphasis" && o === 0, i)) && (t = t.replace(/^(\\?[*_])+/u, (u) => R(0, u, "\\", ""))), t;
		}
		function Mi(e, r, t) {
			return yf(e.map(t, "children"));
		}
		function yf(e) {
			let r = [""];
			return (function t(n) {
				for (let i of n) {
					let u = W(i);
					if (u === j) {
						t(i);
						continue;
					}
					let a = i, o = [];
					u === J && ([a, ...o] = i.parts), r.push([r.pop(), a], ...o);
				}
			})(e), Ye(r);
		}
		var _t = class {
			#e;
			constructor(r) {
				this.#e = new Set(r);
			}
			getLeadingWhitespaceCount(r) {
				let t = this.#e, n = 0;
				for (let i = 0; i < r.length && t.has(r.charAt(i)); i++) n++;
				return n;
			}
			getTrailingWhitespaceCount(r) {
				let t = this.#e, n = 0;
				for (let i = r.length - 1; i >= 0 && t.has(r.charAt(i)); i--) n++;
				return n;
			}
			getLeadingWhitespace(r) {
				let t = this.getLeadingWhitespaceCount(r);
				return r.slice(0, t);
			}
			getTrailingWhitespace(r) {
				let t = this.getTrailingWhitespaceCount(r);
				return r.slice(r.length - t);
			}
			hasLeadingWhitespace(r) {
				return this.#e.has(r.charAt(0));
			}
			hasTrailingWhitespace(r) {
				return this.#e.has(U(0, r, -1));
			}
			trimStart(r) {
				let t = this.getLeadingWhitespaceCount(r);
				return r.slice(t);
			}
			trimEnd(r) {
				let t = this.getTrailingWhitespaceCount(r);
				return r.slice(0, r.length - t);
			}
			trim(r) {
				return this.trimEnd(this.trimStart(r));
			}
			split(r, t = !1) {
				let n = `[${fe([...this.#e].join(""))}]+`, i = new RegExp(t ? `(${n})` : n, "u");
				return r.split(i);
			}
			hasWhitespaceCharacter(r) {
				let t = this.#e;
				return Array.prototype.some.call(r, (n) => t.has(n));
			}
			hasNonWhitespaceCharacter(r) {
				let t = this.#e;
				return Array.prototype.some.call(r, (n) => !t.has(n));
			}
			isWhitespaceOnly(r) {
				let t = this.#e;
				return Array.prototype.every.call(r, (n) => t.has(n));
			}
			#r(r) {
				let t = Number.POSITIVE_INFINITY;
				for (let n of r.split(`
`)) {
					if (n.length === 0) continue;
					let i = this.getLeadingWhitespaceCount(n);
					if (i === 0) return 0;
					n.length !== i && i < t && (t = i);
				}
				return t === Number.POSITIVE_INFINITY ? 0 : t;
			}
			dedentString(r) {
				let t = this.#r(r);
				return t === 0 ? r : r.split(`
`).map((n) => n.slice(t)).join(`
`);
			}
		};
		var Ot = new _t([
			"	",
			`
`,
			"\f",
			"\r",
			" "
		]);
		var Tf = /^\\?.$/su, Bf = /^\n *>[ >]*$/u;
		function _f(e, r) {
			return e = Of(e, r), e = Nf(e), e = If(e, r), e = Sf(e, r), e = Pf(e), e;
		}
		function Of(e, r) {
			return ye(e, (t) => {
				if (t.type !== "text") return t;
				let { value: n } = t;
				if (n === "*" || n === "_" || !Tf.test(n) || t.position.end.offset - t.position.start.offset === n.length) return t;
				let i = r.originalText.slice(t.position.start.offset, t.position.end.offset);
				return Bf.test(i) ? t : {
					...t,
					value: i
				};
			});
		}
		function qf(e, r, t) {
			return ye(e, (n) => {
				if (!n.children) return n;
				let i = [], u, a;
				for (let o of n.children) u && r(u, o) ? (o = t(u, o), i.splice(-1, 1, o), a || (a = !0)) : i.push(o), u = o;
				return a ? {
					...n,
					children: i
				} : n;
			});
		}
		function Nf(e) {
			return qf(e, (r, t) => r.type === "text" && t.type === "text", (r, t) => ({
				type: "text",
				value: r.value + t.value,
				position: {
					start: r.position.start,
					end: t.position.end
				}
			}));
		}
		function Pf(e) {
			return ye(e, (r, t, [n]) => {
				if (r.type !== "text") return r;
				let { value: i } = r;
				return n.type === "paragraph" && (t === 0 && (i = Ot.trimStart(i)), t === n.children.length - 1 && (i = Ot.trimEnd(i))), {
					type: "sentence",
					position: r.position,
					children: Ur(i)
				};
			});
		}
		function If(e, r) {
			return ye(e, (t, n, i) => {
				if (t.type === "code") {
					let u = /^\n?(?: {4,}|\t)/u.test(r.originalText.slice(t.position.start.offset, t.position.end.offset));
					if (t.isIndented = u, u) for (let a = 0; a < i.length; a++) {
						let o = i[a];
						if (o.hasIndentedCodeblock) break;
						o.type === "list" && (o.hasIndentedCodeblock = !0);
					}
				}
				return t;
			});
		}
		function Sf(e, r) {
			return ye(e, (i, u, a) => {
				if (i.type === "list" && i.children.length > 0) {
					for (let o = 0; o < a.length; o++) {
						let s = a[o];
						if (s.type === "list" && !s.isAligned) return i.isAligned = !1, i;
					}
					i.isAligned = n(i);
				}
				return i;
			});
			function t(i) {
				return i.children.length === 0 ? -1 : i.children[0].position.start.column - 1;
			}
			function n(i) {
				if (!i.ordered) return !0;
				let [u, a] = i.children;
				if (ze(u, r).leadingSpaces.length > 1) return !0;
				let s = t(u);
				if (s === -1) return !1;
				if (i.children.length === 1) return s % r.tabWidth === 0;
				return s !== t(a) ? !1 : s % r.tabWidth === 0 ? !0 : ze(a, r).leadingSpaces.length > 1;
			}
		}
		var Yi = _f;
		function Gi(e, r) {
			let t = [""];
			return e.each(() => {
				let { node: n } = e, i = r();
				switch (n.type) {
					case "whitespace": if (W(i) !== V) {
						t.push(i, "");
						break;
					}
					default: t.push([t.pop(), i]);
				}
			}, "children"), Ye(t);
		}
		var Lf = /* @__PURE__ */ new Set([
			"heading",
			"tableCell",
			"link",
			"wikiLink"
		]), zi = /* @__PURE__ */ new Set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~");
		function Rf({ parent: e }) {
			if (e.usesCJSpaces === void 0) {
				let r = {
					" ": 0,
					"": 0
				}, { children: t } = e;
				for (let n = 1; n < t.length - 1; ++n) {
					let i = t[n];
					if (i.type === "whitespace" && (i.value === " " || i.value === "")) {
						let u = t[n - 1].kind, a = t[n + 1].kind;
						(u === ae && a === We || u === We && a === ae) && ++r[i.value];
					}
				}
				e.usesCJSpaces = r[" "] > r[""];
			}
			return e.usesCJSpaces;
		}
		function Mf(e, r) {
			if (r) return !0;
			let { previous: t, next: n } = e;
			if (!t || !n) return !0;
			let i = t.kind, u = n.kind;
			return Wi(i) && Wi(u) || i === Pe && u === ae || u === Pe && i === ae ? !0 : i === cr || u === cr || i === ae && u === ae ? !1 : zi.has(n.value[0]) || zi.has(U(0, t.value, -1)) ? !0 : t.hasTrailingPunctuation || n.hasLeadingPunctuation ? !1 : Rf(e);
		}
		function Wi(e) {
			return e === We || e === Pe;
		}
		function Uf(e, r, t, n) {
			if (t !== "always" || e.hasAncestor((a) => Lf.has(a.type))) return !1;
			if (n) return r !== "";
			let { previous: i, next: u } = e;
			return !i || !u ? !0 : r === "" ? !1 : i.kind === Pe && u.kind === ae || u.kind === Pe && i.kind === ae ? !0 : !(i.isCJ || u.isCJ);
		}
		function qt(e, r, t, n) {
			if (t === "preserve" && r === `
`) return M;
			let i = r === " " || r === `
` && Mf(e, n);
			return Uf(e, r, t, n) ? i ? Nr : Pr : i ? " " : "";
		}
		function Vi(e) {
			let { previous: r, next: t } = e;
			return r?.type === "sentence" && U(0, r.children, -1)?.type === "word" && !U(0, r.children, -1).hasTrailingPunctuation || t?.type === "sentence" && t.children[0]?.type === "word" && !t.children[0].hasLeadingPunctuation;
		}
		function Yf(e, r, t) {
			let { node: n } = e;
			if (zf(e)) {
				let i = [""], u = Ur(r.originalText.slice(n.position.start.offset, n.position.end.offset));
				for (let a of u) {
					if (a.type === "word") {
						i.push([i.pop(), a.value]);
						continue;
					}
					let o = qt(e, a.value, r.proseWrap, !0);
					if (W(o) === V) {
						i.push([i.pop(), o]);
						continue;
					}
					i.push(o, "");
				}
				return Ye(i);
			}
			switch (n.type) {
				case "root": return n.children.length === 0 ? "" : [Gf(e, r, t), M];
				case "paragraph": return Mi(e, r, t);
				case "sentence": return Gi(e, t);
				case "word": return Ri(e);
				case "whitespace": {
					let { next: i } = e, u = i && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/u.test(i.value) ? "never" : r.proseWrap;
					return qt(e, n.value, u);
				}
				case "emphasis": {
					let i;
					if (Gr(n.children[0])) i = r.originalText[n.position.start.offset];
					else {
						let u = Vi(e), a = e.callParent(({ node: o }) => o.type === "strong" && Vi(e));
						i = u || a || e.hasAncestor((o) => o.type === "emphasis") ? "*" : "_";
					}
					return [
						i,
						z(e, r, t),
						i
					];
				}
				case "strong": return [
					"**",
					z(e, r, t),
					"**"
				];
				case "delete": return [
					"~~",
					z(e, r, t),
					"~~"
				];
				case "inlineCode": {
					let i = r.proseWrap === "preserve" ? n.value : R(0, n.value, `
`, " "), u = si(i, "`"), a = "`".repeat(u), o = i.startsWith("`") || i.endsWith("`") || /^[\n ]/u.test(i) && /[\n ]$/u.test(i) && /[^\n ]/u.test(i) ? " " : "";
					return [
						a,
						o,
						i,
						o,
						a
					];
				}
				case "wikiLink": {
					let i = "";
					return r.proseWrap === "preserve" ? i = n.value : i = R(0, n.value, /[\t\n]+/gu, " "), [
						"[[",
						i,
						"]]"
					];
				}
				case "link": switch (r.originalText[n.position.start.offset]) {
					case "<": {
						let i = "mailto:";
						return [
							"<",
							n.url.startsWith(i) && r.originalText.slice(n.position.start.offset + 1, n.position.start.offset + 1 + 7) !== i ? n.url.slice(7) : n.url,
							">"
						];
					}
					case "[": return [
						"[",
						z(e, r, t),
						"](",
						Nt(n.url, ")"),
						Wr(n.title, r),
						")"
					];
					default: return r.originalText.slice(n.position.start.offset, n.position.end.offset);
				}
				case "image": return [
					"![",
					n.alt || "",
					"](",
					Nt(n.url, ")"),
					Wr(n.title, r),
					")"
				];
				case "blockquote": return ["> ", Fe("> ", z(e, r, t))];
				case "heading": return ["#".repeat(n.depth) + " ", z(e, r, t)];
				case "code": {
					if (n.isIndented) {
						let a = " ".repeat(4);
						return Fe(a, [a, xe(n.value, M)]);
					}
					let i = r.__inJsTemplate ? "~" : "`", u = i.repeat(Math.max(3, Sr(n.value, i) + 1));
					return [
						u,
						n.lang || "",
						n.meta ? " " + n.meta : "",
						M,
						xe(Yr(n, r.originalText), M),
						M,
						u
					];
				}
				case "html": {
					let { parent: i, isLast: u } = e, a = i.type === "root" && u ? n.value.trimEnd() : n.value;
					return xe(a, /^<!--.*-->$/su.test(a) ? M : ur(nr));
				}
				case "list": return Si(e, r, t);
				case "thematicBreak": {
					let { ancestors: i } = e, u = i.findIndex((o) => o.type === "list");
					return u === -1 ? "---" : zr(i[u], i[u + 1]) % 2 === 0 ? "***" : "---";
				}
				case "linkReference": return [
					"[",
					z(e, r, t),
					"]",
					n.referenceType === "full" ? Pt(n) : n.referenceType === "collapsed" ? "[]" : ""
				];
				case "imageReference": switch (n.referenceType) {
					case "full": return [
						"![",
						n.alt || "",
						"]",
						Pt(n)
					];
					default: return [
						"![",
						n.alt,
						"]",
						n.referenceType === "collapsed" ? "[]" : ""
					];
				}
				case "definition": {
					let i = r.proseWrap === "always" ? Nr : " ";
					return Ge([
						Pt(n),
						":",
						ir([
							i,
							Nt(n.url),
							n.title === null ? "" : [i, Wr(n.title, r, !1)]
						])
					]);
				}
				case "footnote": return [
					"[^",
					z(e, r, t),
					"]"
				];
				case "footnoteReference": return $i(n);
				case "footnoteDefinition": {
					let i = n.children.length === 1 && n.children[0].type === "paragraph" && (r.proseWrap === "never" || r.proseWrap === "preserve" && n.children[0].position.start.line === n.children[0].position.end.line);
					return [
						$i(n),
						": ",
						i ? z(e, r, t) : Ge([Fe(" ".repeat(4), z(e, r, t, { processor: ({ isFirst: u }) => u ? Ge([Pr, t()]) : t() }))])
					];
				}
				case "table": return Li(e, r, t);
				case "tableCell": return z(e, r, t);
				case "break": return /\s/u.test(r.originalText[n.position.start.offset]) ? ["  ", ur(nr)] : ["\\", M];
				case "liquidNode": return xe(n.value, M);
				case "import":
				case "export":
				case "jsx": return n.value.trimEnd();
				case "esComment": return [
					"{/* ",
					n.value,
					" */}"
				];
				case "math": return [
					"$$",
					M,
					n.value ? [xe(n.value, M), M] : "",
					"$$"
				];
				case "inlineMath": return r.originalText.slice(qe(n), Ne(n));
				default: throw new Di(n, "Markdown");
			}
		}
		function Gf(e, r, t) {
			let n = [], i = null, { children: u } = e.node;
			for (let [a, o] of u.entries()) switch (lr(o)) {
				case "start":
					i === null && (i = {
						index: a,
						offset: o.position.end.offset
					});
					break;
				case "end": i !== null && (n.push({
					start: i,
					end: {
						index: a,
						offset: o.position.start.offset
					}
				}), i = null);
			}
			return z(e, r, t, { processor({ index: a }) {
				if (n.length > 0) {
					let o = n[0];
					if (a === o.start.index) return [
						ji(u[o.start.index]),
						r.originalText.slice(o.start.offset, o.end.offset),
						ji(u[o.end.index])
					];
					if (o.start.index < a && a < o.end.index) return !1;
					if (a === o.end.index) return n.shift(), !1;
				}
				return t();
			} });
		}
		function ji(e) {
			if (e.type === "html") return e.value;
			if (e.type === "paragraph" && Array.isArray(e.children) && e.children.length === 1 && e.children[0].type === "esComment") return [
				"{/* ",
				e.children[0].value,
				" */}"
			];
		}
		function zf(e) {
			let r = e.findAncestor((t) => t.type === "linkReference" || t.type === "imageReference");
			return r && (r.type !== "linkReference" || r.referenceType !== "full");
		}
		var Wf = (e, r) => {
			for (let t of r) e = R(0, e, t, encodeURIComponent(t));
			return e;
		};
		function Nt(e, r = []) {
			let t = [" ", ...Array.isArray(r) ? r : [r]];
			return new RegExp(t.map((n) => fe(n)).join("|"), "u").test(e) ? `<${Wf(e, "<>")}>` : e;
		}
		function Wr(e, r, t = !0) {
			if (!e) return "";
			if (t) return " " + Wr(e, r, !1);
			if (e = R(0, e, /\\(?=["')])/gu, ""), e.includes("\"") && e.includes("'") && !e.includes(")")) return `(${e})`;
			let n = fi(e, r.singleQuote);
			return e = R(0, e, "\\", "\\\\"), e = R(0, e, n, `\\${n}`), `${n}${e}${n}`;
		}
		function Vf(e) {
			return e.index > 0 && lr(e.previous) === "next";
		}
		function Pt(e) {
			return `[${(0, Hi.default)(e.label)}]`;
		}
		function $i(e) {
			return `[^${e.label}]`;
		}
		var Ki = {
			features: { experimental_frontMatterSupport: {
				massageAstNode: !0,
				embed: !0,
				print: !0
			} },
			preprocess: Yi,
			print: Yf,
			embed: Bi,
			massageAstNode: wi,
			hasPrettierIgnore: Vf,
			insertPragma: bi,
			getVisitorKeys: qi
		};
		var Xi = [{
			name: "Markdown",
			type: "prose",
			aceMode: "markdown",
			extensions: [
				".md",
				".livemd",
				".markdown",
				".mdown",
				".mdwn",
				".mkd",
				".mkdn",
				".mkdown",
				".ronn",
				".scd",
				".workbook"
			],
			filenames: ["contents.lr", "README"],
			tmScope: "text.md",
			aliases: ["md", "pandoc"],
			codemirrorMode: "gfm",
			codemirrorMimeType: "text/x-gfm",
			wrap: !0,
			parsers: ["markdown"],
			vscodeLanguageIds: ["markdown"],
			linguistLanguageId: 222
		}, {
			name: "MDX",
			type: "prose",
			aceMode: "markdown",
			extensions: [".mdx"],
			filenames: [],
			tmScope: "text.md",
			aliases: ["md", "pandoc"],
			codemirrorMode: "gfm",
			codemirrorMimeType: "text/x-gfm",
			wrap: !0,
			parsers: ["mdx"],
			vscodeLanguageIds: ["mdx"],
			linguistLanguageId: 222
		}];
		var It = {
			bracketSpacing: {
				category: "Common",
				type: "boolean",
				default: !0,
				description: "Print spaces between brackets.",
				oppositeDescription: "Do not print spaces between brackets."
			},
			objectWrap: {
				category: "Common",
				type: "choice",
				default: "preserve",
				description: "How to wrap object literals.",
				choices: [{
					value: "preserve",
					description: "Keep as multi-line, if there is a newline between the opening brace and first property."
				}, {
					value: "collapse",
					description: "Fit to a single line when possible."
				}]
			},
			singleQuote: {
				category: "Common",
				type: "boolean",
				default: !1,
				description: "Use single quotes instead of double quotes."
			},
			proseWrap: {
				category: "Common",
				type: "choice",
				default: "preserve",
				description: "How to wrap prose.",
				choices: [
					{
						value: "always",
						description: "Wrap prose if it exceeds the print width."
					},
					{
						value: "never",
						description: "Do not wrap prose."
					},
					{
						value: "preserve",
						description: "Wrap prose as-is."
					}
				]
			},
			bracketSameLine: {
				category: "Common",
				type: "boolean",
				default: !1,
				description: "Put > of opening tags on the last line instead of on a new line."
			},
			singleAttributePerLine: {
				category: "Common",
				type: "boolean",
				default: !1,
				description: "Enforce single attribute per line in HTML, Vue and JSX."
			}
		};
		var Ji = {
			proseWrap: It.proseWrap,
			singleQuote: It.singleQuote
		};
		var Wn = {};
		Vn(Wn, {
			markdown: () => cF,
			mdx: () => lF,
			remark: () => cF
		});
		var pl = Re(Zi(), 1), hl = Re(pu(), 1), dl = Re(sc(), 1), ml = Re(rl(), 1);
		var rF = /^import\s/u, tF = /^export\s/u, tl = "[a-z][a-z0-9]*(\\.[a-z][a-z0-9]*)*|", nl = /<!---->|<!---?[^>-](?:-?[^-])*-->/u, nF = /^\{\s*\/\*(.*)\*\/\s*\}/u;
		var iF = (e) => rF.test(e), il = (e) => tF.test(e), ul = (e) => iF(e) || il(e), zn = (e, r) => {
			let t = r.indexOf(`

`), n = t === -1 ? r : r.slice(0, t);
			if (ul(n)) return e(n)({
				type: il(n) ? "export" : "import",
				value: n
			});
		};
		zn.notInBlock = !0;
		zn.locator = (e) => ul(e) ? -1 : 1;
		var al = (e, r) => {
			let t = nF.exec(r);
			if (t) return e(t[0])({
				type: "esComment",
				value: t[1].trim()
			});
		};
		al.locator = (e, r) => e.indexOf("{", r);
		var ol = function() {
			let { Parser: e } = this, { blockTokenizers: r, blockMethods: t, inlineTokenizers: n, inlineMethods: i } = e.prototype;
			r.esSyntax = zn, n.esComment = al, t.splice(t.indexOf("paragraph"), 0, "esSyntax"), i.splice(i.indexOf("text"), 0, "esComment");
		};
		var uF = function() {
			let e = this.Parser.prototype;
			e.blockMethods = ["frontMatter", ...e.blockMethods], e.blockTokenizers.frontMatter = r;
			function r(t, n) {
				let { frontMatter: i } = _e(n);
				if (i) return t(i.raw)({
					...i,
					type: "frontMatter"
				});
			}
			r.onlyAtStart = !0;
		}, sl = uF;
		function aF() {
			return (e) => ye(e, (r, t, [n]) => r.type !== "html" || nl.test(r.value) || Mr.has(n.type) ? r : {
				...r,
				type: "jsx"
			});
		}
		var cl = aF;
		var oF = function() {
			let e = this.Parser.prototype, r = e.inlineMethods;
			r.splice(r.indexOf("text"), 0, "liquid"), e.inlineTokenizers.liquid = t;
			function t(n, i) {
				let u = i.match(/^(\{%.*?%\}|\{\{.*?\}\})/su);
				if (u) return n(u[0])({
					type: "liquidNode",
					value: u[0]
				});
			}
			t.locator = function(n, i) {
				return n.indexOf("{", i);
			};
		}, ll = oF;
		var sF = function() {
			let e = "wikiLink", r = /^\[\[(?<linkContents>.+?)\]\]/su, t = this.Parser.prototype, n = t.inlineMethods;
			n.splice(n.indexOf("link"), 0, e), t.inlineTokenizers.wikiLink = i;
			function i(u, a) {
				let o = r.exec(a);
				if (o) {
					let s = o.groups.linkContents.trim();
					return u(o[0])({
						type: e,
						value: s
					});
				}
			}
			i.locator = function(u, a) {
				return u.indexOf("[", a);
			};
		}, fl = sF;
		function Fl({ isMDX: e }) {
			return (r) => {
				let t = (0, ml.default)().use(dl.default, {
					commonmark: !0,
					...e && { blocks: [tl] }
				}).use(pl.default).use(sl).use(hl.default).use(e ? ol : Dl).use(ll).use(e ? cl : Dl).use(fl);
				return t.run(t.parse(r));
			};
		}
		function Dl() {}
		var gl = {
			astFormat: "mdast",
			hasPragma: Rr,
			hasIgnorePragma: Ai,
			locStart: qe,
			locEnd: Ne
		}, cF = {
			...gl,
			parse: Fl({ isMDX: !1 })
		}, lF = {
			...gl,
			parse: Fl({ isMDX: !0 })
		};
		var fF = { mdast: Ki };
		return xl(DF);
	});
}));
//#endregion
export default require_markdown();
