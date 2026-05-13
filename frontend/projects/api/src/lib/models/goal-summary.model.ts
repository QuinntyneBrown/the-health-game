export type GoalCadence = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface GoalTarget {
  readonly value: number;
  readonly unit: string;
}

export interface GoalSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cadence: GoalCadence;
  readonly target: GoalTarget;
  readonly completedQuantity: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly rewardName: string;
  readonly lastActivityAt?: string | null;
  readonly timeZoneId?: string;
  readonly weekStartsOn?: WeekDay;
  readonly createdAt?: string;
  readonly updatedAt?: string | null;
}
