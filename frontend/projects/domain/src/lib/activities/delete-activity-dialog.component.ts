import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-delete-activity-dialog',
  templateUrl: './delete-activity-dialog.component.html',
  styleUrl: './delete-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteActivityDialogComponent {}
