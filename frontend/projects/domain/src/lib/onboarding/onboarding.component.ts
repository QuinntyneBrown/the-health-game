import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, AppBrandComponent, MetricCardComponent, PageHeaderComponent } from 'components';

@Component({
  selector: 'lib-onboarding',
  imports: [ActionButtonComponent, AppBrandComponent, MetricCardComponent, PageHeaderComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {}
