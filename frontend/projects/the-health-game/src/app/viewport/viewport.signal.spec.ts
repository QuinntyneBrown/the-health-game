// Acceptance Test
// Traces to: L2-020, L2-021, L2-030
// Description: Verifies the viewport signal returns the navigation variant.
import { TestBed } from '@angular/core/testing';

import { provideViewport, viewport } from './viewport.signal';

describe('viewport signal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideViewport()],
    });
  });

  it('returns "bottom" by default for mobile-first behaviour', () => {
    TestBed.runInInjectionContext(() => {
      const variant = viewport();
      expect(variant).toBe('bottom');
    });
  });
});
