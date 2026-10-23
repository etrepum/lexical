/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {TEXT_TYPE_TO_FORMAT} from 'lexical';

import {type Attributes} from './Schema';

const FORMAT_PREFIX = 'p:format:';

/** Each bit merges independently, so concurrent bold and italic both survive. */
export function encodeTextFormats(attributes: Attributes): Attributes {
  const result = {...attributes};
  const format = result['p:format'];
  if (typeof format === 'number') {
    delete result['p:format'];
    for (const bit of Object.values(TEXT_TYPE_TO_FORMAT))
      if (format & bit) result[FORMAT_PREFIX + bit] = true;
  }
  return result;
}

export function decodeTextFormats(attributes: Attributes): Attributes {
  const result = {...attributes};
  let format = typeof result['p:format'] === 'number' ? result['p:format'] : 0;
  for (const bit of Object.values(TEXT_TYPE_TO_FORMAT)) {
    const key = FORMAT_PREFIX + bit;
    if (key in result) {
      if (result[key]) format |= bit;
      else format &= ~bit;
      delete result[key];
    }
  }
  if (format) result['p:format'] = format;
  else delete result['p:format'];
  return result;
}

/** Keys this reader understands; fields from newer writers remain untouched. */
export function isTextFormatKey(key: string): boolean {
  return Object.values(TEXT_TYPE_TO_FORMAT).some(
    bit => key === FORMAT_PREFIX + bit,
  );
}
