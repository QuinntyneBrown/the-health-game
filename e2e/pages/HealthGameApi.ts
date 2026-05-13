import { APIRequestContext, APIResponse, expect } from '@playwright/test';

import { ActivityInput, GoalInput, RewardInput } from './BasePage';

export interface UserCredentials {
  readonly usernameOrEmail: string;
  readonly password: string;
}

export interface RegistrationInput extends UserCredentials {
  readonly displayName: string;
  readonly email: string;
}

export class HealthGameApi {
  private readonly apiBaseUrl = process.env['E2E_API_BASE_URL'] ?? 'http://localhost:5224';

  constructor(private readonly request: APIRequestContext) {}

  async register(input: RegistrationInput): Promise<APIResponse> {
    return this.request.post(this.url('/api/auth/register'), { data: input });
  }

  async signIn(credentials: UserCredentials): Promise<APIResponse> {
    return this.request.post(this.url('/api/auth/sign-in'), { data: credentials });
  }

  async refresh(refreshToken: string): Promise<APIResponse> {
    return this.request.post(this.url('/api/auth/refresh'), { data: { refreshToken } });
  }

  async getCurrentUser(userId: string, roles: readonly string[] = ['User']): Promise<APIResponse> {
    return this.request.get(this.url('/api/users/me'), { headers: this.authHeaders(userId, roles) });
  }

  async getCurrentUserWithCorrelation(userId: string, correlationId: string): Promise<APIResponse> {
    return this.request.get(this.url('/api/users/me'), {
      headers: {
        ...this.authHeaders(userId),
        'X-Correlation-ID': correlationId,
      },
    });
  }

  async updateCurrentUser(userId: string, data: { displayName: string; email: string }): Promise<APIResponse> {
    return this.request.put(this.url('/api/users/me'), { data, headers: this.authHeaders(userId) });
  }

  async deleteCurrentUser(userId: string): Promise<APIResponse> {
    return this.request.delete(this.url('/api/users/me'), { headers: this.authHeaders(userId) });
  }

  async createGoal(userId: string, goal: GoalInput): Promise<APIResponse> {
    return this.request.post(this.url('/api/goals'), {
      data: this.goalPayload(goal),
      headers: this.authHeaders(userId),
    });
  }

  async getGoals(userId: string): Promise<APIResponse> {
    return this.request.get(this.url('/api/goals'), { headers: this.authHeaders(userId) });
  }

  async getGoal(userId: string, goalId: string): Promise<APIResponse> {
    return this.request.get(this.url(`/api/goals/${goalId}`), { headers: this.authHeaders(userId) });
  }

  async updateGoal(userId: string, goalId: string, goal: GoalInput): Promise<APIResponse> {
    return this.request.put(this.url(`/api/goals/${goalId}`), {
      data: this.goalPayload(goal),
      headers: this.authHeaders(userId),
    });
  }

