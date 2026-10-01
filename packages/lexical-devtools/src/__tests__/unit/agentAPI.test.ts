/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions, defineExtension} from '@lexical/extension';
import {$createLinkNode, LinkNode} from '@lexical/link';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type ElementNode,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import {afterEach, describe, expect, test} from 'vitest';

import {
  AGENT_API_GLOBAL,
  createLexicalDevtoolsAgentAPI,
  installLexicalDevtoolsAgentAPI,
} from '../../agent/agentAPI';

function mountEditor(id: string, text: string) {
  const rootElement = document.createElement('div');
  rootElement.id = id;
  rootElement.contentEditable = 'true';
  document.body.appendChild(rootElement);
  const editor = buildEditorFromExtensions(
    defineExtension({
      $initialEditorState: () => {
        $getRoot().append(
          $createParagraphNode().append(
            $createTextNode(text),
            $createLinkNode('https://lexical.dev').append(
              $createTextNode('link'),
            ),
          ),
        );
      },
      dependencies: [RichTextExtension],
      name: `[agent-api-${id}]`,
      nodes: [LinkNode],
    }),
  );
  editor.setRootElement(rootElement);
  editor.read(() => {});
  return editor;
}

// The test shares the page's copy of Lexical, so no shim is needed.
const sameRealm = <V>(_editor: unknown, _state: unknown, fn: () => V) => fn();

afterEach(() => {
  document.body.innerHTML = '';
  delete (window as unknown as Record<string, unknown>)[AGENT_API_GLOBAL];
});

describe('Lexical DevTools page API', () => {
  test('lists editors and resolves targets', () => {
    using first = mountEditor('first', 'one');
    using second = mountEditor('second', 'two');
    const api = createLexicalDevtoolsAgentAPI({
      document,
      readEditorState: sameRealm,
    });

    expect(api.editors().map(({key, index}) => [key, index])).toEqual([
      [first.getKey(), 0],
      [second.getKey(), 1],
    ]);
    expect(api.json(1).root.children).toHaveLength(1);
    expect(api.tree(second.getKey())).toContain('"two"');
    expect(api.tree('#second')).toContain('"two"');
    expect(api.tree(document.getElementById('second')!)).toContain('"two"');
    expect(api.tree(first)).toContain('"one"');
    // With nothing focused, the first editor is the default.
    expect(api.tree()).toContain('"one"');
    expect(() => api.tree('#missing')).toThrow(/No Lexical editor matches/);
  });

  test('describes nodes, selection and the rendered DOM', () => {
    using editor = mountEditor('editor', 'hello');
    const api = createLexicalDevtoolsAgentAPI({
      document,
      readEditorState: sameRealm,
    });
    const linkKey = editor.read(() =>
      $getRoot()
        .getFirstChildOrThrow<ElementNode>()
        .getLastChildOrThrow()
        .getKey(),
    );

    expect(api.node(linkKey)).toMatchObject({
      json: {type: 'link', url: 'https://lexical.dev'},
      text: 'link',
      type: 'link',
    });
    expect(api.node('missing')).toBeNull();
    expect(api.tree()).toContain('link "https://lexical.dev"');
    expect(api.html()).toMatch(/^<div id="editor"[^>]*>\n {2}<p/);

    editor.update(() => $getRoot().selectStart(), {discrete: true});
    expect(api.selection()).toMatchObject({
      isCollapsed: true,
      text: '',
      type: 'range',
    });
  });

  test('dispatches commands by type and logs them', async () => {
    using editor = mountEditor('editor', 'hello');
    const api = createLexicalDevtoolsAgentAPI({
      document,
      readEditorState: sameRealm,
    });
    editor.update(() => $getRoot().selectStart(), {discrete: true});

    const update = api.waitForUpdate();
    expect(api.dispatch(FORMAT_TEXT_COMMAND.type!, 'bold')).toBe(true);
    await expect(update).resolves.toMatchObject({tags: expect.any(Array)});
    expect(api.commands()).toContainEqual(
      expect.objectContaining({payload: 'bold', type: 'FORMAT_TEXT_COMMAND'}),
    );
    expect(api.tree()).toContain('FORMAT_TEXT_COMMAND');
    expect(() => api.dispatch('NOT_A_COMMAND')).toThrow(
      /No command of type NOT_A_COMMAND .*FORMAT_TEXT_COMMAND/,
    );
    using idle = mountEditor('idle', 'idle');
    await expect(api.waitForUpdate(idle, {timeout: 1})).resolves.toBe(null);
  });

  test('replaces the editor state from JSON', () => {
    using editor = mountEditor('editor', 'before');
    const api = createLexicalDevtoolsAgentAPI({
      document,
      readEditorState: sameRealm,
    });
    const json = api.json();
    using other = mountEditor('other', 'after');
    api.setEditorState(JSON.stringify(api.json(other)), editor);
    expect(api.tree(editor)).toContain('"after"');
    api.setEditorState(json, editor);
    expect(api.tree(editor)).toContain('"before"');
  });

  test('installs once on the window', () => {
    const api = installLexicalDevtoolsAgentAPI(window, {
      readEditorState: sameRealm,
    });
    expect(
      (window as unknown as Record<string, unknown>)[AGENT_API_GLOBAL],
    ).toBe(api);
    expect(
      installLexicalDevtoolsAgentAPI(window, {readEditorState: sameRealm}),
    ).toBe(api);
    expect(api.help()).toContain('dispatch(type, payload?, target?)');
  });
});
