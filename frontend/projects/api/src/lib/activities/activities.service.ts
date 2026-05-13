import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

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
    return this.http
      .post<ActivityEntryDto>(
        `${this.apiBaseUrl}/api/goals/${goalId}/activities`,
        toActivityRequest(input),
      )
      .pipe(map(mapActivity));
  }

  getGoalActivities(goalId: string): Observable<readonly ActivityEntry[]> {
    return this.http
      .get<readonly ActivityEntryDto[]>(`${this.apiBaseUrl}/api/goals/${goalId}/activities`)
      .pipe(map((entries) => entries.map(mapActivity)));
  }

  updateActivityEntry(
    goalId: string,
    activityEntryId: string,
    input: UpdateActivityInput,
  ): Observable<ActivityEntry> {
    return this.http
      .put<ActivityEntryDto>(
        `${this.apiBaseUrl}/api/goals/${goalId}/activities/${activityEntryId}`,
        toUpdateActivityRequest(input),
      )
      .pipe(map(mapActivity));
  }

  deleteActivityEntry(goalId: string, activityEntryId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/api/goals/${goalId}/activities/${activityEntryId}`,
    );
  }
}

interface ActivityEntryDto {
  readonly id: string;
  readonly goalId: string;
  readonly occurredAtUtc: string;
  readonly quantity: number;
  readonly notes: string | null;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string | null;
}

interface ActivityRequest {
  readonly occurredAtUtc: string;
  readonly quantity: number;
  readonly notes: string | null;
}

interface UpdateActivityRequest {
  readonly quantity: number;
  readonly notes: string | null;
}

function toActivityRequest(input: LogActivityInput): ActivityRequest {
  return {
    occurredAtUtc: input.recordedAt ?? new Date().toISOString(),
    quantity: input.quantity,
    notes: input.notes ?? null,
  };
}

function toUpdateActivityRequest(input: UpdateActivityInput): UpdateActivityRequest {
  return {
    quantity: input.quantity,
    notes: input.notes ?? null,
  };
}

function mapActivity(dto: ActivityEntryDto): ActivityEntry {
  return {
    id: dto.id,
    goalId: dto.goalId,
    quantity: Number(dto.quantity),
    notes: dto.notes,
    recordedAt: dto.occurredAtUtc,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc,
  };
}
