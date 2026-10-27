/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  codeToTokens as CodeToTokens,
  Lang,
  Theme,
  ThemedToken,
} from '@pierre/highlights';

import {
  $createCodeHighlightNodesFromTokens,
  $isCodeNode,
  $plainifyCodeContent,
  type CodeNode,
} from '@lexical/code-core';
import {themes as themeLoaders} from '@pierre/highlights/themes/loader';
import {
  $getNodeByKey,
  HISTORY_MERGE_TAG,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
} from 'lexical';

/**
 * The languages built into Highlights, as `[id, name, aliases]`. Highlights
 * accepts every id and alias, but does not export the list, so it is kept
 * here for the language picker and for {@link normalizeCodeLanguage}. The
 * ids follow Shiki's where both have the language, so a code block keeps its
 * language when an editor switches between the two.
 */
const LANGUAGES: readonly [id: Lang, name: string, aliases?: string][] = [
  ['plaintext', 'Plain Text', 'plain text txt'],
  ['angular-html', 'Angular HTML'],
  ['asm', 'Assembly', 'assembly s'],
  ['astro', 'Astro'],
  ['bat', 'Batch File', 'batch batchfile cmd dos'],
  ['c', 'C', 'h'],
  ['c3', 'C3'],
  ['clojure', 'Clojure', 'clj cljc cljs edn'],
  ['cmake', 'CMake'],
  ['cpp', 'C++', 'c++ cc cxx hh hpp hxx'],
  ['csharp', 'C#', 'c# cs'],
  ['css', 'CSS'],
  ['cuda', 'CUDA', 'cu cuh'],
  ['dart', 'Dart'],
  ['diff', 'Diff', 'git-commit git-rebase patch'],
  ['docker', 'Dockerfile', 'containerfile dockerfile'],
  ['elixir', 'Elixir', 'ex exs'],
  ['elm', 'Elm'],
  ['erlang', 'Erlang', 'erl hrl'],
  ['fortran-fixed-form', 'Fortran (Fixed Form)', 'f f77 for'],
  ['fortran-free-form', 'Fortran (Free Form)', 'f03 f08 f90 f95 fortran'],
  ['fsharp', 'F#', 'f# fs fsi fsx'],
  ['gdresource', 'GDResource', 'godot-resource tres tscn'],
  ['gdscript', 'GDScript', 'gd'],
  ['gdshader', 'GDShader', 'gdshaderinc godot-shader'],
  ['gleam', 'Gleam'],
  ['glsl', 'GLSL', 'comp frag geom vert'],
  ['go', 'Go', 'golang'],
  ['graphql', 'GraphQL', 'gql'],
  ['groovy', 'Groovy', 'gradle gsh gvy gy'],
  ['haskell', 'Haskell', 'hs'],
  ['hcl', 'HCL', 'terraform tf tfvars'],
  ['hlsl', 'HLSL'],
  ['html', 'HTML', 'htm'],
  ['java', 'Java'],
  ['javascript', 'JavaScript', 'cjs js mjs'],
  ['json', 'JSON', 'jsonc'],
  ['jsx', 'JSX'],
  ['julia', 'Julia', 'jl'],
  ['kotlin', 'Kotlin', 'kt kts'],
  ['less', 'Less'],
  ['lisp', 'Lisp', 'cl el elisp emacs-lisp lsp scheme scm'],
  ['lua', 'Lua'],
  ['make', 'Makefile', 'makefile mk'],
  ['markdown', 'Markdown', 'md'],
  ['matlab', 'MATLAB', 'octave'],
  ['mdx', 'MDX'],
  ['nix', 'Nix'],
  ['objective-c', 'Objective-C', 'm mm objc objcpp objective-cpp objectivec'],
  ['ocaml', 'OCaml', 'ml mli'],
  ['pascal', 'Pascal', 'delphi dpk dpr lpr object-pascal objectpascal pas pp'],
  ['perl', 'Perl', 'pl pm'],
  ['php', 'PHP'],
  ['powershell', 'PowerShell', 'ps ps1 psd1 psm1 pwsh'],
  ['proto', 'Protocol Buffers', 'protobuf'],
  ['python', 'Python', 'py'],
  ['r', 'R', 'rscript'],
  ['ruby', 'Ruby', 'rb'],
  ['rust', 'Rust', 'rs'],
  ['sass', 'Sass'],
  ['scala', 'Scala', 'sbt sc'],
  ['scss', 'SCSS'],
  ['shellscript', 'Shell', 'bash sh shell shellsession zsh'],
  ['solidity', 'Solidity', 'sol'],
  ['sql', 'SQL'],
  ['svelte', 'Svelte'],
  ['swift', 'Swift'],
  ['toml', 'TOML'],
  ['tsrx', 'TSRX'],
  ['tsx', 'TSX'],
  ['typescript', 'TypeScript', 'angular-ts cts mts ts'],
  ['vue', 'Vue'],
  ['wasm', 'WebAssembly', 'wat'],
  ['wgsl', 'WGSL'],
  ['xml', 'XML', 'svg xsd'],
  ['yaml', 'YAML', 'yml'],
  ['zig', 'Zig', 'zon'],
];

