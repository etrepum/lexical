/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {CreateEditorArgs, EditorState, LexicalEditor} from 'lexical';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlan = LexicalPlan<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlanArgument = LexicalPlanArgument<any>;
export type PlanConfigBase = Record<never, never>;

type NormalizedLexicalPlanArgument<Config extends PlanConfigBase> = [
  LexicalPlan<Config>,
  Config,
  ...Config[],
];

export type LexicalPlanArgument<Config extends PlanConfigBase> =
  | LexicalPlan<Config>
  | NormalizedLexicalPlanArgument<Config>;

export interface LexicalPlan<
  Config extends PlanConfigBase = Record<string, never>,
> {
  name: string;
  conflictsWith?: string[];
  dependencies?: AnyLexicalPlanArgument[];

  disableEvents?: CreateEditorArgs['disableEvents'];
  parentEditor?: CreateEditorArgs['parentEditor'];
  namespace?: CreateEditorArgs['namespace'];
  nodes?: CreateEditorArgs['nodes'];
  theme?: CreateEditorArgs['theme'];
  html?: CreateEditorArgs['html'];
  editable?: CreateEditorArgs['editable'];

  onError?: (error: Error, editor: LexicalEditor) => void;
  $initialEditorState?: InitialEditorStateType;
  config: Config;
  mergeConfig?: (a: Config, b?: Partial<Config>) => Config;
  register?: (editor: LexicalEditor, config: Config) => () => void;
  // TODO decorate protocol
}

export type LexicalPlanConfig<Plan extends AnyLexicalPlan> =
  Plan extends LexicalPlan<infer Config> ? Config : never;

export interface EditorHandle {
  editor: LexicalEditor;
  dispose: () => void;
}

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void);
