import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { GoalSummary } from '../models/goal-summary.model';
import { IGoalsService } from './goals.service.contract';

const goalSummaries: readonly GoalSummary[] = [
  {
    id: 'hydrate',
    name: 'Hydrate',
    description: 'Drink enough water before the day closes.',
    cadence: 'daily',
    target: {
      value: 8,
      unit: 'cups',
    },
    completedQuantity: 6,
    currentStreak: 12,
    longestStreak: 18,
    rewardName: 'Trail breakfast',
  },
  {
    id: 'walk',
    name: 'Walk outside',
    description: 'Get outside and move with intention.',
    cadence: 'daily',
    target: {
      value: 30,
      unit: 'minutes',
    },
    completedQuantity: 30,
    currentStreak: 7,
    longestStreak: 14,
    rewardName: 'New playlist',
  },
  {
    id: 'mobility',
    name: 'Mobility reset',
    description: 'Keep the weekly mobility habit alive.',
    cadence: 'weekly',
    target: {
      value: 3,
      unit: 'sessions',
    },
    completedQuantity: 1,
    currentStreak: 4,
    longestStreak: 9,
    rewardName: 'Recovery hour',
  },
];

@Injectable()
export class GoalsService implements IGoalsService {
  getGoalSummaries(): Observable<readonly GoalSummary[]> {
    return of(goalSummaries);
  }
}
