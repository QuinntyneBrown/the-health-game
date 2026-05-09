import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith } from 'rxjs';

export type Loadable<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

export function loadable<T>(source$: Observable<T>): Signal<Loadable<T>> {
  return toSignal(
    source$.pipe(
      map((data): Loadable<T> => ({ status: 'loaded', data })),
      startWith<Loadable<T>>({ status: 'loading' }),
      catchError((err) =>
        of<Loadable<T>>({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        }),
      ),
    ),
    { initialValue: { status: 'loading' } as Loadable<T> },
  );
}
