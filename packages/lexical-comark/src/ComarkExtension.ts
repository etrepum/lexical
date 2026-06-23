/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ComarkExportOptions} from './ComarkExport';
import type {ComarkGenerateNodesOptions} from './ComarkImport';
import type {ComarkTransformer} from './ComarkTransformers';
import type {NamedSignalsOutput} from '@lexical/extension';
import type {ComarkTree, ParseOptions, RenderMarkdownOptions} from 'comark';
import type {ElementNode, LexicalNode} from 'lexical';

import {CodeExtension} from '@lexical/code-core';
import {effect, namedSignals} from '@lexical/extension';
import {LinkExtension} from '@lexical/link';
import {ListExtension} from '@lexical/list';
import {RichTextExtension} from '@lexical/rich-text';
import {createParse} from 'comark';
import {renderMarkdown} from 'comark/render';
import {defineExtension, safeCast} from 'lexical';

import {
  $generateComarkTreeFromNodes,
  COMARK_RENDER_COMPONENTS,
} from './ComarkExport';
import {$generateNodesFromComarkTree, $importComarkTree} from './ComarkImport';
import {registerComarkShortcuts} from './ComarkShortcuts';
import {COMARK_TRANSFORMERS} from './ComarkTransformers';

export interface ComarkConfig {
  /**
   * Disable the streaming markdown shortcuts (import/export are unaffected).
   * @default false
   */
  disabled: boolean;
  /**
   * The transformers that drive import, export and the shortcuts.
   * @default COMARK_TRANSFORMERS
   */
  transformers: readonly ComarkTransformer[];
}

export interface ParseMarkdownOptions {
  /** Options forwarded to comark's parser (`autoClose`, `html`, `plugins`...). */
  parseOptions?: ParseOptions;
}

export interface RenderMarkdownRunOptions {
  /** The element to export. Defaults to the root node. */
  node?: ElementNode;
  /** Frontmatter to attach to the exported tree. */
  frontmatter?: Record<string, unknown>;
  /** Options forwarded to comark's `renderMarkdown`. */
  renderOptions?: RenderMarkdownOptions;
}

/**
 * The deferred result of {@link ComarkExtensionOutput.parseMarkdown}. Call it
 * inside an `editor.update()` to replace `target`'s children (default: the root
 * node) with the imported nodes, which it returns. Because the comark parse
 * already finished before this runs and it performs no work of its own until
 * invoked, the caller fully controls when — and whether — to apply the result,
 * so overlapping imports can never race.
 */
export type ComarkImportApply = (target?: ElementNode) => LexicalNode[];

export type ComarkExtensionOutput = NamedSignalsOutput<ComarkConfig> & {
  /**
   * Parse a markdown string with comark and resolve to a function that applies
   * it. The parse touches no editor state, so call the returned function inside
   * your own `editor.update()` when you are ready to apply the result.
   */
  parseMarkdown: (
    markdown: string,
    options?: ParseMarkdownOptions,
  ) => Promise<ComarkImportApply>;
  /**
   * Build Lexical nodes from an already-parsed comark tree. Must run inside
   * `editor.update()` / `editor.read()`. Mirrors `$generateNodesFromDOM`.
   */
  $generateNodesFromComarkTree: (
    tree: ComarkTree,
    options?: ComarkGenerateNodesOptions,
  ) => LexicalNode[];
  /**
   * Snapshot the editor (or a node) as a comark tree. Must run inside
   * `editor.read()` / `editor.update()`. Mirrors `$generateDOMFromNodes`.
   */
  $generateComarkTreeFromNodes: (options?: ComarkExportOptions) => ComarkTree;
  /**
   * Read the editor and render it to a markdown string. The tree is captured
   * synchronously inside an `editor.read()`, so this is race-free.
   */
  renderMarkdown: (options?: RenderMarkdownRunOptions) => Promise<string>;
};

/**
 * The comark extension: full-document markdown import/export plus streaming
 * markdown shortcuts, powered by the comark parser. It depends on the node
 * extensions required by the default transformers, so adding it to an editor is
 * all that is needed for the standard markdown experience.
 *
 * @example
 * ```ts
 * import {buildEditorFromExtensions} from '@lexical/extension';
 * import {getExtensionDependencyFromEditor} from '@lexical/extension';
 * import {ComarkExtension} from '@lexical/comark';
 *
 * const editor = buildEditorFromExtensions([ComarkExtension]);
 * const {output} = getExtensionDependencyFromEditor(editor, ComarkExtension);
 *
 * // Import (race-free: parse first, apply in your own update)
 * const $apply = await output.parseMarkdown('# Hello **world**');
 * editor.update(() => $apply());
 *
 * // Export
 * const markdown = await output.renderMarkdown();
 * ```
 */
export const ComarkExtension = /* @__PURE__ */ defineExtension({
  build: (editor, config): ComarkExtensionOutput => {
    const signals = namedSignals(config);
    return {
      ...signals,
      $generateComarkTreeFromNodes: (options = {}) =>
        $generateComarkTreeFromNodes({
          transformers: signals.transformers.value,
          ...options,
        }),
      $generateNodesFromComarkTree: (tree, options = {}) =>
        $generateNodesFromComarkTree(tree, {
          transformers: signals.transformers.value,
          ...options,
        }),
      parseMarkdown: async (markdown, options = {}) => {
        const parse = createParse(options.parseOptions);
        const tree = await parse(markdown);
        return target =>
          $importComarkTree(tree, {
            node: target,
            transformers: signals.transformers.value,
          });
      },
      renderMarkdown: async (options = {}) => {
        const tree = editor.read(() =>
          $generateComarkTreeFromNodes({
            frontmatter: options.frontmatter,
            node: options.node,
            transformers: signals.transformers.value,
          }),
        );
        const renderOptions = options.renderOptions;
        return renderMarkdown(tree, {
          ...renderOptions,
          components: {
            ...COMARK_RENDER_COMPONENTS,
            ...(renderOptions && renderOptions.components),
          },
        });
      },
    };
  },
  config: /* @__PURE__ */ safeCast<ComarkConfig>({
    disabled: false,
    transformers: COMARK_TRANSFORMERS,
  }),
  dependencies: [
    RichTextExtension,
    ListExtension,
    CodeExtension,
    LinkExtension,
  ],
  name: '@lexical/comark',
  register: (editor, config, state) => {
    const output = state.getOutput();
    return effect(() => {
      if (output.disabled.value) {
        return;
      }
      return registerComarkShortcuts(editor, output.transformers.value);
    });
  },
});
