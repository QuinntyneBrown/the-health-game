import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTIVITIES_SERVICE, ActivityEntry } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

import { formatRewardEarnedMessage } from '../rewards/format-reward-earned';

export interface LogActivitySheetData {
  readonly goalId: string;
  readonly unit: string;
}

@Component({
  selector: 'lib-log-activity-sheet',
  imports: [HealthTextFieldComponent, MatButtonModule],
  template: `
    <section class="sheet" data-testid="log-activity-sheet">
      <span class="sheet__handle" aria-hidden="true"></span>
      <h2 class="sheet__title">Log activity</h2>
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
      <div class="sheet__actions">
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
      </div>
    </section>
  `,
  styles: [
    `
      .sheet {
        display: grid;
        gap: var(--hg-space-4);
        padding: var(--hg-space-4) var(--hg-space-6) var(--hg-space-6);
      }

      .sheet__handle {
        background: var(--hg-color-outline);
        border-radius: var(--hg-radius-full);
        display: block;
        height: 0.25rem;
        justify-self: center;
        width: 2.5rem;
      }

      .sheet__title {
        font-size: var(--hg-font-size-title-md);
        margin: 0;
      }

      .sheet__actions {
        display: flex;
        gap: var(--hg-space-3);
        justify-content: flex-end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogActivitySheetComponent {
  readonly data = inject<LogActivitySheetData>(MAT_BOTTOM_SHEET_DATA);
  private readonly sheetRef = inject<MatBottomSheetRef<LogActivitySheetComponent, ActivityEntry>>(
    MatBottomSheetRef,
  );
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
    this.sheetRef.dismiss();
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
    this.notifyRewards(entry);
    this.sheetRef.dismiss(entry);
  }

  private notifyRewards(entry: ActivityEntry): void {
    const message = formatRewardEarnedMessage(entry.newlyEarnedRewards ?? []);
    if (message) {
      this.snackBar.open(message, 'View', { duration: 5_000 });
    }
  }
}
