/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {YSuggestion} from '@lexical/y';

// This view deliberately stays outside the contenteditable. Native diff deltas
// include deleted content, which must never be written back as live editor text.
interface Attribution {
  suggestion?: string;
  insert?: unknown;
  delete?: unknown;
  format?: unknown;
}
interface Attribute {
  value?: unknown;
  attribution?: Attribution;
}
interface ReviewDelta {
  name?: string;
  attrs?: Record<string, Attribute>;
  children?: {
    insert?: string | {id: string; token: string}[];
    format?: Record<string, unknown>;
    attribution?: Attribution;
  }[];
}
const tags: Record<string, string> = {
  heading: 'h3',
  list: 'ul',
  listitem: 'li',
  paragraph: 'p',
  quote: 'blockquote',
  table: 'table',
  tablecell: 'td',
  tablerow: 'tr',
};

export function renderReview(
  container: HTMLElement,
  controls: HTMLElement,
  delta: unknown,
  suggestions: YSuggestion[],
  decide: (id: string, accept: boolean) => void,
): void {
  const root = JSON.parse(JSON.stringify(delta)) as ReviewDelta;
  const stores = root.attrs || {};
  const fragment = document.createDocumentFragment();
  const decorate = (element: HTMLElement, attribution?: Attribution) => {
    if (!attribution) return;
    if (attribution.suggestion)
      element.dataset.suggestion = attribution.suggestion;
    if ('delete' in attribution) element.classList.add('review-deleted');
    else if ('insert' in attribution) element.classList.add('review-inserted');
    else if ('format' in attribution) {
      element.classList.add('review-formatted');
      element.title = 'Suggested formatting change';
    }
  };
  const render = (
    node: ReviewDelta,
    target: HTMLElement | DocumentFragment,
    ancestors: Set<string>,
  ) => {
    for (const [key, value] of Object.entries(node.attrs || {})) {
      if (value.attribution && /^(p:|s:|ref:|slot:)/.test(key)) {
        const badge = document.createElement('span');
        badge.className = 'review-property';
        badge.textContent = `${key.replace(/^(p:|s:|ref:|slot:)/, '')} changed`;
        decorate(badge, value.attribution);
        target.append(badge);
      }
    }
    for (const operation of node.children || []) {
      if (typeof operation.insert === 'string') {
        const attribution = operation.attribution;
        const text = document.createElement(
          attribution && 'delete' in attribution
            ? 'del'
            : attribution && 'insert' in attribution
              ? 'ins'
              : 'span',
        );
        text.textContent = operation.insert;
        decorate(text, attribution);
        const rawFormat = operation.format && operation.format['p:format'];
        const format = Array.isArray(rawFormat)
          ? Number(rawFormat[0])
          : Number(rawFormat || 0);
        if (format & 1) text.style.fontWeight = 'bold';
        if (format & 2) text.style.fontStyle = 'italic';
        if (format & 8)
          text.style.textDecoration =
            attribution && 'delete' in attribution
              ? 'underline line-through'
              : 'underline';
        target.append(text);
      } else if (Array.isArray(operation.insert)) {
        for (const reference of operation.insert) {
          const stored = stores[`tree:node:${reference.id}`];
          if (!stored || !stored.value || ancestors.has(reference.id)) continue;
          const child = stored.value as ReviewDelta;
          const placement = child.attrs && child.attrs['tree:placement'];
          if (
            !operation.attribution &&
            placement &&
            placement.value !== reference.token
          )
            continue;
          const element = document.createElement(
            tags[child.name || ''] || (child.name ? 'div' : 'span'),
          );
          decorate(element, operation.attribution || stored.attribution);
          render(child, element, new Set([...ancestors, reference.id]));
          target.append(element);
        }
      }
    }
  };
  render(root, fragment, new Set());
  container.replaceChildren(fragment);
  const rows = suggestions.map((suggestion, index) => {
    const row = document.createElement('li');
    row.dataset.suggestion = suggestion.id;
    const label = document.createElement('span');
    label.textContent = `${index + 1}. ${suggestion.deletedText ? `Delete “${suggestion.deletedText}” ` : ''}${suggestion.insertedText ? `Insert “${suggestion.insertedText}”` : suggestion.deletedText ? '' : `${suggestion.kind} change`}`;
    row.append(label);
    for (const accept of [true, false]) {
      const button = document.createElement('button');
      button.textContent = accept ? 'Accept change' : 'Reject change';
      button.setAttribute(
        'aria-label',
        `${accept ? 'Accept' : 'Reject'} change ${index + 1}`,
      );
      button.onclick = () => decide(suggestion.id, accept);
      row.append(button);
    }
    const highlight = (active: boolean) => {
      for (const element of container.querySelectorAll<HTMLElement>(
        '[data-suggestion]',
      )) {
        if (element.dataset.suggestion === suggestion.id)
          element.classList.toggle('review-focused', active);
      }
    };
    row.onmouseenter = () => highlight(true);
    row.onmouseleave = () => highlight(false);
    row.addEventListener('focusin', () => highlight(true));
    row.addEventListener('focusout', () => highlight(false));
    return row;
  });
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No pending changes.';
    rows.push(empty);
  }
  controls.replaceChildren(...rows);
}
