import { GoalCadence } from 'api';

export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | '';

export type CustomIntervalUnit = 'hours' | 'days';

export interface GoalFormState {
  readonly name: string;
  readonly targetValue: string;
  readonly targetUnit: string;
  readonly cadence: GoalCadence;
  readonly weekStart: WeekDay;
  readonly customCount: string;
  readonly customUnit: CustomIntervalUnit;
}

export interface GoalFormErrors {
  name?: string;
  targetValue?: string;
  weekStart?: string;
  customCount?: string;
}

export function validateGoalForm(state: GoalFormState): GoalFormErrors {
  const errors: GoalFormErrors = {};
  if (state.name.trim() === '') {
    errors.name = 'Name is required';
  }
  if (!(Number(state.targetValue) > 0)) {
    errors.targetValue = 'Target must be greater than zero';
  }
  if (state.cadence === 'weekly' && state.weekStart === '') {
    errors.weekStart = 'Week start day is required';
  }
  if (state.cadence === 'custom' && !(Number(state.customCount) > 0)) {
    errors.customCount = 'Interval count must be greater than zero';
  }
  return errors;
}
