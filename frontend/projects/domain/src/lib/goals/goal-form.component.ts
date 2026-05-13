import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GOALS_SERVICE, GoalSummary } from 'api';
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
  selector: 'lib-goal-form',
  imports: [
    ActionButtonComponent,
    HealthTextFieldComponent,
    PageHeaderComponent,
    SegmentedFilterComponent,
    StatusBannerComponent,
  ],
  templateUrl: './goal-form.component.html',
  styleUrl: './goal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly goalsService = inject(GOALS_SERVICE);

  readonly status = signal('Ready');
  readonly cadenceOptions: readonly SegmentedFilterOption[] = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  goalId = '';
  name = 'Morning walk';
  description = '30 minutes outside';
  target = 30;
  unit = 'minutes';
  cadence: GoalSummary['cadence'] = 'daily';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.goalId = id;
      void this.loadGoal(id);
    }
  }

  async save(): Promise<void> {
    this.status.set(this.goalId ? 'Updating goal' : 'Creating goal');
    const input = {
      name: this.name,
      description: this.description,
      cadence: this.cadence,
      target: { value: this.target, unit: this.unit },
    };

    if (this.goalId) {
      await firstValueFrom(this.goalsService.updateGoal(this.goalId, input));
      this.status.set('Updated goal');
    } else {
      const goal = await firstValueFrom(this.goalsService.createGoal(input));
      this.goalId = goal.id;
      this.status.set('Created goal');
    }
  }

  setTarget(value: string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.target = parsed;
    }
  }

  setCadence(value: string): void { this.cadence = value as GoalSummary['cadence']; }

  private async loadGoal(id: string): Promise<void> {
    this.status.set('Loading goal');
    try {
      const goal = await firstValueFrom(this.goalsService.getGoal(id));
      this.name = goal.name;
      this.description = goal.description;
      this.target = goal.target.value;
      this.unit = goal.target.unit;
      this.cadence = goal.cadence;
      this.status.set('Loaded goal');
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load goal'}`);
    }
  }
}
