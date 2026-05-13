import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-auth-session-states',
  imports: [ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent],
  templateUrl: './auth-session-states.component.html',
  styleUrl: './auth-session-states.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSessionStatesComponent {}
