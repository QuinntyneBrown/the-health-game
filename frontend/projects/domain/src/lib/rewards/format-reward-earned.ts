import { Reward } from 'api';

export function formatRewardEarnedMessage(rewards: readonly Reward[]): string | null {
  if (rewards.length === 0) return null;
  const names = rewards.map((r) => r.name).join(', ');
  return rewards.length === 1 ? `Reward earned: ${names}` : `Rewards earned: ${names}`;
}
