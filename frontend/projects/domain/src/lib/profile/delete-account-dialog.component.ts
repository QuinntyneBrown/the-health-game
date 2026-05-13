import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrl: './delete-account-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {}
