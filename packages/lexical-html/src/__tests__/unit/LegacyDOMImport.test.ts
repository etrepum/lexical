/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $insertDataTransferForRichText,
  ClipboardDOMImportExtension,
} from '@lexical/clipboard';
import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  $generateNodesFromDOMViaExtension,
  CoreImportExtension,
  DOMImportExtension,
} from '@lexical/html';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  configExtension,
  createEditor,
  defineExtension,
  type DOMConversionMap,
  ParagraphNode,
} from 'lexical';
import {beforeEach, describe, expect, test, vi} from 'vitest';

const initializeImport = vi.fn();
const $convertCustom = () => ({
  node: $createParagraphNode().append($createTextNode('legacy')),
});
const legacyImport: DOMConversionMap = {
  'custom-block': () => ({conversion: $convertCustom, priority: 1}),
};

class LegacyParagraphNode extends ParagraphNode {
  $config() {
    return this.config('legacy-paragraph', {extends: ParagraphNode});
  }

  static importDOM(): DOMConversionMap {
    initializeImport(this);
    return legacyImport;
  }
}

const LegacyNodeExtension = defineExtension({
  name: 'test/LegacyNode',
  nodes: [LegacyParagraphNode],
});

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('legacy DOM import migration', () => {
  beforeEach(() => initializeImport.mockClear());

  test('warns when initializing legacy import with the default configuration', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createEditor();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Migrate to DOMImportExtension'),
    );
  });

  test('does not warn after disabling legacy import', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    using _editor = buildEditorFromExtensions(
      CoreImportExtension,
      configExtension(DOMImportExtension, {disableLegacyImport: true}),
    );
    createEditor({html: {import: false}});
    expect(warn).not.toHaveBeenCalled();
  });

  test('keeps legacy converters and html.import overrides enabled by default', () => {
    using editor = buildEditorFromExtensions(
      CoreImportExtension,
      LegacyNodeExtension,
      defineExtension({
        html: {
          import: {
            'custom-block': () => ({
              conversion: () => ({
                node: $createParagraphNode().append(
                  $createTextNode('override'),
                ),
              }),
              priority: 1,
            }),
          },
        },
        name: 'test/LegacyOverride',
      }),
    );
    expect(initializeImport).toHaveBeenCalledExactlyOnceWith(
      LegacyParagraphNode,
    );
    editor.update(
      () => {
        const [node] = $generateNodesFromDOM(editor, parse('<custom-block/>'));
        expect(node.getTextContent()).toBe('override');
      },
      {discrete: true},
    );
  });

  test('a migrated editor skips legacy factories and imports through rules', () => {
    using editor = buildEditorFromExtensions(
      CoreImportExtension,
      LegacyNodeExtension,
      configExtension(DOMImportExtension, {disableLegacyImport: true}),
    );
    expect(initializeImport).not.toHaveBeenCalled();
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            ...$generateNodesFromDOMViaExtension(parse('<p><b>new</b></p>')),
          );
        expect($getRoot().getAllTextNodes()[0].hasFormat('bold')).toBe(true);
        expect(() =>
          $generateNodesFromDOM(editor, parse('<p>old</p>')),
        ).toThrow('Legacy DOM import is disabled');
      },
      {discrete: true},
    );
    expect(editor.read(() => $getRoot().getTextContent())).toBe('new');
  });

  test('createEditor supports disabling legacy import without extensions', () => {
    const editor = createEditor({
      html: {import: false},
      nodes: [LegacyParagraphNode],
    });
    expect(initializeImport).not.toHaveBeenCalled();
    expect(() => $generateNodesFromDOM(editor, parse(''))).toThrow(
      'Legacy DOM import is disabled',
    );
  });

  test.each([false, true])(
    'disabling legacy import preserves html.export (via DOMImportExtension=%s)',
    viaDOMImportExtension => {
      const exportDOM = () => {
        const element = document.createElement('section');
        return {element};
      };
      using editor = buildEditorFromExtensions(
        LegacyNodeExtension,
        viaDOMImportExtension
          ? configExtension(DOMImportExtension, {disableLegacyImport: true})
          : defineExtension({
              html: {import: false},
              name: 'test/DisableLegacy',
            }),
        defineExtension({
          html: {export: new Map([[ParagraphNode, exportDOM]])},
          name: 'test/ExportOverride',
        }),
      );
      expect(initializeImport).not.toHaveBeenCalled();
      editor.update(
        () => {
          $getRoot()
            .clear()
            .append($createParagraphNode().append($createTextNode('export')));
          expect($generateHtmlFromNodes(editor)).toBe(
            '<section><span style="white-space: pre-wrap;">export</span></section>',
          );
        },
        {discrete: true},
      );
    },
  );

  test('ClipboardDOMImportExtension imports formatted HTML with legacy import disabled', () => {
    using editor = buildEditorFromExtensions(
      RichTextExtension,
      ClipboardDOMImportExtension,
      LegacyNodeExtension,
      configExtension(DOMImportExtension, {disableLegacyImport: true}),
    );
    expect(initializeImport).not.toHaveBeenCalled();
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/html', '<h2><b>pasted</b></h2>');
    editor.update(
      () => {
        const selection = $getRoot()
          .clear()
          .append($createParagraphNode())
          .selectEnd();
        $insertDataTransferForRichText(dataTransfer, selection, editor);
      },
      {discrete: true},
    );
    editor.read(() => {
      expect($getRoot().getFirstChildOrThrow().getType()).toBe('heading');
      const [text] = $getRoot().getAllTextNodes();
      expect(text.getTextContent()).toBe('pasted');
      expect(text.hasFormat('bold')).toBe(true);
    });
  });

  test.each([false, true])(
    'rejects conflicting extension maps regardless of order (reverse=%s)',
    reverse => {
      const extensions = [
        defineExtension({html: {import: legacyImport}, name: 'test/LegacyMap'}),
        defineExtension({html: {import: false}, name: 'test/DisableLegacy'}),
      ];
      expect(() =>
        buildEditorFromExtensions(
          ...(reverse ? extensions.reverse() : extensions),
        ),
      ).toThrow('html.import conversions');
    },
  );

  test('the opt-out rejects unmigrated html.import overrides', () => {
    expect(() =>
      buildEditorFromExtensions(
        CoreImportExtension,
        configExtension(DOMImportExtension, {disableLegacyImport: true}),
        defineExtension({html: {import: legacyImport}, name: 'test/LegacyMap'}),
      ),
    ).toThrow('html.import conversions');
  });

  test('empty legacy maps do not prevent opting out', () => {
    using editor = buildEditorFromExtensions(
      CoreImportExtension,
      LegacyNodeExtension,
      configExtension(DOMImportExtension, {disableLegacyImport: true}),
      defineExtension({html: {import: {}}, name: 'test/EmptyMap'}),
    );
    expect(initializeImport).not.toHaveBeenCalled();
    expect(() => $generateNodesFromDOM(editor, parse(''))).toThrow(
      'Legacy DOM import is disabled',
    );
  });
});
