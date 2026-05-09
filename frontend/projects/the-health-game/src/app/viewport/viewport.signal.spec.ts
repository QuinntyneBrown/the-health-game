// Acceptance Test
// Traces to: L2-020, L2-021, L2-030
// Description: Verifies the viewport signal returns the navigation variant.
import { computeVariant } from './viewport.signal';

describe('computeVariant', () => {
  it('returns "bottom" for mobile widths (<768)', () => {
    expect(computeVariant(360)).toBe('bottom');
    expect(computeVariant(767)).toBe('bottom');
  });

  it('returns "rail" for tablet widths (768–1199)', () => {
    expect(computeVariant(768)).toBe('rail');
    expect(computeVariant(1024)).toBe('rail');
    expect(computeVariant(1199)).toBe('rail');
  });

  it('returns "drawer" for desktop widths (>=1200)', () => {
    expect(computeVariant(1200)).toBe('drawer');
    expect(computeVariant(1440)).toBe('drawer');
  });
});
