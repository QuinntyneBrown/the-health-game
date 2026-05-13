export type RewardConditionType = 'goal-target' | 'streak-milestone';

export interface GoalTargetCondition {
  readonly type: 'goal-target';
}

export interface StreakMilestoneCondition {
  readonly type: 'streak-milestone';
  readonly streakDays: number;
}

export type RewardCondition = GoalTargetCondition | StreakMilestoneCondition;

export type RewardStatus = 'locked' | 'in-progress' | 'ready-to-claim' | 'pending' | 'earned';

export interface RewardProgress {
  readonly current: number;
  readonly target: number;
}

export interface Reward {
  readonly id: string;
  readonly goalId: string;
  readonly name: string;
  readonly description: string;
  readonly condition: RewardCondition;
  readonly status: RewardStatus;
  readonly earnedAt: string | null;
  readonly progress?: RewardProgress;
  readonly createdAt?: string;
  readonly updatedAt?: string | null;
}
