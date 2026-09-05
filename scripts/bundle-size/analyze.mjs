/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Measures what an application actually ships when it depends on a given set
// of Lexical extensions, and attributes every byte of the minified output back
// to the source file (and top-level declaration) it came from.
//
// Attribution works off the output sourcemap rather than the bundler's
// `renderedLength`, so the numbers are post-minification bytes: the same bytes
// a consumer downloads. See scripts/bundle-size/README.md for the analysis
// this was written to support.
//
// Usage (from the monorepo root):
//
//   node scripts/bundle-size/analyze.mjs                     # every entry, from source
//   node scripts/bundle-size/analyze.mjs rich-text-dom-import
//   node scripts/bundle-size/analyze.mjs --dist              # measure packages/*/dist
//   node scripts/bundle-size/analyze.mjs --detail=LexicalSelection.ts
//
// `--dist` requires `pnpm run build-release` first and reports the number a
// real consumer sees (invariant messages replaced by error codes). The default
// `source` mode resolves the `source` export condition and runs
// @lexical/compiler exactly as scripts/vite/lexicalMonorepoPlugin does, but
// keeps the invariant message strings, so it reports ~4% higher. Use source
// mode to compare two working trees, dist mode for absolute figures.

import {readdirSync, readFileSync} from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {build} from 'vite';

import {pureAnnotations} from '../../packages/lexical-compiler/src/passes/pureAnnotations.mjs';
import {packagesManager} from '../shared/packagesManager.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_DIR = path.join(HERE, 'entries');
const OUT_DIR = path.join(HERE, '.out');

const argv = process.argv.slice(2);
const useDist = argv.includes('--dist');
const detailArg = argv.find(arg => arg.startsWith('--detail='));
const detailFilter = detailArg ? detailArg.slice('--detail='.length) : null;
const requested = argv.filter(arg => !arg.startsWith('--'));

const allEntries = readdirSync(ENTRY_DIR)
  .filter(name => name.endsWith('.ts'))
  .map(name => name.replace(/\.ts$/, ''));
const entries = requested.length > 0 ? requested : allEntries;
for (const entry of entries) {
  if (!allEntries.includes(entry)) {
    throw new Error(
      `Unknown entry "${entry}". Available: ${allEntries.join(', ')}`,
    );
  }
}

/**
 * Resolve every published `@lexical/*` module name to a file on disk, either
 * its TypeScript source or its built production bundle. Equivalent to
 * scripts/vite/viteModuleResolution.ts, reimplemented here so this script can
 * run under plain node without a TypeScript loader.
 */
function moduleAliases() {
  /** @param {string} value */
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return packagesManager.getPublicPackages().flatMap(pkg => {
    if (!useDist) {
      return pkg.getExportedNpmModuleEntries().map(entry => ({
        find: new RegExp(`^${escape(entry.name)}$`),
        replacement: pkg.resolve(
          'src',
          entry.browserSourceFileName || entry.sourceFileName,
        ),
      }));
    }
    return pkg.getNormalizedNpmModuleExportEntries().map(([name, exports]) => {
      const replacement =
        (exports.browser && exports.browser.production) ||
        exports.import.production ||
        (exports.browser && exports.browser.default) ||
        exports.import.default;
      if (!replacement) {
        throw new Error(`No production entry for ${name}`);
      }
      return {
        find: new RegExp(`^${escape(name)}$`),
        replacement: pkg.resolve(replacement),
      };
    });
  });
}

const ALIASES = moduleAliases();

/**
 * @param {string} entry
 * @returns {Promise<{code: string, map: {mappings: string, sources: Array<string>}}>}
 */
