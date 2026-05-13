import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-delete-account-dialog',
  imports: [ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent, StatusBannerComponent],
  templateUrl: './delete-account-dialog.component.html',
  styleUrl: './delete-account-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {}
