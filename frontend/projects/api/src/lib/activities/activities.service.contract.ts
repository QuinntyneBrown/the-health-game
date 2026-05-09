import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityEntry } from './activity-entry.model';

export interface LogActivityInput {
  readonly quantity: number;
  readonly notes?: string;
  readonly recordedAt?: string;
}

export interface IActivitiesService {
  logActivity(goalId: string, input: LogActivityInput): Observable<ActivityEntry>;
  getGoalActivities(goalId: string): Observable<readonly ActivityEntry[]>;
}

export const ACTIVITIES_SERVICE = new InjectionToken<IActivitiesService>('ACTIVITIES_SERVICE');
