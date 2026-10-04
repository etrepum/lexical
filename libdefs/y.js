/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
declare module '@y/y' {
  declare export type ID = {client: number, clock: number};
  declare export type RelativePosition = {
    type: ID | null,
    item: ID | null,
    tname: string | null,
    assoc: number,
  };
  declare export class Doc {
    clientID: number;
    constructor(options?: {guid?: string, gc?: boolean, ...}): void;
    get(name: string, nodeName?: string | null): Node;
    transact(callback: () => void, origin?: unknown): void;
    destroy(): void;
    on(event: 'update', callback: (update: Uint8Array, origin: unknown) => void): void;
    off(event: 'update', callback: (update: Uint8Array, origin: unknown) => void): void;
  }
  declare export class Node {
    constructor(name?: string | null): void;
    doc: Doc | null;
    parent: Node | null;
    name: string | null;
    length: number;
    get(index: number): any;
    getAttr(key: string): any;
    getAttrs(): {[string]: unknown};
    clone(): Node;
    toJSON(): {name?: string, attrs?: {[string]: unknown}, children?: unknown[]};
    setAttr(key: string, value: unknown): void;
    deleteAttr(key: string): void;
    toArray(): any[];
    insert(index: number, content: string | Node[], formats?: {[string]: unknown}): void;
    delete(index: number, length: number): void;
    format(index: number, length: number, formats: {[string]: unknown}): void;
  }
  declare type StackItem = {meta: Map<unknown, unknown>, ...};
  declare export class UndoManager {
    constructor(scope: Doc | Node | Node[], options?: {captureTimeout?: number, trackedOrigins?: Set<unknown>, ...}): void;
    undoStack: StackItem[];
    redoStack: StackItem[];
    undo(): StackItem | null;
    redo(): StackItem | null;
    stopCapturing(): void;
    clear(clearUndoStack?: boolean, clearRedoStack?: boolean): void;
    destroy(): void;
  }
  declare export function applyUpdate(doc: Doc, update: Uint8Array, origin?: unknown): void;
  declare export function encodeStateAsUpdate(doc: Doc, stateVector?: Uint8Array): Uint8Array;
  declare export function encodeStateVector(doc: Doc): Uint8Array;
}
