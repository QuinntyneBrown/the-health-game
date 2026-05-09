import { InjectionToken, Provider, Signal, signal } from '@angular/core';

import type { NavigationBarVariant } from 'components';

export const VIEWPORT = new InjectionToken<Signal<NavigationBarVariant>>('VIEWPORT');

export function provideViewport(): Provider {
  return {
    provide: VIEWPORT,
    useValue: signal<NavigationBarVariant>('bottom').asReadonly(),
  };
}
