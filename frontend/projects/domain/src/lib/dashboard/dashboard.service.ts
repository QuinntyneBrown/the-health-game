import { inject, Injectable } from '@angular/core';
import { GoalCadence, GOALS_SERVICE, IGoalsService } from 'api';
import { map, Observable } from 'rxjs';

import {
  DashboardGoalItem,
  DashboardMetric,
  DashboardOverview,
  DashboardRewardItem,
} from './dashboard-overview.model';
import { IDashboardService } from './dashboard.service.contract';

const cadenceLabels: Record<GoalCadence, string> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

@Injectable()
export class DashboardService implements IDashboardService {
  private readonly goalsService: IGoalsService = inject(GOALS_SERVICE);

  getOverview(): Observable<DashboardOverview> {
    return this.goalsService.getGoalSummaries().pipe(
      map((goals) => {
        const completedGoals = goals.filter((goal) => goal.completedQuantity >= goal.target.value);
        const longestStreak = goals.reduce(
          (best, goal) => Math.max(best, goal.longestStreak),
          0,
        );

        return {
          dateLabel: 'Today',
          goals: goals.map((goal): DashboardGoalItem => {
            const progressValue = Math.min(
              100,
              Math.round((goal.completedQuantity / goal.target.value) * 100),
            );

            return {
              cadenceLabel: cadenceLabels[goal.cadence],
              currentStreakLabel: `${goal.currentStreak} current`,
              description: goal.description,
              id: goal.id,
              longestStreakLabel: `${goal.longestStreak} longest`,
              name: goal.name,
              progressLabel: `${goal.completedQuantity}/${goal.target.value} ${goal.target.unit}`,
              progressValue,
              rewardName: goal.rewardName,
            };
          }),
          greeting: 'Good morning',
          metrics: this.buildMetrics(goals.length, completedGoals.length, longestStreak),
          rewards: this.buildRewards(),
        };
      }),
    );
  }

  private buildMetrics(
    activeGoalCount: number,
    completedGoalCount: number,
    longestStreak: number,
  ): readonly DashboardMetric[] {
    const completionValue =
      activeGoalCount === 0 ? 0 : Math.round((completedGoalCount / activeGoalCount) * 100);

    return [
      {
        ariaLabel: `${completedGoalCount} of ${activeGoalCount} goals complete today`,
        icon: 'check_circle',
        label: 'Today',
        progressValue: completionValue,
        supportText: `${completedGoalCount} of ${activeGoalCount} goals complete`,
        tone: 'primary',
        value: `${completionValue}%`,
      },
      {
        ariaLabel: `${longestStreak} day best streak`,
        icon: 'local_fire_department',
        label: 'Best streak',
        progressValue: null,
        supportText: 'Across active goals',
        tone: 'streak',
        value: `${longestStreak} days`,
      },
      {
        ariaLabel: 'Two rewards in progress',
        icon: 'emoji_events',
        label: 'Rewards',
        progressValue: null,
        supportText: 'One earned, one pending',
        tone: 'reward',
        value: '2',
      },
    ];
  }

  private buildRewards(): readonly DashboardRewardItem[] {
    return [
      {
        description: 'Unlocked by keeping hydration consistent.',
        earnedDateLabel: 'Earned today',
        id: 'trail-breakfast',
        isEarned: true,
        name: 'Trail breakfast',
        statusLabel: 'Earned',
      },
      {
        description: 'Reach the next mobility streak milestone.',
        earnedDateLabel: '',
        id: 'recovery-hour',
        isEarned: false,
        name: 'Recovery hour',
        statusLabel: 'Pending',
      },
    ];
  }
}
