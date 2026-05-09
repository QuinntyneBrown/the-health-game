import {
  DestroyRef,
  InjectionToken,
  Provider,
  Signal,
  inject,
  signal,
} from '@angular/core';

import type { NavigationBarVariant } from 'components';

export const VIEWPORT = new InjectionToken<Signal<NavigationBarVariant>>('VIEWPORT');

export function computeVariant(width: number): NavigationBarVariant {
  if (width >= 1200) {
    return 'drawer';
  }
  if (width >= 768) {
    return 'rail';
  }
  return 'bottom';
}

export function provideViewport(): Provider {
  return {
    provide: VIEWPORT,
    useFactory: createViewportSignal,
  };
}

function createViewportSignal(): Signal<NavigationBarVariant> {
  if (typeof window === 'undefined') {
    return signal<NavigationBarVariant>('bottom').asReadonly();
  }
  const value = signal<NavigationBarVariant>(computeVariant(window.innerWidth));
  const onResize = (): void => value.set(computeVariant(window.innerWidth));
  window.addEventListener('resize', onResize);
  inject(DestroyRef).onDestroy(() => window.removeEventListener('resize', onResize));
  return value.asReadonly();
}
