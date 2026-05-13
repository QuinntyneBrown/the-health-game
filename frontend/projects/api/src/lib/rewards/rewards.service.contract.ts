import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Reward, RewardCondition } from './reward.model';

export interface CreateRewardInput {
  readonly name: string;
  readonly description: string;
  readonly condition: RewardCondition;
}

export interface UpdateRewardInput {
  readonly name: string;
  readonly description: string;
}

export interface IRewardsService {
  createReward(goalId: string, input: CreateRewardInput): Observable<Reward>;
  getRewards(): Observable<readonly Reward[]>;
  getGoalRewards(goalId: string): Observable<readonly Reward[]>;
  getReward(rewardId: string): Observable<Reward>;
  updateReward(rewardId: string, input: UpdateRewardInput): Observable<Reward>;
  deleteReward(rewardId: string): Observable<void>;
  claimReward(rewardId: string): Observable<Reward>;
}

export const REWARDS_SERVICE = new InjectionToken<IRewardsService>('REWARDS_SERVICE');
