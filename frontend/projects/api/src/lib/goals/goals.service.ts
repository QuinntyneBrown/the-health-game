import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { GoalSummary, WeekDay } from '../models/goal-summary.model';
import { CreateGoalInput, IGoalsService, UpdateGoalInput } from './goals.service.contract';

@Injectable({ providedIn: 'root' })
export class GoalsService implements IGoalsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_CONFIG).apiBaseUrl;

  getGoalSummaries(): Observable<readonly GoalSummary[]> {
    return this.getGoals();
  }

  getGoals(): Observable<readonly GoalSummary[]> {
    return this.http
      .get<readonly GoalDto[]>(`${this.apiBaseUrl}/api/goals`)
      .pipe(map((goals) => goals.map(mapGoal)));
  }

  getGoal(id: string): Observable<GoalSummary> {
    return this.http.get<GoalDto>(`${this.apiBaseUrl}/api/goals/${id}`).pipe(map(mapGoal));
  }

  createGoal(input: CreateGoalInput): Observable<GoalSummary> {
    return this.http
      .post<GoalDto>(`${this.apiBaseUrl}/api/goals`, toGoalRequest(input))
      .pipe(map(mapGoal));
  }

  updateGoal(id: string, input: UpdateGoalInput): Observable<GoalSummary> {
    return this.http
      .put<GoalDto>(`${this.apiBaseUrl}/api/goals/${id}`, toGoalRequest(input))
      .pipe(map(mapGoal));
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/goals/${id}`);
  }
}

interface GoalDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly targetQuantity: number;
  readonly targetUnit: string;
  readonly cadence: {
    readonly type: number | string;
    readonly interval: number;
  };
  readonly timeZoneId: string;
  readonly weekStartsOn: number | string;
  readonly streak: {
    readonly currentStreak: number;
    readonly longestStreak: number;
  };
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string | null;
}

interface GoalRequest {
  readonly name: string;
  readonly description: string | null;
  readonly targetQuantity: number;
  readonly targetUnit: string;
  readonly cadence: {
    readonly type: number;
    readonly interval: number;
  };
  readonly timeZoneId: string;
  readonly weekStartsOn: number;
}

function toGoalRequest(input: CreateGoalInput): GoalRequest {
  const cadence = toBackendCadence(input);

  return {
    name: input.name,
    description: input.description ?? null,
    targetQuantity: input.target.value,
    targetUnit: input.target.unit,
    cadence,
    timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    weekStartsOn: toBackendWeekDay(input.weekStart ?? 'monday'),
  };
}

function toBackendCadence(input: CreateGoalInput): GoalRequest['cadence'] {
  if (input.cadence === 'custom') {
    const custom = input.customInterval ?? { count: 1, unit: 'days' };

    return {
      type: custom.unit === 'hours' ? 5 : 6,
      interval: custom.count,
    };
  }

  const type = {
    hourly: 1,
    daily: 2,
    weekly: 3,
    monthly: 4,
  } satisfies Record<Exclude<CreateGoalInput['cadence'], 'custom'>, number>;

  return {
    type: type[input.cadence],
    interval: 1,
  };
}

function toBackendWeekDay(day: NonNullable<CreateGoalInput['weekStart']>): number {
  return {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }[day];
}

function mapGoal(dto: GoalDto): GoalSummary {
  const cadence = mapCadence(dto.cadence.type);
  const targetValue = Number(dto.targetQuantity);

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    cadence,
    target: {
      value: targetValue,
      unit: dto.targetUnit,
    },
    completedQuantity: 0,
    currentStreak: dto.streak.currentStreak,
    longestStreak: dto.streak.longestStreak,
    rewardName: '',
    timeZoneId: dto.timeZoneId,
    weekStartsOn: mapWeekDay(dto.weekStartsOn),
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc,
  };
}

function mapCadence(type: number | string): GoalSummary['cadence'] {
  const normalized = typeof type === 'string' ? type.toLowerCase() : type;

  switch (normalized) {
    case 1:
    case 'hourly':
      return 'hourly';
    case 2:
    case 'daily':
      return 'daily';
    case 3:
    case 'weekly':
      return 'weekly';
    case 4:
    case 'monthly':
      return 'monthly';
    default:
      return 'custom';
  }
}

function mapWeekDay(day: number | string): WeekDay {
  const normalized = typeof day === 'string' ? day.toLowerCase() : day;

  switch (normalized) {
    case 0:
    case 'sunday':
      return 'sunday';
    case 1:
    case 'monday':
      return 'monday';
    case 2:
    case 'tuesday':
      return 'tuesday';
    case 3:
    case 'wednesday':
      return 'wednesday';
    case 4:
    case 'thursday':
      return 'thursday';
    case 5:
    case 'friday':
      return 'friday';
    case 6:
    case 'saturday':
      return 'saturday';
    default:
      return 'monday';
  }
}
