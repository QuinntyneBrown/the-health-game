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
