// Acceptance Test
// Traces to: L2-016, L2-021
// Description: loadable() exposes { status, data, error } across loading/loaded/error transitions.
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import { loadable } from './loadable';

describe('loadable', () => {
  it('starts in the loading state', () => {
    const source$ = new Subject<number>();
    TestBed.runInInjectionContext(() => {
      const state = loadable(source$);
      expect(state().status).toBe('loading');
    });
  });

  it('moves to loaded once the source emits', () => {
    const source$ = new Subject<number>();
    TestBed.runInInjectionContext(() => {
      const state = loadable(source$);
      source$.next(42);
      const value = state();
      expect(value.status).toBe('loaded');
      expect(value.status === 'loaded' && value.data).toBe(42);
    });
  });

  it('moves to error when the source errors', () => {
    TestBed.runInInjectionContext(() => {
      const state = loadable(throwError(() => new Error('boom')));
      const value = state();
      expect(value.status).toBe('error');
      expect(value.status === 'error' && value.error.message).toBe('boom');
    });
  });
});
