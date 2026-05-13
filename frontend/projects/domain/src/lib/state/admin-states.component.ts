import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, MetricCardComponent, PageHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-admin-states',
  imports: [ActionButtonComponent, MetricCardComponent, PageHeaderComponent, StatusBannerComponent],
  templateUrl: './admin-states.component.html',
  styleUrl: './admin-states.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatesComponent {}