/**
 * The Highlights engine compiles its WebAssembly when its module is
 * evaluated, so it is imported on first use rather than with this package.
 * That keeps editors that never highlight with it (or only have it
 * configured as a disabled alternative) from paying for it, and lets a
 * runtime that can't compile it, such as one without WebAssembly SIMD or
 * with a CSP that forbids WebAssembly, fall back to uncolored code instead
 * of failing to load the app. `null` once importing it has failed.
 */
let engine: undefined | null | typeof CodeToTokens;
let pendingEngine: undefined | Promise<void>;

function loadEngine(): Promise<void> {
  if (!pendingEngine) {
    pendingEngine = import('@pierre/highlights').then(
      module => {
        engine = module.codeToTokens;
      },
      () => {
        engine = null;
      },
    );
  }
  return pendingEngine;
}

function $markCodeNodeDirty(
  editor: LexicalEditor | undefined,
  codeNodeKey: NodeKey | undefined,
): void {
  if (editor && codeNodeKey) {
    editor.update(
      () => {
        const codeNode = $getNodeByKey(codeNodeKey);
        if ($isCodeNode(codeNode)) {
          codeNode.markDirty();
        }
      },
      {tag: HISTORY_MERGE_TAG},
    );
  }
}

/**
 * Each bundled theme that has been asked for: the theme once it has loaded,
 * `null` if loading it failed (code is then left uncolored), or the pending
 * load.
 */
const themes = new Map<string, Theme | null | Promise<void>>();

const DIFF_LANGUAGE_REGEX = /^diff-([\w-]+)/i;

function getDiffedLanguage(language: string) {
  const diffLanguageMatch = DIFF_LANGUAGE_REGEX.exec(language);
  return diffLanguageMatch ? diffLanguageMatch[1] : null;
}

function findLanguage(language: string) {
  const lang = getDiffedLanguage(language) || language;
  return LANGUAGES.find(
    ([id, , aliases]) =>
      id === lang || (aliases && aliases.split(' ').includes(lang)),
  );
}

/**
 * Whether Highlights has a lexer for `language` (or for `xxx` in a
 * `diff-xxx` language) and its engine has loaded. Every language is built
 * into the engine.
 */
export function isCodeLanguageLoaded(language: string): boolean {
  return !!engine && !!findLanguage(language);
}

/**
 * Whether Highlights has a lexer for `language` (or for `xxx` in a
 * `diff-xxx` language), loaded or not.
 */
export function isCodeLanguageSupported(language: string): boolean {
  return !!findLanguage(language);
}

/**
 * Whether loading the Highlights engine has finished, successfully or not.
 */
export function isCodeEngineSettled(): boolean {
  return engine !== undefined;
}

/**
 * Loads the Highlights engine, which has every language built in. If it
 * is already loaded, failed to load, or `language` is not supported, the
 * call is a no-op.
 *
 * When both `editor` and `codeNodeKey` are passed, the corresponding
 * {@link CodeNode} is marked dirty once the engine has loaded, so that it
 * is highlighted.
 * @param language - language identifier (e.g. `"typescript"`, `"diff-js"`)
 * @param editor - Lexical editor instance to update after the engine loads.
 * @param codeNodeKey - Key of the {@link CodeNode} to re-highlight.
 * @returns A Promise that resolves when the engine has loaded (or failed
 * to), or `undefined` if there was nothing to load.
 */
