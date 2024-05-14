/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {AnyLexicalPlan, LexicalPlanConfig} from './types';

import {shallowMergeConfig} from './shallowMergeConfig';

export class PlanRep<Plan extends AnyLexicalPlan> {
  configs: Set<LexicalPlanConfig<Plan>>;
  _config?: LexicalPlanConfig<Plan>;
  plan: Plan;
  constructor(plan: Plan) {
    this.plan = plan;
    this.configs = new Set();
  }
  getConfig(): LexicalPlanConfig<Plan> {
    if (this._config) {
      return this._config;
    }
    let config = this.plan.config;
    const mergeConfig = this.plan.mergeConfig
      ? this.plan.mergeConfig.bind(this.plan)
      : shallowMergeConfig;
    for (const cfg of this.configs) {
      config = mergeConfig(config, cfg);
    }
    this._config = config;
    return config;
  }
}
