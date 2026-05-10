import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GOALS_SERVICE } from 'api';
import { PageHeaderComponent, SegmentedFilterComponent, SegmentedFilterOption } from 'components';

interface StatTile {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone: 'success' | 'streak' | 'info' | 'reward';
}

type StatsWindow = 'week' | 'month' | 'year';

const WINDOW_OPTIONS: readonly SegmentedFilterOption[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

@Component({
  selector: 'lib-stats',
  imports: [PageHeaderComponent, SegmentedFilterComponent],
  template: `
    <hg-page-header title="Stats" />
    @if (showEmptyState()) {
      <section class="stats-empty" data-testid="stats-empty">
        <p class="stats-empty__title">No activity yet</p>
        <p class="stats-empty__description">Log your first activity to get started.</p>
      </section>
    }
    <header class="stats-window">
      <hg-segmented-filter
        ariaLabel="Activity window"
        [options]="windowOptions"
        [value]="windowChoice()"
        (valueChange)="windowChoice.set($any($event))"
      />
    </header>
    <h2 class="stats-section__title">Activity over time</h2>
    <section class="activity-chart" data-testid="activity-chart" aria-label="Daily activity minutes">
      <ol class="activity-chart__bars" [attr.data-window]="windowChoice()">
        @for (day of activeSeries(); track day.label) {
          <li class="activity-chart__column">
            <span
              class="activity-chart__bar"
              [style.height.%]="day.value"
              [attr.aria-label]="day.label + ': ' + day.value + '%'"
            ></span>
            <span class="activity-chart__axis-label">{{ day.label }}</span>
          </li>
        }
      </ol>
    </section>
    <h2 class="stats-section__title">This week</h2>
    <ul class="stat-tiles" data-testid="stat-tiles">
      @for (tile of tiles(); track tile.id) {
        <li
          class="stat-tile"
          [class.stat-tile--success]="tile.tone === 'success'"
          [class.stat-tile--streak]="tile.tone === 'streak'"
          [class.stat-tile--info]="tile.tone === 'info'"
          [class.stat-tile--reward]="tile.tone === 'reward'"
        >
          <span class="stat-tile__value">{{ tile.value }}</span>
          <span class="stat-tile__label">{{ tile.label }}</span>
        </li>
      }
    </ul>
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

      .stat-tiles {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(2, 1fr);
        list-style: none;
        margin: 0;
        padding: 0;
      }
      @media (min-width: 768px) {
        .stat-tiles {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (min-width: 1200px) {
        .stat-tiles {
          grid-template-columns: repeat(5, 1fr);
        }
      }

      .stat-tile {
        background: #94f7b4;
        border-radius: 16px;
        color: #00210f;
        display: grid;
        gap: 4px;
        padding: 16px;
      }

      .stat-tile--streak {
        background: #ffdcc4;
        color: #341100;
      }
      .stat-tile--info {
        background: #beeaf6;
        color: #001f29;
      }
      .stat-tile--reward {
        background: #ffd7ee;
        color: #38071e;
      }

      .stat-tile__value {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 32px;
        font-weight: 600;
      }

      .stat-tile__label {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 12px;
        font-weight: 500;
      }

      .stats-section__title {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 var(--hg-space-3);
      }

      .activity-chart {
        background: #ffffff;
        border-radius: 16px;
        margin-bottom: var(--hg-space-6);
        padding: 24px;
      }

      .activity-chart__bars {
        align-items: end;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(7, 1fr);
        height: 160px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .activity-chart__bars[data-window='month'] {
        grid-template-columns: repeat(4, 1fr);
      }
      .activity-chart__bars[data-window='year'] {
        grid-template-columns: repeat(12, 1fr);
        gap: 6px;
      }

      .stats-window {
        margin-bottom: var(--hg-space-3);
      }

      .stats-empty {
        background: #ffffff;
        border-radius: 16px;
        margin-bottom: var(--hg-space-6);
        padding: 24px;
      }

      .stats-empty__title {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 8px;
      }

      .stats-empty__description {
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      .activity-chart__column {
        display: grid;
        gap: 8px;
        grid-template-rows: 1fr auto;
        height: 100%;
      }

      .activity-chart__bar {
        align-self: end;
        background: #006d3f;
        border-radius: 6px;
        display: block;
        min-height: 4px;
        width: 100%;
      }

      .activity-chart__axis-label {
        color: #424940;
        font-family: Inter, Roboto, Arial, sans-serif;
        font-size: 12px;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  private readonly goalsService = inject(GOALS_SERVICE);
  private readonly goals = toSignal(this.goalsService.getGoals(), { initialValue: [] as const });

  readonly windowOptions = WINDOW_OPTIONS;
  readonly windowChoice = signal<StatsWindow>('week');

  private readonly weekSeries: ReadonlyArray<{ label: string; value: number }> = [
    { label: 'Mon', value: 60 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 70 },
    { label: 'Sat', value: 30 },
    { label: 'Sun', value: 55 },
  ];
  private readonly monthSeries: ReadonlyArray<{ label: string; value: number }> = [
    { label: 'W1', value: 70 },
    { label: 'W2', value: 50 },
    { label: 'W3', value: 80 },
    { label: 'W4', value: 60 },
  ];
  private readonly yearSeries: ReadonlyArray<{ label: string; value: number }> = [
    { label: 'Jan', value: 40 },
    { label: 'Feb', value: 55 },
    { label: 'Mar', value: 65 },
    { label: 'Apr', value: 75 },
    { label: 'May', value: 80 },
    { label: 'Jun', value: 70 },
    { label: 'Jul', value: 65 },
    { label: 'Aug', value: 60 },
    { label: 'Sep', value: 70 },
    { label: 'Oct', value: 75 },
    { label: 'Nov', value: 65 },
    { label: 'Dec', value: 50 },
  ];

  readonly activeSeries = computed(() => {
    switch (this.windowChoice()) {
      case 'month':
        return this.monthSeries;
      case 'year':
        return this.yearSeries;
      default:
        return this.weekSeries;
    }
  });

  activityLabel(): string {
    switch (this.windowChoice()) {
      case 'month':
        return 'Activities this month';
      case 'year':
        return 'Activities this year';
      default:
        return 'Activities this week';
    }
  }
  readonly weekTotal = this.weekSeries.reduce((sum, day) => sum + day.value, 0);
  readonly activeTotal = computed(() =>
    this.activeSeries().reduce((sum, day) => sum + day.value, 0),
  );
  // Deterministic level formula: floor(cumulative activity / 50). Pure
  // function of the same series the bar chart shows, so visual + tile
  // stay consistent without a server round-trip.
  readonly userLevel = Math.floor(this.weekTotal / 50);

  readonly showEmptyState = computed(
    () => this.goals().length === 0 && this.weekTotal === 0,
  );

  readonly currentStreakDays = computed(() => {
    const all = this.goals();
    if (all.length === 0) return 0;
    return Math.max(...all.map((g) => g.currentStreak ?? 0));
  });

  readonly completionPercent = computed(() => {
    const all = this.goals();
    if (all.length === 0) return 0;
    const ratios = all.map((g) => {
      const target = Math.max(g.target.value, 1);
      const completed = Math.max(g.completedQuantity, 0);
      return Math.min(completed / target, 1);
    });
    const avg = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    return Math.round(avg * 100);
  });

  readonly tiles = computed<readonly StatTile[]>(() => [
    {
      id: 'completion',
      label: 'Goal completion',
      value: `${this.completionPercent()}%`,
      tone: 'success',
    },
    { id: 'goals', label: 'Active goals', value: String(this.goals().length), tone: 'success' },
    {
      id: 'streak',
      label: 'Current streak',
      value: `${this.currentStreakDays()} days`,
      tone: 'streak',
    },
    {
      id: 'window-total',
      label: this.activityLabel(),
      value: String(this.activeTotal()),
      tone: 'info',
    },
    { id: 'rewards', label: 'Rewards earned', value: '6', tone: 'reward' },
    {
      id: 'level',
      label: 'Level',
      value: `Lvl ${this.userLevel}`,
      tone: 'success',
    },
  ]);
}
