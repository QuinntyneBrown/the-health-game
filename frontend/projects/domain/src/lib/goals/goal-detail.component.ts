import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { GOALS_SERVICE, GoalSummary } from 'api';
import { PageHeaderComponent, StreakSummaryComponent } from 'components';

type DetailState =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly goal: GoalSummary }
  | { readonly status: 'not-found' };

@Component({
  selector: 'lib-goal-detail',
  imports: [MatButtonModule, PageHeaderComponent, StreakSummaryComponent],
  templateUrl: './goal-detail.component.html',
  styleUrl: './goal-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalDetailComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly state = signal<DetailState>({ status: 'loading' });
  readonly goal = computed(() =>
    this.state().status === 'loaded' ? (this.state() as { goal: GoalSummary }).goal : null,
  );
  readonly notFound = computed(() => this.state().status === 'not-found');

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

  onDelete(): void {
    // Wired in task 19.
  }

  onBack(): void {
    void this.router.navigateByUrl('/goals');
  }
}
