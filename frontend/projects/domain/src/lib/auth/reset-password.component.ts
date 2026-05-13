import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, HealthTextFieldComponent, PageHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-reset-password',
  imports: [ActionButtonComponent, HealthTextFieldComponent, PageHeaderComponent, StatusBannerComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {}
