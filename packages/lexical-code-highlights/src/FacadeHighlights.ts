/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Theme, ThemedToken} from '@pierre/highlights';

import {
  $createCodeHighlightNode,
  $isCodeNode,
  $plainifyCodeContent,
  type CodeNode,
} from '@lexical/code-core';
import {codeToTokens, isSupportedLanguage} from '@pierre/highlights';
import {themes as themeLoaders} from '@pierre/highlights/themes/loader';
import {
  $createLineBreakNode,
  $createTabNode,
  $getNodeByKey,
  HISTORY_MERGE_TAG,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  tokenizeRawText,
} from 'lexical';

/**
 * The languages built into Highlights, as `[id, name, aliases]`. Highlights
 * accepts every id and alias, but does not export the list, so it is kept
 * here for the language picker and for {@link normalizeCodeLanguage}. The
 * ids follow Shiki's where both have the language, so a code block keeps its
 * language when an editor switches between the two.
 */
const LANGUAGES: readonly [id: string, name: string, aliases?: string][] = [
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

const DIFF_PREFIXES = '+->< ';
const DIFF_PREFIX_TYPES = [
  'inserted',
  'deleted',
  'inserted',
  'deleted',
  'unchanged',
];

const loadedThemes = new Map<string, Theme>();

function getDiffedLanguage(language: string) {
  const DIFF_LANGUAGE_REGEX = /^diff-([\w-]+)/i;
  const diffLanguageMatch = DIFF_LANGUAGE_REGEX.exec(language);
  return diffLanguageMatch ? diffLanguageMatch[1] : null;
}

/**
 * Highlights builds every language in, so this reports whether it has a
 * lexer for `language` (or for `xxx` in a `diff-xxx` language); nothing ever
 * needs to be loaded.
 */
export function isCodeLanguageLoaded(language: string): boolean {
  return isSupportedLanguage(getDiffedLanguage(language) || language);
}

/**
 * Whether `theme` names one of the themes bundled with Highlights, loaded or
 * not.
 */
export function isCodeThemeSupported(theme: string): boolean {
  return Object.prototype.hasOwnProperty.call(themeLoaders, theme);
}

export function isCodeThemeLoaded(theme: string): boolean {
  return loadedThemes.has(theme);
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
 * @returns A Promise that resolves when the theme is ready,
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
  return themeLoaders[theme]().then(module => {
    loadedThemes.set(theme, module.default);
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
  });
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

export function normalizeCodeLanguage(language: string): string {
  const languageInfo = LANGUAGES.find(
    ([id, , aliases]) =>
      id === language || (aliases && aliases.split(' ').includes(language)),
  );
  return languageInfo ? languageInfo[0] : language;
}

function getTokenStyle({color, fontStyle = 0}: ThemedToken): string {
  const style: string[] = [];
  if (color) {
    style.push(`color:${color}`);
  }
  if (fontStyle & 1) {
    style.push('font-style:italic');
  }
  if (fontStyle & 2) {
    style.push('font-weight:bold');
  }
  return style.join(';');
}

/**
 * Highlight the text of `codeNode` as `language` with the loaded `theme`,
 * and give the code node the theme's colors. Without a lexer for `language`
 * or with `theme` not loaded, the text is split into uncolored code
 * highlight nodes instead.
 */
export function $getHighlightNodes(
  codeNode: CodeNode,
  language: string,
  theme: string,
): LexicalNode[] {
  const diffedLanguage = getDiffedLanguage(language);
  const lang = diffedLanguage || language;
  const loadedTheme = loadedThemes.get(theme);
  const code = codeNode.getTextContent();
  if (!loadedTheme || !isSupportedLanguage(lang)) {
    return $plainifyCodeContent(code);
  }
  const {tokens, bg, fg} = codeToTokens(code, {lang, theme: loadedTheme});
  const style =
    (bg ? `background-color: ${bg};` : '') + (fg ? `color: ${fg};` : '');
  if (codeNode.getStyle() !== style) {
    codeNode.setStyle(style);
  }

  const nodes: LexicalNode[] = [];
  tokens.forEach((line, idx) => {
    if (idx) {
      nodes.push($createLineBreakNode());
    }
    line.forEach((token, tidx) => {
      let text = token.content;

      // implement diff-xxxx languages
      if (diffedLanguage && tidx === 0 && text.length > 0) {
        const prefixIndex = DIFF_PREFIXES.indexOf(text[0]);
        if (prefixIndex !== -1) {
          nodes.push(
            $createCodeHighlightNode(text[0], DIFF_PREFIX_TYPES[prefixIndex]),
          );
          text = text.slice(1);
        }
      }

      const tokenStyle = getTokenStyle(token);
      tokenizeRawText(text, {
        linebreak: () => nodes.push($createLineBreakNode()),
        tab: () => nodes.push($createTabNode()),
        text: part =>
          nodes.push($createCodeHighlightNode(part).setStyle(tokenStyle)),
      });
    });
  });

  return nodes;
}
