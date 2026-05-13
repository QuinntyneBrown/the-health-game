import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

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
    return this.http
      .post<RewardDto>(`${this.apiBaseUrl}/api/goals/${goalId}/rewards`, toRewardRequest(input))
      .pipe(map(mapReward));
  }

  getRewards(): Observable<readonly Reward[]> {
    return this.http
      .get<readonly RewardDto[]>(`${this.apiBaseUrl}/api/rewards`)
      .pipe(map((rewards) => rewards.map(mapReward)));
  }

  getGoalRewards(goalId: string): Observable<readonly Reward[]> {
    return this.http
      .get<readonly RewardDto[]>(`${this.apiBaseUrl}/api/goals/${goalId}/rewards`)
      .pipe(map((rewards) => rewards.map(mapReward)));
  }

  claimReward(rewardId: string): Observable<Reward> {
    return this.http
      .post<RewardDto>(`${this.apiBaseUrl}/api/rewards/${rewardId}/claim`, {})
      .pipe(map(mapReward));
  }

  getReward(rewardId: string): Observable<Reward> {
    return this.http.get<RewardDto>(`${this.apiBaseUrl}/api/rewards/${rewardId}`).pipe(map(mapReward));
  }

  updateReward(rewardId: string, input: UpdateRewardInput): Observable<Reward> {
    return this.http
      .put<RewardDto>(`${this.apiBaseUrl}/api/rewards/${rewardId}`, input)
      .pipe(map(mapReward));
  }

  deleteReward(rewardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/rewards/${rewardId}`);
  }
}

interface RewardDto {
  readonly id: string;
  readonly goalId: string;
  readonly name: string;
  readonly description: string | null;
  readonly condition: {
    readonly type: number | string;
    readonly requiredStreakCount: number;
  };
  readonly isEarned: boolean;
  readonly earnedAtUtc: string | null;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string | null;
}

interface RewardRequest {
  readonly name: string;
  readonly description: string | null;
  readonly condition: {
    readonly type: number;
    readonly requiredStreakCount: number;
  };
}

function toRewardRequest(input: CreateRewardInput): RewardRequest {
  return {
    name: input.name,
    description: input.description ?? null,
    condition:
      input.condition.type === 'streak-milestone'
        ? { type: 2, requiredStreakCount: input.condition.streakDays }
        : { type: 1, requiredStreakCount: 1 },
  };
}

function mapReward(dto: RewardDto): Reward {
  const isStreak =
    dto.condition.type === 2 ||
    String(dto.condition.type).toLowerCase() === 'streakmilestone';

  return {
    id: dto.id,
    goalId: dto.goalId,
    name: dto.name,
    description: dto.description ?? '',
    condition: isStreak
      ? { type: 'streak-milestone', streakDays: dto.condition.requiredStreakCount }
      : { type: 'goal-target' },
    status: dto.isEarned ? 'earned' : 'in-progress',
    earnedAt: dto.earnedAtUtc,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc,
  };
}
