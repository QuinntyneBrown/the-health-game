import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-edit-activity-dialog',
  templateUrl: './edit-activity-dialog.component.html',
  styleUrl: './edit-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActivityDialogComponent {}
