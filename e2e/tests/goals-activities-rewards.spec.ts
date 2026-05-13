// Acceptance Test
// Traces to: L2-001, L2-002, L2-003, L2-004, L2-005, L2-006, L2-007, L2-008, L2-009, L2-010, L2-011, L2-012, L2-035
// Description: Exercises goal, activity, streak, cadence, and reward behaviours through Playwright page objects and API calls.
import { expect, test } from '@playwright/test';

import {
  ActivityInput,
  GoalDeletePage,
  GoalDetailPage,
  GoalFormPage,
  GoalInput,
  GoalsListPage,
  HealthGameApi,
  LogActivityPage,
  RewardFormPage,
  RewardsListPage,
} from '../pages';

test.describe('goals, activities, streaks, cadences, and rewards', () => {
  test('L2-001 creates goals and rejects invalid or unauthenticated goal creation', async ({ page, request }) => {
    const api = new HealthGameApi(request);
    const userId = unique('goals-create');
    const goal = validGoal(`Morning walk ${userId}`);
    const goals = new GoalsListPage(page);
    const form = new GoalFormPage(page);

    await goals.authenticateAs(userId);
    await goals.goto();
    await goals.createGoal(goal);
    await goals.expectGoalVisible(goal.name);

    const goalsResponse = await api.getGoals(userId);
    api.expectStatus(goalsResponse, 200);
    expect(await goalsResponse.json()).toEqual(expect.arrayContaining([expect.objectContaining({ name: goal.name })]));

    await form.authenticateAs(userId);
    await form.gotoNew();
    await form.submitGoal({ ...goal, name: '' });
    await form.expectValidationError(/name.*required|validation/i);

    const invalidTargetResponse = await api.createGoal(userId, { ...goal, name: `${goal.name} invalid`, targetValue: '0' });
    api.expectStatus(invalidTargetResponse, 400);
    await api.expectStructuredError(invalidTargetResponse);

    const unauthenticatedResponse = await api.createGoalWithoutAuth({ ...goal, name: `${goal.name} unauthenticated` });
    api.expectStatus(unauthenticatedResponse, 401);
  });

  test('L2-002 through L2-004 view, edit, cadence-change, and delete goal ownership rules', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const ownerId = unique('goal-owner');
    const otherUserId = unique('goal-other');
    const ownGoal = await createGoal(api, ownerId, validGoal(`Owner goal ${ownerId}`));
    const otherGoal = await createGoal(api, otherUserId, validGoal(`Other goal ${otherUserId}`));
    const originalActivity = await logActivity(api, ownerId, ownGoal.id, { quantity: '30', notes: 'Before cadence edit' });
    const cascadeReward = await createReward(api, ownerId, ownGoal.id, `Delete cascade reward ${ownerId}`);

    const goals = new GoalsListPage(page);
    await goals.authenticateAs(ownerId);
    await goals.goto();
    await goals.expectOnlyGoals([ownGoal.name]);

    const forbiddenRead = await api.getGoal(ownerId, otherGoal.id);
    api.expectStatus(forbiddenRead, [403, 404]);
    const forbiddenEdit = await api.updateGoal(ownerId, otherGoal.id, validGoal('Unauthorized edit'));
    api.expectStatus(forbiddenEdit, [403, 404]);
    const forbiddenDelete = await api.deleteGoal(ownerId, otherGoal.id);
    api.expectStatus(forbiddenDelete, [403, 404]);

    const updatedGoal = validGoal(`${ownGoal.name} updated`, { cadence: 'weekly' });
    const updateResponse = await api.updateGoal(ownerId, ownGoal.id, updatedGoal);
    api.expectStatus(updateResponse, 200);
    expect(await updateResponse.json()).toEqual(expect.objectContaining({ name: updatedGoal.name, cadence: 'weekly' }));

    const activitiesAfterCadenceChange = await api.getActivities(ownerId, ownGoal.id);
    api.expectStatus(activitiesAfterCadenceChange, 200);
    expect(await activitiesAfterCadenceChange.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: originalActivity.id })]),
    );

    const detail = new GoalDetailPage(page);
    await detail.authenticateAs(ownerId);
    await detail.gotoGoal(ownGoal.id);
    await detail.expectGoalSummary({
      name: updatedGoal.name,
      description: updatedGoal.description ?? '',
      target: /30.*minutes/i,
      cadence: /weekly/i,
      currentStreak: 0,
      longestStreak: 0,
    });

    const deletePage = new GoalDeletePage(page);
    await deletePage.authenticateAs(ownerId);
    await deletePage.gotoGoal(ownGoal.id);
    await deletePage.expectExplicitConfirmationRequired(updatedGoal.name);

    const deleteResponse = await api.deleteGoal(ownerId, ownGoal.id);
    api.expectStatus(deleteResponse, 204);
    const postDeleteRead = await api.getGoal(ownerId, ownGoal.id);
    api.expectStatus(postDeleteRead, [403, 404]);
    const postDeleteActivities = await api.getActivities(ownerId, ownGoal.id);
    api.expectStatus(postDeleteActivities, [403, 404]);
    const postDeleteRewards = await api.getRewards(ownerId);
    api.expectStatus(postDeleteRewards, 200);
    expect(await postDeleteRewards.json()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: cascadeReward.id })]),
    );
  });

  test('L2-005 and L2-006 log, order, edit, delete, and protect activity entries', async ({ page, request }) => {
    const api = new HealthGameApi(request);
    const ownerId = unique('activity-owner');
    const otherUserId = unique('activity-other');
    const goal = await createGoal(api, ownerId, validGoal(`Activity goal ${ownerId}`));
    const first = await logActivity(api, ownerId, goal.id, {
      quantity: '20',
      notes: 'Older activity',
      recordedAt: isoDaysAgo(2),
    });
    const second = await logActivity(api, ownerId, goal.id, {
      quantity: '35',
      notes: 'Newer activity',
      recordedAt: isoDaysAgo(1),
    });
    expect(first).toEqual(expect.objectContaining({ quantity: 20, notes: 'Older activity', recordedAt: expect.any(String) }));
    expect(second).toEqual(expect.objectContaining({ quantity: 35, notes: 'Newer activity', recordedAt: expect.any(String) }));

    const futureResponse = await api.logActivity(ownerId, goal.id, {
      quantity: '10',
      notes: 'Future activity',
      recordedAt: isoDaysFromNow(45),
    });
    api.expectStatus(futureResponse, 400);
    await api.expectStructuredError(futureResponse);

    const unauthorizedLog = await api.logActivity(otherUserId, goal.id, { quantity: '10', notes: 'Unauthorized' });
    api.expectStatus(unauthorizedLog, [403, 404]);

    const detail = new GoalDetailPage(page);
    await detail.authenticateAs(ownerId);
    await detail.gotoGoal(goal.id);
    await detail.expectActivityHistoryOrdered(['Newer activity', 'Older activity']);

    const updateResponse = await api.updateActivity(ownerId, goal.id, first.id, {
      quantity: '25',
      notes: 'Older activity updated',
      recordedAt: first.recordedAt,
    });
    api.expectStatus(updateResponse, 200);
    expect(await updateResponse.json()).toEqual(expect.objectContaining({ quantity: 25, notes: 'Older activity updated' }));
    const streakAfterUpdate = await api.getGoal(ownerId, goal.id);
    api.expectStatus(streakAfterUpdate, 200);
    expect(await streakAfterUpdate.json()).toEqual(expect.objectContaining({ currentStreak: expect.any(Number) }));

    const unauthorizedEdit = await api.updateActivity(otherUserId, goal.id, second.id, { quantity: '1', notes: 'Bad edit' });
    api.expectStatus(unauthorizedEdit, [403, 404]);
    const unauthorizedDelete = await api.deleteActivity(otherUserId, goal.id, second.id);
    api.expectStatus(unauthorizedDelete, [403, 404]);

    const deleteResponse = await api.deleteActivity(ownerId, goal.id, second.id);
    api.expectStatus(deleteResponse, 204);
    const streakAfterDelete = await api.getGoal(ownerId, goal.id);
    api.expectStatus(streakAfterDelete, 200);
    expect(await streakAfterDelete.json()).toEqual(expect.objectContaining({ currentStreak: expect.any(Number) }));
    const activities = await api.getActivities(ownerId, goal.id);
    api.expectStatus(activities, 200);
    expect(await activities.json()).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: second.id })]));
  });

  test('L2-007 and L2-008 compute and display current and longest streaks independently', async ({
    page,
    request,
  }) => {
    const api = new HealthGameApi(request);
    const userId = unique('streaks');
    const sevenDayGoal = await createGoal(api, userId, validGoal(`Seven day streak ${userId}`));
    const missedPeriodGoal = await createGoal(api, userId, validGoal(`Missed period ${userId}`));
    const inProgressGoal = await createGoal(api, userId, validGoal(`In progress period ${userId}`));
    const independentGoal = await createGoal(api, userId, validGoal(`Independent goal ${userId}`));

    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      await logActivity(api, userId, sevenDayGoal.id, {
        quantity: '30',
        notes: `met target ${daysAgo}`,
        recordedAt: isoDaysAgo(daysAgo),
      });
    }

    await logActivity(api, userId, missedPeriodGoal.id, {
      quantity: '30',
      notes: 'met before gap',
      recordedAt: isoDaysAgo(3),
    });
    await logActivity(api, userId, missedPeriodGoal.id, {
      quantity: '30',
      notes: 'met current in-progress period',
      recordedAt: isoDaysAgo(0),
    });
    await logActivity(api, userId, inProgressGoal.id, {
      quantity: '30',
      notes: 'completed previous period',
      recordedAt: isoDaysAgo(1),
    });
    await logActivity(api, userId, independentGoal.id, {
      quantity: '30',
      notes: 'independent progress',
      recordedAt: isoDaysAgo(0),
    });

    const goals = new GoalsListPage(page);
    await goals.authenticateAs(userId);
    await goals.setViewport(375, 812);
    await goals.goto();
    await goals.expectCurrentStreakVisible(sevenDayGoal.name, 7);
    await goals.expectNoHorizontalOverflow();

    const detail = new GoalDetailPage(page);
    await detail.authenticateAs(userId);
    await detail.gotoGoal(sevenDayGoal.id);
    await detail.expectGoalSummary({
      name: sevenDayGoal.name,
      description: sevenDayGoal.description,
      target: /30.*minutes/i,
      cadence: /daily/i,
      currentStreak: 7,
      longestStreak: 7,
    });

    const missedResponse = await api.getGoal(userId, missedPeriodGoal.id);
    api.expectStatus(missedResponse, 200);
    const missedBody = (await missedResponse.json()) as { currentStreak: number; longestStreak: number };
    expect(missedBody.currentStreak).toBeLessThanOrEqual(1);
    expect(missedBody.longestStreak).toBeGreaterThanOrEqual(1);

    const inProgressResponse = await api.getGoal(userId, inProgressGoal.id);
    api.expectStatus(inProgressResponse, 200);
    expect(await inProgressResponse.json()).toEqual(expect.objectContaining({ currentStreak: 1 }));

    const independentResponse = await api.getGoal(userId, independentGoal.id);
    api.expectStatus(independentResponse, 200);
    expect(await independentResponse.json()).toEqual(
      expect.objectContaining({ name: independentGoal.name, currentStreak: 1 }),
    );
  });

  test('L2-009 and L2-010 define, earn, display, and preserve rewards', async ({ page, request }) => {
    const api = new HealthGameApi(request);
    const userId = unique('rewards');
    const otherUserId = unique('rewards-other');
    const goal = await createGoal(api, userId, validGoal(`Reward goal ${userId}`));
    const rewardName = `Seven day badge ${userId}`;
    const reward = await createReward(api, userId, goal.id, rewardName, { conditionType: 'streak', streakThreshold: '7' });

    const invalidRewardResponse = await api.malformedPost(`/api/goals/${goal.id}/rewards`, userId, {
      name: `Invalid reward ${userId}`,
      description: 'Missing condition',
    });
    api.expectStatus(invalidRewardResponse, 400);

    const unauthorizedRewardResponse = await api.createReward(otherUserId, goal.id, {
      name: `Unauthorized reward ${userId}`,
      conditionType: 'streak',
      streakThreshold: '7',
    });
    api.expectStatus(unauthorizedRewardResponse, [403, 404]);

    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      await logActivity(api, userId, goal.id, {
        quantity: '30',
        notes: `reward progress ${daysAgo}`,
        recordedAt: isoDaysAgo(daysAgo),
      });
    }

    const rewards = new RewardsListPage(page);
    await rewards.authenticateAs(userId);
    await rewards.goto();
    await rewards.expectRewardVisible(reward.name);
    await rewards.expectEarnedReward(reward.name, /\d{4}-\d{2}-\d{2}|today/i);

    const rewardsResponse = await api.getRewards(userId);
    api.expectStatus(rewardsResponse, 200);
    expect(await rewardsResponse.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: reward.id, status: 'earned' })]),
    );

    const clockResponse = await api.advanceTestClock(`${userId}-admin`, isoDaysFromNow(2));
    api.expectStatus(clockResponse, [200, 204]);
    const resetGoalResponse = await api.getGoal(userId, goal.id);
    api.expectStatus(resetGoalResponse, 200);
    expect(await resetGoalResponse.json()).toEqual(expect.objectContaining({ currentStreak: 0 }));

    const afterResetResponse = await api.getRewards(userId);
    api.expectStatus(afterResetResponse, 200);
    expect(await afterResetResponse.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: reward.id, status: 'earned' })]),
    );
  });

  test('L2-011 and L2-012 support standard and custom cadence boundaries', async ({ page, request }) => {
    const api = new HealthGameApi(request);
    const userId = unique('cadence');
    const cadences: readonly GoalInput[] = [
      validGoal(`Hourly cadence ${userId}`, { cadence: 'hourly' }),
      validGoal(`Daily cadence ${userId}`, { cadence: 'daily' }),
      validGoal(`Weekly cadence ${userId}`, { cadence: 'weekly' }),
      validGoal(`Monthly cadence ${userId}`, { cadence: 'monthly' }),
      validGoal(`Custom cadence ${userId}`, {
        cadence: 'custom',
        customIntervalValue: '3',
        customIntervalUnit: 'days',
      }),
    ];

    for (const cadenceGoal of cadences) {
      const created = await createGoal(api, userId, cadenceGoal);
      await logActivity(api, userId, created.id, {
        quantity: '30',
        notes: `${cadenceGoal.cadence} boundary sample`,
        recordedAt: isoDaysAgo(0),
      });

      const read = await api.getGoal(userId, created.id);
      api.expectStatus(read, 200);
      const readBody = await read.json();
      expect(readBody).toEqual(expect.objectContaining({ name: cadenceGoal.name }));
      if (cadenceGoal.cadence === 'custom') {
        expect(JSON.stringify(readBody)).toMatch(/custom.*3.*days|3.*days.*custom/i);
      }

      const rolloverResponse = await api.advanceTestClock(`${userId}-admin`, rolloverInstantFor(cadenceGoal.cadence));
      api.expectStatus(rolloverResponse, [200, 204]);
      const afterRollover = await api.getGoal(userId, created.id);
      api.expectStatus(afterRollover, 200);
      expect(await afterRollover.json()).toEqual(
        expect.objectContaining({
          name: cadenceGoal.name,
          completedQuantity: 0,
        }),
      );
    }

    const form = new GoalFormPage(page);
    await form.authenticateAs(userId);
    await form.gotoNew();
    await form.expectCustomCadenceControls();
    await form.submitGoal({
      ...validGoal(`Invalid custom ${userId}`),
      cadence: 'custom',
      customIntervalValue: '0',
      customIntervalUnit: 'days',
    });
    await form.expectValidationError(/interval|greater than|positive|validation/i);

    const apiInvalidCustom = await api.createGoal(userId, {
      ...validGoal(`Invalid custom API ${userId}`),
      cadence: 'custom',
      customIntervalValue: '0',
      customIntervalUnit: 'hours',
    });
    api.expectStatus(apiInvalidCustom, 400);
  });

  test('L2-005 activity logging page supports note entry and discard protection', async ({ page }) => {
    const userId = unique('activity-ui');
    const logActivityPage = new LogActivityPage(page);

    await logActivityPage.authenticateAs(userId);
    await logActivityPage.goto();
    await logActivityPage.logActivity({ quantity: '15', notes: 'Evening stretch' });
    await logActivityPage.expectStatus(/logged|saved/i);

    await logActivityPage.gotoDialog();
    await logActivityPage.expectDiscardChangesPrompt();
  });

  test('L2-009 reward form requires a qualifying condition', async ({ page }) => {
    const rewardForm = new RewardFormPage(page);

    await rewardForm.authenticateAs(unique('reward-form'));
    await rewardForm.gotoNew();
    await rewardForm.submitRewardWithoutCondition('No condition reward', 'No qualifying condition');
    await rewardForm.expectValidationError(/condition|name|required|validation/i);
  });
});

