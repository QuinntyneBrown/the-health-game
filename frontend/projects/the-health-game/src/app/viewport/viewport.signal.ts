import { InjectionToken, Provider, Signal, inject, signal } from '@angular/core';

import type { NavigationBarVariant } from 'components';

export const VIEWPORT = new InjectionToken<Signal<NavigationBarVariant>>('VIEWPORT');

export function provideViewport(): Provider {
  return {
    provide: VIEWPORT,
    useFactory: () => signal<NavigationBarVariant>('bottom').asReadonly(),
  };
}

export function viewport(): NavigationBarVariant {
  return inject(VIEWPORT)();
}
