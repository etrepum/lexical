# `@lexical/list`

[![See API Documentation](https://lexical.dev/img/see-api-documentation.svg)](https://lexical.dev/docs/api/modules/lexical_list)

This package exposes the primitives for implementing lists in Lexical. If you're trying to implement conventional lists with React, take a look at the ListPlugin exposed
by [@lexical/react](https://lexical.dev/docs/packages/lexical-react), which wraps these primitives into a neat component that you can drop into any LexicalComposer.

The API of @lexical/list primarily consists of Lexical Nodes that encapsulate list behaviors and a set of functions that can be called to trigger typical list manipulation functionality:

## Functions

### $insertList

As the name suggests, this inserts a list of the provided type according to an algorithm that tries to determine the best way to do that based on
the current Selection. For instance, if some text is selected, $insertList may try to move it into the first item in the list. See the API documentation for more detail.

### $removeList

Attempts to remove lists inside the current selection based on a set of opinionated heuristics that implement conventional editor behaviors. For instance, it converts empty ListItemNodes into empty ParagraphNodes.

## Nodes

### ListNode

### ListItemNode

## Commands

For convenience, we provide a set of commands that can be used to connect a plugin to trigger typical list manipulation functionality:

### INSERT_UNORDERED_LIST_COMMAND

### INSERT_ORDERED_LIST_COMMAND

### INSERT_CHECK_LIST_COMMAND

### REMOVE_LIST_COMMAND

It's important to note that these commands don't have any functionality on their own. They are just for convenience and require you to register a handler for them in order to actually change the editor state when they are dispatched, as below:


```ts
// MyListPlugin.ts

editor.registerCommand(INSERT_UNORDERED_LIST_COMMAND, () => {
    $insertList(editor, 'bullet');
    return true;
}, COMMAND_PRIORITY_LOW);

// MyInsertListToolbarButton.ts

function onButtonClick(e: MouseEvent) {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
}

```

## Semantic nested list representation

By default, a nested list requires a dedicated wrapper `ListItemNode` whose
sole child is the nested `ListNode`, which renders as:

```html
<ul>
  <li>first item</li>
  <li>nested list below</li>
  <li>
    <ul>
      <li>nested</li>
    </ul>
  </li>
</ul>
```

You can opt in to the semantic representation, where the nested list lives
inside the list item that precedes it:

```html
<ul>
  <li>first item</li>
  <li>
    <span>nested list below</span>
    <ul>
      <li>nested</li>
    </ul>
  </li>
</ul>
```

Opt in with the `hasSemanticNesting` config of `ListExtension`. This
registers a `ListItemNode` transform that continuously converts wrapper
items produced by editing operations or deserialized documents into the
semantic form, and switches HTML import over to preserving
`<li>text<ul>…</ul></li>` structures. Nested lists that sit in a
content-bearing item are marked with NodeState, so an item whose inline
content is later deleted keeps its own row instead of being mistaken for a
dedicated wrapper (the two shapes are structurally identical). HTML export
produces the semantic representation in either mode.

In the semantic mode, check-list rows also render a real
`<input type="checkbox">` as unmanaged DOM at the start of each `<li>`,
instead of emulating one with `role="checkbox"`/`aria-checked` attributes
and a CSS marker. The input carries the role, checked state, and focus
semantics natively (click and Space toggle it, arrow keys move between
rows) and is labelled by its row via `aria-labelledby`; a theme-rendered
`::before` marker area on the `<li>` stays clickable like in the default
mode. The `<li>` keeps an `aria-checked` attribute (without the role it
is inert for assistive technology), so both exported HTML and HTML
captured from the live DOM keep the checked state importable by editors
that do not consume checkbox inputs (including default-mode Lexical
editors), and
`<li><input type="checkbox">…` structures are recognized on import in the
semantic mode. State still flows one way — clicks are routed through the
editor, and the reconciler keeps the input in sync with the node's
`checked` value.

The flag only gates *producing* the semantic shape (the transform, HTML
import, and native checkbox rendering); *honoring* it — rendering,
numbering, checkbox roles, editing operations, export — is unconditional
in every editor. A marked document therefore keeps its row identities when
opened in an editor with the flag off, but no transform maintains or
converts the representation there. The mark travels with document JSON,
not with HTML or markdown.

## Theming

Lists can be styled using the following properties in the EditorTheme passed to the editor in the initial config (the values are classes that will be applied in the denoted contexts):

```ts
{
  list?: {
    // Applies to all lists of type "bullet"
    ul?: EditorThemeClassName;
    // Used to apply specific styling to nested levels of bullet lists
    // e.g., [ 'bullet-list-level-one', 'bullet-list-level-two' ]
    ulDepth?: Array<EditorThemeClassName>;
    // Applies to all lists of type "number"
    ol?: EditorThemeClassName;
    // Used to apply specific styling to nested levels of number lists
    // e.g., [ 'number-list-level-one', 'number-list-level-two' ]
    olDepth?: Array<EditorThemeClassName>;
    // Applies to all list items
    listitem?: EditorThemeClassName;
    // Applies to all list items with checked property set to "true"
    listitemChecked?: EditorThemeClassName;
    // Applies to all list items with checked property set to "false"
    listitemUnchecked?: EditorThemeClassName;
    // Applies to list items that render a row of their own and contain a
    // nested list inside the same <li> (semantic nested list
    // representation) — e.g. to scope a checked style away from the
    // nested rows
    listitemHost?: EditorThemeClassName;
    // Applies only to list and list items that are not at the top level.
    nested?: {
      list?: EditorThemeClassName;
      listitem?: EditorThemeClassName;
    };
  };
}
```
