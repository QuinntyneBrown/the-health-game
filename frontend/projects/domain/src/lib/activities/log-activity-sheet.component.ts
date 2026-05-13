import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-log-activity-sheet',
  templateUrl: './log-activity-sheet.component.html',
  styleUrl: './log-activity-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogActivitySheetComponent {}