async function buildEntry(entry) {
  const outDir = path.join(OUT_DIR, entry);
  await build({
    build: {
      emptyOutDir: true,
      lib: {
        entry: path.join(ENTRY_DIR, `${entry}.ts`),
        fileName: entry,
        formats: ['es'],
      },
      minify: 'terser',
      outDir,
      sourcemap: true,
      target: 'es2022',
      terserOptions: {compress: {passes: 3}, mangle: true},
    },
    configFile: false,
    define: {
      __DEV__: false,
      'process.env.IS_PREACT': 'undefined',
      'process.env.LEXICAL_VERSION': JSON.stringify('0.0.0+bundle-size'),
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    logLevel: 'warn',
    // Source builds need the same PURE/inline transform the published bundles
    // are built with, or unused extension definitions would be pinned into the
    // output and the numbers would be fiction.
    plugins: useDist ? [] : [pureAnnotations({inline: true, strict: true})],
    resolve: {alias: ALIASES},
  });
  return {
    code: readFileSync(path.join(outDir, `${entry}.mjs`), 'utf8'),
    map: JSON.parse(
      readFileSync(path.join(outDir, `${entry}.mjs.map`), 'utf8'),
    ),
  };
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decode a sourcemap `mappings` string into
 * `[generatedLine, generatedColumn, sourceIndex, originalLine]` tuples.
 * Only the four fields this script needs are tracked; the name index is
 * consumed and discarded.
 *
 * @param {string} mappings
 */
function decodeMappings(mappings) {
  /** @type {Array<[number, number, number, number]>} */
  const out = [];
  let sourceIndex = 0;
  let originalLine = 0;
  let originalColumn = 0;
  let nameIndex = 0;
  const state = [0, 0, 0, 0, 0];
  mappings.split(';').forEach((lineSegments, lineOffset) => {
    let generatedColumn = 0;
    if (lineSegments === '') {
      return;
    }
    for (const segment of lineSegments.split(',')) {
      if (segment === '') {
        continue;
      }
      let pos = 0;
      let field = 0;
      state[0] = generatedColumn;
      state[1] = sourceIndex;
      state[2] = originalLine;
      state[3] = originalColumn;
      state[4] = nameIndex;
      let fieldCount = 0;
      while (pos < segment.length) {
        let value = 0;
        let shift = 0;
        let digit;
        do {
          digit = B64.indexOf(segment[pos++]);
          value += (digit & 31) << shift;
          shift += 5;
        } while (digit & 32);
        const negative = value & 1;
        value >>= 1;
        state[field] += negative ? -value : value;
        field++;
        fieldCount++;
      }
      generatedColumn = state[0];
      if (fieldCount >= 4) {
        sourceIndex = state[1];
        originalLine = state[2];
        originalColumn = state[3];
        nameIndex = state[4];
        out.push([
          lineOffset + 1,
          generatedColumn,
          sourceIndex,
          originalLine + 1,
        ]);
      }
    }
  });
  return out;
}

/**
 * Charge each run of generated bytes to the source file and original line it
 * came from. A mapping owns everything up to the next mapping on the same
 * generated line, or to the end of that line.
 *
 * @param {string} code
 * @param {{mappings: string, sources: Array<string>}} map
 * @returns {Map<string, Map<number, number>>}
 */
function attribute(code, map) {
  const lineLengths = code.split('\n').map(line => line.length + 1);
  const mappings = decodeMappings(map.mappings);
  const perFile = new Map();
  for (let i = 0; i < mappings.length; i++) {
    const [generatedLine, generatedColumn, sourceIndex, originalLine] =
      mappings[i];
    const next = mappings[i + 1];
    const size =
      next && next[0] === generatedLine
        ? next[1] - generatedColumn
        : lineLengths[generatedLine - 1] - generatedColumn;
    if (size <= 0) {
      continue;
    }
    const source = path.resolve(
      path.dirname(path.join(OUT_DIR, 'x', 'x')),
      map.sources[sourceIndex],
    );
    let lines = perFile.get(source);
    if (lines === undefined) {
      lines = new Map();
      perFile.set(source, lines);
    }
    lines.set(originalLine, (lines.get(originalLine) || 0) + size);
  }
  return perFile;
}

const TOP_LEVEL_DECL =
  /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?\s+([\w$]+)|class\s+([\w$]+)|(?:const|let|var)\s+([\w$]+))/;
const CLASS_MEMBER =
  /^ {2}(?:(?:public|private|protected|static|readonly|get|set|async)\s+)*\*?([\w$]+)\s*[(<]/;

/**
 * Map original line numbers back to the declaration that encloses them, so a
 * per-file total can be broken down by function / method.
 *
 * @param {string} sourcePath
 * @returns {Array<[number, string]>}
 */
function declarationsOf(sourcePath) {
  /** @type {string} */
  let text;
  try {
    text = readFileSync(sourcePath, 'utf8');
  } catch {
    return [];
  }
  /** @type {Array<[number, string]>} */
  const decls = [];
  text.split('\n').forEach((line, index) => {
    const top = TOP_LEVEL_DECL.exec(line);
    if (top) {
      decls.push([index + 1, top[1] || top[2] || top[3]]);
      return;
    }
    const member = CLASS_MEMBER.exec(line);
    if (
      member &&
      !/^\s*(?:if|for|while|switch|return|catch|else)\b/.test(line)
    ) {
      decls.push([index + 1, `.${member[1]}`]);
    }
  });
  return decls;
}

/** @param {string} sourcePath */
function label(sourcePath) {
  for (const marker of [`${path.sep}packages${path.sep}`, 'node_modules/']) {
    const index = sourcePath.lastIndexOf(marker);
    if (index !== -1) {
      return sourcePath.slice(index + marker.length);
    }
  }
  return sourcePath;
}

/** @param {string} sourcePath */
function packageOf(sourcePath) {
  const match = /[\\/]packages[\\/]([^\\/]+)[\\/]/.exec(sourcePath);
  if (match) {
    return match[1];
  }
  return /node_modules/.test(sourcePath) ? 'node_modules' : 'entry';
}

/**
 * @param {Array<[string, number]>} rows
 * @param {number} [limit]
 */
function table(rows, limit = Infinity) {
  return rows
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, size]) => `${String(size).padStart(8)}  ${name}`)
    .join('\n');
}

