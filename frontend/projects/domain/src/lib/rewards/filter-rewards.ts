import { Reward, RewardStatus } from 'api';

export type RewardStatusFilter = RewardStatus | 'all';

export function filterRewardsByStatus(
  rewards: readonly Reward[],
  status: RewardStatusFilter,
): readonly Reward[] {
  return status === 'all' ? rewards : rewards.filter((r) => r.status === status);
}
