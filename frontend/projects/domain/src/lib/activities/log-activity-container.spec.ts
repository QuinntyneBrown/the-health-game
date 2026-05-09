// Acceptance Test
// Traces to: L2-005, L2-020, L2-021
// Description: pickLogActivityContainer chooses sheet on mobile, dialog otherwise.
import { pickLogActivityContainer } from './log-activity-container';

describe('pickLogActivityContainer', () => {
  it('returns "sheet" when viewport is bottom', () => {
    expect(pickLogActivityContainer('bottom')).toBe('sheet');
  });

  it('returns "dialog" when viewport is rail', () => {
    expect(pickLogActivityContainer('rail')).toBe('dialog');
  });

  it('returns "dialog" when viewport is drawer', () => {
    expect(pickLogActivityContainer('drawer')).toBe('dialog');
  });
});