for (const entry of entries) {
  const {code, map} = await buildEntry(entry);
  const raw = Buffer.from(code, 'utf8');
  const perFile = attribute(code, map);

  /** @type {Array<[string, number]>} */
  const fileTotals = [];
  /** @type {Map<string, number>} */
  const packageTotals = new Map();
  for (const [source, lines] of perFile) {
    let total = 0;
    for (const size of lines.values()) {
      total += size;
    }
    fileTotals.push([source, total]);
    const pkg = packageOf(source);
    packageTotals.set(pkg, (packageTotals.get(pkg) || 0) + total);
  }

  console.log(`\n${'='.repeat(72)}`);
  console.log(`${entry}  (${useDist ? 'dist' : 'source'})`);
  console.log(
    `minified ${raw.length} bytes / gzip ${gzipSync(raw).length} bytes`,
  );
  console.log('='.repeat(72));
  console.log('\n-- by package --');
  console.log(table([...packageTotals.entries()]));
  console.log('\n-- by file (top 30) --');
  console.log(
    table(
      fileTotals.map(
        ([source, size]) =>
          /** @type {[string, number]} */ ([label(source), size]),
      ),
      30,
    ),
  );

  if (detailFilter) {
    for (const [source, lines] of perFile) {
      if (!source.includes(detailFilter)) {
        continue;
      }
      const decls = declarationsOf(source);
      const groups = new Map();
      for (const [originalLine, size] of lines) {
        let found = null;
        for (const decl of decls) {
          if (decl[0] > originalLine) {
            break;
          }
          found = decl;
        }
        const name = found ? `${found[1]} (L${found[0]})` : '<module scope>';
        groups.set(name, (groups.get(name) || 0) + size);
      }
      console.log(`\n-- ${label(source)} (top 25 declarations) --`);
      console.log(table([...groups.entries()], 25));
    }
  }
}
