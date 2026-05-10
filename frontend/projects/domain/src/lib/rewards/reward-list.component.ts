import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
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
    @if (readyToClaim(); as hero) {
      <section
        class="reward-hero"
        data-testid="reward-hero"
        aria-labelledby="reward-hero-title"
      >
        <span class="reward-hero__icon-frame" aria-hidden="true">
          <mat-icon class="reward-hero__icon" fontSet="material-symbols-rounded">
            emoji_events
          </mat-icon>
        </span>
        <div class="reward-hero__copy">
          <p class="reward-hero__eyebrow" data-testid="reward-hero-eyebrow">READY TO CLAIM</p>
          <h2 class="reward-hero__title" id="reward-hero-title">{{ hero.name }}</h2>
          <p class="reward-hero__description">{{ hero.description }}</p>
          <div class="reward-hero__actions">
            <button
              class="reward-hero__claim"
              type="button"
              data-testid="reward-hero-claim"
              [attr.aria-label]="'Claim ' + hero.name"
              (click)="onClaim(hero)"
            >
              Claim
            </button>
            <button
              class="reward-hero__secondary"
              type="button"
              data-testid="reward-hero-secondary"
              (click)="onMaybeLater(hero)"
            >
              Maybe later
            </button>
          </div>
        </div>
      </section>
    }
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

      @for (group of groupedRewards(); track group.label) {
        <section class="reward-section" [attr.data-status]="group.status">
          <h3 class="reward-section__label">{{ group.label }}</h3>
          <ul class="reward-list" data-testid="reward-list">
            @for (reward of group.rewards; track reward.id) {
              <li class="reward-list__item">
                <hg-reward-card
                  [name]="reward.name"
                  [description]="reward.description"
                  [isEarned]="reward.status === 'earned'"
                  [statusLabel]="statusLabel(reward)"
                  [earnedDateLabel]="earnedLabel(reward)"
                  [progressCurrent]="reward.progress?.current ?? null"
                  [progressTarget]="reward.progress?.target ?? null"
                />
              </li>
            }
          </ul>
        </section>
      }
    }
  `,
  styles: [
    `
      :host {
        background: #f1f5ed;
        display: block;
        min-height: 100%;
        padding: 16px;
      }

      @media (min-width: 768px) {
        :host {
          padding: 24px;
        }
      }

      @media (min-width: 1200px) {
        :host {
          padding: 32px;
        }
      }

      .reward-list__header {
        margin-bottom: var(--hg-space-4);
      }

      .reward-list {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      @media (min-width: 768px) {
        .reward-list {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1200px) {
        .reward-list {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .reward-list__item {
        display: contents;
      }

      .reward-hero {
        align-items: center;
        background: #ffd7ee;
        border-radius: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.149);
        display: grid;
        gap: var(--hg-space-4);
        grid-template-columns: 1fr;
        margin-bottom: var(--hg-space-6);
        padding: 32px;
      }

      @media (min-width: 768px) {
        .reward-hero {
          grid-template-columns: auto 1fr;
        }
      }

      .reward-hero__icon-frame {
        align-items: center;
        background: #9b2680;
        border-radius: 9999px;
        display: inline-flex;
        height: 120px;
        justify-content: center;
        width: 120px;
      }

      .reward-hero__icon {
        color: #ffffff;
        font-size: 48px;
        height: 48px;
        width: 48px;
      }

      .reward-hero__copy {
        display: grid;
        gap: var(--hg-space-2);
      }

      .reward-hero__actions {
        display: flex;
        gap: 12px;
        margin-top: var(--hg-space-3);
      }

      .reward-hero__claim {
        background: #9b2680;
        border: none;
        border-radius: 9999px;
        color: #ffffff;
        cursor: pointer;
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        padding: 12px 24px;
      }

      .reward-hero__claim:hover {
        filter: brightness(1.05);
      }

      .reward-hero__claim:focus-visible {
        outline: 2px solid #006d3f;
        outline-offset: 2px;
      }

      .reward-hero__secondary {
        background: transparent;
        border: 1px solid #c2c9be;
        border-radius: 9999px;
        color: inherit;
        cursor: pointer;
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        padding: 12px 24px;
      }

      .reward-hero__secondary:focus-visible {
        outline: 2px solid #006d3f;
        outline-offset: 2px;
      }

      .reward-hero__eyebrow {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.5px;
        margin: 0;
        text-transform: uppercase;
      }

      .reward-hero__title {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 36px;
        font-weight: 500;
        margin: 0;
      }

      .reward-hero__description {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
      }

      .reward-section {
        margin-bottom: var(--hg-space-6);
      }

      .reward-section[data-status='in-progress'] ::ng-deep .reward-card,
      .reward-section[data-status='locked'] ::ng-deep .reward-card {
        background: #ebefe7;
      }

      .reward-section[data-status='locked'] .reward-list__item {
        opacity: 0.65;
      }

      .reward-section__label {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 var(--hg-space-3);
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
  readonly readyToClaim = computed(() =>
    this.rewards().find((r) => r.status === 'ready-to-claim') ?? null,
  );

  readonly groupedRewards = computed(() => {
    const visible = this.visibleRewards().filter((r) => r.status !== 'ready-to-claim');
    const order: Array<{ status: Reward['status']; label: string }> = [
      { status: 'in-progress', label: 'In progress' },
      { status: 'pending', label: 'Pending' },
      { status: 'earned', label: 'Earned' },
      { status: 'locked', label: 'Locked' },
    ];
    return order
      .map(({ status, label }) => ({
        status,
        label,
        rewards: visible.filter((r) => r.status === status),
      }))
      .filter((group) => group.rewards.length > 0);
  });

  statusLabel(reward: Reward): string {
    return reward.status === 'earned' ? 'Earned' : 'Pending';
  }

  earnedLabel(reward: Reward): string {
    return reward.earnedAt ? new Date(reward.earnedAt).toLocaleDateString() : '';
  }

  onCreate(): void {
    void this.router.navigateByUrl('/rewards/new');
  }

  onClaim(_reward: Reward): void {
    // Wired in 05-TC-F-004; visual + structural only for now.
  }

  onMaybeLater(_reward: Reward): void {
    // Visual placeholder; defer-claim flow not yet specified.
  }
}
