import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GOALS_SERVICE } from 'api';
import { EmptyStateComponent } from 'components';

@Component({
  selector: 'lib-goal-list',
  imports: [EmptyStateComponent],
  template: `
    @if (isEmpty()) {
      <hg-empty-state
        title="No goals yet"
        description="Create your first goal to start tracking your habits."
        actionLabel="Create goal"
        actionIcon="add"
        icon="flag"
        (actionSelected)="onCreate()"
      />
    } @else {
      <ul class="goal-list" data-testid="goal-list">
        @for (goal of goals(); track goal.id) {
          <li class="goal-list__item">{{ goal.name }}</li>
        }
      </ul>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        padding: var(--hg-space-6);
      }

      .goal-list {
        display: grid;
        gap: var(--hg-space-3);
        list-style: none;
        margin: 0;
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly router = inject(Router);

  readonly goals = toSignal(this.goalsService.getGoals(), { initialValue: [] as const });
  readonly isEmpty = computed(() => this.goals().length === 0);

  onCreate(): void {
    void this.router.navigateByUrl('/goals/new');
  }
}