export function loadCodeLanguage(
  language: string,
  editor?: LexicalEditor,
  codeNodeKey?: NodeKey,
): Promise<void> | undefined {
  if (isCodeEngineSettled() || !isCodeLanguageSupported(language)) {
    return undefined;
  }
  return loadEngine().then(() => $markCodeNodeDirty(editor, codeNodeKey));
}

/**
 * Whether `theme` names one of the themes bundled with Highlights, loaded or
 * not.
 */
export function isCodeThemeSupported(theme: string): boolean {
  return Object.prototype.hasOwnProperty.call(themeLoaders, theme);
}

/**
 * Whether loading `theme` has finished, successfully or not.
 */
export function isCodeThemeLoaded(theme: string): boolean {
  const entry = themes.get(theme);
  return entry !== undefined && !(entry instanceof Promise);
}

/**
 * Loads one of the themes bundled with Highlights. If the theme is already
 * loaded or is not bundled, the call is a no-op.
 *
 * When both `editor` and `codeNodeKey` are passed, the corresponding
 * {@link CodeNode} is marked dirty once the theme has loaded, so that it is
 * highlighted with it.
 * @param theme - theme identifier (e.g. `"one-light"`)
 * @param editor - Lexical editor instance to update after the theme loads.
 * @param codeNodeKey - Key of the {@link CodeNode} to re-highlight.
 * @returns A Promise that resolves when the theme has loaded (or failed to),
 * or `undefined` if the `theme` was already loaded or is not bundled.
 */
export function loadCodeTheme(
  theme: string,
  editor?: LexicalEditor,
  codeNodeKey?: NodeKey,
): Promise<void> | undefined {
  if (isCodeThemeLoaded(theme) || !isCodeThemeSupported(theme)) {
    return undefined;
  }
  let pending = themes.get(theme);
  if (!(pending instanceof Promise)) {
    pending = themeLoaders[theme]().then(
      module => {
        themes.set(theme, module.default);
      },
      () => {
        themes.set(theme, null);
      },
    );
    themes.set(theme, pending);
  }
  return pending.then(() => $markCodeNodeDirty(editor, codeNodeKey));
}

export function getCodeLanguageOptions(): [string, string][] {
  return LANGUAGES.map(([id, name]) => [id, name]);
}

export function getCodeThemeOptions(): [string, string][] {
  return Object.keys(themeLoaders).map(id => [
    id,
    id.replace(/(^|-)(\w)/g, (_, dash, c) => (dash && ' ') + c.toUpperCase()),
  ]);
}

function getTokenStyle({color, fontStyle = 0}: ThemedToken): string {
  const style: string[] = [];
  if (color) {
    style.push(`color:${color}`);
  }
  // Highlights only sets the italic and bold flags.
  if (fontStyle & 1) {
    style.push('font-style:italic');
  }
  if (fontStyle & 2) {
    style.push('font-weight:bold');
  }
  return style.join(';');
}

export function normalizeCodeLanguage(language: string): string {
  const languageInfo = !getDiffedLanguage(language) && findLanguage(language);
  return languageInfo ? languageInfo[0] : language;
}

/**
 * Highlight the text of `codeNode` as `language` (as plain text without a
 * lexer for it) with the loaded `theme`, and give the code node the theme's
 * colors. Without the engine or a loaded `theme` the text is split into
 * uncolored code highlight nodes instead.
 */
export function $getHighlightNodes(
  codeNode: CodeNode,
  language: string,
  theme: string,
): LexicalNode[] {
  const diffedLanguage = getDiffedLanguage(language);
  const lang = diffedLanguage || language;
  const loadedTheme = themes.get(theme);
  const code = codeNode.getTextContent();
  if (!engine || !loadedTheme || loadedTheme instanceof Promise) {
    return $plainifyCodeContent(code);
  }
  const languageInfo = findLanguage(lang);
  const {tokens, bg, fg} = engine(code, {
    lang: languageInfo ? languageInfo[0] : 'plaintext',
    theme: loadedTheme,
  });
  const style =
    (bg ? `background-color: ${bg};` : '') + (fg ? `color: ${fg};` : '');
  if (codeNode.getStyle() !== style) {
    codeNode.setStyle(style);
  }
  return $createCodeHighlightNodesFromTokens(
    tokens,
    !!diffedLanguage,
    getTokenStyle,
  );
}
