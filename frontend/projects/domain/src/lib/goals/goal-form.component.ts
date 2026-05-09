import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { GOALS_SERVICE, GoalCadence } from 'api';
import { HealthTextFieldComponent } from 'components';

const cadences: readonly { id: GoalCadence; label: string }[] = [
  { id: 'hourly', label: 'Hourly' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

@Component({
  selector: 'lib-goal-form',
  imports: [
    HealthTextFieldComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <form class="goal-form" (ngSubmit)="submit()" data-testid="goal-form">
      <hg-health-text-field
        label="Name"
        [value]="name()"
        [errorText]="nameError()"
        (valueChange)="name.set($event)"
      />
      <div class="goal-form__target">
        <hg-health-text-field
          label="Target"
          type="number"
          [value]="targetValue()"
          [errorText]="targetValueError()"
          (valueChange)="targetValue.set($event)"
        />
        <hg-health-text-field
          label="Unit"
          [value]="targetUnit()"
          (valueChange)="targetUnit.set($event)"
        />
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Cadence</mat-label>
        <mat-select [value]="cadence()" (valueChange)="cadence.set($event)">
          @for (option of cadences; track option.id) {
            <mat-option [value]="option.id">{{ option.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="goal-form__actions">
        <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
        <button
          mat-flat-button
          type="submit"
          data-testid="goal-form-save"
          [disabled]="!canSave()"
        >
          Create goal
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: var(--hg-space-6);
      }

      .goal-form {
        display: grid;
        gap: var(--hg-space-4);
        max-width: var(--hg-size-readable-max);
      }

      .goal-form__target {
        display: grid;
        gap: var(--hg-space-3);
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .goal-form__actions {
        display: flex;
        gap: var(--hg-space-3);
        justify-content: flex-end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);

  readonly cadences = cadences;

  readonly name = signal('');
  readonly targetValue = signal('');
  readonly targetUnit = signal('');
  readonly cadence = signal<GoalCadence>('daily');
  private readonly attemptedSubmit = signal(false);

  readonly nameError = computed(() =>
    this.attemptedSubmit() && this.name().trim() === '' ? 'Name is required' : '',
  );
  readonly targetValueError = computed(() =>
    this.attemptedSubmit() && !(Number(this.targetValue()) > 0)
      ? 'Target must be greater than zero'
      : '',
  );
  readonly canSave = computed(
    () => this.name().trim() !== '' && Number(this.targetValue()) > 0,
  );

  cancel(): void {
    void this.router.navigateByUrl('/goals');
  }

  submit(): void {
    this.attemptedSubmit.set(true);
    if (!this.canSave()) return;
    this.goalsService
      .createGoal({
        name: this.name().trim(),
        cadence: this.cadence(),
        target: { value: Number(this.targetValue()), unit: this.targetUnit().trim() },
      })
      .subscribe((goal) => {
        void this.router.navigateByUrl(`/goals/${goal.id}`);
      });
  }
}
