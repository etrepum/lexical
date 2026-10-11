/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Keep the binding entry point bundled; only the optional table adapter is a subpath.
import {YExtension} from './YExtension';

export {
  $getYNodeReference,
  $getYSelection,
  $resolveYNodeReference,
  $resolveYSelection,
  isYNodeReference,
  registerYSelectionCodec,
  type YNodeReference,
  type YSelection,
  type YSelectionCodec,
} from './Selection';
export {
  type YAttributionConfig,
  YAttributionExtension,
} from './YAttributionExtension';
export {
  type YAwareness,
  type YAwarenessConfig,
  YAwarenessExtension,
  type YPresence,
  type YUser,
} from './YAwarenessExtension';
export {type YBinding} from './YBinding';
export {
  type YCursorContext,
  type YCursorsConfig,
  YCursorsExtension,
} from './YCursorsExtension';

export {YExtension};
export {type YConfig} from './YExtension';
export {YHistoryExtension} from './YHistoryExtension';
export {
  type YProvider,
  type YProviderConfig,
  YProviderExtension,
} from './YProviderExtension';
export {
  type YSuggestion,
  type YSuggestionsConfig,
  YSuggestionsExtension,
} from './YSuggestionsExtension';
export {
  compareYCheckpoints,
  createYDocumentView,
  type YCheckpoint,
  type YDocumentView,
  YVersionsExtension,
} from './YVersionsExtension';
