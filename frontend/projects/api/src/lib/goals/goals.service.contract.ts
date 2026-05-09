import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { GoalSummary } from '../models/goal-summary.model';

export interface IGoalsService {
  getGoalSummaries(): Observable<readonly GoalSummary[]>;
  getGoals(): Observable<readonly GoalSummary[]>;
}

export const GOALS_SERVICE = new InjectionToken<IGoalsService>('GOALS_SERVICE');
