import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { REWARDS_SERVICE, Reward } from 'api';
import {
  EmptyStateComponent,
  PageHeaderComponent,
  RewardCardComponent,
  SegmentedFilterComponent,
  SegmentedFilterOption,
} from 'components';

import { RewardStatusFilter, filterRewardsByStatus } from './filter-rewards';

const filterOptions: readonly SegmentedFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'earned', label: 'Earned' },
  { value: 'pending', label: 'Pending' },
];

@Component({
  selector: 'lib-reward-list',
  imports: [
    EmptyStateComponent,
    PageHeaderComponent,
    RewardCardComponent,
    SegmentedFilterComponent,
  ],
  template: `
    <hg-page-header
      title="Rewards"
      actionLabel="New reward"
      actionIcon="add"
      (actionSelected)="onCreate()"
    />
    @if (rewards().length === 0) {
      <hg-empty-state
        title="No rewards yet"
        description="Define a reward to celebrate hitting your goals."
        actionLabel="Create reward"
        actionIcon="add"
        icon="emoji_events"
        (actionSelected)="onCreate()"
      />
    } @else {
      <header class="reward-list__header">
        <hg-segmented-filter
          ariaLabel="Status"
          [options]="filterOptions"
          [value]="status()"
          (valueChange)="status.set($any($event))"
        />
      </header>

      <ul class="reward-list" data-testid="reward-list">
        @for (reward of visibleRewards(); track reward.id) {
          <li class="reward-list__item">
            <hg-reward-card
              [name]="reward.name"
              [description]="reward.description"
              [isEarned]="reward.status === 'earned'"
              [statusLabel]="statusLabel(reward)"
              [earnedDateLabel]="earnedLabel(reward)"
            />
          </li>
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

      .reward-list__header {
        margin-bottom: var(--hg-space-4);
      }

      .reward-list {
        display: grid;
        gap: var(--hg-space-4);
        grid-template-columns: repeat(auto-fill, minmax(var(--hg-size-card-min), 1fr));
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .reward-list__item {
        display: contents;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardListComponent {
  private readonly rewardsService = inject(REWARDS_SERVICE);
  private readonly router = inject(Router);

  readonly filterOptions = filterOptions;
  readonly status = signal<RewardStatusFilter>('all');

  readonly rewards = toSignal(this.rewardsService.getRewards(), {
    initialValue: [] as const,
  });
  readonly visibleRewards = computed(() => filterRewardsByStatus(this.rewards(), this.status()));

  statusLabel(reward: Reward): string {
    return reward.status === 'earned' ? 'Earned' : 'Pending';
  }

  earnedLabel(reward: Reward): string {
    return reward.earnedAt ? new Date(reward.earnedAt).toLocaleDateString() : '';
  }

  onCreate(): void {
    void this.router.navigateByUrl('/rewards/new');
  }
}