  async deleteGoal(userId: string, goalId: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/api/goals/${goalId}`), { headers: this.authHeaders(userId) });
  }

  async createGoalWithoutAuth(goal: GoalInput): Promise<APIResponse> {
    return this.request.post(this.url('/api/goals'), { data: this.goalPayload(goal) });
  }

  async createGoalFromCrossSiteOrigin(userId: string, goal: GoalInput): Promise<APIResponse> {
    return this.request.post(this.url('/api/goals'), {
      data: this.goalPayload(goal),
      headers: {
        ...this.authHeaders(userId),
        Origin: 'https://attacker.example',
      },
    });
  }

  async logActivity(userId: string, goalId: string, activity: ActivityInput): Promise<APIResponse> {
    return this.request.post(this.url(`/api/goals/${goalId}/activities`), {
      data: this.activityPayload(activity),
      headers: this.authHeaders(userId),
    });
  }

  async getActivities(userId: string, goalId: string): Promise<APIResponse> {
    return this.request.get(this.url(`/api/goals/${goalId}/activities`), { headers: this.authHeaders(userId) });
  }

  async updateActivity(userId: string, goalId: string, activityId: string, activity: ActivityInput): Promise<APIResponse> {
    return this.request.put(this.url(`/api/goals/${goalId}/activities/${activityId}`), {
      data: this.activityPayload(activity),
      headers: this.authHeaders(userId),
    });
  }

  async deleteActivity(userId: string, goalId: string, activityId: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/api/goals/${goalId}/activities/${activityId}`), {
      headers: this.authHeaders(userId),
    });
  }

  async createReward(userId: string, goalId: string, reward: RewardInput): Promise<APIResponse> {
    return this.request.post(this.url(`/api/goals/${goalId}/rewards`), {
      data: this.rewardPayload(reward),
      headers: this.authHeaders(userId),
    });
  }

  async getRewards(userId: string): Promise<APIResponse> {
    return this.request.get(this.url('/api/rewards'), { headers: this.authHeaders(userId) });
  }

  async getAdminAuditLog(userId: string, roles: readonly string[] = ['Admin']): Promise<APIResponse> {
    return this.request.get(this.url('/api/admin/audit-log'), { headers: this.authHeaders(userId, roles) });
  }

  async getAdminUsers(userId: string, roles: readonly string[] = ['User']): Promise<APIResponse> {
    return this.request.get(this.url('/api/admin/users'), { headers: this.authHeaders(userId, roles) });
  }

  async advanceTestClock(userId: string, nowUtc: string): Promise<APIResponse> {
    return this.request.post(this.url('/api/test/clock'), {
      data: { nowUtc },
      headers: this.authHeaders(userId, ['Admin']),
    });
  }

  async malformedPost(path: string, userId: string, data: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), {
      data,
      headers: this.authHeaders(userId),
    });
  }

  async expiredTokenRequest(path = '/api/users/me'): Promise<APIResponse> {
    return this.request.get(this.url(path), {
      headers: { Authorization: 'Bearer expired.jwt.token' },
    });
  }

  async invalidTokenRequest(path = '/api/users/me'): Promise<APIResponse> {
    return this.request.get(this.url(path), {
      headers: { Authorization: 'Bearer not-a-valid-token' },
    });
  }

  async plainHttpNonLocalRequest(host = 'http://healthgame.invalid/api/users/me'): Promise<APIResponse> {
    return this.request.get(host, { failOnStatusCode: false, timeout: 5_000 });
  }

  expectStatus(response: APIResponse, expected: number | readonly number[]): void {
    const allowed = Array.isArray(expected) ? expected : [expected];
    expect(allowed, `Unexpected status ${response.status()} from ${response.url()}`).toContain(response.status());
  }

  async expectStructuredError(response: APIResponse): Promise<void> {
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        title: expect.any(String),
        status: response.status(),
      }),
    );
  }

  async expectNoSecretsInJson(response: APIResponse): Promise<void> {
    const text = await response.text();
    expect(text).not.toMatch(/password|refresh[_-]?token|reset[_-]?token|client[_-]?secret/i);
  }

  async expectResponseTimeLessThan(
    operation: () => Promise<APIResponse>,
    maxMilliseconds: number,
  ): Promise<APIResponse> {
    const startedAt = performance.now();
    const response = await operation();
    const elapsed = performance.now() - startedAt;
    expect(elapsed).toBeLessThanOrEqual(maxMilliseconds);
    return response;
  }

  authHeaders(userId: string, roles: readonly string[] = ['User']): Record<string, string> {
    return {
      Authorization: `Bearer e2e-${userId}`,
      'X-E2E-User': userId,
      'X-E2E-Email': `${userId}@example.test`,
      'X-E2E-Name': userId,
      'X-E2E-Roles': roles.join(','),
    };
  }

  private goalPayload(goal: GoalInput): Record<string, unknown> {
    return {
      name: goal.name,
      description: goal.description ?? '',
      target: {
        value: Number(goal.targetValue),
        unit: goal.targetUnit,
      },
      cadence:
        goal.cadence === 'custom'
          ? {
              type: 'custom',
              interval: Number(goal.customIntervalValue),
              intervalUnit: goal.customIntervalUnit,
            }
          : goal.cadence,
    };
  }

  private activityPayload(activity: ActivityInput): Record<string, unknown> {
    return {
      quantity: Number(activity.quantity),
      recordedAt: activity.recordedAt ?? new Date().toISOString(),
      notes: activity.notes ?? '',
    };
  }

  private rewardPayload(reward: RewardInput): Record<string, unknown> {
    return {
      name: reward.name,
      description: reward.description ?? '',
      condition:
        reward.conditionType === 'streak'
          ? {
              type: 'streak',
              threshold: Number(reward.streakThreshold),
            }
          : {
              type: 'goal-target',
            },
    };
  }

  private url(path: string): string {
    return new URL(path, this.apiBaseUrl).toString();
  }
}
