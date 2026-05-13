import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-delete-goal-dialog',
  imports: [ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent],
  templateUrl: './delete-goal-dialog.component.html',
  styleUrl: './delete-goal-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteGoalDialogComponent {}
