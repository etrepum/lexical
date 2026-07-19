/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ListConfig, ListItemNode, ListNode} from '@lexical/list';

import {
  buildEditorFromExtensions,
  configExtension,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  DOMImportExtension,
} from '@lexical/html';
import {
  $createListItemNode,
  $createListNode,
  $getListDepth,
  $handleListInsertParagraph,
  $insertList,
  $isListItemNode,
  $isListNode,
  $isWrapperListItemNode,
  $removeList,
  CheckListExtension,
  ListExtension,
  listSemanticNestingState,
} from '@lexical/list';
import {$findCheckListItemSibling} from '@lexical/list/src/checkList';
import {$handleOutdent} from '@lexical/list/src/formatList';
import {
  $isListSemanticNestingEnabled,
  $normalizeSemanticListItem,
} from '@lexical/list/src/semanticNesting';
import {
  $convertSelectionToMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import {$createQuoteNode, RichTextExtension} from '@lexical/rich-text';
import {$setBlocksType} from '@lexical/selection';
import {
  $createParagraphNode,
  $createTextNode,
  $getEditor,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $getState,
  $insertNodes,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $setState,
  defineExtension,
  INSERT_PARAGRAPH_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_SPACE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  setDOMUnmanaged,
  type TextNode,
} from 'lexical';
import {
  $assertNodeType,
  expectHtmlToBeEqual,
  html,
  invariant,
} from 'lexical/src/__tests__/utils';
import {describe, expect, test} from 'vitest';

function buildEditor(config: Partial<ListConfig> = {}) {
  return buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(ListExtension, {hasSemanticNesting: true, ...config}),
      ],
      name: 'semantic-list-host',
    }),
  );
}

function buildCheckEditor(config: Partial<ListConfig> = {}) {
  return buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(ListExtension, {hasSemanticNesting: true, ...config}),
        CheckListExtension,
      ],
      name: 'semantic-check-host',
    }),
  );
}

/** A check list holding one checked row 'nested', marked as semantic. */
function $markedNestedCheckList(): ListNode {
  const nested = $createListNode('check').append(
    $createListItemNode(true).append($createTextNode('nested')),
  );
  $setState(nested, listSemanticNestingState, true);
  return nested;
}

/**
 * Attach a root element so updates reconcile to the DOM and the editor's
 * rendered innerHTML can be asserted.
 */
function mountRootElement(editor: LexicalEditor): HTMLElement {
  const rootElement = document.createElement('div');
  document.body.appendChild(rootElement);
  editor.setRootElement(rootElement);
  return rootElement;
}

function $clearAndAppend(...nodes: LexicalNode[]): void {
  $getRoot()
    .clear()
    .append(...nodes);
}

function $createSemanticFixture(): ListNode {
  // <ul><li>first item</li><li>nested list below<ul><li>nested</li></ul></li></ul>
  return $createListNode('bullet').append(
    $createListItemNode().append($createTextNode('first item')),
    $createListItemNode().append(
      $createTextNode('nested list below'),
      $createListNode('bullet').append(
        $createListItemNode().append($createTextNode('nested')),
      ),
    ),
  );
}

function $rootList(): ListNode {
  return $assertNodeType($getRoot().getFirstChild(), $isListNode);
}

function importIntoViaPipeline(
  editor: LexicalEditor,
  htmlString: string,
): void {
  editor.update(
    () => {
      const dep = getExtensionDependencyFromEditor(
        $getEditor(),
        DOMImportExtension,
      );
      const dom = new DOMParser().parseFromString(htmlString, 'text/html');
      $getRoot()
        .clear()
        .append(...dep.output.$generateNodesFromDOM(dom));
    },
    {discrete: true},
  );
}

const SEMANTIC_INPUT =
  '<ul><li>first item</li><li>nested list below<ul><li>nested</li></ul></li></ul>';
const WRAPPER_INPUT = '<ul><li>a</li><li><ul><li>b</li></ul></li></ul>';

