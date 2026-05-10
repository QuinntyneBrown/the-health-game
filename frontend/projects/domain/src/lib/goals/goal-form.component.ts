import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateGoalInput,
  CustomIntervalUnit,
  GOALS_SERVICE,
  GoalCadence,
  WeekDay,
} from 'api';
import { HealthTextFieldComponent, SegmentedFilterComponent, SegmentedFilterOption } from 'components';

import { GoalFormState, validateGoalForm } from './goal-form.validate';
import { GoalsOptimisticService } from './goals.optimistic.service';

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
    MatSlideToggleModule,
    SegmentedFilterComponent,
  ],
  templateUrl: './goal-form.component.html',
  styleUrl: './goal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly optimistic = inject(GoalsOptimisticService);
  private readonly snackBar = inject(MatSnackBar);

  readonly cadences = cadences;
  readonly weekDays = weekDays;
  readonly customUnits = customUnits;
  readonly cadenceOptions: readonly SegmentedFilterOption[] = cadences.map((c) => ({
    value: c.id,
    label: c.label,
  }));

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
  readonly remindersOn = signal(false);
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
  readonly isOffline = signal(typeof navigator !== 'undefined' && navigator.onLine === false);
  readonly canSave = computed(
    () => Object.keys(this.errors()).length === 0 && !this.isOffline(),
  );

  constructor() {
    if (typeof window !== 'undefined') {
      const onOffline = () => this.isOffline.set(true);
      const onOnline = () => this.isOffline.set(false);
      window.addEventListener('offline', onOffline);
      window.addEventListener('online', onOnline);
      inject(DestroyRef).onDestroy(() => {
        window.removeEventListener('offline', onOffline);
        window.removeEventListener('online', onOnline);
      });
    }
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

    if (this.editingId) {
      this.goalsService.updateGoal(this.editingId, input).subscribe({
        next: (goal) => {
          void this.router.navigateByUrl(`/goals/${goal.id}`);
        },
        error: (err: unknown) => {
          const status =
            (err as { status?: number } | null)?.status ??
            (err as { response?: { status?: number } } | null)?.response?.status;
          const message =
            status === 409
              ? 'Goal was modified by another session — please reload to see the latest.'
              : 'Could not save goal — please try again.';
          this.snackBar.open(message, 'Dismiss', { duration: 6000 });
        },
      });
      return;
    }

    const tempId = `pending-${Date.now()}`;
    this.optimistic.add({
      id: tempId,
      name: input.name,
      description: '',
      cadence: input.cadence,
      target: input.target,
      completedQuantity: 0,
      currentStreak: 0,
      longestStreak: 0,
      rewardName: '',
    });
    void this.router.navigateByUrl('/goals');

    this.goalsService.createGoal(input).subscribe({
      next: (goal) => {
        this.optimistic.remove(tempId);
        void this.router.navigateByUrl(`/goals/${goal.id}`);
      },
      error: () => {
        this.optimistic.remove(tempId);
        this.snackBar.open('Could not create goal — please try again.', 'Dismiss', {
          duration: 5000,
        });
      },
    });
  }
}
