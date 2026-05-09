// Acceptance Test
// Traces to: L2-032, L2-033
// Description: Verifies the API library exposes goal data through its service abstraction.
import { firstValueFrom } from 'rxjs';

import { GoalsService } from './goals.service';
import { IGoalsService } from './goals.service.contract';

describe('GoalsService', () => {
  it('returns goal summaries from the backend-facing service contract', async () => {
    const service: IGoalsService = new GoalsService();

    const goals = await firstValueFrom(service.getGoalSummaries());

    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].target.value).toBeGreaterThan(0);
  });
});
