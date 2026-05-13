import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-delete-goal-dialog',
  templateUrl: './delete-goal-dialog.component.html',
  styleUrl: './delete-goal-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteGoalDialogComponent {}
