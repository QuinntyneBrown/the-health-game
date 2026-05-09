import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lib-delete-activity-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete activity</h2>
    <mat-dialog-content>
      <p>This permanently removes the activity entry. Streaks will recompute.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
      <button
        mat-flat-button
        color="warn"
        type="button"
        data-testid="delete-activity-confirm"
        (click)="confirm()"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteActivityDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DeleteActivityDialogComponent, boolean>>(
    MatDialogRef,
  );

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
