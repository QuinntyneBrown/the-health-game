import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ACTIVITIES_SERVICE, ActivityEntry } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

export interface EditActivityDialogData {
  readonly entry: ActivityEntry;
  readonly unit: string;
}

@Component({
  selector: 'lib-edit-activity-dialog',
  imports: [HealthTextFieldComponent, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Edit activity</h2>
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
        data-testid="edit-activity-save"
        [disabled]="!canSave()"
        (click)="submit()"
      >
        Save
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
export class EditActivityDialogComponent {
  readonly data = inject<EditActivityDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<
    MatDialogRef<EditActivityDialogComponent, ActivityEntry | undefined>
  >(MatDialogRef);
  private readonly activities = inject(ACTIVITIES_SERVICE);

  readonly quantity = signal(String(this.data.entry.quantity));
  readonly notes = signal(this.data.entry.notes ?? '');
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
    const updated = await firstValueFrom(
      this.activities.updateActivityEntry(this.data.entry.id, {
        quantity: Number(this.quantity()),
        notes: this.notes().trim() || undefined,
      }),
    );
    this.dialogRef.close(updated);
  }
}
