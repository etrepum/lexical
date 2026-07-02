/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ElementNode,
  LexicalEditor,
  LexicalNode,
  TextFormatType,
  TextNode,
} from 'lexical';
import type {
  Code,
  Content,
  Delete,
  Emphasis,
  Heading,
  Html,
  Link,
  List,
  ListItem,
  Nodes,
  Paragraph,
  Root,
  Strong,
  Text,
} from 'mdast';
import type {Options as FromMarkdownOptions} from 'mdast-util-from-markdown';
import type {Options as ToMarkdownOptions} from 'mdast-util-to-markdown';

import {
  $createCodeHighlightNode,
  $createCodeNode,
  CodeExtension,
} from '@lexical/code';
import {defineExtension, safeCast} from '@lexical/extension';
import {$createLinkNode, LinkExtension} from '@lexical/link';
import {
  $createListItemNode,
  $createListNode,
  CheckListExtension,
  ListExtension,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  RichTextExtension,
} from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
} from 'lexical';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toMarkdown} from 'mdast-util-to-markdown';

export type MdastNode = Nodes;
export type MdastImportHandler<T extends MdastNode = MdastNode> = (
  node: T,
  context: MdastImportContext,
) => LexicalNode | LexicalNode[] | null;
export type MdastExportHandler<T extends LexicalNode = LexicalNode> = (
  node: T,
  context: MdastExportContext,
) => MdastNode | MdastNode[] | null;

export interface MdastExtensionConfig {
  fromMarkdown?: FromMarkdownOptions;
  toMarkdown?: ToMarkdownOptions;
  import?: Partial<Record<MdastNode['type'], MdastImportHandler>>;
  export?: Record<string, MdastExportHandler>;
}

export interface MdastImportContext {
  config: MdastExtensionConfig;
  importChildren(parent: {children?: Content[]}): LexicalNode[];
  importNode(node: MdastNode): LexicalNode | LexicalNode[] | null;
}

export interface MdastExportContext {
  config: MdastExtensionConfig;
  exportChildren(parent: ElementNode): Content[];
  exportNode(node: LexicalNode): MdastNode | MdastNode[] | null;
}

const textFormats: TextFormatType[] = [
  'bold',
  'italic',
  'strikethrough',
  'code',
];

function appendChildren(
  parent: ElementNode,
  children: LexicalNode[],
): ElementNode {
  if (children.length > 0) {
    parent.append(...children);
  }
  return parent;
}

function withFormat(
  children: LexicalNode[],
  format: TextFormatType,
): LexicalNode[] {
  for (const child of children) {
    if ($isTextNode(child)) {
      child.toggleFormat(format);
    } else if ($isElementNode(child)) {
      withFormat(child.getChildren(), format);
    }
  }
  return children;
}

const importers: Partial<Record<MdastNode['type'], MdastImportHandler>> = {
  blockquote: (node, context) =>
    appendChildren($createQuoteNode(), context.importChildren(node as Root)),
  break: () => $createLineBreakNode(),
  code: node => {
    const code = node as Code;
    return $createCodeNode(code.lang || undefined).append(
      $createCodeHighlightNode(code.value),
    );
  },
  delete: (node, context) =>
    withFormat(context.importChildren(node as Delete), 'strikethrough'),
  emphasis: (node, context) =>
    withFormat(context.importChildren(node as Emphasis), 'italic'),
  heading: (node, context) =>
    appendChildren(
      $createHeadingNode(`h${(node as Heading).depth}` as 'h1'),
      context.importChildren(node as Heading),
    ),
  html: node =>
    $createParagraphNode().append($createTextNode((node as Html).value)),
  inlineCode: node =>
    $createTextNode((node as Text).value).toggleFormat('code'),
  link: (node, context) =>
    appendChildren(
      $createLinkNode((node as Link).url, {
        title: (node as Link).title || null,
      }),
      context.importChildren(node as Link),
    ),
  list: (node, context) => {
    const list = node as List;
    return appendChildren(
      $createListNode(list.ordered ? 'number' : 'bullet', list.start || 1),
      context.importChildren(list),
    );
  },
  listItem: (node, context) => {
    const item = node as ListItem;
    return appendChildren(
      $createListItemNode(item.checked == null ? undefined : item.checked),
      context.importChildren(item),
    );
  },
  paragraph: (node, context) =>
    appendChildren(
      $createParagraphNode(),
      context.importChildren(node as Paragraph),
    ),
  root: (node, context) => context.importChildren(node as Root),
  strong: (node, context) =>
    withFormat(context.importChildren(node as Strong), 'bold'),
  text: node => $createTextNode((node as Text).value),
  thematicBreak: () => $createParagraphNode().append($createTextNode('---')),
};

function createImportContext(config: MdastExtensionConfig): MdastImportContext {
  const context: MdastImportContext = {
    config,
    importChildren(parent) {
      return (parent.children !== undefined ? parent.children : []).flatMap(
        child => {
          const imported = context.importNode(child);
          return imported == null
            ? []
            : Array.isArray(imported)
              ? imported
              : [imported];
        },
      );
    },
    importNode(node) {
      const handler =
        (config.import !== undefined ? config.import[node.type] : undefined) ||
        importers[node.type];
      return handler ? handler(node, context) : null;
    },
  };
  return context;
}

