import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { findBoundaryViolations } from './check-boundaries.mjs';

describe('findBoundaryViolations', () => {
  it('returns no violations for an api file that imports rxjs', () => {
    const result = findBoundaryViolations('api', [
      { path: 'a.ts', source: "import { of } from 'rxjs';" },
    ]);
    assert.deepEqual(result, []);
  });

  it('flags an api file importing from components', () => {
    const result = findBoundaryViolations('api', [
      { path: 'a.ts', source: "import { GoalCardComponent } from 'components';" },
    ]);
    assert.equal(result.length, 1);
    assert.match(result[0].message, /components/);
  });

  it('flags a components file importing from api', () => {
    const result = findBoundaryViolations('components', [
      { path: 'b.ts', source: "import { GOALS_SERVICE } from 'api';" },
    ]);
    assert.equal(result.length, 1);
    assert.match(result[0].message, /api/);
  });

  it('flags a domain file importing from the-health-game', () => {
    const result = findBoundaryViolations('domain', [
      { path: 'c.ts', source: "import { App } from 'the-health-game/app';" },
    ]);
    assert.equal(result.length, 1);
    assert.match(result[0].message, /the-health-game/);
  });

  it('allows a domain file importing from api or components', () => {
    const result = findBoundaryViolations('domain', [
      { path: 'd.ts', source: "import { GOALS_SERVICE } from 'api';\nimport { GoalCardComponent } from 'components';" },
    ]);
    assert.deepEqual(result, []);
  });
});
