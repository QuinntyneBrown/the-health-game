import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lib-discard-changes-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Discard changes?</h2>
    <mat-dialog-content>
      <p>Your draft will be lost.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="cancel()">Keep editing</button>
      <button
        mat-flat-button
        color="warn"
        type="button"
        data-testid="discard-confirm"
        (click)="confirm()"
      >
        Discard
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscardChangesDialogComponent {
  private readonly ref =
    inject<MatDialogRef<DiscardChangesDialogComponent, boolean>>(MatDialogRef);

  cancel(): void {
    this.ref.close(false);
  }

  confirm(): void {
    this.ref.close(true);
  }
}
