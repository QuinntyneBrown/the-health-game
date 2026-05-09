import { GoalCadence, GoalSummary } from 'api';

export type CadenceFilter = GoalCadence | 'all';

export function filterGoalsByCadence(
  goals: readonly GoalSummary[],
  cadence: CadenceFilter,
): readonly GoalSummary[] {
  return cadence === 'all' ? goals : goals.filter((goal) => goal.cadence === cadence);
}