async function createGoal(api: HealthGameApi, userId: string, goal: GoalInput): Promise<Record<string, any>> {
  const response = await api.createGoal(userId, goal);
  api.expectStatus(response, [200, 201]);
  return (await response.json()) as Record<string, any>;
}

async function logActivity(
  api: HealthGameApi,
  userId: string,
  goalId: string,
  activity: ActivityInput,
): Promise<Record<string, any>> {
  const response = await api.logActivity(userId, goalId, activity);
  api.expectStatus(response, [200, 201]);
  return (await response.json()) as Record<string, any>;
}

async function createReward(
  api: HealthGameApi,
  userId: string,
  goalId: string,
  rewardName: string,
  options: Partial<{ conditionType: 'goal-target' | 'streak'; streakThreshold: string }> = {},
): Promise<Record<string, any>> {
  const response = await api.createReward(userId, goalId, {
    name: rewardName,
    description: `Reward for ${goalId}`,
    conditionType: options.conditionType ?? 'goal-target',
    streakThreshold: options.streakThreshold,
  });
  api.expectStatus(response, [200, 201]);
  return (await response.json()) as Record<string, any>;
}

function validGoal(name: string, overrides: Partial<GoalInput> = {}): GoalInput {
  return {
    name,
    description: 'A Playwright acceptance goal',
    targetValue: '30',
    targetUnit: 'minutes',
    cadence: 'daily',
    ...overrides,
  };
}

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isoDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

function isoDaysFromNow(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

function rolloverInstantFor(cadence: GoalInput['cadence']): string {
  const date = new Date();
  if (cadence === 'hourly') {
    date.setUTCHours(date.getUTCHours() + 1, 1, 0, 0);
  } else if (cadence === 'weekly') {
    date.setUTCDate(date.getUTCDate() + 8);
    date.setUTCHours(12, 0, 0, 0);
  } else if (cadence === 'monthly') {
    date.setUTCMonth(date.getUTCMonth() + 1, 1);
    date.setUTCHours(12, 0, 0, 0);
  } else if (cadence === 'custom') {
    date.setUTCDate(date.getUTCDate() + 3);
    date.setUTCHours(12, 0, 0, 0);
  } else {
    date.setUTCDate(date.getUTCDate() + 1);
    date.setUTCHours(0, 1, 0, 0);
  }

  return date.toISOString();
}
