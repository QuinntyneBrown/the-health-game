// Acceptance Test
// Traces to: L2-018, L2-019
// Description: Measures API response-time targets, concurrent-user error rate, frontend LCP, route code-splitting, and interaction blocking budgets.
import { expect, test } from '@playwright/test';

import { DashboardPage, GoalInput, GoalsListPage, HealthGameApi, SourceCodeInspector } from '../pages';

test.describe('performance targets', () => {
  test('L2-018 keeps goal-list read p95 at or below 300ms for up to 100 goals', async ({ request }) => {
    const api = new HealthGameApi(request);
    const userId = unique('perf-read');

    for (let index = 0; index < 100; index += 1) {
      const response = await api.createGoal(userId, validGoal(`Perf read ${index}`));
      api.expectStatus(response, [200, 201]);
    }

    const timings = await measure(20, async () => {
      const response = await api.getGoals(userId);
      api.expectStatus(response, 200);
    });

    expect(percentile(timings, 95)).toBeLessThanOrEqual(300);
  });

  test('L2-018 keeps create and update p95 at or below 500ms', async ({ request }) => {
    const api = new HealthGameApi(request);
    const userId = unique('perf-write');
    const createTimings = await measure(10, async (index) => {
      const response = await api.createGoal(userId, validGoal(`Perf write ${index}`));
      api.expectStatus(response, [200, 201]);
    });
    const goalResponse = await api.createGoal(userId, validGoal('Perf update target'));
    api.expectStatus(goalResponse, [200, 201]);
    const goal = (await goalResponse.json()) as { id: string };
    const updateTimings = await measure(10, async (index) => {
      const response = await api.updateGoal(userId, goal.id, validGoal(`Perf updated ${index}`));
      api.expectStatus(response, 200);
    });

    expect(percentile(createTimings, 95)).toBeLessThanOrEqual(500);
    expect(percentile(updateTimings, 95)).toBeLessThanOrEqual(500);
  });

  test('L2-018 supports 100 concurrent authenticated users below 1 percent error rate', async ({ request }) => {
    const api = new HealthGameApi(request);
    const responses = await Promise.all(
      Array.from({ length: 100 }, async (_, index) => {
        const userId = unique(`perf-concurrent-${index}`);
        const goalResponse = await api.createGoal(userId, validGoal(`Concurrent goal ${index}`));
        if (!goalResponse.ok()) {
          return goalResponse.status();
        }

        const goal = (await goalResponse.json()) as { id: string };
        const activityResponse = await api.logActivity(userId, goal.id, {
          quantity: '30',
          notes: `concurrent ${index}`,
        });
        return activityResponse.status();
      }),
    );
    const errorRate = responses.filter((status) => status >= 500 || status === 429).length / responses.length;

    expect(errorRate).toBeLessThan(0.01);
  });

  test('L2-019 keeps mobile cold-load LCP and interaction TBT within budgets', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.authenticateAs(unique('frontend-perf'));
    await dashboard.setViewport(390, 844);
    await dashboard.emulateMobile4G();
    await dashboard.goto();

    const metrics = await dashboard.loadPerformanceMetrics();
    expect(metrics.lcp).toBeLessThanOrEqual(2_500);
    expect(metrics.totalBlockingTime).toBeLessThanOrEqual(200);
  });

  test('L2-019 lazy-loads route-level frontend chunks', async () => {
    new SourceCodeInspector().expectRouteLevelLazyLoading();
  });

  test('L2-019 keeps interactions responsive on goal-list controls', async ({ page }) => {
    const goals = new GoalsListPage(page);

    await goals.authenticateAs(unique('interaction-perf'));
    await goals.goto();
    const before = await goals.loadPerformanceMetrics();
    await goals.createGoal(validGoal('Interaction budget goal'));
    const after = await goals.loadPerformanceMetrics();

    expect(after.totalBlockingTime - before.totalBlockingTime).toBeLessThanOrEqual(200);
  });
});

async function measure(iterations: number, operation: (index: number) => Promise<void>): Promise<readonly number[]> {
  const timings: number[] = [];

  for (let index = 0; index < iterations; index += 1) {
    const startedAt = performance.now();
    await operation(index);
    timings.push(performance.now() - startedAt);
  }

  return timings;
}

function percentile(values: readonly number[], percentileValue: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function validGoal(name: string, overrides: Partial<GoalInput> = {}): GoalInput {
  return {
    name,
    description: 'Performance acceptance goal',
    targetValue: '30',
    targetUnit: 'minutes',
    cadence: 'daily',
    ...overrides,
  };
}

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
