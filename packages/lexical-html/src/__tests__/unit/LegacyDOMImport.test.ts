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
import {registerRichText, RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  configExtension,
  createEditor,
  defineExtension,
  type DOMConversionMap,
  ParagraphNode,
  PASTE_COMMAND,
} from 'lexical';
import {
  captureLegacyDOMImportWarning,
  LEGACY_DOM_IMPORT_WARNING,
} from 'lexical/src/__tests__/utils';
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

  test('legacy nested spans retain additive formatting and emit the diagnostic', () => {
    using warn = captureLegacyDOMImportWarning();
    const editor = createEditor({
      onError: error => {
        throw error;
      },
    });
    editor.update(
      () => {
        const nodes = $generateNodesFromDOM(
          editor,
          parse(
            '<p><span style="font-weight: bold"><span style="font-weight: normal">x</span></span></p>',
          ),
        );
        $getRoot().append(...nodes);
      },
      {discrete: true},
    );
    expect(
      editor.read(() => $getRoot().getAllTextNodes()[0].hasFormat('bold')),
    ).toBe(true);
    expect(warn).toHaveBeenCalledExactlyOnceWith(LEGACY_DOM_IMPORT_WARNING);
  });

  test.each([undefined, null, false, true])(
    'legacy converters initialize only on demand and warn only for unspecified mode (%s)',
    disableLegacyImport => {
      using warn = captureLegacyDOMImportWarning();
      for (const mode of ['core', 'extension', 'dom-import']) {
        initializeImport.mockClear();
        warn.mockClear();
        const editor =
          mode === 'core'
            ? createEditor({disableLegacyImport, nodes: [LegacyParagraphNode]})
            : buildEditorFromExtensions(
                LegacyNodeExtension,
                CoreImportExtension,
                mode === 'extension'
                  ? defineExtension({
                      disableLegacyImport,
                      name: 'test/LegacyImportConfig',
                    })
                  : configExtension(DOMImportExtension, {disableLegacyImport}),
              );
        try {
          expect(initializeImport).not.toHaveBeenCalled();
          expect(warn).not.toHaveBeenCalled();
          editor.update(
            () => {
              for (let i = 0; i < 2; i++) {
                const dom = parse('<custom-block></custom-block>');
                if (disableLegacyImport === true) {
                  expect(() => $generateNodesFromDOM(editor, dom)).toThrow(
                    'Legacy DOM import is disabled',
                  );
                } else {
                  const [node] = $generateNodesFromDOM(editor, dom);
                  expect(node.getTextContent()).toBe('legacy');
                }
              }
            },
            {discrete: true},
          );
          if (disableLegacyImport === true) {
            expect(initializeImport).not.toHaveBeenCalled();
          } else {
            expect(initializeImport).toHaveBeenCalledExactlyOnceWith(
              LegacyParagraphNode,
            );
          }
          if (disableLegacyImport == null) {
            expect(warn).toHaveBeenCalledExactlyOnceWith(
              LEGACY_DOM_IMPORT_WARNING,
            );
          } else {
            expect(warn).not.toHaveBeenCalled();
          }
        } finally {
          if ('dispose' in editor && typeof editor.dispose === 'function') {
            editor.dispose();
          }
        }
      }
    },
  );

  test('each editor lazily builds its own cache', () => {
    const [first, second] = Array.from({length: 2}, () =>
      createEditor({disableLegacyImport: false, nodes: [LegacyParagraphNode]}),
    );
    expect(initializeImport).not.toHaveBeenCalled();

    for (const editor of [first, second]) {
      editor.update(
        () => {
          $generateNodesFromDOM(editor, parse('<custom-block></custom-block>'));
        },
        {discrete: true},
      );
      expect(initializeImport).toHaveBeenCalledTimes(editor === first ? 1 : 2);
    }
  });

  test('a bare nested editor keeps formatted paste under an opted-out parent', () => {
    using warn = captureLegacyDOMImportWarning();
    using parent = buildEditorFromExtensions(
      RichTextExtension,
      ClipboardDOMImportExtension,
      LegacyNodeExtension,
      configExtension(DOMImportExtension, {disableLegacyImport: true}),
    );
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/html', '<p><b>pasted</b></p>');
    dataTransfer.setData('text/plain', 'plain-text fallback');
    const paste = new ClipboardEvent('paste', {
      cancelable: true,
      clipboardData: dataTransfer,
    });

    parent.update(
      () => {
        const child = createEditor();
        expect(child._nodes).toBe(parent._nodes);
        expect(initializeImport).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
        const cleanup = registerRichText(child);
        try {
          child.update(
            () => {
              $getRoot().append($createParagraphNode()).selectEnd();
              expect(child.dispatchCommand(PASTE_COMMAND, paste)).toBe(true);
            },
            {discrete: true},
          );
          child.read('latest', () => {
            const [text] = $getRoot().getAllTextNodes();
            expect(text.getTextContent()).toBe('pasted');
            expect(text.hasFormat('bold')).toBe(true);
          });
        } finally {
          cleanup();
        }
        expect(() => $generateNodesFromDOM(parent, parse(''))).toThrow(
          'Legacy DOM import is disabled',
        );
      },
      {discrete: true},
    );

    expect(paste.defaultPrevented).toBe(true);
    expect(initializeImport).toHaveBeenCalledExactlyOnceWith(
      LegacyParagraphNode,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  test('the core opt-out rejects unmigrated overrides', () => {
    expect(() =>
      createEditor({disableLegacyImport: true, html: {import: legacyImport}}),
    ).toThrow('html.import conversions');
  });

  test('explicitly retaining legacy import preserves converters and html.import overrides', () => {
    using editor = buildEditorFromExtensions(
      CoreImportExtension,
      LegacyNodeExtension,
      defineExtension({
        disableLegacyImport: false,
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
    expect(initializeImport).not.toHaveBeenCalled();
    editor.update(
      () => {
        const [node] = $generateNodesFromDOM(editor, parse('<custom-block/>'));
        expect(node.getTextContent()).toBe('override');
      },
      {discrete: true},
    );
    expect(initializeImport).toHaveBeenCalledExactlyOnceWith(
      LegacyParagraphNode,
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
      disableLegacyImport: true,
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
              disableLegacyImport: true,
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
        defineExtension({
          disableLegacyImport: true,
          name: 'test/DisableLegacy',
        }),
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
