import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from 'components';

interface StatTile {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone: 'success' | 'streak' | 'info' | 'reward';
}

@Component({
  selector: 'lib-stats',
  imports: [PageHeaderComponent],
  template: `
    <hg-page-header title="Stats" />
    <h2 class="stats-section__title">This week</h2>
    <ul class="stat-tiles" data-testid="stat-tiles">
      @for (tile of tiles; track tile.id) {
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  readonly tiles: readonly StatTile[] = [
    { id: 'completion', label: 'Goal completion', value: '87%', tone: 'success' },
    { id: 'streak', label: 'Current streak', value: '14 days', tone: 'streak' },
    { id: 'minutes', label: 'Active minutes', value: '1,240', tone: 'info' },
    { id: 'rewards', label: 'Rewards earned', value: '6', tone: 'reward' },
    { id: 'level', label: 'Level', value: 'Lvl 8', tone: 'success' },
  ];
}
