// Acceptance Test
// Traces to: docs/mocks/manifest.json
// Description: Verifies the domain library exposes route groups consumed by the app router.
import { AUTH_ROUTES } from './auth/auth.routes';
import { DASHBOARD_ROUTES } from './dashboard/dashboard.routes';
import { GOALS_ROUTES } from './goals/goals.routes';
import { PROFILE_ROUTES } from './profile/profile.routes';
import { REWARDS_ROUTES } from './rewards/rewards.routes';
import { STATS_ROUTES } from './stats/stats.routes';

describe('domain route exports', () => {
  it('exposes mock-aligned route groups for app composition', () => {
    expect(AUTH_ROUTES.map((route) => route.path)).toEqual([
      '',
      'create-account',
      'reset-password',
      'session',
    ]);
    expect(DASHBOARD_ROUTES.map((route) => route.path)).toEqual(['']);
    expect(GOALS_ROUTES.map((route) => route.path)).toEqual([
      '',
      'empty',
      'new',
      ':id/edit',
      ':id/delete',
      ':id',
    ]);
    expect(PROFILE_ROUTES.map((route) => route.path)).toEqual(['']);
    expect(REWARDS_ROUTES.map((route) => route.path)).toEqual(['', 'new', ':id/edit', ':id']);
    expect(STATS_ROUTES.map((route) => route.path)).toEqual(['']);
  });
});
