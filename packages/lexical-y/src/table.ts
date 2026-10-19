/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {YSuggestionGrouping} from './Suggestions';
import type {YBinding} from './YBinding';

import {
  $computeTableMap,
  $computeTableMapSkipCellCheck,
  $createTableSelectionFrom,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  $isTableSelection,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromTypeIndex,
  type RelativePosition,
} from '@y/y';
import {
  $getNodeByKey,
  $nodesOfType,
  defineExtension,
  mergeRegister,
} from 'lexical';

import {YExtension} from '.';
import {
  $getYNodeReference,
  $resolveYNodeReference,
  isRelativePosition,
  isYNodeReference,
  registerYSelectionCodec,
  type YNodeReference,
} from './Selection';
import {getChildIndex, getNodeByID, getNodeID, getStoredNode} from './Topology';

interface CellBookmark {
  cell: YNodeReference;
  row: YNodeReference;
  rowBoundary: RelativePosition;
  column: number;
}
interface TableBookmark {
  table: YNodeReference;
  anchor: CellBookmark;
  focus: CellBookmark;
}
function validCell(value: unknown): value is CellBookmark {
  if (!value || typeof value !== 'object') return false;
  const cell = value as CellBookmark;
  return (
    isYNodeReference(cell.cell) &&
    isYNodeReference(cell.row) &&
    isRelativePosition(cell.rowBoundary) &&
    Number.isSafeInteger(cell.column) &&
    cell.column >= 0
  );
}
function $encodeCell(
  binding: YBinding,
  table: TableNode,
  cell: TableCellNode,
): CellBookmark | null {
  const row = cell.getParentOrThrow();
  const tableType = binding.mapping.types.get(table.getKey());
  const rowType = binding.mapping.types.get(row.getKey());
  const cellRef = $getYNodeReference(binding, cell);
  const rowRef = $getYNodeReference(binding, row);
  if (!tableType || !rowType || !cellRef || !rowRef) return null;
  const [, entry] = $computeTableMap(table, cell, cell);
  return {
    cell: cellRef,
    column: entry.startColumn,
    row: rowRef,
    rowBoundary: createRelativePositionFromTypeIndex(
      tableType,
      Math.max(0, getChildIndex(binding, tableType, rowType)),
    ),
  };
}
function $resolveCell(
  binding: YBinding,
  table: TableNode,
  bookmark: CellBookmark,
  follow: boolean,
): TableCellNode | null {
  const cell = $resolveYNodeReference(binding, bookmark.cell, follow)[0];
  if ($isTableCellNode(cell) && cell.getParentOrThrow().getParent() === table)
    return cell;
  const row = $resolveYNodeReference(binding, bookmark.row, follow)[0];
  let rowIndex =
    $isTableRowNode(row) && row.getParent() === table
      ? row.getIndexWithinParent()
      : -1;
  if (rowIndex < 0) {
    const boundary = createAbsolutePositionFromRelativePosition(
      bookmark.rowBoundary,
      binding.doc,
      follow,
    );
    const tableType = binding.mapping.types.get(table.getKey());
    if (!boundary || boundary.type !== tableType) return null;
    rowIndex = boundary.type
      .toArray()
      .slice(0, boundary.index)
      .filter((value: unknown) => getStoredNode(binding, value)).length;
  }
  const [map] = $computeTableMapSkipCellCheck(table, null, null);
  const cells = map[Math.min(rowIndex, map.length - 1)];
  if (!cells) return null;
  const entry = cells[Math.min(bookmark.column, cells.length - 1)];
  return entry ? entry.cell : null;
}

/** Repair merged table geometry without allocating peer-specific shared identities. */
function $normalizeTableProjection(): void {
  for (const table of $nodesOfType(TableNode)) {
    const rows = table.getChildren<TableRowNode>();
    if (rows.every(row => row.getChildrenSize() === 0)) {
      table.remove();
      continue;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!$isTableRowNode(row)) continue;
      for (const cell of row.getChildren())
        if ($isTableCellNode(cell) && cell.getRowSpan() > rows.length - i)
          cell.setRowSpan(rows.length - i);
    }
    const [map] = $computeTableMapSkipCellCheck(table, null, null);
    const width = Math.max(0, ...map.map(row => row.length));
    let malformed = false;
    // A rectangular map can still hide overlapping spans: the table map's
    // later writes overwrite the earlier cell's covered positions.
    const coverage = new Map<string, number>();
    for (const row of map)
      for (const entry of row)
        if (entry) {
          const key = entry.cell.getKey();
          coverage.set(key, (coverage.get(key) || 0) + 1);
        }
    for (const row of rows)
      for (const cell of row.getChildren<TableCellNode>())
        if (
          coverage.get(cell.getKey()) !==
          cell.getRowSpan() * cell.getColSpan()
        )
          malformed = true;
    // Extend adjacent existing cells into holes where their rectangles fit.
    // This also fills holes on either side of cells spanning from above.
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < width; j++) {
        if (map[i][j]) continue;
        const left = map[i][j - 1];
        const above = i > 0 ? map[i - 1][j] : undefined;
        if (left && left.startRow === i && left.cell.getRowSpan() === 1) {
          left.cell.setColSpan(left.cell.getColSpan() + 1);
          map[i][j] = left;
        } else if (
          above &&
          above.startRow + above.cell.getRowSpan() === i &&
          Array.from(
            {length: above.cell.getColSpan()},
            (_, offset) => map[i][above.startColumn + offset],
          ).every(value => !value)
        ) {
          above.cell.setRowSpan(above.cell.getRowSpan() + 1);
          for (let c = 0; c < above.cell.getColSpan(); c++)
            map[i][above.startColumn + c] = above;
        } else {
          malformed = true;
          continue;
        }
      }
    }
    if (!malformed) continue;
    // Some concurrent merges cannot coexist as rectangles. Retain every cell
    // and its content, and resolve those span conflicts in document order.
    // Keeping this a projection avoids concurrent padding inserts growing the
    // table whenever independently repaired documents are synchronized.
    for (const row of rows)
      for (const cell of row.getChildren<TableCellNode>()) cell.setRowSpan(1);
    const firstPopulatedRow = rows.find(row => row.getChildrenSize() > 0);
    if (!firstPopulatedRow) {
      table.remove();
      continue;
    }
    if (firstPopulatedRow !== rows[0])
      rows[0].append(...firstPopulatedRow.getChildren());
    let previous: TableCellNode[] = [];
    for (const row of rows) {
      const cells = row.getChildren<TableCellNode>();
      if (cells.length) {
        const size = cells.reduce((sum, cell) => sum + cell.getColSpan(), 0);
        const last = cells[cells.length - 1];
        if (size < width) last.setColSpan(last.getColSpan() + width - size);
        previous = cells;
      } else {
        for (const cell of previous) cell.setRowSpan(cell.getRowSpan() + 1);
      }
    }
  }
}

