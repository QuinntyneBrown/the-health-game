// Acceptance Test
// Traces to: L2-010
// Description: formatRewardEarnedMessage produces the snackbar text for newly earned rewards.
import { Reward } from 'api';

import { formatRewardEarnedMessage } from './format-reward-earned';

const reward = (id: string, name: string): Reward => ({
  id,
  goalId: 'g',
  name,
  description: '',
  condition: { type: 'goal-target' },
  status: 'earned',
  earnedAt: '2026-05-09T12:00:00Z',
});

describe('formatRewardEarnedMessage', () => {
  it('returns null for an empty list', () => {
    expect(formatRewardEarnedMessage([])).toBeNull();
  });

  it('formats a single reward as "Reward earned: NAME"', () => {
    expect(formatRewardEarnedMessage([reward('r1', 'New playlist')])).toBe(
      'Reward earned: New playlist',
    );
  });

  it('joins multiple reward names with commas', () => {
    expect(
      formatRewardEarnedMessage([reward('r1', 'New playlist'), reward('r2', 'Trail breakfast')]),
    ).toBe('Rewards earned: New playlist, Trail breakfast');
  });
});
