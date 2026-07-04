/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnyLexicalExtensionArgument,
  ElementNode,
  LexicalEditor,
  LexicalExtension,
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
import {configExtension, defineExtension, safeCast} from '@lexical/extension';
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

export interface MdastExtensionOptions {
  config: MdastExtensionConfig;
  dependencies?: AnyLexicalExtensionArgument[];
  name: string;
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

export function mergeMdastExtensionConfigs(
  ...configs: MdastExtensionConfig[]
): MdastExtensionConfig {
  const merged: MdastExtensionConfig = {};
  for (const config of configs) {
    merged.fromMarkdown = {
      ...merged.fromMarkdown,
      ...config.fromMarkdown,
      extensions: [
        ...(merged.fromMarkdown !== undefined &&
        merged.fromMarkdown.extensions != null
          ? merged.fromMarkdown.extensions
          : []),
        ...(config.fromMarkdown !== undefined &&
        config.fromMarkdown.extensions != null
          ? config.fromMarkdown.extensions
          : []),
      ],
      mdastExtensions: [
        ...(merged.fromMarkdown !== undefined &&
        merged.fromMarkdown.mdastExtensions != null
          ? merged.fromMarkdown.mdastExtensions
          : []),
        ...(config.fromMarkdown !== undefined &&
        config.fromMarkdown.mdastExtensions != null
          ? config.fromMarkdown.mdastExtensions
          : []),
      ],
    };
    merged.toMarkdown = {
      ...merged.toMarkdown,
      ...config.toMarkdown,
      extensions: [
        ...(merged.toMarkdown !== undefined &&
        merged.toMarkdown.extensions != null
          ? merged.toMarkdown.extensions
          : []),
        ...(config.toMarkdown !== undefined &&
        config.toMarkdown.extensions != null
          ? config.toMarkdown.extensions
          : []),
      ],
    };
    merged.import = {...merged.import, ...config.import};
    merged.export = {...merged.export, ...config.export};
  }
  return merged;
}

export const MdastCoreExtension = /* @__PURE__ */ defineExtension({
  config: /* @__PURE__ */ safeCast<MdastExtensionConfig>({}),
  name: '@lexical/mdast/Core',
});

export function createMdastExtension({
  config,
  dependencies,
  name,
}: MdastExtensionOptions): LexicalExtension<
  MdastExtensionConfig,
  string,
  unknown,
  unknown
> {
  return defineExtension({
    dependencies: [
      /* @__PURE__ */ configExtension(MdastCoreExtension, config),
      ...(dependencies !== undefined ? dependencies : []),
    ],
    name,
  });
}

export const MdastTextConfig: MdastExtensionConfig = {
  export: {
    linebreak: () => ({type: 'break'}),
    text: node => textNodeToMdast(node as TextNode),
  },
  import: {
    break: () => $createLineBreakNode(),
    inlineCode: node =>
      $createTextNode((node as Text).value).toggleFormat('code'),
    text: node => $createTextNode((node as Text).value),
  },
};

export const MdastRichTextConfig: MdastExtensionConfig = {
  export: {
    heading: (node, context) =>
      ({
        children: context.exportChildren(node as ElementNode),
        depth: Number(
          (node as LexicalNode & {getTag(): string}).getTag().slice(1),
        ),
        type: 'heading',
      }) as Heading,
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
  },
  import: {
    blockquote: (node, context) =>
      appendChildren($createQuoteNode(), context.importChildren(node as Root)),
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
    paragraph: (node, context) =>
      appendChildren(
        $createParagraphNode(),
        context.importChildren(node as Paragraph),
      ),
    root: (node, context) => context.importChildren(node as Root),
    strong: (node, context) =>
      withFormat(context.importChildren(node as Strong), 'bold'),
    thematicBreak: () => $createParagraphNode().append($createTextNode('---')),
  },
};

export const MdastLinkConfig: MdastExtensionConfig = {
  export: {
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
  },
  import: {
    link: (node, context) =>
      appendChildren(
        $createLinkNode((node as Link).url, {
          title: (node as Link).title || null,
        }),
        context.importChildren(node as Link),
      ),
  },
};

export const MdastListConfig: MdastExtensionConfig = {
  export: {
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
  },
  import: {
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
  },
};

export const MdastCodeConfig: MdastExtensionConfig = {
  export: {
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
  },
  import: {
    code: node => {
      const code = node as Code;
      return $createCodeNode(code.lang || undefined).append(
        $createCodeHighlightNode(code.value),
      );
    },
  },
};

export const CommonMarkMdastConfig: MdastExtensionConfig =
  /* @__PURE__ */ mergeMdastExtensionConfigs(
    MdastTextConfig,
    MdastRichTextConfig,
    MdastLinkConfig,
    MdastListConfig,
    MdastCodeConfig,
  );

export const MdastTextExtension = /* @__PURE__ */ createMdastExtension({
  config: MdastTextConfig,
  name: '@lexical/mdast/Text',
});

export const MdastRichTextExtension = /* @__PURE__ */ createMdastExtension({
  config: MdastRichTextConfig,
  dependencies: [RichTextExtension],
  name: '@lexical/mdast/RichText',
});

export const MdastLinkExtension = /* @__PURE__ */ createMdastExtension({
  config: MdastLinkConfig,
  dependencies: [LinkExtension],
  name: '@lexical/mdast/Link',
});

export const MdastListExtension = /* @__PURE__ */ createMdastExtension({
  config: MdastListConfig,
  dependencies: [ListExtension, CheckListExtension],
  name: '@lexical/mdast/List',
});

export const MdastCodeExtension = /* @__PURE__ */ createMdastExtension({
  config: MdastCodeConfig,
  dependencies: [CodeExtension],
  name: '@lexical/mdast/Code',
});

export const CommonMarkMdastExtension = /* @__PURE__ */ createMdastExtension({
  config: CommonMarkMdastConfig,
  dependencies: [
    MdastTextExtension,
    MdastRichTextExtension,
    MdastLinkExtension,
    MdastListExtension,
    MdastCodeExtension,
  ],
  name: '@lexical/mdast/CommonMark',
});

export const MdastExtension = CommonMarkMdastExtension;

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
        config.import !== undefined ? config.import[node.type] : undefined;
      return handler ? handler(node, context) : null;
    },
  };
  return context;
}