const groupTableSuggestions: YSuggestionGrouping = ({
  binding,
  base,
  changes,
}) => {
  const tableOf = (type: import('@y/y').Node): string | null => {
    for (const owner of [binding, base]) {
      const key = type._item && getNodeID(type);
      let node =
        owner === binding
          ? type
          : typeof key === 'string'
            ? getNodeByID(owner.root, key)
            : null;
      const seen = new Set<import('@y/y').Node>();
      while (node && !seen.has(node)) {
        if (node.name === 'table') return getNodeID(node);
        seen.add(node);
        node = owner.parents.get(node) || null;
      }
    }
    return null;
  };
  const tables = changes.map(p => tableOf(p.created || p.parent));
  const coupled = new Set(
    changes.flatMap((p, i) =>
      tables[i] &&
      !p.parentIsNew &&
      ((p.parent.name === 'tablerow' && p.attribute === null) ||
        p.attribute === 'p:colSpan' ||
        p.attribute === 'p:rowSpan' ||
        (p.parent.name === 'table' && p.attribute === 'p:colWidths'))
        ? [tables[i]!]
        : [],
    ),
  );
  const groups = new Map<string, number[]>();
  changes.forEach((p, i) => {
    const table = tables[i];
    if (!table || !coupled.has(table)) return;
    const geometry = p.created
      ? ['table', 'tablerow', 'tablecell'].includes(p.created.name || '')
      : p.attribute === null
        ? p.parent.name === 'table' || p.parent.name === 'tablerow'
        : p.attribute === 'tree:placement'
          ? ['table', 'tablerow', 'tablecell'].includes(p.parent.name || '')
          : p.attribute === 'p:colSpan' ||
            p.attribute === 'p:rowSpan' ||
            (p.parent.name === 'table' && p.attribute === 'p:colWidths');
    if (geometry) {
      const group = groups.get(table) || [];
      group.push(i);
      groups.set(table, group);
    }
  });
  return [...groups.values()];
};

/** Table collaboration projection and selection codec. Import from @lexical/y/table. */
export const YTableSelectionExtension = defineExtension({
  dependencies: [YExtension],
  name: '@lexical/y/TableSelection',
  nodes: () => [TableNode, TableRowNode, TableCellNode],
  register(_editor, _config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const roots = new Set<import('@y/y').Node>();
    return mergeRegister(
      binding.registerProjectionTransform(
        () => {
          $normalizeTableProjection();
          roots.clear();
          for (const table of $nodesOfType(TableNode)) {
            const type = binding.mapping.types.get(table.getKey());
            if (type) roots.add(type);
          }
        },
        () => roots,
      ),
      binding.registerSuggestionGrouping(groupTableSuggestions),
      registerYSelectionCodec(binding, {
        encode(_binding, selection) {
          if (!$isTableSelection(selection)) return null;
          const table = $getNodeByKey(selection.tableKey);
          const anchor = selection.anchor.getNode();
          const focus = selection.focus.getNode();
          if (
            !$isTableNode(table) ||
            !$isTableCellNode(anchor) ||
            !$isTableCellNode(focus)
          )
            return null;
          const tableRef = $getYNodeReference(binding, table);
          const anchorRef = $encodeCell(binding, table, anchor);
          const focusRef = $encodeCell(binding, table, focus);
          return tableRef && anchorRef && focusRef
            ? {anchor: anchorRef, focus: focusRef, table: tableRef}
            : null;
        },
        getNodesForHighlight: selection =>
          selection.getNodes().filter($isTableCellNode),
        kind: 'table',
        resolve(_binding, data, follow) {
          if (!data || typeof data !== 'object') return null;
          const bookmark = data as TableBookmark;
          if (
            !isYNodeReference(bookmark.table) ||
            !validCell(bookmark.anchor) ||
            !validCell(bookmark.focus)
          )
            return null;
          const table = $resolveYNodeReference(
            binding,
            bookmark.table,
            follow,
          )[0];
          if (!$isTableNode(table)) return null;
          const anchor = $resolveCell(binding, table, bookmark.anchor, follow);
          const focus = $resolveCell(binding, table, bookmark.focus, follow);
          return anchor && focus
            ? $createTableSelectionFrom(table, anchor, focus)
            : null;
        },
      }),
    );
  },
});
