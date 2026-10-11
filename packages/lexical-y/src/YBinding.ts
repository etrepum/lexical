/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {signal} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {type Doc, Node as YNode, type Transaction} from '@y/y';
import {
  $getNodeByKey,
  $getRoot,
  COLLABORATION_TAG,
  HISTORIC_TAG,
  type LexicalEditor,
  SKIP_COLLAB_TAG,
  SKIP_SCROLL_INTO_VIEW_TAG,
} from 'lexical';

import {Mapping} from './Mapping';
import {type Attributes} from './Schema';
import {
  $getYSelection,
  $restoreYSelection,
  type YSelection,
  type YSelectionCodec,
} from './Selection';
import {
  hasSharedReference,
  isSharedTypeDeleted,
  SHARED_PREFIX,
} from './SharedTypes';
import {$readElement, $writeElement} from './Sync';
import {
  changesTopology,
  deleteRemovedNodes,
  getChildren,
  getParent,
  readTopology,
} from './Topology';

/** One editor bound to one integrated subtree, independent of its transport. */
export class YBinding {
  readonly doc: Doc;
  readonly error = signal<Error | null>(null);
  readonly mapping = new Mapping();
  private readonly projectionTransforms = new Set<() => void>();
  readonly selectionCodecs = new Map<string, YSelectionCodec>();
  readonly parents = new Map<YNode, YNode>();
  readonly recovered = new Set<YNode>();
  topologyChanged = false;
  readonly normalizationOrigin = {};
  readonly bootstrapOrigin = {};
  selection: YSelection | null = null;
  selectionBefore: YSelection | null = null;
  restoringSelection: YSelection | null | undefined;
  private readonly attributeCache = new Map<YNode, Attributes>();
  private reading = false;
  private active = false;
  private writing = false;
  private readonly sharedOwners = new Map<string, Set<YNode>>();
  private readonly sharedTypes = new Set<YNode>();
  private readonly pendingSharedOwners = new Map<string, Attributes>();
  private readonly sharedTypeListeners = new Set<(type: YNode) => void>();

  /** Register deterministic, local projection repair for a schema integration. */
  registerProjectionTransform(transform: () => void): () => void {
    this.projectionTransforms.add(transform);
    this.read();
    return () => {
      this.projectionTransforms.delete(transform);
    };
  }

  /** Mutate shared values with this binding's local history origin. */
  transact(callback: () => void): void {
    invariant(
      this.active,
      '@lexical/y: cannot transact through an inactive binding',
    );
    invariant(
      !this.editor._updating,
      '@lexical/y: transact must run outside an editor update',
    );
    invariant(
      !this.error.peek(),
      '@lexical/y: cannot transact while the binding has a schema error',
    );
    this.selectionBefore = this.selection;
    this.doc.transact(callback, this);
  }

  /** Release a binding-owned shared value after its references have been removed.
   * This is an undoable Yjs deletion, not forced garbage collection. Applications
   * choose when to release independently owned values; concurrent references to
   * a released value do not resurrect it.
   */
  releaseSharedType(type: YNode): void {
    const key = type._item && type._item.parentSub;
    invariant(
      type.parent === this.root &&
        typeof key === 'string' &&
        key.startsWith(SHARED_PREFIX) &&
        this.root.getAttr(key) === type,
      "@lexical/y: only this binding root's stored shared values can be released",
    );
    invariant(
      !hasSharedReference(this, key),
      '@lexical/y: remove shared value references before releasing it',
    );
    this.transact(() => this.root.deleteAttr(key));
    this.sharedTypes.delete(type);
  }

  /** @internal Only schema attributes and slots participate in reconciliation. */
  getAttributes(type: YNode): Attributes {
    let attributes = this.attributeCache.get(type);
    if (!attributes) {
      attributes = {};
      for (const [key, value] of Object.entries(type.getAttrs())) {
        if (!key.startsWith('tree:') && !key.startsWith('shared:'))
          attributes[key] = value;
      }
      this.attributeCache.set(type, attributes);
    }
    return attributes;
  }

