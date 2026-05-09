import { Injectable, inject } from '@angular/core';
import { GOALS_SERVICE, GoalCadence, REWARDS_SERVICE, Reward } from 'api';
import { Observable, combineLatest, map } from 'rxjs';

import {
  DashboardGoalItem,
  DashboardMetric,
  DashboardOverview,
  DashboardRewardItem,
} from './dashboard-overview.model';
import { IDashboardService } from './dashboard.service.contract';

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

const cadenceLabels: Record<GoalCadence, string> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

@Injectable()
export class DashboardService implements IDashboardService {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly rewardsService = inject(REWARDS_SERVICE);

  getOverview(): Observable<DashboardOverview> {
    return combineLatest([
      this.goalsService.getGoals(),
      this.rewardsService.getRewards(),
    ]).pipe(
      map(([goals, rewards]) => {
        const completedGoals = goals.filter(
          (goal) => goal.completedQuantity >= goal.target.value,
        );
        const longestStreak = goals.reduce(
          (best, goal) => Math.max(best, goal.longestStreak),
          0,
        );
        const earnedRewards = rewards.filter((r) => r.status === 'earned');
        const pendingRewards = rewards.filter((r) => r.status === 'pending');

        return {
          dateLabel: 'Today',
          greeting: greetingFor(new Date().getHours()),
          goals: goals.map((goal): DashboardGoalItem => {
            const progressValue =
              goal.target.value === 0
                ? 0
                : Math.min(
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
          metrics: this.buildMetrics(
            goals.length,
            completedGoals.length,
            longestStreak,
            earnedRewards.length,
            pendingRewards.length,
          ),
          rewards: rewards.map((reward) => this.toRewardItem(reward)),
        };
      }),
    );
  }

  private buildMetrics(
    activeGoalCount: number,
    completedGoalCount: number,
    longestStreak: number,
    earnedCount: number,
    pendingCount: number,
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
        ariaLabel: `${earnedCount} earned, ${pendingCount} pending rewards`,
        icon: 'emoji_events',
        label: 'Rewards',
        progressValue: null,
        supportText: `${earnedCount} earned, ${pendingCount} pending`,
        tone: 'reward',
        value: `${earnedCount + pendingCount}`,
      },
    ];
  }

  private toRewardItem(reward: Reward): DashboardRewardItem {
    return {
      description: reward.description,
      earnedDateLabel: reward.earnedAt
        ? `Earned ${new Date(reward.earnedAt).toLocaleDateString()}`
        : '',
      id: reward.id,
      isEarned: reward.status === 'earned',
      name: reward.name,
      statusLabel: reward.status === 'earned' ? 'Earned' : 'Pending',
    };
  }
}
