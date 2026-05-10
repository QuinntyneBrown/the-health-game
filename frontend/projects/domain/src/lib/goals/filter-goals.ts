import { GoalCadence, GoalSummary } from 'api';

export type CadenceFilter = GoalCadence | 'all';

export function filterGoalsByCadence(
  goals: readonly GoalSummary[],
  cadence: CadenceFilter,
): readonly GoalSummary[] {
  return cadence === 'all' ? goals : goals.filter((goal) => goal.cadence === cadence);
}

export function filterGoalsByName(
  goals: readonly GoalSummary[],
  query: string,
): readonly GoalSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return goals;
  return goals.filter((goal) => goal.name.toLowerCase().includes(needle));
}

export type GoalSortOrder = 'name' | 'streak' | 'recent';

export function sortGoals(
  goals: readonly GoalSummary[],
  order: GoalSortOrder,
): readonly GoalSummary[] {
  const copy = [...goals];
  if (order === 'streak') {
    copy.sort((a, b) => {
      const diff = b.currentStreak - a.currentStreak;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  } else if (order === 'recent') {
    copy.sort((a, b) => {
      const aTs = a.lastActivityAt ? Date.parse(a.lastActivityAt) : -Infinity;
      const bTs = b.lastActivityAt ? Date.parse(b.lastActivityAt) : -Infinity;
      if (bTs !== aTs) return bTs - aTs;
      return a.name.localeCompare(b.name);
    });
  } else {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy;
}
