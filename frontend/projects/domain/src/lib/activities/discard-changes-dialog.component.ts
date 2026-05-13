import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-discard-changes-dialog',
  templateUrl: './discard-changes-dialog.component.html',
  styleUrl: './discard-changes-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscardChangesDialogComponent {}
