import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { GOALS_SERVICE, GoalSummary, REWARDS_SERVICE, RewardConditionType } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

@Component({
  selector: 'lib-reward-form',
  imports: [
    FormsModule,
    HealthTextFieldComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
  ],
  template: `
    <form class="reward-form" (ngSubmit)="submit()" data-testid="reward-form">
      <h1 class="reward-form__title">Define reward</h1>

      <hg-health-text-field
        label="Name"
        [value]="name()"
        [errorText]="nameError()"
        (valueChange)="name.set($event)"
      />
      <hg-health-text-field
        label="Description"
        [value]="description()"
        (valueChange)="description.set($event)"
      />

      <mat-form-field appearance="outline">
        <mat-label>Goal</mat-label>
        <mat-select
          [value]="goalId()"
          data-testid="reward-form-goal"
          (valueChange)="goalId.set($event)"
        >
          @for (g of goals(); track g.id) {
            <mat-option [value]="g.id">{{ g.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <fieldset class="reward-form__condition">
        <legend>Condition</legend>
        <mat-radio-group
          [value]="conditionType()"
          (change)="conditionType.set($any($event.value))"
        >
          <mat-radio-button value="goal-target" data-testid="reward-form-goal-target">
            Goal target met
          </mat-radio-button>
          <mat-radio-button value="streak-milestone" data-testid="reward-form-streak">
            Streak milestone
          </mat-radio-button>
        </mat-radio-group>
        @if (conditionType() === 'streak-milestone') {
          <hg-health-text-field
            label="Streak days"
            type="number"
            [value]="streakDays()"
            [errorText]="streakError()"
            (valueChange)="streakDays.set($event)"
          />
        }
      </fieldset>

      <div class="reward-form__actions">
        <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
        <button
          mat-flat-button
          type="submit"
          data-testid="reward-form-save"
          [disabled]="!canSave()"
        >
          Create reward
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

      .reward-form {
        display: grid;
        gap: var(--hg-space-4);
        max-width: var(--hg-size-readable-max);
      }

      .reward-form__title {
        font-size: var(--hg-font-size-headline-sm);
        margin: 0;
      }

      .reward-form__condition {
        border: 0;
        display: grid;
        gap: var(--hg-space-3);
        margin: 0;
        padding: 0;
      }

      .reward-form__condition mat-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hg-space-3);
      }

      .reward-form__actions {
        display: flex;
        gap: var(--hg-space-3);
        justify-content: flex-end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardFormComponent {
  private readonly rewardsService = inject(REWARDS_SERVICE);
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);

  readonly goals = signal<readonly GoalSummary[]>([]);
  readonly name = signal('');
  readonly description = signal('');
  readonly goalId = signal<string | null>(null);
  readonly conditionType = signal<RewardConditionType>('goal-target');
  readonly streakDays = signal('1');
  private readonly attemptedSubmit = signal(false);

  readonly nameError = computed(() =>
    this.attemptedSubmit() && this.name().trim() === '' ? 'Name is required' : '',
  );
  readonly streakError = computed(() =>
    this.attemptedSubmit() &&
    this.conditionType() === 'streak-milestone' &&
    !(Number(this.streakDays()) >= 1)
      ? 'Streak days must be at least 1'
      : '',
  );
  readonly canSave = computed(() => true);

  private isValid(): boolean {
    return (
      this.name().trim() !== '' &&
      this.goalId() !== null &&
      (this.conditionType() === 'goal-target' || Number(this.streakDays()) >= 1)
    );
  }

  constructor() {
    this.goalsService.getGoals().subscribe((goals) => {
      this.goals.set(goals);
      if (!this.goalId() && goals.length > 0) {
        this.goalId.set(goals[0].id);
      }
    });
  }

  cancel(): void {
    void this.router.navigateByUrl('/rewards');
  }

  async submit(): Promise<void> {
    this.attemptedSubmit.set(true);
    if (!this.isValid()) return;
    const goalId = this.goalId();
    if (!goalId) return;
    const condition =
      this.conditionType() === 'goal-target'
        ? ({ type: 'goal-target' } as const)
        : ({ type: 'streak-milestone', streakDays: Number(this.streakDays()) } as const);
    await firstValueFrom(
      this.rewardsService.createReward(goalId, {
        name: this.name().trim(),
        description: this.description().trim(),
        condition,
      }),
    );
    void this.router.navigateByUrl('/rewards');
  }
}
