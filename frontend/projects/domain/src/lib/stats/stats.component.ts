import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from 'components';

@Component({
  selector: 'lib-stats',
  imports: [PageHeaderComponent],
  template: `
    <hg-page-header title="Stats" />
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {}
