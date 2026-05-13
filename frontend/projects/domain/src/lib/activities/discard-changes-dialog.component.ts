import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent } from 'components';

@Component({
  selector: 'lib-discard-changes-dialog',
  imports: [ActionButtonComponent, SectionHeaderComponent, StatusBannerComponent],
  templateUrl: './discard-changes-dialog.component.html',
  styleUrl: './discard-changes-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscardChangesDialogComponent {}
