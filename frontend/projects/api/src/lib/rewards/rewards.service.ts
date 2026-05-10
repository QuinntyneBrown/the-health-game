import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { Reward } from './reward.model';
import {
  CreateRewardInput,
  IRewardsService,
  UpdateRewardInput,
} from './rewards.service.contract';

@Injectable({ providedIn: 'root' })
export class RewardsService implements IRewardsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_CONFIG).apiBaseUrl;

  createReward(goalId: string, input: CreateRewardInput): Observable<Reward> {
    return this.http.post<Reward>(`${this.apiBaseUrl}/api/goals/${goalId}/rewards`, input);
  }

  getRewards(): Observable<readonly Reward[]> {
    return this.http.get<readonly Reward[]>(`${this.apiBaseUrl}/api/rewards`);
  }

  claimReward(rewardId: string): Observable<Reward> {
    return this.http.post<Reward>(`${this.apiBaseUrl}/api/rewards/${rewardId}/claim`, {});
  }

  getReward(rewardId: string): Observable<Reward> {
    return this.http.get<Reward>(`${this.apiBaseUrl}/api/rewards/${rewardId}`);
  }

  updateReward(rewardId: string, input: UpdateRewardInput): Observable<Reward> {
    return this.http.put<Reward>(`${this.apiBaseUrl}/api/rewards/${rewardId}`, input);
  }
}
