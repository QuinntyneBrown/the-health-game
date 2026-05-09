// Acceptance Test
// Traces to: L2-001, L2-011, L2-012
// Description: Goal-form validation surfaces field errors per cadence variant.
import { validateGoalForm } from './goal-form.validate';

describe('validateGoalForm', () => {
  const base = {
    name: 'Hydrate',
    targetValue: '8',
    targetUnit: 'cups',
    cadence: 'daily' as const,
    weekStart: 'monday' as const,
    customCount: '1',
    customUnit: 'days' as const,
  };

  it('passes for a valid daily goal', () => {
    expect(validateGoalForm(base)).toEqual({});
  });

  it('flags empty name', () => {
    expect(validateGoalForm({ ...base, name: '' }).name).toMatch(/required/i);
  });

  it('flags non-positive target', () => {
    expect(validateGoalForm({ ...base, targetValue: '0' }).targetValue).toMatch(/zero/i);
  });

  it('passes for hourly when target is positive', () => {
    expect(validateGoalForm({ ...base, cadence: 'hourly' })).toEqual({});
  });

  it('requires weekStart for weekly cadence', () => {
    const withoutWeekStart = { ...base, cadence: 'weekly' as const, weekStart: '' as never };
    expect(validateGoalForm(withoutWeekStart).weekStart).toMatch(/start/i);
  });

  it('requires customCount > 0 for custom cadence', () => {
    expect(
      validateGoalForm({ ...base, cadence: 'custom', customCount: '0' }).customCount,
    ).toMatch(/greater/i);
  });
});
