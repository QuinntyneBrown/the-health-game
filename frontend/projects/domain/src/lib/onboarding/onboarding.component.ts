import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {}