  /** @internal */
  cacheAttributes(type: YNode, attributes: Attributes): void {
    this.attributeCache.set(type, attributes);
  }

  /** @internal */
  trackSharedTypes(
    owner: string,
    attributes: Attributes,
    pending: Attributes = {},
  ): void {
    if (Object.keys(pending).length)
      this.pendingSharedOwners.set(owner, pending);
    else this.pendingSharedOwners.delete(owner);
    const values = new Set<YNode>();
    for (const value of Object.values(attributes)) {
      if (value instanceof YNode) {
        values.add(value);
        if (!this.sharedTypes.has(value)) {
          this.sharedTypes.add(value);
          for (const listener of this.sharedTypeListeners) listener(value);
        }
      }
    }
    if (values.size) this.sharedOwners.set(owner, values);
    else this.sharedOwners.delete(owner);
  }

  /** @internal */
  getPendingSharedReferences(owner: string): Attributes {
    return this.pendingSharedOwners.get(owner) || {};
  }

  /** @internal */
  registerSharedTypeListener(listener: (type: YNode) => void): () => void {
    this.sharedTypeListeners.add(listener);
    for (const type of this.sharedTypes) listener(type);
    return () => {
      this.sharedTypeListeners.delete(listener);
    };
  }

  constructor(
    readonly editor: LexicalEditor,
    readonly root: YNode,
    readonly schemaId = 'default',
  ) {
    invariant(
      root.doc !== null,
      '@lexical/y: root must be integrated into a Y.Doc',
    );
    this.doc = root.doc;
  }

  /** Register synchronization; disposing the binding never destroys its document. */
  register(): () => void {
    invariant(!this.active, '@lexical/y: binding is already registered');
    this.assertFormat();
    this.active = true;
    const onChange = (transaction: Transaction) => {
      for (const [type, keys] of transaction.changed) {
        if (
          [...keys].some(
            key =>
              key !== null &&
              !key.startsWith('tree:') &&
              !key.startsWith('shared:'),
          )
        )
          this.attributeCache.delete(type);
      }
      if (
        !(transaction.origin === this && this.writing) &&
        transaction.origin !== this.normalizationOrigin &&
        transaction.origin !== this.bootstrapOrigin
      ) {
        const dirty = new Set<string>();
        for (const [owner, types] of this.sharedOwners) {
          for (const type of types) {
            if (
              transaction.changedParentTypes.has(type) ||
              isSharedTypeDeleted(type)
            )
              dirty.add(owner);
          }
        }
        if (
          dirty.size ||
          this.pendingSharedOwners.size ||
          transaction.changedParentTypes.has(this.root)
        ) {
          const changed = new Set(transaction.changedParentTypes.keys());
          for (const type of [...changed]) {
            let parent = getParent(this, type);
            while (parent) {
              changed.add(parent);
              parent = getParent(this, parent);
            }
          }
          for (const key of dirty) {
            let type = this.mapping.types.get(key);
            while (type) {
              changed.add(type);
              type = getParent(this, type) ?? undefined;
            }
          }
          const structural = changesTopology(this, transaction.changed);
          this.read(
            dirty,
            this.pendingSharedOwners.size || structural ? undefined : changed,
            structural,
          );
        }
      }
    };
    this.doc.on('afterTransaction', onChange);
    const removeListener = this.editor.registerUpdateListener(
      ({editorState, normalizedNodes, dirtyElements, dirtyLeaves, tags}) => {
        if (!this.active || this.error.peek() || tags.has(SKIP_COLLAB_TAG))
          return;
        const remote =
          this.reading || tags.has(COLLABORATION_TAG) || tags.has(HISTORIC_TAG);
        editorState.read(() => {
          this.selectionBefore = this.selection;
          if (
            (!remote && (dirtyElements.size > 0 || dirtyLeaves.size > 0)) ||
            normalizedNodes.size > 0
          ) {
            this.writing = true;
            try {
              this.doc.transact(
                () => {
                  const previous = new Set(this.parents.keys());
                  $writeElement(
                    this.root,
                    $getRoot(),
                    this,
                    new Set([
                      ...dirtyElements.keys(),
                      ...dirtyLeaves,
                      ...normalizedNodes,
                    ]),
                  );
                  if (this.topologyChanged) {
                    readTopology(this);
                    if (!remote) deleteRemovedNodes(this, previous);
                  }
                  this.selection = $getYSelection(this);
                },
                remote ? this.normalizationOrigin : this,
              );
            } finally {
              this.writing = false;
            }
          } else this.selection = $getYSelection(this);
        });
        this.pruneMapping();
      },
      {synchronous: true},
    );
    const unregister = () => {
      this.active = false;
      this.doc.off('afterTransaction', onChange);
      removeListener();
      this.mapping.clear();
      this.attributeCache.clear();
      this.parents.clear();
      this.recovered.clear();
      this.sharedOwners.clear();
      this.sharedTypes.clear();
      this.pendingSharedOwners.clear();
    };
    try {
      this.read();
    } catch (error) {
      unregister();
      throw error;
    }
    return unregister;
  }

