import { Reward } from '../rewards/reward.model';

export interface ActivityEntry {
  readonly id: string;
  readonly goalId: string;
  readonly quantity: number;
  readonly notes: string | null;
  readonly recordedAt: string;
  readonly newlyEarnedRewards?: readonly Reward[];
}
