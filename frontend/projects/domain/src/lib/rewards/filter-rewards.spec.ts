// Acceptance Test
// Traces to: L2-010
// Description: filterRewardsByStatus narrows rewards by earned/pending.
import { Reward } from 'api';

import { filterRewardsByStatus } from './filter-rewards';

const rewards: readonly Reward[] = [
  {
    id: 'r-1',
    goalId: 'g-1',
    name: 'New playlist',
    description: '',
    condition: { type: 'goal-target' },
    status: 'earned',
    earnedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'r-2',
    goalId: 'g-1',
    name: 'Trail breakfast',
    description: '',
    condition: { type: 'streak-milestone', streakDays: 7 },
    status: 'pending',
    earnedAt: null,
  },
];

describe('filterRewardsByStatus', () => {
  it('returns all rewards when status is "all"', () => {
    expect(filterRewardsByStatus(rewards, 'all').length).toBe(2);
  });

  it('returns only earned rewards when status is "earned"', () => {
    expect(filterRewardsByStatus(rewards, 'earned').map((r) => r.id)).toEqual(['r-1']);
  });

  it('returns only pending rewards when status is "pending"', () => {
    expect(filterRewardsByStatus(rewards, 'pending').map((r) => r.id)).toEqual(['r-2']);
  });
});
