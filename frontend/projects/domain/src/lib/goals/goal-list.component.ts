import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivitiesService,
  ActivityEntry,
  GoalSummary,
  GoalsService,
  Reward,
  RewardsService,
} from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-goal-list',
  imports: [FormsModule],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent implements OnInit {
  private readonly goalsService = inject(GoalsService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly rewardsService = inject(RewardsService);

  readonly goals = signal<readonly GoalSummary[]>([]);
  readonly activities = signal<Record<string, readonly ActivityEntry[]>>({});
  readonly rewards = signal<readonly Reward[]>([]);
  readonly status = signal('Ready');

  goalName = 'Morning walk';
  goalDescription = '30 minutes outside';
  goalTarget = 30;
  goalUnit = 'minutes';
  goalCadence: GoalSummary['cadence'] = 'daily';
  rewardName = 'Trail breakfast';
  activityQuantity = 20;
  activityNotes = 'Park loop';
  readonly editNames: Partial<Record<string, string>> = {};

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('Loading');
    try {
      const [goals, rewards] = await Promise.all([
        firstValueFrom(this.goalsService.getGoals()),
        firstValueFrom(this.rewardsService.getRewards()),
      ]);

      this.goals.set(goals);
      this.rewards.set(rewards);
      await Promise.all(goals.map((goal) => this.loadActivities(goal.id)));
      this.status.set(`Loaded ${goals.length} goals`);
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load goals'}`);
    }
  }

  async createGoal(): Promise<void> {
    this.status.set('Creating goal');
    await firstValueFrom(
      this.goalsService.createGoal({
        name: this.goalName,
        description: this.goalDescription,
        cadence: this.goalCadence,
        target: {
          value: this.goalTarget,
          unit: this.goalUnit,
        },
      }),
    );
    await this.load();
  }

  async updateGoal(goal: GoalSummary): Promise<void> {
    const name = this.editNames[goal.id] ?? `${goal.name} updated`;
    this.status.set(`Updating ${goal.name}`);
    await firstValueFrom(
      this.goalsService.updateGoal(goal.id, {
        name,
        description: goal.description,
        cadence: goal.cadence,
        target: goal.target,
      }),
    );
    await this.load();
  }

  async deleteGoal(goal: GoalSummary): Promise<void> {
    this.status.set(`Deleting ${goal.name}`);
    await firstValueFrom(this.goalsService.deleteGoal(goal.id));
    await this.load();
  }

  async logActivity(goal: GoalSummary): Promise<void> {
    this.status.set(`Logging activity for ${goal.name}`);
    await firstValueFrom(
      this.activitiesService.logActivity(goal.id, {
        quantity: this.activityQuantity,
        notes: this.activityNotes,
        recordedAt: new Date().toISOString(),
      }),
    );
    await this.loadActivities(goal.id);
    this.status.set(`Logged activity for ${goal.name}`);
  }

  async updateActivity(goal: GoalSummary, activity: ActivityEntry): Promise<void> {
    this.status.set('Updating activity');
    await firstValueFrom(
      this.activitiesService.updateActivityEntry(goal.id, activity.id, {
        quantity: activity.quantity + 1,
        notes: `${activity.notes ?? 'Activity'} updated`,
        recordedAt: activity.recordedAt,
      }),
    );
    await this.loadActivities(goal.id);
    this.status.set('Updated activity');
  }

  async deleteActivity(goal: GoalSummary, activity: ActivityEntry): Promise<void> {
    this.status.set('Deleting activity');
    await firstValueFrom(this.activitiesService.deleteActivityEntry(goal.id, activity.id));
    await this.loadActivities(goal.id);
    this.status.set('Deleted activity');
  }

  async createReward(goal: GoalSummary): Promise<void> {
    this.status.set(`Creating reward for ${goal.name}`);
    await firstValueFrom(
      this.rewardsService.createReward(goal.id, {
        name: this.rewardName,
        description: 'Earned from the E2E flow',
        condition: { type: 'goal-target' },
      }),
    );
    this.rewards.set(await firstValueFrom(this.rewardsService.getRewards()));
    this.status.set(`Created reward for ${goal.name}`);
  }

  goalActivities(goalId: string): readonly ActivityEntry[] {
    return this.activities()[goalId] ?? [];
  }

  goalRewards(goalId: string): readonly Reward[] {
    return this.rewards().filter((reward) => reward.goalId === goalId);
  }

  private async loadActivities(goalId: string): Promise<void> {
    const entries = await firstValueFrom(this.activitiesService.getGoalActivities(goalId));
    this.activities.update((current) => ({
      ...current,
      [goalId]: entries,
    }));
  }
}
