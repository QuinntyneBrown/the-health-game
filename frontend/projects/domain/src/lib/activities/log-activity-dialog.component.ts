import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-log-activity-dialog',
  templateUrl: './log-activity-dialog.component.html',
  styleUrl: './log-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogActivityDialogComponent {}
