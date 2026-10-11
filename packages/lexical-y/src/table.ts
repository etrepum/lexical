/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
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
import {getChildIndex, getStoredNode} from './Topology';

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

/** Repair trailing gaps after overlapping merges without allocating shared identities. */
function $normalizeTableProjection(): void {
  for (const table of $nodesOfType(TableNode)) {
    const rows = table.getChildren();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!$isTableRowNode(row)) continue;
      for (const cell of row.getChildren())
        if ($isTableCellNode(cell) && cell.getRowSpan() > rows.length - i)
          cell.setRowSpan(rows.length - i);
    }
    const [map] = $computeTableMapSkipCellCheck(table, null, null);
    const width = Math.max(0, ...map.map(row => row.length));
    for (let i = 0; i < map.length; i++) {
      const row = map[i];
      if (row.length >= width || !row.length) continue;
      const last = row[row.length - 1];
      if (last && last.startRow === i && last.cell.getRowSpan() === 1)
        last.cell.setColSpan(last.cell.getColSpan() + width - row.length);
    }
  }
}

/** Optional table selection codec. Import from @lexical/y/table. */
export const YTableSelectionExtension = defineExtension({
  dependencies: [YExtension],
  name: '@lexical/y/TableSelection',
  nodes: () => [TableNode, TableRowNode, TableCellNode],
  register(_editor, _config, state) {
    const {binding} = state.getDependency(YExtension).output;
    return mergeRegister(
      binding.registerProjectionTransform($normalizeTableProjection),
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
