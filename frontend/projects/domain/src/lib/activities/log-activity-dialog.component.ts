import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTIVITIES_SERVICE, ActivityEntry } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

import { formatRewardEarnedMessage } from '../rewards/format-reward-earned';
import { LogActivitySheetData } from './log-activity-sheet.component';

@Component({
  selector: 'lib-log-activity-dialog',
  imports: [HealthTextFieldComponent, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Log activity</h2>
    <mat-dialog-content class="dialog__content">
      <hg-health-text-field
        label="Quantity ({{ data.unit }})"
        type="number"
        [value]="quantity()"
        [errorText]="quantityError()"
        (valueChange)="quantity.set($event)"
      />
      <hg-health-text-field
        label="Notes (optional)"
        [value]="notes()"
        (valueChange)="notes.set($event)"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
      <button
        mat-flat-button
        type="button"
        data-testid="log-activity-save"
        [disabled]="!canSave()"
        (click)="submit()"
      >
        Log
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
export class LogActivityDialogComponent {
  readonly data = inject<LogActivitySheetData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<
    MatDialogRef<LogActivityDialogComponent, ActivityEntry | undefined>
  >(MatDialogRef);
  private readonly activities = inject(ACTIVITIES_SERVICE);
  private readonly snackBar = inject(MatSnackBar);

  readonly quantity = signal('');
  readonly notes = signal('');
  private readonly attemptedSubmit = signal(false);

  readonly quantityError = computed(() =>
    this.attemptedSubmit() && !(Number(this.quantity()) > 0)
      ? 'Quantity must be greater than zero'
      : '',
  );
  readonly canSave = computed(() => Number(this.quantity()) > 0);

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  async submit(): Promise<void> {
    this.attemptedSubmit.set(true);
    if (!this.canSave()) return;
    const entry = await firstValueFrom(
      this.activities.logActivity(this.data.goalId, {
        quantity: Number(this.quantity()),
        notes: this.notes().trim() || undefined,
      }),
    );
    const message = formatRewardEarnedMessage(entry.newlyEarnedRewards ?? []);
    if (message) {
      this.snackBar.open(message, 'View', { duration: 5_000 });
    }
    this.dialogRef.close(entry);
  }
}
