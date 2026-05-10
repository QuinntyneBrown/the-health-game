import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTIVITIES_SERVICE, ActivityEntry } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

import { formatRewardEarnedMessage } from '../rewards/format-reward-earned';
import { LogActivityDraftService } from './log-activity-draft.service';
import { LogActivitySheetData } from './log-activity-sheet.component';

@Component({
  selector: 'lib-log-activity-dialog',
  imports: [HealthTextFieldComponent, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Log activity</h2>
    <mat-dialog-content class="dialog__content">
      <hg-health-text-field
        label="Quantity"
        type="number"
        [helperText]="data.unit"
        [value]="quantity()"
        [errorText]="quantityError()"
        (valueChange)="onQuantity($event)"
      />
      <hg-health-text-field
        label="Notes (optional)"
        [value]="notes()"
        [errorText]="notesError()"
        (valueChange)="onNotes($event)"
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
  private readonly draft = inject(LogActivityDraftService);

  readonly quantity = signal(this.draft.draft().quantity);
  readonly notes = signal(this.draft.draft().notes);
  private readonly attemptedSubmit = signal(false);

  readonly quantityError = computed(() =>
    this.attemptedSubmit() && !(Number(this.quantity()) > 0)
      ? 'Quantity must be greater than zero'
      : '',
  );
  readonly notesError = computed(() =>
    this.attemptedSubmit() && this.notes().length > 500
      ? 'Note is too long (max 500 characters)'
      : '',
  );
  readonly canSave = computed(() => true);

  onQuantity(value: string): void {
    this.quantity.set(value);
    this.draft.patch({ quantity: value });
  }

  onNotes(value: string): void {
    this.notes.set(value);
    this.draft.patch({ notes: value });
  }

  cancel(): void {
    this.draft.reset();
    this.dialogRef.close(undefined);
  }

  async submit(): Promise<void> {
    this.attemptedSubmit.set(true);
    if (!(Number(this.quantity()) > 0) || this.notes().length > 500) return;
    let entry;
    try {
      entry = await firstValueFrom(
        this.activities.logActivity(this.data.goalId, {
          quantity: Number(this.quantity()),
          notes: this.notes().trim() || undefined,
        }),
      );
    } catch (err: unknown) {
      const message = (err as { message?: string } | null)?.message
        ?? 'Could not log activity — please try again.';
      this.snackBar.open(message, 'Dismiss', { duration: 6_000 });
      return;
    }
    const rewardMessage = formatRewardEarnedMessage(entry.newlyEarnedRewards ?? []);
    if (rewardMessage) {
      this.snackBar.open(rewardMessage, 'View', { duration: 5_000 });
    }
    this.draft.reset();
    this.dialogRef.close(entry);
  }
}
