import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ActionButtonComponent,
  HealthTextFieldComponent,
  PageHeaderComponent,
  StatusBannerComponent,
} from 'components';

@Component({
  selector: 'lib-create-account',
  imports: [ActionButtonComponent, HealthTextFieldComponent, PageHeaderComponent, StatusBannerComponent],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent {}
