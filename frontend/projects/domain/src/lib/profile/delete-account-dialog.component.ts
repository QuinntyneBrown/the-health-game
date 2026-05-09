import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HealthTextFieldComponent } from 'components';

export interface DeleteAccountDialogData {
  readonly email: string;
}

@Component({
  selector: 'lib-delete-account-dialog',
  imports: [HealthTextFieldComponent, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete account</h2>
    <mat-dialog-content class="dialog__content">
      <p>
        This permanently deletes your account and all associated data. To confirm, type your
        email <strong>{{ data.email }}</strong> below.
      </p>
      <hg-health-text-field
        label="Email"
        type="email"
        [value]="typed()"
        (valueChange)="typed.set($event)"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
      <button
        mat-flat-button
        color="warn"
        type="button"
        data-testid="delete-account-confirm"
        [disabled]="!matches()"
        (click)="confirm()"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog__content {
        display: grid;
        gap: var(--hg-space-4);
        padding-block: var(--hg-space-4);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {
  readonly data = inject<DeleteAccountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<DeleteAccountDialogComponent, boolean>>(
    MatDialogRef,
  );

  readonly typed = signal('');
  readonly matches = computed(() => this.typed().trim() === this.data.email);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.matches()) {
      this.dialogRef.close(true);
    }
  }
}
