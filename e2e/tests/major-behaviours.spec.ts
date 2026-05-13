// Acceptance Test
// Objective: exercise the frontend against the real backend and SQL Express database.
import { expect, test } from '@playwright/test';

import { HealthGameE2EPage } from '../pages/HealthGameE2EPage';
import { SqlExpressDatabase, escapeSql } from './sqlExpress';

test.describe('HealthQuest real backend behaviours', () => {
  const db = new SqlExpressDatabase();

  test('persists profile, goal, activity, and reward behaviours through SQL Express', async ({
    page,
  }) => {
    const userId = `ui-${Date.now()}`;
    const displayName = 'Playwright User';
    const email = `${userId}@example.test`;
    const goalName = `Walk ${Date.now()}`;
    const updatedGoalName = `${goalName} updated`;
    const rewardName = `Reward ${Date.now()}`;
    const app = new HealthGameE2EPage(page);

    db.cleanupUser(userId);
    await app.authenticateAs(userId);

    await app.gotoProfile();
    await app.saveProfile(displayName, email);
    expect(
      db.scalar(
        `SELECT DisplayName FROM UserProfiles WHERE SubjectId = N'${escapeSql(userId)}' AND DeletedAtUtc IS NULL`,
      ),
    ).toBe(displayName);

    await app.gotoGoals();
    await app.createGoal(goalName, 'Daily walk from Playwright', '30', 'minutes');
    const goalId = db.scalar(
      `SELECT TOP 1 CONVERT(nvarchar(36), Id) FROM Goals WHERE UserId = N'${escapeSql(userId)}' AND Name = N'${escapeSql(goalName)}' AND DeletedAtUtc IS NULL ORDER BY CreatedAtUtc DESC`,
    ).toLowerCase();
    expect(goalId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    await app.updateGoal(goalId, updatedGoalName);
    expect(
      db.scalar(`SELECT Name FROM Goals WHERE Id = '${escapeSql(goalId)}' AND DeletedAtUtc IS NULL`),
    ).toBe(updatedGoalName);

    await app.logActivity(goalId, '24', 'Park loop');
    const activityId = db.scalar(
      `SELECT TOP 1 CONVERT(nvarchar(36), Id) FROM ActivityEntries WHERE UserId = N'${escapeSql(userId)}' AND GoalId = '${escapeSql(goalId)}' AND DeletedAtUtc IS NULL ORDER BY CreatedAtUtc DESC`,
    ).toLowerCase();
    expect(activityId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    await app.updateActivity(activityId);
    expect(
      db.scalar(`SELECT CONVERT(varchar(32), Quantity) FROM ActivityEntries WHERE Id = '${escapeSql(activityId)}'`),
    ).toContain('25');

    await app.createReward(goalId, rewardName);
    expect(
      db.scalar(
        `SELECT Name FROM Rewards WHERE UserId = N'${escapeSql(userId)}' AND GoalId = '${escapeSql(goalId)}' AND Name = N'${escapeSql(rewardName)}'`,
      ),
    ).toBe(rewardName);

    await app.gotoRewards();
    await expect(app.rewardCardByName(rewardName)).toBeVisible();

    await app.gotoGoals();
    await app.deleteActivity(activityId);
    expect(
      db.scalar(`SELECT CASE WHEN DeletedAtUtc IS NULL THEN 'active' ELSE 'deleted' END FROM ActivityEntries WHERE Id = '${escapeSql(activityId)}'`),
    ).toBe('deleted');

    await app.deleteGoal(goalId);
    expect(
      db.scalar(`SELECT CASE WHEN DeletedAtUtc IS NULL THEN 'active' ELSE 'deleted' END FROM Goals WHERE Id = '${escapeSql(goalId)}'`),
    ).toBe('deleted');

    await app.gotoProfile();
    await app.deleteAccount();
    expect(
      db.scalar(
        `SELECT CASE WHEN DeletedAtUtc IS NULL THEN 'active' ELSE 'deleted' END FROM UserProfiles WHERE SubjectId = N'${escapeSql(userId)}'`,
      ),
    ).toBe('deleted');
  });
});
