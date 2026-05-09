import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { GoalCadence, GoalSummary, GoalTarget } from '../models/goal-summary.model';

export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type CustomIntervalUnit = 'hours' | 'days';

export interface CustomInterval {
  readonly count: number;
  readonly unit: CustomIntervalUnit;
}

export interface CreateGoalInput {
  readonly name: string;
  readonly cadence: GoalCadence;
  readonly target: GoalTarget;
  readonly weekStart?: WeekDay;
  readonly customInterval?: CustomInterval;
}

export interface IGoalsService {
  getGoalSummaries(): Observable<readonly GoalSummary[]>;
  getGoals(): Observable<readonly GoalSummary[]>;
  createGoal(input: CreateGoalInput): Observable<GoalSummary>;
}

export const GOALS_SERVICE = new InjectionToken<IGoalsService>('GOALS_SERVICE');
