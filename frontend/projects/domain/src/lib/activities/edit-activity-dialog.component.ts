import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent } from 'components';

@Component({
  selector: 'lib-edit-activity-dialog',
  imports: [ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent],
  templateUrl: './edit-activity-dialog.component.html',
  styleUrl: './edit-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActivityDialogComponent {}