export function $convertFromMdast(
  root: Root,
  config: MdastExtensionConfig = {},
): void {
  const lexicalRoot = $getRoot();
  lexicalRoot.clear();
  const context = createImportContext(config);
  const nodes = context.importChildren(root);
  lexicalRoot.append(
    ...(nodes.length === 0 ? [$createParagraphNode()] : nodes),
  );
}

export function $convertFromMarkdownString(
  markdown: string,
  config: MdastExtensionConfig = {},
): void {
  $convertFromMdast(
    fromMarkdown(markdown, config.fromMarkdown) as Root,
    config,
  );
}

function childrenOf(
  parent: ElementNode,
  context: MdastExportContext,
): Content[] {
  return parent.getChildren().flatMap(child => {
    const exported = context.exportNode(child);
    return exported == null
      ? []
      : Array.isArray(exported)
        ? (exported as Content[])
        : [exported as Content];
  });
}

function textNodeToMdast(node: TextNode): Content {
  let current: Content = {type: 'text', value: node.getTextContent()};
  for (const format of textFormats) {
    if (node.hasFormat(format)) {
      current =
        format === 'bold'
          ? {children: [current], type: 'strong'}
          : format === 'italic'
            ? {children: [current], type: 'emphasis'}
            : format === 'strikethrough'
              ? ({children: [current], type: 'delete'} as Delete)
              : {type: 'inlineCode', value: node.getTextContent()};
    }
  }
  return current;
}

const exporters: Record<string, MdastExportHandler> = {
  code: node => {
    const codeNode = node as LexicalNode & {
      getLanguage(): null | string | undefined;
    };
    return {
      lang: codeNode.getLanguage() || null,
      type: 'code',
      value: node.getTextContent(),
    } as Code;
  },
  heading: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      depth: Number(
        (node as LexicalNode & {getTag(): string}).getTag().slice(1),
      ),
      type: 'heading',
    }) as Heading,
  linebreak: () => ({type: 'break'}),
  link: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      title:
        (
          node as LexicalNode & {getTitle(): string | null | undefined}
        ).getTitle() || null,
      type: 'link',
      url: (node as LexicalNode & {getURL(): string}).getURL(),
    }) as Link,
  list: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      ordered:
        (node as LexicalNode & {getListType(): string}).getListType() ===
        'number',
      spread: false,
      start:
        (
          node as LexicalNode & {getStart(): number | null | undefined}
        ).getStart() || null,
      type: 'list',
    }) as List,
  listitem: (node, context) =>
    ({
      checked:
        (
          node as LexicalNode & {getChecked(): boolean | null | undefined}
        ).getChecked() ?? null,
      children: context.exportChildren(node as ElementNode),
      spread: false,
      type: 'listItem',
    }) as ListItem,
  paragraph: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      type: 'paragraph',
    }) as Paragraph,
  quote: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      type: 'blockquote',
    }) as MdastNode,
  root: (node, context) =>
    ({
      children: context.exportChildren(node as ElementNode),
      type: 'root',
    }) as Root,
  text: node => textNodeToMdast(node as TextNode),
};

function createExportContext(config: MdastExtensionConfig): MdastExportContext {
  const context: MdastExportContext = {
    config,
    exportChildren(parent) {
      return childrenOf(parent, context);
    },
    exportNode(node) {
      const handler =
        (config.export !== undefined
          ? config.export[node.getType()]
          : undefined) || exporters[node.getType()];
      if (handler) {
        return handler(node, context);
      }
      return $isElementNode(node)
        ? ({
            children: context.exportChildren(node),
            type: 'paragraph',
          } as Paragraph)
        : null;
    },
  };
  return context;
}

export function $convertToMdast(config: MdastExtensionConfig = {}): Root {
  const context = createExportContext(config);
  return {children: context.exportChildren($getRoot()), type: 'root'};
}

export function $convertToMarkdownString(
  config: MdastExtensionConfig = {},
): string {
  return toMarkdown($convertToMdast(config), config.toMarkdown);
}

export const MdastExtension = /* @__PURE__ */ defineExtension({
  config: /* @__PURE__ */ safeCast<MdastExtensionConfig>({}),
  dependencies: [
    RichTextExtension,
    ListExtension,
    CheckListExtension,
    LinkExtension,
    CodeExtension,
  ],
  name: '@lexical/mdast',
});

export function importMarkdown(
  editor: LexicalEditor,
  markdown: string,
  config: MdastExtensionConfig = {},
): void {
  editor.update(() => $convertFromMarkdownString(markdown, config));
}

export function exportMarkdown(
  editor: LexicalEditor,
  config: MdastExtensionConfig = {},
): string {
  return editor.read(() => $convertToMarkdownString(config));
}
