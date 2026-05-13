import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AUTH_SERVICE } from 'api';
import {
  ActionButtonComponent,
  AppBrandComponent,
  HealthTextFieldComponent,
  StatusBannerComponent,
} from 'components';

@Component({
  selector: 'lib-sign-in',
  imports: [ActionButtonComponent, AppBrandComponent, HealthTextFieldComponent, StatusBannerComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly authService = inject(AUTH_SERVICE);

  email = 'quinn@example.com';
  password = '';

  signIn(): void {
    void this.authService.signIn('/home');
  }
}
