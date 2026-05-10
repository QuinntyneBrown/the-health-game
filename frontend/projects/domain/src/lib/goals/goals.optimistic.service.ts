import { Injectable, signal } from '@angular/core';
import { GoalSummary } from 'api';

@Injectable({ providedIn: 'root' })
export class GoalsOptimisticService {
  readonly pending = signal<readonly GoalSummary[]>([]);

  add(goal: GoalSummary): void {
    this.pending.update((arr) => [...arr, goal]);
  }

  remove(id: string): void {
    this.pending.update((arr) => arr.filter((g) => g.id !== id));
  }
}
