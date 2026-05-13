import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-delete-activity-dialog',
  imports: [ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent],
  templateUrl: './delete-activity-dialog.component.html',
  styleUrl: './delete-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteActivityDialogComponent {}
