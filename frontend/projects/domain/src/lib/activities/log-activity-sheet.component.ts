import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTIVITIES_SERVICE, ActivityEntry } from 'api';
import { firstValueFrom } from 'rxjs';
import { HealthTextFieldComponent } from 'components';

import { formatRewardEarnedMessage } from '../rewards/format-reward-earned';
import { DiscardChangesDialogComponent } from './discard-changes-dialog.component';
import { LogActivityDraftService } from './log-activity-draft.service';

export interface LogActivitySheetData {
  readonly goalId: string;
  readonly unit: string;
}

@Component({
  selector: 'lib-log-activity-sheet',
  imports: [HealthTextFieldComponent, MatButtonModule],
  template: `
    <section class="sheet" data-testid="log-activity-sheet">
      <span
        class="sheet__handle"
        aria-hidden="true"
        (pointerdown)="onHandleDown($event)"
        (pointermove)="onHandleMove($event)"
        (pointerup)="onHandleUp($event)"
      ></span>
      <h2 class="sheet__title">Log activity</h2>
      <hg-health-text-field
        label="Quantity ({{ data.unit }})"
        type="number"
        [value]="quantity()"
        [errorText]="quantityError()"
        (valueChange)="onQuantity($event)"
      />
      <hg-health-text-field
        label="Notes (optional)"
        [value]="notes()"
        (valueChange)="onNotes($event)"
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
        max-height: 100vh;
        overflow-y: auto;
        padding: var(--hg-space-4) var(--hg-space-6) var(--hg-space-6);
      }

      .sheet__handle {
        background: var(--hg-color-outline);
        border-radius: var(--hg-radius-full);
        display: block;
        height: 4px;
        justify-self: center;
        width: 32px;
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
  private readonly draft = inject(LogActivityDraftService);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.sheetRef.backdropClick().subscribe(() => this.maybeDiscard());
  }

  private async maybeDiscard(): Promise<void> {
    if (!this.quantity() && !this.notes()) {
      this.draft.reset();
      this.sheetRef.dismiss();
      return;
    }
    const ref = this.dialog.open<DiscardChangesDialogComponent, undefined, boolean>(
      DiscardChangesDialogComponent,
    );
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (confirmed) {
      this.draft.reset();
      this.sheetRef.dismiss();
    }
  }

  readonly quantity = signal(this.draft.draft().quantity);
  readonly notes = signal(this.draft.draft().notes);
  private readonly attemptedSubmit = signal(false);
  private dragStartY: number | null = null;

  readonly quantityError = computed(() =>
    this.attemptedSubmit() && !(Number(this.quantity()) > 0)
      ? 'Quantity must be greater than zero'
      : '',
  );
  readonly canSave = computed(() => Number(this.quantity()) > 0);

  onHandleDown(event: PointerEvent): void {
    this.dragStartY = event.clientY;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  onHandleMove(_event: PointerEvent): void {
    // No-op; handled at pointerup so the sheet doesn't move underfoot.
  }

  onHandleUp(event: PointerEvent): void {
    const start = this.dragStartY;
    this.dragStartY = null;
    if (start === null) return;
    const delta = event.clientY - start;
    if (delta > 80) {
      this.draft.reset();
      this.sheetRef.dismiss();
    }
  }

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
    this.draft.reset();
    this.sheetRef.dismiss(entry);
  }

  private notifyRewards(entry: ActivityEntry): void {
    const message = formatRewardEarnedMessage(entry.newlyEarnedRewards ?? []);
    if (message) {
      this.snackBar.open(message, 'View', { duration: 5_000 });
    }
  }
}
