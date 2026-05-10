import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateGoalInput,
  CustomIntervalUnit,
  GOALS_SERVICE,
  GoalCadence,
  WeekDay,
} from 'api';
import { HealthTextFieldComponent } from 'components';

import { GoalFormState, validateGoalForm } from './goal-form.validate';

const cadences: readonly { id: GoalCadence; label: string }[] = [
  { id: 'hourly', label: 'Hourly' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

const weekDays: readonly { id: WeekDay; label: string }[] = [
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
];

const customUnits: readonly { id: CustomIntervalUnit; label: string }[] = [
  { id: 'hours', label: 'Hours' },
  { id: 'days', label: 'Days' },
];

@Component({
  selector: 'lib-goal-form',
  imports: [
    FormsModule,
    HealthTextFieldComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './goal-form.component.html',
  styleUrl: './goal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cadences = cadences;
  readonly weekDays = weekDays;
  readonly customUnits = customUnits;

  private readonly editingId = this.route.snapshot.paramMap.get('id');
  readonly isEditing = this.editingId !== null;
  readonly title = this.isEditing ? 'Edit goal' : 'Create goal';

  readonly name = signal('');
  readonly targetValue = signal('');
  readonly targetUnit = signal('');
  readonly cadence = signal<GoalCadence>('daily');
  readonly weekStart = signal<GoalFormState['weekStart']>('monday');
  readonly customCount = signal('1');
  readonly customUnit = signal<CustomIntervalUnit>('days');
  private readonly attemptedSubmit = signal(false);
  private readonly initialCadence = signal<GoalCadence>('daily');

  readonly cadenceChanged = computed(() => this.cadence() !== this.initialCadence());

  readonly state = computed<GoalFormState>(() => ({
    name: this.name(),
    targetValue: this.targetValue(),
    targetUnit: this.targetUnit(),
    cadence: this.cadence(),
    weekStart: this.weekStart(),
    customCount: this.customCount(),
    customUnit: this.customUnit(),
  }));

  readonly errors = computed(() => validateGoalForm(this.state()));
  readonly nameError = computed(() =>
    this.attemptedSubmit() ? this.errors().name ?? '' : '',
  );
  readonly targetValueError = computed(() =>
    this.attemptedSubmit() ? this.errors().targetValue ?? '' : '',
  );
  readonly weekStartError = computed(() =>
    this.attemptedSubmit() ? this.errors().weekStart ?? '' : '',
  );
  readonly customCountError = computed(() =>
    this.attemptedSubmit() ? this.errors().customCount ?? '' : '',
  );
  readonly canSave = computed(() => Object.keys(this.errors()).length === 0);

  constructor() {
    if (this.editingId) {
      this.goalsService.getGoal(this.editingId).subscribe((goal) => {
        this.name.set(goal.name);
        this.targetValue.set(String(goal.target.value));
        this.targetUnit.set(goal.target.unit);
        this.cadence.set(goal.cadence);
        this.initialCadence.set(goal.cadence);
      });
    }
  }

  cancel(): void {
    void this.router.navigateByUrl(this.editingId ? `/goals/${this.editingId}` : '/goals');
  }

  submit(): void {
    this.attemptedSubmit.set(true);
    if (!this.canSave()) return;
    const state = this.state();
    const input: CreateGoalInput = {
      name: state.name.trim(),
      cadence: state.cadence,
      target: { value: Number(state.targetValue), unit: state.targetUnit.trim() },
      ...(state.cadence === 'weekly' && state.weekStart !== ''
        ? { weekStart: state.weekStart }
        : {}),
      ...(state.cadence === 'custom'
        ? {
            customInterval: {
              count: Number(state.customCount),
              unit: state.customUnit,
            },
          }
        : {}),
    };
    const request$ = this.editingId
      ? this.goalsService.updateGoal(this.editingId, input)
      : this.goalsService.createGoal(input);
    request$.subscribe((goal) => {
      void this.router.navigateByUrl(`/goals/${goal.id}`);
    });
  }
}
