export interface DashboardMetric {
  readonly ariaLabel: string;
  readonly icon: string;
  readonly label: string;
  readonly progressValue: number | null;
  readonly supportText: string;
  readonly tone: 'primary' | 'reward' | 'streak' | 'neutral';
  readonly value: string;
}

export interface DashboardGoalItem {
  readonly cadenceLabel: string;
  readonly currentStreakLabel: string;
  readonly description: string;
  readonly id: string;
  readonly longestStreakLabel: string;
  readonly name: string;
  readonly progressLabel: string;
  readonly progressValue: number;
  readonly rewardName: string;
}

export interface DashboardRewardItem {
  readonly description: string;
  readonly earnedDateLabel: string;
  readonly id: string;
  readonly isEarned: boolean;
  readonly name: string;
  readonly statusLabel: string;
}

export interface DashboardOverview {
  readonly dateLabel: string;
  readonly goals: readonly DashboardGoalItem[];
  readonly greeting: string;
  readonly metrics: readonly DashboardMetric[];
  readonly rewards: readonly DashboardRewardItem[];
}
