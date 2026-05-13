import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityEntry } from './activity-entry.model';

export interface LogActivityInput {
  readonly quantity: number;
  readonly notes?: string;
  readonly recordedAt?: string;
}

export type UpdateActivityInput = LogActivityInput;

export interface IActivitiesService {
  logActivity(goalId: string, input: LogActivityInput): Observable<ActivityEntry>;
  getGoalActivities(goalId: string): Observable<readonly ActivityEntry[]>;
  updateActivityEntry(
    goalId: string,
    activityEntryId: string,
    input: UpdateActivityInput,
  ): Observable<ActivityEntry>;
  deleteActivityEntry(goalId: string, activityEntryId: string): Observable<void>;
}

export const ACTIVITIES_SERVICE = new InjectionToken<IActivitiesService>('ACTIVITIES_SERVICE');
