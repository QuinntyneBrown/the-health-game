// Acceptance Test
// Traces to: L2-002, L2-008
// Description: filterGoalsByCadence narrows goals by the selected cadence.
import { GoalSummary } from 'api';

import { filterGoalsByCadence } from './filter-goals';

const goals: readonly GoalSummary[] = [
  { id: 'a', name: 'Hydrate', description: '', cadence: 'daily', target: { value: 8, unit: 'cups' }, completedQuantity: 4, currentStreak: 1, longestStreak: 1, rewardName: '' },
  { id: 'b', name: 'Walk', description: '', cadence: 'daily', target: { value: 30, unit: 'min' }, completedQuantity: 30, currentStreak: 5, longestStreak: 5, rewardName: '' },
  { id: 'c', name: 'Mobility', description: '', cadence: 'weekly', target: { value: 3, unit: 'sessions' }, completedQuantity: 1, currentStreak: 4, longestStreak: 9, rewardName: '' },
];

describe('filterGoalsByCadence', () => {
  it('returns all goals when cadence is "all"', () => {
    expect(filterGoalsByCadence(goals, 'all').length).toBe(3);
  });

  it('returns only daily goals when cadence is "daily"', () => {
    expect(filterGoalsByCadence(goals, 'daily').map((g) => g.id)).toEqual(['a', 'b']);
  });

  it('returns only weekly goals when cadence is "weekly"', () => {
    expect(filterGoalsByCadence(goals, 'weekly').map((g) => g.id)).toEqual(['c']);
  });
});
