/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalPlan} from './types';
import type {LexicalEditor} from 'lexical';

import {
  LexicalComposerContext,
  type LexicalComposerContextWithEditor,
} from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';

import {canShowPlaceholder} from './registerShowPlaceholder';
import {type ErrorBoundaryType, useReactDecorators} from './useReactDecorators';
import {useRegisterSubscription} from './useRegisterSubscription';

export interface EditorComponentProps {
  children?: ((editor: LexicalEditor) => React.ReactNode) | React.ReactNode;
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  contentEditable: JSX.Element | null;
  ErrorBoundary: ErrorBoundaryType;
}

export interface ReactConfig {
  contentEditable: JSX.Element | null;
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  ErrorBoundary: ErrorBoundaryType;
  setComposerContext: (context: LexicalComposerContextWithEditor) => void;
  setComponent: (
    component: (props: Partial<EditorComponentProps>) => JSX.Element,
  ) => void;
}

function notImplemented() {}

export const ReactPlan: LexicalPlan<ReactConfig> = {
  config: {
    ErrorBoundary: LexicalErrorBoundary,
    contentEditable: <ContentEditable />,
    placeholder: null,
    setComponent: notImplemented,
    setComposerContext: notImplemented,
  },
  name: '@lexical/builder/ReactPlan',
  register(editor, config) {
    const context: LexicalComposerContextWithEditor = [
      editor,
      {getTheme: () => editor._config.theme},
    ];
    config.setComposerContext(context);
    config.setComponent(buildEditorComponent(context, config));
    return () => {};
  },
};

function buildEditorComponent(
  context: LexicalComposerContextWithEditor,
  config: ReactConfig,
) {
  return function EditorComponent(props: Partial<EditorComponentProps>) {
    const [editor] = context;
    const {
      ErrorBoundary = config.ErrorBoundary,
      contentEditable = config.contentEditable,
      placeholder = config.placeholder,
      children,
    } = props;
    const decorators = useReactDecorators(editor, ErrorBoundary);
    return (
      <LexicalComposerContext.Provider value={context}>
        {contentEditable}
        {placeholder && <Placeholder content={placeholder} />}
        {typeof children === 'function' ? children(editor) : children}
        {decorators}
      </LexicalComposerContext.Provider>
    );
  };
}

function WithEditable({
  content,
}: {
  content: (isEditable: boolean) => null | JSX.Element;
}) {
  return content(useLexicalEditable());
}

function Placeholder({
  content,
}: {
  content: ((isEditable: boolean) => null | JSX.Element) | JSX.Element;
}): null | JSX.Element {
  const showPlaceholder = useRegisterSubscription(canShowPlaceholder);
  if (!showPlaceholder) {
    return null;
  } else if (typeof content === 'function') {
    return <WithEditable content={content} />;
  } else {
    return content;
  }
}
