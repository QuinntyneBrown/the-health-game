import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Reward, RewardCondition } from './reward.model';

export interface CreateRewardInput {
  readonly name: string;
  readonly description: string;
  readonly condition: RewardCondition;
}

export interface IRewardsService {
  createReward(goalId: string, input: CreateRewardInput): Observable<Reward>;
  getRewards(): Observable<readonly Reward[]>;
}

export const REWARDS_SERVICE = new InjectionToken<IRewardsService>('REWARDS_SERVICE');
