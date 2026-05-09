import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface DeleteGoalDialogData {
  readonly name: string;
}

@Component({
  selector: 'lib-delete-goal-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete goal</h2>
    <mat-dialog-content>
      <p>This permanently deletes <strong>{{ data.name }}</strong>.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
      <button
        mat-flat-button
        color="warn"
        type="button"
        data-testid="delete-goal-confirm"
        (click)="confirm()"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteGoalDialogComponent {
  readonly data = inject<DeleteGoalDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<DeleteGoalDialogComponent, boolean>>(
    MatDialogRef,
  );

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
