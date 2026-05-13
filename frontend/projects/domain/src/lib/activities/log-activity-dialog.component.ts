import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent } from 'components';

@Component({
  selector: 'lib-log-activity-dialog',
  imports: [ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent],
  templateUrl: './log-activity-dialog.component.html',
  styleUrl: './log-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogActivityDialogComponent {}