export function $convertFromMdast(
  root: Root,
  config: MdastExtensionConfig = CommonMarkMdastConfig,
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
  config: MdastExtensionConfig = CommonMarkMdastConfig,
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

function createExportContext(config: MdastExtensionConfig): MdastExportContext {
  const context: MdastExportContext = {
    config,
    exportChildren(parent) {
      return childrenOf(parent, context);
    },
    exportNode(node) {
      const handler =
        config.export !== undefined ? config.export[node.getType()] : undefined;
      if (handler) {
        return handler(node, context);
      }
      return null;
    },
  };
  return context;
}

export function $convertToMdast(
  config: MdastExtensionConfig = CommonMarkMdastConfig,
): Root {
  const context = createExportContext(config);
  return {children: context.exportChildren($getRoot()), type: 'root'};
}

export function $convertToMarkdownString(
  config: MdastExtensionConfig = CommonMarkMdastConfig,
): string {
  return toMarkdown($convertToMdast(config), config.toMarkdown);
}

export function importMarkdown(
  editor: LexicalEditor,
  markdown: string,
  config: MdastExtensionConfig = CommonMarkMdastConfig,
): void {
  editor.update(() => $convertFromMarkdownString(markdown, config));
}

export function exportMarkdown(
  editor: LexicalEditor,
  config: MdastExtensionConfig = CommonMarkMdastConfig,
): string {
  return editor.read(() => $convertToMarkdownString(config));
}
