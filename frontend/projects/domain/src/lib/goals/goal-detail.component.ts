import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ACTIVITIES_SERVICE, ActivityEntry, GOALS_SERVICE, GoalSummary } from 'api';
import {
  ActivityListItemComponent,
  EmptyStateComponent,
  GoalCardComponent,
  MetricCardComponent,
  PageHeaderComponent,
  SectionHeaderComponent,
  StatusBannerComponent,
} from 'components';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-goal-detail',
  imports: [
    ActivityListItemComponent,
    EmptyStateComponent,
    GoalCardComponent,
    MetricCardComponent,
    PageHeaderComponent,
    SectionHeaderComponent,
    StatusBannerComponent,
  ],
  templateUrl: './goal-detail.component.html',
  styleUrl: './goal-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly activitiesService = inject(ACTIVITIES_SERVICE);

  readonly goal = signal<GoalSummary | null>(null);
  readonly activities = signal<readonly ActivityEntry[]>([]);
  readonly status = signal('Loading goal');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.load(id);
    } else {
      this.status.set('Missing goal id');
    }
  }

  async load(id: string): Promise<void> {
    try {
      const [goal, activities] = await Promise.all([
        firstValueFrom(this.goalsService.getGoal(id)),
        firstValueFrom(this.activitiesService.getGoalActivities(id)),
      ]);
      this.goal.set(goal);
      this.activities.set(activities);
      this.status.set('Loaded goal');
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load goal'}`);
    }
  }

  progress(goal: GoalSummary): number {
    if (goal.target.value <= 0) return 0;
    return Math.round(Math.min(goal.completedQuantity / goal.target.value, 1) * 100);
  }

  activityTitle(activity: ActivityEntry, goal: GoalSummary): string {
    return `${activity.quantity} ${goal.target.unit}`;
  }
}
