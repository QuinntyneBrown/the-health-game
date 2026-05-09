// Acceptance Test
// Traces to: L2-002, L2-008, L2-010
// Description: Dashboard composes goals and rewards from the live API services.
import { TestBed } from '@angular/core/testing';
import { GOALS_SERVICE, IGoalsService, IRewardsService, REWARDS_SERVICE } from 'api';
import { EMPTY, firstValueFrom, of } from 'rxjs';

import { DashboardService } from './dashboard.service';

const goalsService: IGoalsService = {
  getGoalSummaries: () => EMPTY,
  getGoals: () =>
    of([
      {
        id: 'sleep',
        name: 'Sleep',
        description: 'Protect the sleep window.',
        cadence: 'daily',
        target: { value: 8, unit: 'hours' },
        completedQuantity: 8,
        currentStreak: 5,
        longestStreak: 6,
        rewardName: 'Slow morning',
      },
    ]),
  getGoal: () => EMPTY,
  createGoal: () => EMPTY,
  updateGoal: () => EMPTY,
  deleteGoal: () => EMPTY,
};

const rewardsService: IRewardsService = {
  getRewards: () =>
    of([
      {
        id: 'trail-breakfast',
        goalId: 'sleep',
        name: 'Trail breakfast',
        description: 'Unlocked by keeping hydration consistent.',
        condition: { type: 'goal-target' },
        status: 'earned',
        earnedAt: '2026-05-01T00:00:00Z',
      },
      {
        id: 'recovery-hour',
        goalId: 'sleep',
        name: 'Recovery hour',
        description: 'Reach the next mobility streak milestone.',
        condition: { type: 'streak-milestone', streakDays: 7 },
        status: 'pending',
        earnedAt: null,
      },
    ]),
  createReward: () => EMPTY,
};

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: GOALS_SERVICE, useValue: goalsService },
        { provide: REWARDS_SERVICE, useValue: rewardsService },
      ],
    });
  });

  it('maps live goals into the dashboard goal cards', async () => {
    const service = TestBed.inject(DashboardService);

    const overview = await firstValueFrom(service.getOverview());

    expect(overview.goals[0].name).toBe('Sleep');
    expect(overview.goals[0].progressValue).toBe(100);
    expect(overview.metrics[0].value).toBe('100%');
  });

  it('renders the live rewards on the dashboard with status', async () => {
    const service = TestBed.inject(DashboardService);

    const overview = await firstValueFrom(service.getOverview());

    expect(overview.rewards.length).toBe(2);
    const earned = overview.rewards.find((r) => r.id === 'trail-breakfast');
    expect(earned?.isEarned).toBe(true);
    expect(earned?.statusLabel).toBe('Earned');
  });
});
