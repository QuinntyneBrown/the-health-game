// Acceptance Test
// Traces to: L2-008, L2-032, L2-033
// Description: Verifies the domain service consumes the API through its injection token.
import { TestBed } from '@angular/core/testing';
import { GOALS_SERVICE, IGoalsService } from 'api';
import { EMPTY, firstValueFrom, of } from 'rxjs';

import { DashboardService } from './dashboard.service';

const goalsService: IGoalsService = {
  getGoalSummaries: () =>
    of([
      {
        id: 'sleep',
        name: 'Sleep',
        description: 'Protect the sleep window.',
        cadence: 'daily',
        target: {
          value: 8,
          unit: 'hours',
        },
        completedQuantity: 8,
        currentStreak: 5,
        longestStreak: 6,
        rewardName: 'Slow morning',
      },
    ]),
  getGoals: () => EMPTY,
  createGoal: () => EMPTY,
};

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, { provide: GOALS_SERVICE, useValue: goalsService }],
    });
  });

  it('maps goal summaries into dashboard progress view models', async () => {
    const service = TestBed.inject(DashboardService);

    const overview = await firstValueFrom(service.getOverview());

    expect(overview.goals[0].name).toBe('Sleep');
    expect(overview.goals[0].progressValue).toBe(100);
    expect(overview.metrics[0].value).toBe('100%');
  });
});
