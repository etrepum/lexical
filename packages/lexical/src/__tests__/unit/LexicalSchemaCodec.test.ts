/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import {
  createEditor,
  ElementNode,
  getNodeSchemaCodec,
  type LexicalUpdateJSON,
  type SerializedElementNode,
} from 'lexical';
import {expect, test, vi} from 'vitest';

class CustomJSONNode extends ElementNode {
  $config() {
    return this.config('custom-json-codec-test', {extends: ElementNode});
  }
  updateFromJSON(json: LexicalUpdateJSON<SerializedElementNode>): this {
    return super.updateFromJSON(json);
  }
}

test('schema integrations warn once about custom JSON overrides', () => {
  const onWarn = vi.fn();
  const editor = createEditor({nodes: [CustomJSONNode], onWarn});
  const codec = getNodeSchemaCodec(editor);
  codec.validate(CustomJSONNode);
  codec.validate(CustomJSONNode);
  expect(onWarn).toHaveBeenCalledTimes(1);
  expect(onWarn.mock.calls[0][0].message).toMatch(
    /Schema integrations ignore these overrides/,
  );
  expect(codec.nodes.get('custom-json-codec-test')!.klass).toBe(CustomJSONNode);
});
