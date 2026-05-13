import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent } from 'components';

@Component({
  selector: 'lib-log-activity-sheet',
  imports: [ActionButtonComponent, HealthTextFieldComponent, SectionHeaderComponent],
  templateUrl: './log-activity-sheet.component.html',
  styleUrl: './log-activity-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogActivitySheetComponent {}