describe('ListExtension hasSemanticNesting', () => {
  test('$isListSemanticNestingEnabled reflects the extension output', () => {
    using semanticEditor = buildEditor();
    using defaultEditor = buildEditor({hasSemanticNesting: false});
    semanticEditor.read('force-commit', () => {
      expect($isListSemanticNestingEnabled()).toBe(true);
    });
    expect($isListSemanticNestingEnabled(semanticEditor)).toBe(true);
    expect($isListSemanticNestingEnabled(defaultEditor)).toBe(false);
  });

  test('merges a wrapper item into the previous item', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        // Default (wrapper) representation:
        // <ul><li>first item</li><li>nested list below</li>
        //     <li><ul><li>nested</li></ul></li></ul>
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('first item')),
            $createListItemNode().append($createTextNode('nested list below')),
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('nested')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const items = $rootList().getChildren();
      expect(items).toHaveLength(2);
      const second = $assertNodeType(items[1], $isListItemNode);
      expect(second.getChildren().map(n => n.getType())).toEqual([
        'text',
        'list',
      ]);
      expect($isWrapperListItemNode(second)).toBe(false);
    });

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1"><span data-lexical-text="true">first item</span></li>
          <li value="2">
            <span data-lexical-text="true">nested list below</span>
            <ul>
              <li value="1"><span data-lexical-text="true">nested</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('keeps a wrapper item with no previous sibling', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('deep')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const first = $assertNodeType(
        $rootList().getFirstChild(),
        $isListItemNode,
      );
      expect($isWrapperListItemNode(first)).toBe(true);
    });
  });

  test('keeps a wrapper item after an empty item until content is typed', () => {
    using editor = buildEditor();
    let emptyItem!: ListItemNode;
    editor.update(
      () => {
        emptyItem = $createListItemNode();
        $clearAndAppend(
          $createListNode('bullet').append(
            emptyItem,
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('nested')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      expect($rootList().getChildrenSize()).toBe(2);
      expect(emptyItem.getLatest().getChildrenSize()).toBe(0);
    });

    // Typing into the empty item adopts the following wrapper.
    editor.update(
      () => {
        emptyItem.getLatest().append($createTextNode('typed'));
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getChildrenSize()).toBe(1);
      const item = $assertNodeType(list.getFirstChild(), $isListItemNode);
      expect(item.getChildren().map(n => n.getType())).toEqual([
        'text',
        'list',
      ]);
    });
  });

  test('an item emptied of its content keeps its own row and nested list', () => {
    using editor = buildEditor();
    let text!: TextNode;
    editor.update(
      () => {
        text = $createTextNode('b');
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('x')),
              ),
            ),
            $createListItemNode().append(
              text,
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('y')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    // Deleting the item's text leaves a wrapper-shaped item, but its nested
    // list was marked as semantically belonging to it while it had content,
    // so it is not mistaken for a dedicated wrapper and is not merged into
    // the previous item.
    editor.update(
      () => {
        text.getLatest().select(0, 1);
        const selection = $getSelection();
        invariant($isRangeSelection(selection), 'expected a range selection');
        selection.removeText();
      },
      {discrete: true},
    );

    const $expectEmptiedRowPreserved = () => {
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      expect($isWrapperListItemNode(items[1])).toBe(false);
      expect(items[1].getChildren().map(n => n.getType())).toEqual(['list']);
      // It still renders (and numbers) as a row of its own.
      expect(items.map(item => item.getValue())).toEqual([1, 2]);
    };

    editor.read('force-commit', $expectEmptiedRowPreserved);

    // The disambiguating mark survives a JSON round trip.
    editor.setEditorState(
      editor.parseEditorState(JSON.stringify(editor.getEditorState().toJSON())),
    );
    editor.read('force-commit', $expectEmptiedRowPreserved);
  });

  test('setIndent produces the semantic representation', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let second!: ListItemNode;
    editor.update(
      () => {
        second = $createListItemNode().append($createTextNode('b'));
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            second,
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        second.getLatest().setIndent(1);
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">b</span></li>
            </ul>
          </li>
        </ul>
      `,
    );

    editor.read('force-commit', () => {
      expect(second.getLatest().getIndent()).toBe(1);
    });
  });

  test('outdent of the first nested item adopts the rest of the nested list', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let nestedFirst!: ListItemNode;
    editor.update(
      () => {
        nestedFirst = $createListItemNode().append($createTextNode('b'));
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                nestedFirst,
                $createListItemNode().append($createTextNode('c')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        nestedFirst.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    // Document order (a, b, c) is preserved: b becomes a's sibling and c
    // stays one level deeper as b's own nested list.
    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1"><span data-lexical-text="true">a</span></li>
          <li value="2">
            <span data-lexical-text="true">b</span>
            <ul>
              <li value="1"><span data-lexical-text="true">c</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('outdent of the last nested item keeps the preceding items nested', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let nestedLast!: ListItemNode;
    editor.update(
      () => {
        nestedLast = $createListItemNode().append($createTextNode('c'));
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('b')),
                nestedLast,
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        nestedLast.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">b</span></li>
            </ul>
          </li>
          <li value="2"><span data-lexical-text="true">c</span></li>
        </ul>
      `,
    );
  });

  test('outdent of a middle nested item splits the nested list', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let middle!: ListItemNode;
    editor.update(
      () => {
        middle = $createListItemNode().append($createTextNode('c'));
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('b')),
                middle,
                $createListItemNode().append($createTextNode('d')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        middle.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">b</span></li>
            </ul>
          </li>
          <li value="2">
            <span data-lexical-text="true">c</span>
            <ul>
              <li value="1"><span data-lexical-text="true">d</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('outdent of the only nested item removes the empty nested list', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let nested!: ListItemNode;
    editor.update(
      () => {
        nested = $createListItemNode().append($createTextNode('b'));
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(nested),
            ),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        nested.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1"><span data-lexical-text="true">a</span></li>
          <li value="2"><span data-lexical-text="true">b</span></li>
        </ul>
      `,
    );
  });

  test('ordered list values count semantic items and nested depth', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('number').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('number').append(
                $createListItemNode().append($createTextNode('a1')),
                $createListItemNode().append($createTextNode('a2')),
              ),
            ),
            $createListItemNode().append($createTextNode('b')),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const [first, second] = $rootList().getChildren().filter($isListItemNode);
      expect(first.getValue()).toBe(1);
      expect(second.getValue()).toBe(2);
      const nestedList = $assertNodeType(first.getLastChild(), $isListNode);
      expect($getListDepth(nestedList)).toBe(2);
      const nestedItems = nestedList.getChildren().filter($isListItemNode);
      expect(nestedItems.map(item => item.getValue())).toEqual([1, 2]);
      expect(nestedItems.map(item => item.getIndent())).toEqual([1, 1]);
    });
  });

  test('paragraph insertion on an empty nested item splits the nested list', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    let emptyItem!: ListItemNode;
    editor.update(
      () => {
        emptyItem = $createListItemNode();
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('x')),
                emptyItem,
                $createListItemNode().append($createTextNode('y')),
              ),
            ),
          ),
        );
        emptyItem.select();
      },
      {discrete: true},
    );
    editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);

    editor.update(
      () => {
        // The empty item is lifted to the outer level; "y" stays one level
        // deeper. Typing into the lifted item adopts the trailing list.
        const items = $rootList().getChildren().filter($isListItemNode);
        expect(items).toHaveLength(3);
        expect(items[0].getTextContent().startsWith('a')).toBe(true);
        expect(items[1].getChildrenSize()).toBe(0);
        expect($isWrapperListItemNode(items[2])).toBe(true);
        items[1].append($createTextNode('typed'));
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">x</span></li>
            </ul>
          </li>
          <li value="2">
            <span data-lexical-text="true">typed</span>
            <ul>
              <li value="1"><span data-lexical-text="true">y</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('legacy $generateNodesFromDOM preserves semantic HTML', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $getRoot().clear().select();
        const dom = new DOMParser().parseFromString(
          SEMANTIC_INPUT,
          'text/html',
        );
        $insertNodes($generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const items = $rootList().getChildren();
      expect(items).toHaveLength(2);
      const second = $assertNodeType(items[1], $isListItemNode);
      expect($isListNode(second.getLastChild())).toBe(true);
      expect($isWrapperListItemNode(second)).toBe(false);
    });
  });

  test('legacy $generateNodesFromDOM merges wrapper HTML into the previous item', () => {
    using editor = buildEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $getRoot().clear().select();
        const dom = new DOMParser().parseFromString(WRAPPER_INPUT, 'text/html');
        $insertNodes($generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">b</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('import pipeline preserves semantic HTML when enabled', () => {
    using editor = buildEditor();
    importIntoViaPipeline(editor, SEMANTIC_INPUT);
    editor.read('force-commit', () => {
      const items = $rootList().getChildren();
      expect(items).toHaveLength(2);
      const second = $assertNodeType(items[1], $isListItemNode);
      expect(second.getChildren().map(n => n.getType())).toEqual([
        'text',
        'list',
      ]);
      expect(second.getValue()).toBe(2);
    });
  });

  test('import pipeline merges wrapper HTML into the previous item when enabled', () => {
    using editor = buildEditor();
    importIntoViaPipeline(editor, WRAPPER_INPUT);
    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getChildrenSize()).toBe(1);
      const item = $assertNodeType(list.getFirstChild(), $isListItemNode);
      expect(item.getChildren().map(n => n.getType())).toEqual([
        'text',
        'list',
      ]);
    });
  });

  test('import pipeline splits semantic HTML into wrapper items when disabled', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    importIntoViaPipeline(editor, SEMANTIC_INPUT);
    editor.read('force-commit', () => {
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect($isWrapperListItemNode(items[2])).toBe(true);
      expect($isListSemanticNestingEnabled()).toBe(false);
    });
  });

  test('toggling the output signal at runtime switches representations', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    importIntoViaPipeline(editor, SEMANTIC_INPUT);
    editor.read('force-commit', () => {
      expect($rootList().getChildrenSize()).toBe(3);
    });

    const {output} = getExtensionDependencyFromEditor(editor, ListExtension);
    output.hasSemanticNesting.value = true;

    // The now-registered transform converts the existing wrapper structure...
    editor.update(() => {}, {discrete: true});
    editor.read('force-commit', () => {
      expect($isListSemanticNestingEnabled()).toBe(true);
      expect($rootList().getChildrenSize()).toBe(2);
    });

    // ...and a fresh import preserves the semantic structure directly.
    importIntoViaPipeline(editor, SEMANTIC_INPUT);
    editor.read('force-commit', () => {
      expect($rootList().getChildrenSize()).toBe(2);
    });
  });

  test('exportDOM emits the semantic representation', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend($createSemanticFixture());
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expectHtmlToBeEqual(
        $generateHtmlFromNodes(editor),
        html`
          <ul>
            <li value="1">
              <span style="white-space: pre-wrap;">first item</span>
            </li>
            <li value="2">
              <span style="white-space: pre-wrap;">nested list below</span>
              <ul>
                <li value="1">
                  <span style="white-space: pre-wrap;">nested</span>
                </li>
              </ul>
            </li>
          </ul>
        `,
      );
    });
  });

  test('$removeList flattens a semantic tree in document order', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const list = $createSemanticFixture();
        $clearAndAppend(list);
        const firstText = list.getFirstDescendant();
        invariant(firstText !== null, 'expected a descendant');
        firstText.selectStart();
        $removeList();
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const children = $getRoot().getChildren();
      expect(children.every($isParagraphNode)).toBe(true);
      expect(children.map(child => child.getTextContent())).toEqual([
        'first item',
        'nested list below',
        'nested',
      ]);
    });
  });

  test('strict indent transform corrects over-indentation in semantic trees', () => {
    using editor = buildEditor({hasStrictIndent: true});
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        // "b" is two levels deeper than "a" (via an intermediate wrapper);
        // strict indent pulls it up to one level.
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createTextNode('a'),
              $createListNode('bullet').append(
                $createListItemNode().append(
                  $createListNode('bullet').append(
                    $createListItemNode().append($createTextNode('b')),
                  ),
                ),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    expectHtmlToBeEqual(
      rootElement.innerHTML,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
            <ul>
              <li value="1"><span data-lexical-text="true">b</span></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('paragraphs stay out of list items when disabled (existing behavior)', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
          ),
          $createParagraphNode().append($createTextNode('p')),
        );
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expect($getRoot().getChildrenSize()).toBe(2);
    });
  });
});

/** An item with `text` content and a marked nested list of `items`. */
function $createHostItem(text: string, ...nested: string[]): ListItemNode {
  const list = $createListNode('bullet').append(
    ...nested.map(item => $createListItemNode().append($createTextNode(item))),
  );
  $setState(list, listSemanticNestingState, true);
  return $createListItemNode().append($createTextNode(text), list);
}

/** An emptied row: no inline content, just a marked nested list. */
function $createMarkedEmptyItem(...nested: string[]): ListItemNode {
  const list = $createListNode('bullet').append(
    ...nested.map(item => $createListItemNode().append($createTextNode(item))),
  );
  $setState(list, listSemanticNestingState, true);
  return $createListItemNode().append(list);
}

describe('marked-empty rows (content-deleted items)', () => {
  test('outdenting an empty middle item of a marked nested list keeps its row', () => {
    using editor = buildEditor();
    let empty!: ListItemNode;
    editor.update(
      () => {
        empty = $createListItemNode();
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('A')),
          empty,
          $createListItemNode().append($createTextNode('B')),
        );
        $setState(nested, listSemanticNestingState, true);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('P'), nested),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        empty.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      // The empty row survives at the outer level and adopts B as its own
      // nested list; nothing is merged away.
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      expect(items[0].getTextContent().replace(/\s+/g, '')).toBe('PA');
      const outdented = items[1];
      expect(outdented.is(empty.getLatest())).toBe(true);
      expect($isWrapperListItemNode(outdented)).toBe(false);
      const adopted = $assertNodeType(outdented.getFirstChild(), $isListNode);
      expect(adopted.getTextContent()).toBe('B');
    });
  });

  test('outdent from a multi-list host preserves document order', () => {
    using editor = buildEditor();
    let b!: ListItemNode;
    editor.update(
      () => {
        b = $createListItemNode().append($createTextNode('b'));
        const ulA = $createListNode('bullet').append(b);
        $setState(ulA, listSemanticNestingState, true);
        const olB = $createListNode('number').append(
          $createListItemNode().append($createTextNode('c')),
        );
        $setState(olB, listSemanticNestingState, true);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a'), ulA, olB),
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        b.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      // Rendered order stays a, b, c: the trailing <ol> moves with the
      // outdented item instead of being jumped over.
      expect($getRoot().getTextContent().replace(/\s+/g, '')).toBe('abc');
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      expect(items[1].is(b.getLatest())).toBe(true);
      const trailing = $assertNodeType(items[1].getLastChild(), $isListNode);
      expect(trailing.getListType()).toBe('number');
      expect(trailing.getTextContent()).toBe('c');
    });
  });

  test('setIndent works on a marked-empty row', () => {
    using editor = buildEditor();
    let emptyRow!: ListItemNode;
    editor.update(
      () => {
        emptyRow = $createMarkedEmptyItem('x');
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            emptyRow,
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        emptyRow.getLatest().setIndent(1);
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      expect(emptyRow.getLatest().getIndent()).toBe(1);
      expect(emptyRow.getLatest().isAttached()).toBe(true);
      expect($isWrapperListItemNode(emptyRow.getLatest())).toBe(false);
    });

    editor.update(
      () => {
        emptyRow.getLatest().setIndent(0);
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      expect(emptyRow.getLatest().getIndent()).toBe(0);
      expect(emptyRow.getLatest().isAttached()).toBe(true);
    });
  });

  test('merging adjacent same-type lists keeps marked-empty boundary rows', () => {
    using editor = buildEditor();
    let emptyRow!: ListItemNode;
    editor.update(
      () => {
        emptyRow = $createMarkedEmptyItem('y');
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('x')),
          ),
          $createListNode('bullet').append(
            emptyRow,
            $createListItemNode().append($createTextNode('z')),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      // The sibling lists merged (same type), but the marked-empty boundary
      // row survives with its nested list.
      expect($getRoot().getChildrenSize()).toBe(1);
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect(items[1].is(emptyRow.getLatest())).toBe(true);
      expect($isWrapperListItemNode(items[1])).toBe(false);
    });
  });

  test('exportDOM emits a marked-empty row as its own <li>', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x'),
            $createMarkedEmptyItem('y'),
          ),
        );
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expectHtmlToBeEqual(
        $generateHtmlFromNodes(editor),
        html`
          <ul>
            <li value="1">
              <span style="white-space: pre-wrap;">a</span>
              <ul>
                <li value="1"><span style="white-space: pre-wrap;">x</span></li>
              </ul>
            </li>
            <li value="2">
              <ul>
                <li value="1"><span style="white-space: pre-wrap;">y</span></li>
              </ul>
            </li>
          </ul>
        `,
      );
    });
  });

  test('$removeList keeps the caret in the nested item it was in', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const nestedText = $createTextNode('b');
        const nested = $createListNode('bullet').append(
          $createListItemNode().append(nestedText),
        );
        $setState(nested, listSemanticNestingState, true);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a'), nested),
          ),
        );
        nestedText.select(1, 1);
        $removeList();
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      const children = $getRoot().getChildren();
      expect(children.map(child => child.getTextContent())).toEqual(['a', 'b']);
      const selection = $getSelection();
      invariant($isRangeSelection(selection), 'expected a range selection');
      const anchorNode = selection.anchor.getNode();
      expect(anchorNode.getTextContent()).toBe('b');
      expect(children[1].is(anchorNode.getParent())).toBe(true);
    });
  });
});

describe('checklist arrow navigation', () => {
  function $checkItem(text?: string, ...children: LexicalNode[]) {
    const item = $createListItemNode(false);
    if (text !== undefined) {
      item.append($createTextNode(text));
    }
    return item.append(...children);
  }

  function $markedCheckList(...items: ListItemNode[]): ListNode {
    const list = $createListNode('check').append(...items);
    $setState(list, listSemanticNestingState, true);
    return list;
  }

  function $expectNavigation(rows: ListItemNode[]) {
    // Forward walks the rows in order; backward walks them in reverse.
    for (let i = 0; i < rows.length; i++) {
      const forward = $findCheckListItemSibling(rows[i].getLatest(), false);
      const expectedForward =
        i + 1 < rows.length ? rows[i + 1].getLatest() : null;
      expect(forward === null ? null : forward.getKey()).toBe(
        expectedForward === null ? null : expectedForward.getKey(),
      );
      const backward = $findCheckListItemSibling(rows[i].getLatest(), true);
      const expectedBackward = i > 0 ? rows[i - 1].getLatest() : null;
      expect(backward === null ? null : backward.getKey()).toBe(
        expectedBackward === null ? null : expectedBackward.getKey(),
      );
    }
  }

  test('marked-empty rows are visited symmetrically', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const c = $checkItem('c');
        const emptyRow = $checkItem(undefined, $markedCheckList(c));
        const a = $checkItem('a');
        $getRoot().clear().append($createListNode('check').append(a, emptyRow));
        $expectNavigation([a, emptyRow, c]);
      },
      {discrete: true},
    );
  });

  test('all nested check lists of a host are visited in order', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const a1 = $checkItem('a1');
        const b1 = $checkItem('b1');
        const host = $checkItem(
          'x',
          $markedCheckList(a1),
          $markedCheckList(b1),
        );
        const y = $checkItem('y');
        $getRoot().clear().append($createListNode('check').append(host, y));
        $expectNavigation([host, a1, b1, y]);
      },
      {discrete: true},
    );
  });

  test('check lists separated by a non-check list are all visited', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const a1 = $checkItem('a1');
        const b1 = $checkItem('b1');
        const bullets = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('p')),
        );
        $setState(bullets, listSemanticNestingState, true);
        const host = $checkItem(
          'x',
          $markedCheckList(a1),
          bullets,
          $markedCheckList(b1),
        );
        const y = $checkItem('y');
        $getRoot().clear().append($createListNode('check').append(host, y));
        $expectNavigation([host, a1, b1, y]);
      },
      {discrete: true},
    );
  });

  test('check rows nested below a non-check level are reachable', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const rowB = $checkItem('b');
        const bullets = $createListNode('bullet').append(
          $createListItemNode().append($createListNode('check').append(rowB)),
        );
        $setState(bullets, listSemanticNestingState, true);
        const rowA = $checkItem('a', bullets);
        const rowC = $checkItem('c');
        $getRoot().clear().append($createListNode('check').append(rowA, rowC));
        $expectNavigation([rowA, rowB, rowC]);
      },
      {discrete: true},
    );
  });

  test('nested non-check lists are skipped', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const bullets = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('p')),
        );
        $setState(bullets, listSemanticNestingState, true);
        const host = $checkItem('x', bullets);
        const y = $checkItem('y');
        $getRoot().clear().append($createListNode('check').append(host, y));
        $expectNavigation([host, y]);
      },
      {discrete: true},
    );
  });
});

describe('listitemHost theme class', () => {
  test('host rows get the class; wrappers and leaf rows do not', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(ListExtension, {hasSemanticNesting: true}),
        ],
        name: 'themed-semantic-host',
        theme: {
          list: {
            listitemHost: 'host',
            nested: {listitem: 'wrapper'},
          },
        },
      }),
    );
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x'),
            $createListItemNode().append($createTextNode('leaf')),
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('deep')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );

    // First item hosts a nested list -> host class; second is a leaf row ->
    // no class; the leading-wrapper shape (kept when no host precedes it...
    // here it merges into 'leaf', which then becomes a host itself).
    const listItems = rootElement.querySelectorAll(':scope > ul > li');
    expect(listItems).toHaveLength(2);
    expect(listItems[0].className).toBe('host');
    expect(listItems[1].className).toBe('host');
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('deep')),
              ),
            ),
          ),
        );
      },
      {discrete: true},
    );
    const wrapperItems = rootElement.querySelectorAll(':scope > ul > li');
    expect(wrapperItems[0].className).toBe('wrapper');
    const leafItems = rootElement.querySelectorAll('ul ul li');
    expect(leafItems[0].className).toBe('');
  });
});

describe('multi-list wrappers and hosts', () => {
  test('merging adjacent lists preserves every list of a multi-list wrapper', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        // Two adjacent same-type root lists whose boundary items are both
        // wrappers; the second wrapper holds two lists of different types.
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('p')),
              ),
            ),
          ),
          $createListNode('bullet').append(
            $createListItemNode().append(
              $createListNode('bullet').append(
                $createListItemNode().append($createTextNode('q')),
              ),
              $createListNode('number').append(
                $createListItemNode().append($createTextNode('r')),
              ),
            ),
            $createListItemNode().append($createTextNode('z')),
          ),
        );
      },
      {discrete: true},
    );

    editor.read('force-commit', () => {
      // All rows survive, in order, with the ordered list intact.
      expect($getRoot().getTextContent().replace(/\s+/g, '')).toBe('pqrz');
      const list = $rootList();
      const wrapper = $assertNodeType(list.getFirstChild(), $isListItemNode);
      expect($isWrapperListItemNode(wrapper)).toBe(true);
      const wrapperLists = wrapper.getChildren().filter($isListNode);
      expect(wrapperLists).toHaveLength(2);
      expect(wrapperLists[0].getTextContent().replace(/\s+/g, '')).toBe('pq');
      expect(wrapperLists[1].getListType()).toBe('number');
      expect(wrapperLists[1].getTextContent()).toBe('r');
    });
  });

  test('backspace at the start of a host row keeps nested depth and clears marks', () => {
    using editor = buildEditor();
    let text!: TextNode;
    editor.update(
      () => {
        text = $createTextNode('a');
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append(
              text,
              (() => {
                const nested = $createListNode('bullet').append(
                  $createListItemNode().append($createTextNode('b')),
                );
                $setState(nested, listSemanticNestingState, true);
                return nested;
              })(),
            ),
            $createListItemNode().append($createTextNode('c')),
          ),
        );
        text.select(0, 0);
      },
      {discrete: true},
    );
    editor.dispatchCommand(
      KEY_BACKSPACE_COMMAND,
      new KeyboardEvent('keydown', {key: 'Backspace'}),
    );

    editor.read('force-commit', () => {
      const children = $getRoot().getChildren();
      expect(children).toHaveLength(2);
      expect($isParagraphNode(children[0])).toBe(true);
      expect(children[0].getTextContent()).toBe('a');
      const list = $assertNodeType(children[1], $isListNode);
      const items = list.getChildren().filter($isListItemNode);
      // 'b' keeps its depth (one level below the demoted row) inside a
      // dedicated wrapper whose list is no longer marked.
      const wrapper = items[0];
      expect($isWrapperListItemNode(wrapper)).toBe(true);
      const nested = $assertNodeType(wrapper.getFirstChild(), $isListNode);
      expect(nested.getTextContent()).toBe('b');
      const nestedItem = $assertNodeType(
        nested.getFirstChild(),
        $isListItemNode,
      );
      expect(nestedItem.getIndent()).toBe(1);
      expect(items[1].getTextContent()).toBe('c');
    });
  });

  test('Enter on an empty item in a multi-list host preserves document order', () => {
    using editor = buildEditor();
    let emptyItem!: ListItemNode;
    editor.update(
      () => {
        emptyItem = $createListItemNode();
        const checkList = $createListNode('check').append(
          $createListItemNode().append($createTextNode('x')),
          emptyItem,
          $createListItemNode().append($createTextNode('y')),
        );
        $setState(checkList, listSemanticNestingState, true);
        const bulletList = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('z')),
        );
        $setState(bulletList, listSemanticNestingState, true);
        $clearAndAppend(
          $createListNode('check').append(
            $createListItemNode().append(
              $createTextNode('h'),
              checkList,
              bulletList,
            ),
          ),
        );
        emptyItem.select();
      },
      {discrete: true},
    );
    editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);

    editor.read('force-commit', () => {
      // Order stays h, x, (new empty row), y, z: the host's trailing bullet
      // list moved with the split instead of rendering above it.
      expect($getRoot().getTextContent().replace(/\s+/g, '')).toBe('hxyz');
      const outer = $rootList();
      const items = outer.getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect(items[1].getChildrenSize()).toBe(0);
      const carrier = items[2];
      const carriedLists = carrier.getChildren().filter($isListNode);
      expect(carriedLists).toHaveLength(2);
      expect(carriedLists[0].getListType()).toBe('check');
      expect(carriedLists[0].getTextContent()).toBe('y');
      expect(carriedLists[1].getListType()).toBe('bullet');
      expect(carriedLists[1].getTextContent()).toBe('z');
    });
  });

  test('markdown export renders semantic hosts and emptied rows', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x'),
            $createMarkedEmptyItem('y'),
          ),
        );
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expect($convertToMarkdownString(TRANSFORMERS)).toBe(
        '- a\n    - x\n- \n    - y',
      );
    });
  });
});

describe('native checkbox inputs (semantic mode)', () => {
  function $checkFixture(): ListNode {
    // done(checked) / host(unchecked) hosting nested(checked)
    return $createListNode('check').append(
      $createListItemNode(true).append($createTextNode('done')),
      $createListItemNode(false).append(
        $createTextNode('host'),
        $markedNestedCheckList(),
      ),
    );
  }

  test('check rows render an unmanaged input and drop the ARIA emulation', () => {
    using editor = buildCheckEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend($checkFixture());
      },
      {discrete: true},
    );

    const listItems = Array.from(rootElement.querySelectorAll('li'));
    expect(listItems).toHaveLength(3);
    for (const li of listItems) {
      const input = li.firstElementChild;
      invariant(
        input instanceof HTMLInputElement,
        'expected a leading <input>',
      );
      expect(input.type).toBe('checkbox');
      expect(input.tabIndex).toBe(-1);
      // Accessible name: the input is labelled by its row li.
      expect(li.id).not.toBe('');
      expect(input.getAttribute('aria-labelledby')).toBe(li.id);
      expect(li.getAttribute('role')).toBe(null);
      // aria-checked stays (inert without the role, but keeps HTML
      // captured from the live DOM importable by default-mode editors).
      expect(li.getAttribute('aria-checked')).toBe(
        (li.firstElementChild as HTMLInputElement).checked ? 'true' : 'false',
      );
      expect(li.getAttribute('tabIndex')).toBe(null);
    }
    expect(
      listItems.map(li => (li.firstElementChild as HTMLInputElement).checked),
    ).toEqual([true, false, true]);
    // The attribute serializes too (outerHTML / clipboard).
    expect(
      listItems.map(li => li.firstElementChild!.hasAttribute('checked')),
    ).toEqual([true, false, true]);
  });

  test('toggling checked syncs the input without replacing it', () => {
    using editor = buildCheckEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend($checkFixture());
      },
      {discrete: true},
    );
    const hostLi = Array.from(rootElement.querySelectorAll('li')).find(li =>
      (li.textContent ?? '').startsWith('host'),
    );
    invariant(hostLi !== undefined, 'expected the host li');
    const input = hostLi.firstElementChild as HTMLInputElement;
    expect(input.checked).toBe(false);

    editor.update(
      () => {
        const node = $getRoot()
          .getAllTextNodes()
          .find(text => text.getTextContent() === 'host')!
          .getParent()! as LexicalNode;
        invariant($isListItemNode(node), 'expected a list item');
        node.toggleChecked();
      },
      {discrete: true},
    );

    // Same element, updated in place.
    expect(hostLi.firstElementChild).toBe(input);
    expect(input.checked).toBe(true);
    expect(input.hasAttribute('checked')).toBe(true);
  });

  test('an emptied check row keeps its input', () => {
    using editor = buildCheckEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend($checkFixture());
        const hostText = $getRoot()
          .getAllTextNodes()
          .find(text => text.getTextContent() === 'host')!;
        hostText.remove();
      },
      {discrete: true},
    );
    const listItems = Array.from(rootElement.querySelectorAll('li'));
    // done / emptied host (still its own row) / nested
    expect(listItems).toHaveLength(3);
    for (const li of listItems) {
      expect(li.firstElementChild?.nodeName).toBe('INPUT');
    }
  });

  test('the default mode keeps the ARIA emulation and renders no input', () => {
    using editor = buildCheckEditor({hasSemanticNesting: false});
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createListNode('check').append(
              $createListItemNode(true).append($createTextNode('done')),
            ),
          );
      },
      {discrete: true},
    );
    const li = rootElement.querySelector('li');
    invariant(li !== null, 'expected a li');
    expect(li.querySelector('input')).toBe(null);
    expect(li.getAttribute('role')).toBe('checkbox');
    expect(li.getAttribute('aria-checked')).toBe('true');
  });

  test('exportDOM emits the inputs and they round-trip through import', () => {
    using editor = buildCheckEditor();
    let exported = '';
    editor.update(
      () => {
        $clearAndAppend($checkFixture());
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      exported = $generateHtmlFromNodes(editor);
    });
    expect(exported).toContain('<input type="checkbox"');
    expect(exported).toContain('checked');

    using importEditor = buildCheckEditor();
    importEditor.update(
      () => {
        const dom = new DOMParser().parseFromString(exported, 'text/html');
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(importEditor, dom));
      },
      {discrete: true},
    );
    importEditor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const items = list.getChildren().filter($isListItemNode);
      expect(items.map(item => item.getChecked())).toEqual([true, false]);
      const nested = items[1].getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      expect(nested.getListType()).toBe('check');
      const nestedItem = nested.getFirstChild();
      invariant($isListItemNode(nestedItem), 'expected a nested item');
      expect(nestedItem.getChecked()).toBe(true);
      expect($isWrapperListItemNode(items[1])).toBe(false);
    });
  });

  test('foreign task-list HTML without container classes imports as a check list', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const dom = new DOMParser().parseFromString(
          '<ul><li><input type="checkbox" checked>done</li><li><input type="checkbox">todo</li></ul>',
          'text/html',
        );
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const items = list.getChildren().filter($isListItemNode);
      expect(items.map(item => item.getChecked())).toEqual([true, false]);
      expect(items.map(item => item.getTextContent())).toEqual([
        'done',
        'todo',
      ]);
    });
  });
});

describe('review round 3 regression fixes', () => {
  /** check list: [checked 'done', checked emptied row hosting checked 'nested'] */
  function $createEmptiedCheckRowFixture(): ListNode {
    return $createListNode('check').append(
      $createListItemNode(true).append($createTextNode('done')),
      $createListItemNode(true).append($markedNestedCheckList()),
    );
  }

  test('Enter on the sole empty item of an emptied host row keeps the row', () => {
    using editor = buildEditor();
    let host!: ListItemNode;
    editor.update(
      () => {
        const emptyNested = $createListItemNode();
        const nestedList = $createListNode('bullet').append(emptyNested);
        $setState(nestedList, listSemanticNestingState, true);
        host = $createListItemNode().append(nestedList);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        emptyNested.select();
        $handleListInsertParagraph();
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // The emptied host row survives (only its now-empty marked list is
      // removed); the split lands a new row after it.
      expect(host.getLatest().isAttached()).toBe(true);
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect(items[1].is(host.getLatest())).toBe(true);
      expect(items[1].getChildren().filter($isListNode)).toHaveLength(0);
      expect($isWrapperListItemNode(items[1])).toBe(false);
    });
  });

  test('an emptied check row round-trips through its own HTML export (legacy pipeline)', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        $clearAndAppend($createEmptiedCheckRowFixture());
      },
      {discrete: true},
    );
    let exported = '';
    editor.read('force-commit', () => {
      exported = $generateHtmlFromNodes(editor);
    });

    using importEditor = buildCheckEditor();
    importEditor.update(
      () => {
        const dom = new DOMParser().parseFromString(exported, 'text/html');
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(importEditor, dom));
      },
      {discrete: true},
    );
    importEditor.read('force-commit', () => {
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      expect($isWrapperListItemNode(items[1])).toBe(false);
      expect(items[1].getChecked()).toBe(true);
      const nested = items[1].getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list to survive');
      expect($getState(nested, listSemanticNestingState)).toBe(true);
      expect(nested.getTextContent()).toBe('nested');
    });
  });

  test('an emptied check row round-trips through the rules import pipeline', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        $clearAndAppend($createEmptiedCheckRowFixture());
      },
      {discrete: true},
    );
    let exported = '';
    editor.read('force-commit', () => {
      exported = $generateHtmlFromNodes(editor);
    });

    using importEditor = buildCheckEditor();
    importIntoViaPipeline(importEditor, exported);
    importEditor.read('force-commit', () => {
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      expect($isWrapperListItemNode(items[1])).toBe(false);
      expect(items[1].getChecked()).toBe(true);
      const nested = items[1].getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list to survive');
      expect($getState(nested, listSemanticNestingState)).toBe(true);
    });
  });

  test('rules pipeline imports class-less checkbox inputs with checked state', () => {
    using editor = buildCheckEditor();
    importIntoViaPipeline(
      editor,
      '<ul><li><input type="checkbox" checked>done</li><li><input type="checkbox">todo</li></ul>',
    );
    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const items = list.getChildren().filter($isListItemNode);
      expect(items.map(item => item.getChecked())).toEqual([true, false]);
      expect(items.map(item => item.getTextContent())).toEqual([
        'done',
        'todo',
      ]);
    });
  });

  test("changing an emptied host row's nested list type keeps the row", () => {
    using editor = buildEditor();
    let host!: ListItemNode;
    editor.update(
      () => {
        const nestedItem = $createListItemNode().append($createTextNode('x'));
        const nested = $createListNode('bullet').append(nestedItem);
        $setState(nested, listSemanticNestingState, true);
        host = $createListItemNode().append(nested);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        const text = nestedItem.getFirstChild<TextNode>();
        invariant(text !== null, 'expected the nested text');
        text.select();
        $insertList('number');
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expect(host.getLatest().isAttached()).toBe(true);
      expect($isWrapperListItemNode(host.getLatest())).toBe(false);
      const nested = host.getLatest().getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the retyped nested list');
      expect(nested.getListType()).toBe('number');
      expect($getState(nested, listSemanticNestingState)).toBe(true);
    });
  });

  test('indent after a semantic host continues its nested list even without the flag', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    let b!: ListItemNode;
    editor.update(
      () => {
        const nested = $createListNode('number').append(
          $createListItemNode().append($createTextNode('x')),
        );
        $setState(nested, listSemanticNestingState, true);
        const host = $createListItemNode().append($createTextNode('a'), nested);
        b = $createListItemNode().append($createTextNode('b'));
        $clearAndAppend($createListNode('number').append(host, b));
      },
      {discrete: true},
    );
    editor.update(
      () => {
        b.getLatest().setIndent(1);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const items = $rootList().getChildren().filter($isListItemNode);
      // 'b' joined the host's existing nested list instead of a separate
      // wrapper whose ordered numbering would restart.
      expect(items).toHaveLength(1);
      const nested = items[0].getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      const rows = nested.getChildren().filter($isListItemNode);
      expect(rows.map(row => row.getTextContent())).toEqual(['x', 'b']);
      expect(rows.map(row => row.getValue())).toEqual([1, 2]);
    });
  });

  test('markdown selection export omits a host row whose nested rows alone are selected', () => {
    using editor = buildEditor();
    let markdown = '';
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x', 'y'),
            $createListItemNode().append($createTextNode('b')),
          ),
        );
        const texts = $getRoot().getAllTextNodes();
        const x = texts.find(text => text.getTextContent() === 'x');
        const bText = texts.find(text => text.getTextContent() === 'b');
        invariant(
          x !== undefined && bText !== undefined,
          'expected the fixture texts',
        );
        const listSelection = x.select(0, 0);
        listSelection.focus.set(bText.getKey(), 0, 'text');
        markdown = $convertSelectionToMarkdownString(
          TRANSFORMERS,
          listSelection,
        );
      },
      {discrete: true},
    );
    // The host row 'a' is not part of the selection; only its nested rows
    // are (matching the default representation, where the wrapper is
    // skipped before the selection filter).
    expect(markdown).not.toContain('- a');
    expect(markdown.split('\n')[0]).toBe('    - x');
  });

  test('default mode leaves class-less checkbox-input HTML as plain items', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    editor.update(
      () => {
        const dom = new DOMParser().parseFromString(
          '<ul><li><input type="checkbox" checked>Subscribe</li></ul>',
          'text/html',
        );
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('bullet');
      const item = list.getFirstChild();
      invariant($isListItemNode(item), 'expected a list item');
      expect(item.getChecked()).toBe(undefined);
      expect(item.getTextContent()).toBe('Subscribe');
    });
  });

  test('GitHub task-list HTML still imports as a check list in default mode', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    editor.update(
      () => {
        const dom = new DOMParser().parseFromString(
          '<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" checked>done</li></ul>',
          'text/html',
        );
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const item = list.getFirstChild();
      invariant($isListItemNode(item), 'expected a list item');
      expect(item.getChecked()).toBe(true);
    });
  });
});

describe('review round 4 regression fixes', () => {
  test('semantic check-list HTML export round-trips into a default-mode editor', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('check').append(
            $createListItemNode(true).append($createTextNode('done')),
            $createListItemNode(false).append(
              $createTextNode('host'),
              $markedNestedCheckList(),
            ),
          ),
        );
      },
      {discrete: true},
    );
    let exported = '';
    editor.read('force-commit', () => {
      exported = $generateHtmlFromNodes(editor);
    });
    // aria-checked keeps the state readable for editors that do not consume
    // the checkbox inputs; the live-DOM label plumbing stays out of exports.
    expect(exported).toContain('aria-checked');
    expect(exported).not.toContain('aria-labelledby');
    expect(exported).not.toContain('id=');

    using defaultEditor = buildCheckEditor({hasSemanticNesting: false});
    defaultEditor.update(
      () => {
        const dom = new DOMParser().parseFromString(exported, 'text/html');
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(defaultEditor, dom));
      },
      {discrete: true},
    );
    defaultEditor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const items = list.getChildren().filter($isListItemNode);
      expect(items[0].getChecked()).toBe(true);
      const host = items.find(item => item.getTextContent().startsWith('host'));
      invariant(host !== undefined, 'expected the host row');
      expect(host.getChecked()).toBe(false);
    });
  });

  test('checkbox-input import preserves the row format and direction', () => {
    using editor = buildCheckEditor();
    editor.update(
      () => {
        const dom = new DOMParser().parseFromString(
          '<ul><li dir="rtl" style="text-align: center;"><input type="checkbox" checked>done</li></ul>',
          'text/html',
        );
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(editor, dom));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const item = $rootList().getFirstChild();
      invariant($isListItemNode(item), 'expected a list item');
      expect(item.getChecked()).toBe(true);
      expect(item.getFormatType()).toBe('center');
      expect(item.getDirection()).toBe('rtl');
    });
  });

  test('list commands on an emptied host row retype its own list, not the nested one', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('b')),
        );
        $setState(nested, listSemanticNestingState, true);
        const host = $createListItemNode().append(nested);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        // Caret as an element point on the emptied row, as left behind by
        // deleting its inline content.
        host.select(0, 0);
        $insertList('number');
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const outer = $rootList();
      expect(outer.getListType()).toBe('number');
      const host = outer
        .getChildren()
        .filter($isListItemNode)
        .find(item => item.getChildren().some($isListNode));
      invariant(host !== undefined, 'expected the host row to survive');
      const nested = host.getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      expect(nested.getListType()).toBe('bullet');
      expect($getState(nested, listSemanticNestingState)).toBe(true);
    });
  });

  test('disabling hasSemanticNesting at runtime swaps native inputs back to ARIA emulation', () => {
    using editor = buildCheckEditor();
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('check').append(
            $createListItemNode(true).append($createTextNode('done')),
          ),
        );
      },
      {discrete: true},
    );
    const li = rootElement.querySelector('li');
    invariant(li !== null, 'expected a li');
    expect(li.querySelector('input')).not.toBeNull();
    expect(li.getAttribute('role')).toBe(null);

    const dep = getExtensionDependencyFromEditor(editor, ListExtension);
    dep.output.hasSemanticNesting.value = false;
    // The toggle marks all list items dirty; flush the queued update.
    editor.read('force-commit', () => {});

    expect(li.querySelector('input')).toBeNull();
    expect(li.getAttribute('role')).toBe('checkbox');
    expect(li.getAttribute('aria-checked')).toBe('true');

    dep.output.hasSemanticNesting.value = true;
    editor.read('force-commit', () => {});
    expect(li.querySelector('input')).not.toBeNull();
    expect(li.getAttribute('role')).toBe(null);
  });

  test('converting a host row to a paragraph leaves its nested list behind', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x', 'y'),
            $createListItemNode().append($createTextNode('b')),
          ),
        );
        const host = $rootList().getFirstChild();
        invariant($isListItemNode(host), 'expected the host');
        host.replace($createParagraphNode(), true);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const rootChildren = $getRoot().getChildren();
      // paragraph('a'), then a list still containing the nested rows and 'b'.
      expect($isParagraphNode(rootChildren[0])).toBe(true);
      expect(rootChildren[0].getTextContent()).toBe('a');
      const texts = $getRoot()
        .getAllTextNodes()
        .map(text => text.getTextContent());
      expect(texts).toEqual(['a', 'x', 'y', 'b']);
      // The nested rows stayed list rows (not swallowed into the paragraph).
      const lists = rootChildren.filter($isListNode);
      expect(lists.length).toBeGreaterThan(0);
      expect(
        lists.flatMap(list =>
          list.getAllTextNodes().map(text => text.getTextContent()),
        ),
      ).toEqual(['x', 'y', 'b']);
    });
  });

  test('outdenting the sole item of one list of a multi-list wrapper keeps the other list', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    let inner!: ListItemNode;
    editor.update(
      () => {
        // wrapper holding two lists: bullet ['x'] and check ['y']
        const wrapper = $createListItemNode().append(
          $createListNode('bullet').append(
            (inner = $createListItemNode().append($createTextNode('x'))),
          ),
          $createListNode('check').append(
            $createListItemNode(false).append($createTextNode('y')),
          ),
        );
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            wrapper,
          ),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        inner.getLatest().setIndent(0);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const texts = $getRoot()
        .getAllTextNodes()
        .map(text => text.getTextContent());
      // 'y' must survive the outdent of 'x'.
      expect(texts.sort()).toEqual(['a', 'x', 'y']);
    });
  });

  test("indenting between two wrappers keeps a multi-list wrapper's extra lists", () => {
    using editor = buildEditor({hasSemanticNesting: false});
    let middle!: ListItemNode;
    editor.update(
      () => {
        const prevWrapper = $createListItemNode().append(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('p')),
          ),
        );
        const nextWrapper = $createListItemNode().append(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('n1')),
          ),
          $createListNode('check').append(
            $createListItemNode(false).append($createTextNode('n2')),
          ),
        );
        middle = $createListItemNode().append($createTextNode('m'));
        $clearAndAppend(
          $createListNode('bullet').append(prevWrapper, middle, nextWrapper),
        );
      },
      {discrete: true},
    );
    editor.update(
      () => {
        middle.getLatest().setIndent(1);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const texts = $getRoot()
        .getAllTextNodes()
        .map(text => text.getTextContent());
      // 'n2' (the next wrapper's second list) must survive the merge.
      expect(texts.sort()).toEqual(['m', 'n1', 'n2', 'p']);
    });
  });
});

describe('review round 5 regression fixes', () => {
  test('Enter on an emptied host row splits the list and keeps the nested rows', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('b')),
        );
        $setState(nested, listSemanticNestingState, true);
        const host = $createListItemNode().append(nested);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        host.select(0, 0);
        $handleListInsertParagraph();
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const rootChildren = $getRoot().getChildren();
      // list [a], the new paragraph, and a list carrying the nested rows.
      expect(rootChildren).toHaveLength(3);
      expect($isListNode(rootChildren[0])).toBe(true);
      expect(rootChildren[0].getTextContent()).toBe('a');
      expect($isParagraphNode(rootChildren[1])).toBe(true);
      expect($isListNode(rootChildren[2])).toBe(true);
      expect(rootChildren[2].getTextContent().replace(/\s+/g, '')).toBe('b');
    });
  });

  test('list commands inside an unmarked wrapper still retype the nested list (default mode)', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    editor.update(
      () => {
        const wrapper = $createListItemNode().append(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('x')),
          ),
        );
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            wrapper,
          ),
        );
        wrapper.select(0, 0);
        $insertList('number');
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const outer = $rootList();
      // The wrapper is not an "empty row": the nested level converts, the
      // outer list keeps its type (pre-existing behavior).
      expect(outer.getListType()).toBe('bullet');
      const nested = outer
        .getChildren()
        .filter($isListItemNode)
        .flatMap(item => item.getChildren())
        .find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      expect(nested.getListType()).toBe('number');
    });
  });

  test('converting a host row keeps element selection points in range', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append($createHostItem('a', 'x')),
        );
        const host = $rootList().getFirstChild();
        invariant($isListItemNode(host), 'expected the host');
        // Caret at the li end: element point after the nested list.
        host.select(2, 2);
        const paragraph = $createParagraphNode();
        host.replace(paragraph, true);
        const selection = $getSelection();
        invariant($isRangeSelection(selection), 'expected a range selection');
        expect(selection.anchor.key).toBe(paragraph.getKey());
        // The parked nested list did not transfer, so the offset shrinks
        // to the number of transferred children.
        expect(selection.anchor.offset).toBeLessThanOrEqual(
          paragraph.getChildrenSize(),
        );
      },
      {discrete: true},
    );
  });

  test('$setBlocksType converts an emptied host row (isBlock override)', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('b')),
        );
        $setState(nested, listSemanticNestingState, true);
        const host = $createListItemNode().append(nested);
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        host.select(0, 0);
        $setBlocksType($getSelection(), () => $createParagraphNode());
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // The emptied row became a paragraph; the nested rows stayed a list.
      expect($getRoot().getChildren().some($isParagraphNode)).toBe(true);
      const texts = $getRoot()
        .getAllTextNodes()
        .map(text => text.getTextContent());
      expect(texts.sort()).toEqual(['a', 'b']);
      const listTexts = $getRoot()
        .getChildren()
        .filter($isListNode)
        .flatMap(list => list.getAllTextNodes().map(t => t.getTextContent()));
      expect(listTexts).toContain('b');
    });
  });

  test('markdown selection export skips childless empty items', () => {
    using editor = buildEditor();
    let markdown = '';
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            $createListItemNode(),
            $createListItemNode().append($createTextNode('b')),
          ),
        );
        const texts = $getRoot().getAllTextNodes();
        const a = texts.find(text => text.getTextContent() === 'a');
        const b = texts.find(text => text.getTextContent() === 'b');
        invariant(a !== undefined && b !== undefined, 'expected fixture text');
        const listSelection = a.select(0, 0);
        listSelection.focus.set(b.getKey(), 1, 'text');
        markdown = $convertSelectionToMarkdownString(
          TRANSFORMERS,
          listSelection,
        );
      },
      {discrete: true},
    );
    expect(markdown).toBe('- a\n- b');
  });

  test('live-DOM HTML of a semantic check list imports into a default-mode editor', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(ListExtension, {hasSemanticNesting: true}),
          CheckListExtension,
        ],
        name: 'semantic-r5-live-dom-host',
      }),
    );
    const rootElement = mountRootElement(editor);
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('check').append(
            $createListItemNode(true).append($createTextNode('done')),
            $createListItemNode(false).append($createTextNode('todo')),
          ),
        );
      },
      {discrete: true},
    );
    // What a drag operation or scraper sees: the live DOM, not exportDOM.
    const liveHTML = rootElement.innerHTML;
    expect(liveHTML).toContain('aria-checked');

    using defaultEditor = buildEditor({hasSemanticNesting: false});
    defaultEditor.update(
      () => {
        const dom = new DOMParser().parseFromString(liveHTML, 'text/html');
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(defaultEditor, dom));
      },
      {discrete: true},
    );
    defaultEditor.read('force-commit', () => {
      const list = $rootList();
      expect(list.getListType()).toBe('check');
      const items = list.getChildren().filter($isListItemNode);
      expect(items.map(item => item.getChecked())).toEqual([true, false]);
    });
  });
});

describe('review round 6 regression fixes', () => {
  function $createEmptiedHost(...nested: string[]): ListItemNode {
    const list = $createListNode('bullet').append(
      ...nested.map(item =>
        $createListItemNode().append($createTextNode(item)),
      ),
    );
    $setState(list, listSemanticNestingState, true);
    return $createListItemNode().append(list);
  }

  test('a range anchored on an emptied host row targets the nested list, not the row', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const host = $createEmptiedHost('xyz');
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        const nestedText = $getRoot()
          .getAllTextNodes()
          .find(text => text.getTextContent() === 'xyz');
        invariant(nestedText !== undefined, 'expected nested text');
        const listSelection = host.select(0, 0);
        listSelection.focus.set(nestedText.getKey(), 2, 'text');
        $insertList('number');
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // The RANGE is not an empty-item selection: the nested list holding
      // the selected text converts, the outer list keeps its type.
      const outer = $rootList();
      expect(outer.getListType()).toBe('bullet');
      const nested = outer
        .getChildren()
        .filter($isListItemNode)
        .flatMap(item => item.getChildren())
        .find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      expect(nested.getListType()).toBe('number');
    });
  });

  test('Enter declines without mutating when the list container is unsupported', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          RichTextExtension,
          configExtension(ListExtension, {hasSemanticNesting: true}),
        ],
        name: 'semantic-r6-quote-host',
      }),
    );
    let handled = true;
    editor.update(
      () => {
        const host = $createEmptiedHost('b');
        const list = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('a')),
          host,
        );
        $getRoot().clear().append($createQuoteNode().append(list));
        host.select(0, 0);
        handled = $handleListInsertParagraph();
      },
      {discrete: true},
    );
    expect(handled).toBe(false);
    editor.read('force-commit', () => {
      // Declined WITHOUT restructuring: the emptied host still owns its
      // marked nested list; no wrapper was inserted.
      const quote = $getRoot().getFirstChild();
      invariant(quote !== null && $isElementNode(quote), 'expected the quote');
      const list = quote.getFirstChild();
      invariant($isListNode(list), 'expected the list');
      const items = list.getChildren().filter($isListItemNode);
      expect(items).toHaveLength(2);
      const host = items[1];
      const nested = host.getChildren().find($isListNode);
      invariant(nested !== undefined, 'expected the nested list');
      expect($getState(nested, listSemanticNestingState)).toBe(true);
      expect($isWrapperListItemNode(host)).toBe(false);
    });
  });

  test('Enter on a whitespace-only host row takes the empty-item path', () => {
    using editor = buildEditor();
    editor.update(
      () => {
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('b')),
        );
        $setState(nested, listSemanticNestingState, true);
        const host = $createListItemNode().append(
          $createTextNode('  '),
          nested,
        );
        $clearAndAppend(
          $createListNode('bullet').append(
            $createListItemNode().append($createTextNode('a')),
            host,
          ),
        );
        const whitespace = host.getFirstChild<TextNode>();
        invariant(whitespace !== null, 'expected the whitespace text');
        whitespace.select(1, 1);
        expect($handleListInsertParagraph()).toBe(true);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const rootChildren = $getRoot().getChildren();
      // list [a], the new paragraph, and a list carrying the nested rows —
      // same as the childless empty item.
      expect(rootChildren).toHaveLength(3);
      expect($isParagraphNode(rootChildren[1])).toBe(true);
      expect($isListNode(rootChildren[2])).toBe(true);
      expect(rootChildren[2].getTextContent().replace(/\s+/g, '')).toBe('b');
    });
  });

  test('selection markdown export keeps a host row and its nested rows separate', () => {
    using editor = buildEditor();
    let markdown = '';
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('bullet').append(
            $createHostItem('a', 'x', 'y'),
            $createListItemNode().append($createTextNode('b')),
          ),
        );
        const texts = $getRoot().getAllTextNodes();
        const a = texts.find(text => text.getTextContent() === 'a');
        const b = texts.find(text => text.getTextContent() === 'b');
        invariant(a !== undefined && b !== undefined, 'expected fixture text');
        const listSelection = a.select(0, 0);
        listSelection.focus.set(b.getKey(), 1, 'text');
        markdown = $convertSelectionToMarkdownString(
          TRANSFORMERS,
          listSelection,
        );
      },
      {discrete: true},
    );
    // The nested rows appear once, at depth — not flattened into 'a'.
    expect(markdown).toBe('- a\n    - x\n    - y\n- b');
  });

  test('exported HTML carries no render-time attributes on checkbox inputs', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(ListExtension, {hasSemanticNesting: true}),
          CheckListExtension,
        ],
        name: 'semantic-r6-export-host',
      }),
    );
    editor.update(
      () => {
        $clearAndAppend(
          $createListNode('check').append(
            $createListItemNode(true).append($createTextNode('done')),
          ),
        );
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const exported = $generateHtmlFromNodes(editor);
      expect(exported).toContain('<input type="checkbox"');
      expect(exported).not.toContain('tabindex');
      expect(exported).not.toContain('aria-labelledby');
      expect(exported).not.toContain('id=');
    });
  });

  test('both import pipelines agree on class-less checkbox rows not wrapped in li', () => {
    const checkboxRowHtml =
      '<ul><div><input type="checkbox" checked>milk</div></ul>';
    using legacyEditor = buildEditor();
    legacyEditor.update(
      () => {
        const dom = new DOMParser().parseFromString(
          checkboxRowHtml,
          'text/html',
        );
        $getRoot()
          .clear()
          .append(...$generateNodesFromDOM(legacyEditor, dom));
      },
      {discrete: true},
    );
    const legacyType = legacyEditor.read('force-commit', () =>
      $rootList().getListType(),
    );

    using rulesEditor = buildEditor();
    importIntoViaPipeline(rulesEditor, checkboxRowHtml);
    const rulesType = rulesEditor.read('force-commit', () =>
      $rootList().getListType(),
    );

    expect(legacyType).toBe('check');
    expect(rulesType).toBe(legacyType);
  });
});

describe('review round 7 regression fixes', () => {
  test('replacing a host row without includeChildren keeps its nested rows', () => {
    using editor = buildEditor();
    let host!: ListItemNode;
    editor.update(
      () => {
        const nested = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('B')),
        );
        $setState(nested, listSemanticNestingState, true);
        host = $createListItemNode().append($createTextNode('A'), nested);
        $clearAndAppend($createListNode('bullet').append(host));
        host.replace($createParagraphNode().append($createTextNode('P')));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // Row B survives in a list after the replacement paragraph, exactly
      // like the default representation, where it lives in a sibling
      // wrapper li that replace() never touches.
      const children = $getRoot().getChildren();
      expect(children).toHaveLength(2);
      expect($isParagraphNode(children[0])).toBe(true);
      expect(children[0].getTextContent()).toBe('P');
      const list = $assertNodeType(children[1], $isListNode);
      expect(list.getTextContent()).toBe('B');
    });
  });

  test('strict indent keeps rows nested under an earlier sibling list of the same host', () => {
    using editor = buildEditor({hasStrictIndent: true});
    let deepItem!: ListItemNode;
    editor.update(
      () => {
        // Host a's second list starts with a wrapper holding a depth-3
        // list; the previous visual row is the depth-2 row 'x2' at the end
        // of the host's FIRST list, so depth 3 is legal and must not be
        // clamped against the depth-1 host row.
        const l1 = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('x2')),
        );
        $setState(l1, listSemanticNestingState, true);
        deepItem = $createListItemNode().append($createTextNode('x3'));
        const deep = $createListNode('bullet').append(deepItem);
        const wrapper = $createListItemNode().append(deep);
        const l2 = $createListNode('bullet').append(wrapper);
        $setState(l2, listSemanticNestingState, true);
        const host = $createListItemNode().append($createTextNode('a'), l1, l2);
        $clearAndAppend($createListNode('bullet').append(host));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const deepList = deepItem.getLatest().getParent();
      invariant($isListNode(deepList), 'expected x3 to stay in a list');
      expect($getListDepth(deepList)).toBe(3);
      expect($rootList().getTextContent().replace(/\s+/g, '')).toBe('ax2x3');
    });
  });

  test('outdenting the first row of a later list in a multi-list wrapper preserves order', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    let one!: ListItemNode;
    editor.update(
      () => {
        const l1 = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('a')),
          $createListItemNode().append($createTextNode('b')),
        );
        one = $createListItemNode().append($createTextNode('one'));
        const l2 = $createListNode('bullet').append(
          one,
          $createListItemNode().append($createTextNode('two')),
        );
        const wrapper = $createListItemNode().append(l1, l2);
        $clearAndAppend($createListNode('bullet').append(wrapper));
        $handleOutdent(one);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // 'one' is first in ITS list but not the wrapper's first row, so it
      // must land after the rows of the wrapper's earlier list — the
      // wrapper splits around it instead of being jumped over.
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect(items[0].getTextContent().replace(/\s+/g, ' ')).toBe('a b');
      expect(items[1].getTextContent()).toBe('one');
      expect(items[2].getTextContent()).toBe('two');
      expect($rootList().getTextContent().replace(/\s+/g, ' ')).toBe(
        'a b one two',
      );
    });
  });

  test('outdenting the last row of an earlier list in a multi-list wrapper preserves order', () => {
    using editor = buildEditor({hasSemanticNesting: false});
    let b!: ListItemNode;
    editor.update(
      () => {
        b = $createListItemNode().append($createTextNode('b'));
        const l1 = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('a')),
          b,
        );
        const l2 = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('one')),
        );
        const wrapper = $createListItemNode().append(l1, l2);
        $clearAndAppend($createListNode('bullet').append(wrapper));
        $handleOutdent(b);
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      // 'b' is last in ITS list but rows of the wrapper's later list
      // render below it, so it must not land after the whole wrapper.
      expect($rootList().getTextContent().replace(/\s+/g, ' ')).toBe('a b one');
      const items = $rootList().getChildren().filter($isListItemNode);
      expect(items).toHaveLength(3);
      expect(items[1].is(b.getLatest())).toBe(true);
    });
  });

  test('an emptied host row adopts a following wrapper (transform host branch)', () => {
    // Built with the transform unregistered so only the direct call runs:
    // this exercises the branch a dirty emptied host takes when the
    // wrapper itself is not dirty.
    using editor = buildEditor({hasSemanticNesting: false});
    let host!: ListItemNode;
    let wrapper!: ListItemNode;
    editor.update(
      () => {
        const marked = $createListNode('bullet').append(
          $createListItemNode().append($createTextNode('x')),
        );
        $setState(marked, listSemanticNestingState, true);
        host = $createListItemNode().append(marked);
        // A number list so the ListNode merge transform cannot fold the
        // adopted list into the host's bullet list.
        wrapper = $createListItemNode().append(
          $createListNode('number').append(
            $createListItemNode().append($createTextNode('y')),
          ),
        );
        $clearAndAppend($createListNode('bullet').append(host, wrapper));
      },
      {discrete: true},
    );
    const wrapperKey = editor.read('force-commit', () => wrapper.getKey());
    editor.update(
      () => {
        $normalizeSemanticListItem(host.getLatest());
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      expect($getNodeByKey(wrapperKey)).toBe(null);
      const lists = host.getLatest().getChildren().filter($isListNode);
      expect(lists).toHaveLength(2);
      for (const list of lists) {
        expect($getState(list, listSemanticNestingState)).toBe(true);
      }
      expect(host.getLatest().getTextContent().replace(/\s+/g, ' ')).toBe(
        'x y',
      );
    });
  });

  test('splitting a marked nested list keeps the second half marked', () => {
    // Flag off so no normalization transform can re-mark: the mark must be
    // carried by the split itself ($copyListForSplit in insertAfter).
    using editor = buildEditor({hasSemanticNesting: false});
    let host!: ListItemNode;
    editor.update(
      () => {
        const x = $createListItemNode().append($createTextNode('x'));
        const y = $createListItemNode().append($createTextNode('y'));
        const nested = $createListNode('bullet').append(x, y);
        $setState(nested, listSemanticNestingState, true);
        host = $createListItemNode().append($createTextNode('a'), nested);
        $clearAndAppend($createListNode('bullet').append(host));
        x.insertAfter($createParagraphNode().append($createTextNode('p')));
      },
      {discrete: true},
    );
    editor.read('force-commit', () => {
      const lists = host.getLatest().getChildren().filter($isListNode);
      expect(lists).toHaveLength(2);
      for (const list of lists) {
        expect($getState(list, listSemanticNestingState)).toBe(true);
      }
    });
  });

  test("an application's own unmanaged checkbox input is never claimed", () => {
    using editor = buildCheckEditor({hasSemanticNesting: false});
    mountRootElement(editor);
    let item!: ListItemNode;
    editor.update(
      () => {
        item = $createListItemNode(false).append($createTextNode('todo'));
        $clearAndAppend($createListNode('check').append(item));
      },
      {discrete: true},
    );
    const li = editor.getElementByKey(item.getKey());
    invariant(li !== null, 'expected the li element');
    const appInput = document.createElement('input');
    appInput.type = 'checkbox';
    setDOMUnmanaged(appInput);
    li.insertBefore(appInput, li.firstChild);
    editor.update(
      () => {
        item.getLatest().setChecked(true);
      },
      {discrete: true},
    );
    // Ownership is an explicit stamp, not DOM shape: the reconciler must
    // not remove (default mode) or sync the app's own decoration.
    expect(appInput.parentElement).toBe(li);
    expect(appInput.checked).toBe(false);
    // The ARIA emulation stays on the li in default mode.
    expect(li.getAttribute('role')).toBe('checkbox');
  });

  test('Space on the focused checkbox input works right after a touch tap', () => {
    using editor = buildCheckEditor();
    const rootElement = mountRootElement(editor);
    let item!: ListItemNode;
    editor.update(
      () => {
        item = $createListItemNode(false).append($createTextNode('todo'));
        $clearAndAppend($createListNode('check').append(item));
      },
      {discrete: true},
    );
    const li = editor.getElementByKey(item.getKey());
    invariant(li !== null, 'expected the li element');
    const input = li.firstElementChild;
    invariant(
      input instanceof HTMLInputElement,
      'expected the native checkbox input',
    );

    // A touch tap toggles at pointerup; on browsers where the touchstart
    // preventDefault suppresses the synthesized click, no click follows to
    // consume the dedup record.
    const pointerUp = new MouseEvent('pointerup', {bubbles: true});
    Object.defineProperty(pointerUp, 'pointerType', {value: 'touch'});
    input.dispatchEvent(pointerUp);
    expect(
      editor.read('force-commit', () => item.getLatest().getChecked()),
    ).toBe(true);

    // Space on the (now focused) input: the command handler defers to the
    // native activation, whose click must not be swallowed by the stale
    // tap record.
    input.focus();
    editor.dispatchCommand(
      KEY_SPACE_COMMAND,
      new KeyboardEvent('keydown', {key: ' '}),
    );
    input.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(
      editor.read('force-commit', () => item.getLatest().getChecked()),
    ).toBe(false);
    expect(rootElement.isConnected).toBe(true);
  });
});
