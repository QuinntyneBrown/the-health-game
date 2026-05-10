import { Injectable, signal } from '@angular/core';

export interface LogActivityDraft {
  readonly quantity: string;
  readonly notes: string;
}

@Injectable({ providedIn: 'root' })
export class LogActivityDraftService {
  readonly draft = signal<LogActivityDraft>({ quantity: '', notes: '' });

  reset(): void {
    this.draft.set({ quantity: '', notes: '' });
  }

  patch(input: Partial<LogActivityDraft>): void {
    this.draft.update((current) => ({ ...current, ...input }));
  }
}
