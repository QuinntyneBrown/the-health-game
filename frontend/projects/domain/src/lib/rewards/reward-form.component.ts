import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GOALS_SERVICE, GoalSummary, REWARDS_SERVICE } from 'api';
import {
  ActionButtonComponent,
  HealthTextFieldComponent,
  PageHeaderComponent,
  SegmentedFilterComponent,
  SegmentedFilterOption,
  StatusBannerComponent,
} from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-reward-form',
  imports: [
    ActionButtonComponent,
    HealthTextFieldComponent,
    PageHeaderComponent,
    SegmentedFilterComponent,
    StatusBannerComponent,
  ],
  templateUrl: './reward-form.component.html',
  styleUrl: './reward-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardFormComponent implements OnInit {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly rewardsService = inject(REWARDS_SERVICE);

  readonly goals = signal<readonly GoalSummary[]>([]);
  readonly status = signal('Ready');
  readonly conditionOptions: readonly SegmentedFilterOption[] = [
    { value: 'goal-target', label: 'Goal target' },
    { value: 'streak-milestone', label: 'Streak milestone' },
  ];

  goalId = '';
  name = 'Trail breakfast';
  description = 'Saturday breakfast after a full week';
  conditionType = 'streak-milestone';
  streakDays = 7;

  ngOnInit(): void {
    void this.loadGoals();
  }

  async save(): Promise<void> {
    if (!this.goalId) {
      this.status.set('Choose a goal before creating a reward');
      return;
    }

    this.status.set('Creating reward');
    await firstValueFrom(
      this.rewardsService.createReward(this.goalId, {
        name: this.name,
        description: this.description,
        condition:
          this.conditionType === 'streak-milestone'
            ? { type: 'streak-milestone', streakDays: this.streakDays }
            : { type: 'goal-target' },
      }),
    );
    this.status.set('Created reward');
  }

  setGoal(value: string): void { this.goalId = value; }
  setCondition(value: string): void { this.conditionType = value; }
  setStreakDays(value: string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.streakDays = parsed;
    }
  }

  goalOptions(): readonly SegmentedFilterOption[] {
    return this.goals().map((goal) => ({ value: goal.id, label: goal.name }));
  }

  private async loadGoals(): Promise<void> {
    this.status.set('Loading goals');
    try {
      const goals = await firstValueFrom(this.goalsService.getGoals());
      this.goals.set(goals);
      this.goalId = goals[0]?.id ?? '';
      this.status.set(`Loaded ${goals.length} goals`);
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load goals'}`);
    }
  }
}
