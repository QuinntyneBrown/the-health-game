import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../api.config';
import {
  IActivitiesService,
  LogActivityInput,
  UpdateActivityInput,
} from './activities.service.contract';
import { ActivityEntry } from './activity-entry.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService implements IActivitiesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_CONFIG).apiBaseUrl;

  logActivity(goalId: string, input: LogActivityInput): Observable<ActivityEntry> {
    return this.http.post<ActivityEntry>(
      `${this.apiBaseUrl}/api/goals/${goalId}/activities`,
      input,
    );
  }

  getGoalActivities(goalId: string): Observable<readonly ActivityEntry[]> {
    return this.http.get<readonly ActivityEntry[]>(
      `${this.apiBaseUrl}/api/goals/${goalId}/activities`,
    );
  }

  updateActivityEntry(id: string, input: UpdateActivityInput): Observable<ActivityEntry> {
    return this.http.put<ActivityEntry>(`${this.apiBaseUrl}/api/activities/${id}`, input);
  }

  deleteActivityEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/activities/${id}`);
  }
}