  read(
    dirty: ReadonlySet<string> = new Set(),
    changed?: ReadonlySet<YNode>,
    structural = true,
  ): void {
    const selection =
      this.restoringSelection === undefined
        ? this.selection
        : this.restoringSelection;
    this.reading = true;
    try {
      this.editor.update(
        () => {
          try {
            this.assertFormat();
            if (structural) readTopology(this);
            $readElement(this.root, this, changed);
            for (const transform of this.projectionTransforms) transform();
            this.error.value = null;
          } catch (error) {
            this.mapping.clear();
            this.attributeCache.clear();
            this.parents.clear();
            this.error.value =
              error instanceof Error ? error : new Error(String(error));
            throw error;
          }
          for (const key of dirty) {
            const node = $getNodeByKey(key);
            if (node) node.markDirty();
          }
          $restoreYSelection(this, selection);
        },
        {
          discrete: true,
          skipTransforms: true,
          tag: [COLLABORATION_TAG, SKIP_SCROLL_INTO_VIEW_TAG],
        },
      );
    } finally {
      this.reading = false;
    }
    this.pruneMapping();
  }

  private assertFormat(): void {
    const format = this.root.getAttr('tree:format');
    if (format === undefined) {
      invariant(this.root.length === 0, '@lexical/y: missing document format');
      this.doc.transact(
        () =>
          this.root.setAttr('tree:format', {schema: this.schemaId, version: 1}),
        this.bootstrapOrigin,
      );
    } else {
      invariant(
        format && format.version === 1 && format.schema === this.schemaId,
        '@lexical/y: incompatible document format or application schema',
      );
    }
  }

  bootstrap(initialize: () => void): void {
    readTopology(this);
    if (getChildren(this, this.root).length !== 0) return;
    this.editor.update(
      () => {
        if (getChildren(this, this.root).length === 0) initialize();
      },
      {discrete: true, tag: SKIP_COLLAB_TAG},
    );
    this.editor.read('latest', () => {
      this.doc.transact(() => {
        $writeElement(this.root, $getRoot(), this);
        readTopology(this);
        this.selection = $getYSelection(this);
      }, this.bootstrapOrigin);
    });
  }

  private pruneMapping(): void {
    for (const key of this.pendingSharedOwners.keys()) {
      if (!this.mapping.types.has(key)) this.pendingSharedOwners.delete(key);
    }
    for (const key of this.sharedOwners.keys()) {
      if (!this.mapping.types.has(key)) this.sharedOwners.delete(key);
    }
    for (const type of this.mapping.nodes.keys()) {
      if (type !== this.root && !this.parents.has(type)) {
        this.mapping.delete(type);
        this.attributeCache.delete(type);
      }
    }
  }
}
