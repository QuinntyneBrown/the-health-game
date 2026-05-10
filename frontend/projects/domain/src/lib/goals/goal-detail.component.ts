import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ACTIVITIES_SERVICE, ActivityEntry, GOALS_SERVICE, GoalSummary } from 'api';
import {
  ActivityListItemComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  StreakSummaryComponent,
} from 'components';

import { DeleteActivityDialogComponent } from '../activities/delete-activity-dialog.component';
import {
  EditActivityDialogComponent,
  EditActivityDialogData,
} from '../activities/edit-activity-dialog.component';
import { LogActivityDialogComponent } from '../activities/log-activity-dialog.component';
import {
  LogActivitySheetComponent,
  LogActivitySheetData,
} from '../activities/log-activity-sheet.component';
import { pickLogActivityContainer } from '../activities/log-activity-container';
import {
  DeleteGoalDialogComponent,
  DeleteGoalDialogData,
} from './delete-goal-dialog.component';
import type { NavigationBarVariant } from 'components';

type DetailState =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly goal: GoalSummary }
  | { readonly status: 'not-found' };

@Component({
  selector: 'lib-goal-detail',
  imports: [
    ActivityListItemComponent,
    EmptyStateComponent,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    StreakSummaryComponent,
  ],
  templateUrl: './goal-detail.component.html',
  styleUrl: './goal-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalDetailComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly activitiesService = inject(ACTIVITIES_SERVICE);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);

  private readonly state = signal<DetailState>({ status: 'loading' });
  readonly goal = computed(() =>
    this.state().status === 'loaded' ? (this.state() as { goal: GoalSummary }).goal : null,
  );
  readonly notFound = computed(() => this.state().status === 'not-found');
  readonly activities = signal<readonly ActivityEntry[]>([]);
  readonly sortedActivities = computed(() =>
    [...this.activities()].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
  );

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.state.set({ status: 'not-found' });
      return;
    }
    this.goalsService.getGoal(id).subscribe({
      next: (goal) => this.state.set({ status: 'loaded', goal }),
      error: () => this.state.set({ status: 'not-found' }),
    });
    this.activitiesService.getGoalActivities(id).subscribe({
      next: (entries) => this.activities.set(entries),
      error: () => this.activities.set([]),
    });
  }

  activityTitle(entry: ActivityEntry, goal: GoalSummary): string {
    return `${entry.quantity} ${goal.target.unit}`;
  }

  activityMeta(entry: ActivityEntry): string {
    return new Date(entry.recordedAt).toLocaleString();
  }

  async onEditEntry(entry: ActivityEntry): Promise<void> {
    const goal = this.goal();
    if (!goal) return;
    const ref = this.dialog.open<
      EditActivityDialogComponent,
      EditActivityDialogData,
      ActivityEntry | undefined
    >(EditActivityDialogComponent, {
      data: { entry, unit: goal.target.unit },
      width: '32rem',
    });
    const updated = await firstValueFrom(ref.afterClosed());
    if (updated) {
      this.activities.update((entries) =>
        entries.map((e) => (e.id === updated.id ? updated : e)),
      );
      this.refreshGoal(goal.id);
    }
  }

  async onDeleteEntry(entry: ActivityEntry): Promise<void> {
    const goal = this.goal();
    if (!goal) return;
    const ref = this.dialog.open<DeleteActivityDialogComponent, undefined, boolean>(
      DeleteActivityDialogComponent,
    );
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;
    await firstValueFrom(this.activitiesService.deleteActivityEntry(entry.id));
    this.activities.update((entries) => entries.filter((e) => e.id !== entry.id));
    this.refreshGoal(goal.id);
  }

  private refreshGoal(id: string): void {
    this.goalsService.getGoal(id).subscribe({
      next: (goal) => this.state.set({ status: 'loaded', goal }),
    });
  }

  cadenceLabel(goal: GoalSummary): string {
    return goal.cadence.charAt(0).toUpperCase() + goal.cadence.slice(1);
  }

  targetLabel(goal: GoalSummary): string {
    return `${goal.target.value} ${goal.target.unit}`;
  }

  onEdit(): void {
    const goal = this.goal();
    if (goal) {
      void this.router.navigateByUrl(`/goals/${goal.id}/edit`);
    }
  }

  async onDelete(): Promise<void> {
    const goal = this.goal();
    if (!goal) return;
    const ref = this.dialog.open<
      DeleteGoalDialogComponent,
      DeleteGoalDialogData,
      boolean
    >(DeleteGoalDialogComponent, {
      data: { name: goal.name },
      ariaModal: true,
      role: 'alertdialog',
      restoreFocus: true,
    });
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;
    await firstValueFrom(this.goalsService.deleteGoal(goal.id));
    void this.router.navigateByUrl('/goals');
  }

  onBack(): void {
    void this.router.navigateByUrl('/goals');
  }

  private currentLogContainer: 'sheet' | 'dialog' | null = null;
  private currentLogData: LogActivitySheetData | null = null;
  private currentSheetRef: ReturnType<MatBottomSheet['open']> | null = null;
  private currentDialogRef: ReturnType<MatDialog['open']> | null = null;
  private resizeListener: (() => void) | null = null;

  onLogActivity(): void {
    const goal = this.goal();
    if (!goal) return;
    const data: LogActivitySheetData = { goalId: goal.id, unit: goal.target.unit };
    this.currentLogData = data;
    this.openLogContainerForViewport(data);
    if (!this.resizeListener) {
      this.resizeListener = () => this.maybeSwapLogContainer();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  private openLogContainerForViewport(data: LogActivitySheetData): void {
    const variant: NavigationBarVariant = window.innerWidth >= 768 ? 'rail' : 'bottom';
    const container = pickLogActivityContainer(variant);
    this.currentLogContainer = container;
    if (container === 'sheet') {
      const ref = this.bottomSheet.open(LogActivitySheetComponent, { data });
      this.currentSheetRef = ref;
      ref.afterDismissed().subscribe((entry) => {
        if (entry) this.refreshActivities();
        this.cleanupLogContainer();
      });
    } else {
      const ref = this.dialog.open(LogActivityDialogComponent, { data, width: '35rem' });
      this.currentDialogRef = ref;
      ref.afterClosed().subscribe((entry) => {
        if (entry) this.refreshActivities();
        this.cleanupLogContainer();
      });
    }
  }

  private refreshActivities(): void {
    const id = this.goal()?.id;
    if (!id) return;
    this.activitiesService.getGoalActivities(id).subscribe({
      next: (entries) => this.activities.set(entries),
    });
  }

  private maybeSwapLogContainer(): void {
    const data = this.currentLogData;
    if (!data || !this.currentLogContainer) return;
    const variant: NavigationBarVariant = window.innerWidth >= 768 ? 'rail' : 'bottom';
    const next = pickLogActivityContainer(variant);
    if (next === this.currentLogContainer) return;
    if (this.currentSheetRef) {
      this.currentSheetRef.dismiss();
      this.currentSheetRef = null;
    }
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
      this.currentDialogRef = null;
    }
    // Open the other container with the persisted draft state.
    this.currentLogContainer = null;
    this.openLogContainerForViewport(data);
  }

  private cleanupLogContainer(): void {
    this.currentLogContainer = null;
    this.currentSheetRef = null;
    this.currentDialogRef = null;
    if (!this.currentLogData) return;
    // Only clear if both refs are gone (true close, not a swap).
    setTimeout(() => {
      if (!this.currentLogContainer) {
        this.currentLogData = null;
        if (this.resizeListener) {
          window.removeEventListener('resize', this.resizeListener);
          this.resizeListener = null;
        }
      }
    }, 50);
  }
}
