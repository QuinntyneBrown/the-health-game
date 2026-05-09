// Acceptance Test
// Traces to: 01-TC-V-001..010, 01-TC-C-001..010, 01-TC-L-001..010, 01-TC-R-001..008, 01-TC-F-001..008, 01-TC-B-001..007, 01-TC-A-001..006, 01-TC-D-001..002
// Description: Onboarding headline ("Make health a game") renders with font family Inter weight 500
//              and the design-spec font-size at each breakpoint (mobile = 28 px, tablet = 45 px,
//              desktop = 57 px with line-height 1.1). Body description paragraph renders at
//              font-weight 400.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Cannot parse rgb from: ${value}`);
  }
  const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
  return [parts[0], parts[1], parts[2]];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = (channel: number): number => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const lf = relativeLuminance(parseRgb(fg));
  const lb = relativeLuminance(parseRgb(bg));
  const [light, dark] = lf > lb ? [lf, lb] : [lb, lf];
  return (light + 0.05) / (dark + 0.05);
}

async function assertTabletLayout(
  page: import('@playwright/test').Page,
  width: number,
  height: number,
): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.goto('/onboarding');

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

  const primary = page.getByTestId('onboarding-get-started');
  const secondary = page.getByTestId('onboarding-have-account');
  const rects = await Promise.all(
    [primary, secondary].map((loc) =>
      loc.evaluate((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return { top: rect.top, left: rect.left, right: rect.right };
      }),
    ),
  );
  expect(Math.abs(rects[0].top - rects[1].top)).toBeLessThan(2);
  expect(rects[1].left).toBeGreaterThan(rects[0].right);

  const trophy = page.getByTestId('onboarding-trophy');
  const trophyFontSize = await trophy.evaluate((el) => getComputedStyle(el).fontSize);
  expect(trophyFontSize).toBe('180px');
}

async function assertSingleColumnMobile(
  page: import('@playwright/test').Page,
  width: number,
  height: number,
): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.goto('/onboarding');

  const root = page.getByTestId('onboarding');
  await expect(root).toBeVisible();

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

  const ids = [
    'onboarding-hero',
    'onboarding-headline',
    'onboarding-description',
    'onboarding-page-dots',
    'onboarding-buttons',
  ];
  const lefts = await Promise.all(
    ids.map((id) =>
      page.getByTestId(id).evaluate((el) => (el as HTMLElement).getBoundingClientRect().left),
    ),
  );
  const minLeft = Math.min(...lefts);
  const maxLeft = Math.max(...lefts);
  expect(maxLeft - minLeft).toBeLessThan(2);
}

test.describe('Onboarding — headline typography', () => {
  test('headline uses Inter font family with weight 500', async ({ page }) => {
    await page.goto('/onboarding');

    const headline = page.getByTestId('onboarding-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toHaveText('Make health a game');

    const computed = await headline.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
      };
    });

    expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
    expect(computed.fontWeight).toBe('500');
  });

  test('body description font-weight is 400 (TC-V-005)', async ({ page }) => {
    await page.goto('/onboarding');

    const description = page.getByTestId('onboarding-description');
    await expect(description).toBeVisible();

    const fontWeight = await description.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe('400');
  });

  test('page background is #F7FBF3 (TC-C-001)', async ({ page }) => {
    await page.goto('/onboarding');

    const root = page.getByTestId('onboarding');
    await expect(root).toBeVisible();

    const background = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(247, 251, 243)');
  });

  test('hero panel background is #94F7B4 (TC-C-002)', async ({ page }) => {
    await page.goto('/onboarding');

    const hero = page.getByTestId('onboarding-hero');
    await expect(hero).toBeVisible();

    const background = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(148, 247, 180)');
  });

  test('trophy icon color on hero is #00210F (TC-C-003)', async ({ page }) => {
    await page.goto('/onboarding');

    const trophy = page.getByTestId('onboarding-trophy');
    await expect(trophy).toBeVisible();

    const color = await trophy.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(0, 33, 15)');
  });

  test('headline color is #191D17 (TC-C-004)', async ({ page }) => {
    await page.goto('/onboarding');

    const headline = page.getByTestId('onboarding-headline');
    await expect(headline).toBeVisible();

    const color = await headline.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(25, 29, 23)');
  });

  test('primary button background is #006D3F (TC-C-005)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    const background = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(0, 109, 63)');
  });

  test('primary button label color is #FFFFFF (TC-C-006)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    const color = await button.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('active page-dot background is #006D3F (TC-C-008)', async ({ page }) => {
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const active = dots.locator('[aria-current="step"]');
    await expect(active).toBeVisible();

    const background = await active.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe('rgb(0, 109, 63)');
  });

  test('clicking "Get started" navigates to OIDC /connect/authorize with PKCE (TC-F-001)', async ({
    page,
  }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');
    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.getByTestId('onboarding-get-started').click();
    await navigation;

    const url = new URL(page.url());
    expect(url.pathname).toBe('/connect/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('client_id')).toBeTruthy();
  });

  test('verifier and state are cleared after a successful callback exchange (TC-D-002)', async ({
    page,
  }) => {
    await page.route('**/connect/token', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      }),
    );

    await page.goto('/onboarding');
    await page.evaluate(() => {
      sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
      sessionStorage.setItem('hg.oidc.state', 'test-state');
    });

    await page.goto('/auth/callback?code=test-code&state=test-state');
    await page.waitForURL(/\/home(\b|\/|$)/);

    const storage = await page.evaluate(() => ({
      verifier: sessionStorage.getItem('hg.oidc.verifier'),
      state: sessionStorage.getItem('hg.oidc.state'),
    }));
    expect(storage.verifier).toBeNull();
    expect(storage.state).toBeNull();
  });

  test('verifier persists in sessionStorage until callback exchange (TC-D-001)', async ({
    page,
  }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');

    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.getByTestId('onboarding-get-started').click();
    await navigation;

    // Return to the app origin without invoking the callback exchange
    await page.goto('/onboarding');
    const verifier = await page.evaluate(() =>
      sessionStorage.getItem('hg.oidc.verifier'),
    );
    expect(verifier).not.toBeNull();
    expect((verifier ?? '').length).toBeGreaterThan(20);
  });

  test('axe-core scan reports 0 critical / serious violations (TC-A-006)', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-headline')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (blocking.length > 0) {
      console.warn(
        'axe violations:',
        blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
      );
    }
    expect(blocking).toEqual([]);
  });

  test('exactly one page-dot exposes aria-current="step" (TC-A-005)', async ({ page }) => {
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const totalDots = await dots.locator('li').count();
    expect(totalDots).toBeGreaterThan(0);

    const activeDots = await dots.locator('[aria-current="step"]').count();
    expect(activeDots).toBe(1);

    const inactiveDots = await dots.locator('li:not([aria-current])').count();
    expect(inactiveDots).toBe(totalDots - 1);
  });

  test('buttons expose descriptive accessible names (TC-A-004)', async ({ page }) => {
    await page.goto('/onboarding');

    const getStarted = page.getByRole('button', { name: 'Get started', exact: true });
    const haveAccount = page.getByRole('button', { name: 'I have an account', exact: true });

    await expect(getStarted).toBeVisible();
    await expect(haveAccount).toBeVisible();
    expect(await getStarted.count()).toBe(1);
    expect(await haveAccount.count()).toBe(1);
  });

  test('trophy icon is decorative (aria-hidden via self or ancestor) (TC-A-003)', async ({
    page,
  }) => {
    await page.goto('/onboarding');

    const trophy = page.getByTestId('onboarding-trophy');
    await expect(trophy).toBeVisible();

    const hidden = await trophy.evaluate((el) => {
      let cursor: Element | null = el;
      while (cursor) {
        if (cursor.getAttribute('aria-hidden') === 'true') {
          return true;
        }
        cursor = cursor.parentElement;
      }
      return false;
    });
    expect(hidden).toBe(true);
  });

  test('headline is rendered as <h1> (TC-A-002)', async ({ page }) => {
    await page.goto('/onboarding');

    const headline = page.getByTestId('onboarding-headline');
    await expect(headline).toBeVisible();

    const tag = await headline.evaluate((el) => el.tagName);
    expect(tag).toBe('H1');

    // There should be exactly one h1 on the onboarding screen
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('exactly one <main> landmark wraps the onboarding content (TC-A-001)', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-headline')).toBeVisible();

    const mainCount = await page.locator('main').count();
    expect(mainCount).toBe(1);

    const headlineInsideMain = await page
      .locator('main')
      .getByTestId('onboarding-headline')
      .count();
    expect(headlineInsideMain).toBe(1);
  });

  test('reduced-motion preference suppresses dot transitions (TC-B-007)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const dotMetrics = await dots.locator('li').first().evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        transitionDuration: style.transitionDuration,
        animationDuration: style.animationDuration,
        animationName: style.animationName,
      };
    });

    expect(['0s', '0ms', ''].includes(dotMetrics.transitionDuration)).toBe(true);
    expect(['0s', '0ms', ''].includes(dotMetrics.animationDuration)).toBe(true);
    expect(['none', '']).toContain(dotMetrics.animationName);

    // Primary button hover transition should also be suppressed
    const primary = page.getByTestId('onboarding-get-started');
    const primaryTransition = await primary.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    expect(['0s', '0ms', ''].includes(primaryTransition)).toBe(true);
  });

  test('double-clicking "Get started" emits only one OIDC redirect (TC-B-006)', async ({
    page,
  }) => {
    let authorizeCount = 0;
    await page.route('**/connect/authorize**', async (route) => {
      authorizeCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>ok</body></html>',
      });
    });

    await page.goto('/onboarding');
    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/connect\/authorize/),
      button.dispatchEvent('click'),
      button.dispatchEvent('click'),
    ]);

    // Give the browser a moment to settle any second redirect that might still race in
    await page.waitForLoadState('networkidle').catch(() => undefined);

    expect(authorizeCount).toBe(1);
  });

  test('hover on primary button shows pointer cursor and elevation (TC-B-005)', async ({
    page,
  }) => {
    await page.goto('/onboarding');
    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();

    const cursor = await button.evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');

    const before = await button.evaluate((el) => getComputedStyle(el).boxShadow);
    await button.hover();
    const after = await button.evaluate((el) => getComputedStyle(el).boxShadow);

    // Hover state introduces an elevation / state-layer change
    expect(after).not.toBe('none');
    expect(after).not.toBe('');
    expect(after).not.toBe(before);
  });

  test('Space on focused "Get started" button activates it (TC-B-004)', async ({ page }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');
    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();
    await button.focus();

    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.keyboard.press('Space');
    await navigation;

    expect(page.url()).toContain('/connect/authorize');
  });

  test('Enter on focused "Get started" button activates it (TC-B-003)', async ({ page }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');
    const button = page.getByTestId('onboarding-get-started');
    await expect(button).toBeVisible();
    await button.focus();

    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.keyboard.press('Enter');
    await navigation;

    expect(page.url()).toContain('/connect/authorize');
  });

  test('keyboard focus shows a visible focus ring on each button (TC-B-002)', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-headline')).toBeVisible();

    for (const id of ['onboarding-get-started', 'onboarding-have-account']) {
      const button = page.getByTestId(id);
      await button.focus();

      const indicator = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        };
      });

      const hasOutline =
        indicator.outlineStyle !== 'none' &&
        indicator.outlineStyle !== '' &&
        parseFloat(indicator.outlineWidth) > 0;
      const hasBoxShadow = indicator.boxShadow !== '' && indicator.boxShadow !== 'none';

      expect(hasOutline || hasBoxShadow).toBe(true);
    }
  });

  test('Tab order: Get started → I have an account (TC-B-001)', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-headline')).toBeVisible();

    // Click in a non-interactive area to seed focus on body
    await page.locator('body').focus();

    const trail: string[] = [];
    let primaryIndex = -1;
    let secondaryIndex = -1;

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName ?? '',
      );
      trail.push(id);
      if (id === 'onboarding-get-started' && primaryIndex < 0) primaryIndex = i;
      if (id === 'onboarding-have-account' && secondaryIndex < 0) secondaryIndex = i;
      if (primaryIndex >= 0 && secondaryIndex >= 0) break;
    }

    expect(primaryIndex).toBeGreaterThanOrEqual(0);
    expect(secondaryIndex).toBeGreaterThan(primaryIndex);

    // No interactive controls between primary and secondary except possibly the dots
    const between = trail.slice(primaryIndex + 1, secondaryIndex);
    for (const id of between) {
      expect(id).toMatch(/onboarding-page-dots|onboarding-have-account|^$/);
    }
  });

  test('page load leaks no auth tokens to console or network (TC-F-007)', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(`${msg.type()}:${msg.text()}`));

    const requestsWithAuth: string[] = [];
    page.on('request', (req) => {
      const auth = req.headers()['authorization'];
      if (auth) {
        requestsWithAuth.push(`${req.method()} ${req.url()} -> ${auth.slice(0, 16)}…`);
      }
    });

    await page.goto('/onboarding');
    await expect(page.getByTestId('onboarding-headline')).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(requestsWithAuth).toEqual([]);

    const tokenPattern =
      /\b(access[_-]?token|refresh[_-]?token|id[_-]?token|bearer\s+[a-z0-9._-]{16,})\b/i;
    const leaks = consoleMessages.filter((m) => tokenPattern.test(m));
    expect(leaks).toEqual([]);
  });

  test('OIDC callback with mismatched state rejects and routes to /onboarding (TC-F-006)', async ({
    page,
  }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => {
      sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
      sessionStorage.setItem('hg.oidc.state', 'expected-state');
    });

    await page.goto('/auth/callback?code=test-code&state=mismatched-state');
    await page.waitForURL(/\/onboarding(\b|\/|\?|$)/);
    expect(page.url()).toContain('/onboarding');

    const toast = page.locator('mat-snack-bar-container, .mat-mdc-snack-bar-container');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/sign[-\s]?in|couldn't|state/i);
  });

  test('authenticated user visiting /onboarding is redirected to /home (TC-F-008)', async ({
    page,
  }) => {
    await page.route('**/connect/token', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      }),
    );

    // Authenticate via the callback flow
    await page.goto('/onboarding');
    await page.evaluate(() => {
      sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
      sessionStorage.setItem('hg.oidc.state', 'test-state');
    });
    await page.goto('/auth/callback?code=test-code&state=test-state');
    await page.waitForURL(/\/home(\b|\/|$)/);

    // Now go directly to /onboarding while authenticated
    await page.goto('/onboarding');
    await page.waitForURL(/\/home(\b|\/|$)/);
    expect(page.url()).toContain('/home');
    expect(page.url()).not.toContain('/onboarding');
  });

  test('successful OIDC callback routes the app to /home (TC-F-005)', async ({ page }) => {
    await page.route('**/connect/token', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      }),
    );

    // Land on the app to establish the origin, seed sessionStorage, then visit callback
    await page.goto('/onboarding');
    await page.evaluate(() => {
      sessionStorage.setItem('hg.oidc.verifier', 'test-verifier');
      sessionStorage.setItem('hg.oidc.state', 'test-state');
    });

    await page.goto('/auth/callback?code=test-code&state=test-state');
    await page.waitForURL(/\/home(\b|\/|$)/);
    expect(page.url()).toContain('/home');
  });

  test('verifier stored in sessionStorage only, not in localStorage (TC-F-004)', async ({
    page,
  }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');

    const before = await page.evaluate(() => ({
      session: sessionStorage.getItem('hg.oidc.verifier'),
      local: localStorage.getItem('hg.oidc.verifier'),
    }));
    expect(before.session).toBeNull();
    expect(before.local).toBeNull();

    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.getByTestId('onboarding-get-started').click();
    await navigation;

    // Navigate back to the origin where sessionStorage was written;
    // sessionStorage persists for the tab session across the round trip.
    await page.goto('/onboarding');
    const after = await page.evaluate(() => ({
      session: sessionStorage.getItem('hg.oidc.verifier'),
      local: localStorage.getItem('hg.oidc.verifier'),
    }));
    expect(after.session).toBeTruthy();
    expect((after.session ?? '').length).toBeGreaterThan(20);
    expect(after.local).toBeNull();
  });

  test('OIDC state and code_challenge are random per click (TC-F-003)', async ({ page }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    const captured: Array<{ state: string; codeChallenge: string }> = [];

    for (let i = 0; i < 2; i++) {
      await page.goto('/onboarding');
      const navigation = page.waitForURL(/\/connect\/authorize/);
      await page.getByTestId('onboarding-get-started').click();
      await navigation;

      const url = new URL(page.url());
      const state = url.searchParams.get('state') ?? '';
      const codeChallenge = url.searchParams.get('code_challenge') ?? '';
      expect(state.length).toBeGreaterThan(0);
      expect(codeChallenge.length).toBeGreaterThan(0);
      captured.push({ state, codeChallenge });
    }

    expect(captured[0].state).not.toBe(captured[1].state);
    expect(captured[0].codeChallenge).not.toBe(captured[1].codeChallenge);
  });

  test('clicking "I have an account" navigates to OIDC authorize with prompt=login (TC-F-002)', async ({
    page,
  }) => {
    await page.route('**/connect/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    );

    await page.goto('/onboarding');
    const navigation = page.waitForURL(/\/connect\/authorize/);
    await page.getByTestId('onboarding-have-account').click();
    await navigation;

    const url = new URL(page.url());
    expect(url.pathname).toBe('/connect/authorize');
    expect(url.searchParams.get('prompt')).toBe('login');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('client_id')).toBeTruthy();
  });

  test('page-dot indicator is visible at every breakpoint (TC-R-008)', async ({ page }) => {
    for (const size of [
      { width: 360, height: 780 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(size);
      await page.goto('/onboarding');
      const dots = page.getByTestId('onboarding-page-dots');
      await expect(dots).toBeVisible();
      const count = await dots.locator('li').count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('layout recomputes on window resize without overflow (TC-R-007)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/onboarding');

    const root = page.getByTestId('onboarding');
    await expect(root).toBeVisible();

    const measure = async (): Promise<{ scroll: number; client: number; heroLeft: number; rootLeft: number; rootWidth: number; }> => {
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      const rootRect = await root.evaluate((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return { left: r.left, width: r.width };
      });
      const heroLeft = await page
        .getByTestId('onboarding-hero')
        .evaluate((el) => (el as HTMLElement).getBoundingClientRect().left);
      return {
        scroll: overflow.scroll,
        client: overflow.client,
        heroLeft,
        rootLeft: rootRect.left,
        rootWidth: rootRect.width,
      };
    };

    const sizes = [
      { width: 1440, height: 900, expectSplit: true },
      { width: 768, height: 1024, expectSplit: false },
      { width: 360, height: 780, expectSplit: false },
    ];

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      const m = await measure();
      expect(m.scroll).toBeLessThanOrEqual(m.client);
      if (size.expectSplit) {
        expect(m.heroLeft).toBeGreaterThan(m.rootLeft + m.rootWidth / 2 - 4);
      }
    }
  });

  test('text/background contrast meets WCAG AA (TC-C-010)', async ({ page }) => {
    await page.goto('/onboarding');

    const root = page.getByTestId('onboarding');
    const headline = page.getByTestId('onboarding-headline');
    const description = page.getByTestId('onboarding-description');
    const trophy = page.getByTestId('onboarding-trophy');
    const hero = page.getByTestId('onboarding-hero');
    const primary = page.getByTestId('onboarding-get-started');
    const secondary = page.getByTestId('onboarding-have-account');

    const pageBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    const heroBg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    const headlineFg = await headline.evaluate((el) => getComputedStyle(el).color);
    const descriptionFg = await description.evaluate((el) => getComputedStyle(el).color);
    const trophyFg = await trophy.evaluate((el) => getComputedStyle(el).color);
    const primaryFg = await primary.evaluate((el) => getComputedStyle(el).color);
    const primaryBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
    const secondaryFg = await secondary.evaluate((el) => getComputedStyle(el).color);

    // Large text (>= 24 px or >= 18.66 px bold): >= 3:1
    expect(contrastRatio(headlineFg, pageBg)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(trophyFg, heroBg)).toBeGreaterThanOrEqual(3);
    // Normal text: >= 4.5:1
    expect(contrastRatio(descriptionFg, pageBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(primaryFg, primaryBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(secondaryFg, pageBg)).toBeGreaterThanOrEqual(4.5);
  });

  test('inactive page-dot background is #F1F5ED (TC-C-009)', async ({ page }) => {
    await page.goto('/onboarding');

    const dots = page.getByTestId('onboarding-page-dots');
    await expect(dots).toBeVisible();

    const inactive = dots.locator('li:not([aria-current="step"])');
    expect(await inactive.count()).toBeGreaterThan(0);

    const backgrounds = await inactive.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    for (const bg of backgrounds) {
      expect(bg).toBe('rgb(241, 245, 237)');
    }
  });

  test('primary and secondary buttons are full pills (TC-L-009)', async ({ page }) => {
    await page.goto('/onboarding');

    for (const id of ['onboarding-get-started', 'onboarding-have-account']) {
      const button = page.getByTestId(id);
      await expect(button).toBeVisible();

      const measurements = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        const rect = (el as HTMLElement).getBoundingClientRect();
        return {
          radius: parseFloat(style.borderTopLeftRadius),
          height: rect.height,
          allCorners: [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomLeftRadius,
            style.borderBottomRightRadius,
          ],
        };
      });

      // All four corners share the same radius
      const unique = new Set(measurements.allCorners);
      expect(unique.size).toBe(1);
      // Pill: radius >= half the button height
      expect(measurements.radius).toBeGreaterThanOrEqual(measurements.height / 2);
    }
  });

  test('secondary button border is 1 px #C2C9BE (TC-C-007)', async ({ page }) => {
    await page.goto('/onboarding');

    const button = page.getByTestId('onboarding-have-account');
    await expect(button).toBeVisible();

    const border = await button.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        topWidth: style.borderTopWidth,
        rightWidth: style.borderRightWidth,
        bottomWidth: style.borderBottomWidth,
        leftWidth: style.borderLeftWidth,
        color: style.borderTopColor,
      };
    });

    expect(border.topWidth).toBe('1px');
    expect(border.rightWidth).toBe('1px');
    expect(border.bottomWidth).toBe('1px');
    expect(border.leftWidth).toBe('1px');
    expect(border.color).toBe('rgb(194, 201, 190)');
  });

  test('body description line-height ratio is 1.5 (TC-V-007)', async ({ page }) => {
    await page.goto('/onboarding');

    const description = page.getByTestId('onboarding-description');
    await expect(description).toBeVisible();

    const metrics = await description.evaluate((el) => {
      const style = getComputedStyle(el);
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    });

    const fontSizePx = parseFloat(metrics.fontSize);
    const lineHeightPx = parseFloat(metrics.lineHeight);
    expect(lineHeightPx / fontSizePx).toBeCloseTo(1.5, 2);
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 360, height: 780 } });

    test('headline font-size is 28 px on mobile (TC-V-002)', async ({ page }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const fontSize = await headline.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('28px');
    });

    test('vertical gap between hero, title, dots, buttons is 24 px (TC-L-002)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const rowGap = await root.evaluate((el) => getComputedStyle(el).rowGap);
      expect(rowGap).toBe('24px');

      const ids = [
        'onboarding-hero',
        'onboarding-headline',
        'onboarding-description',
        'onboarding-page-dots',
        'onboarding-buttons',
      ];
      const rects = await Promise.all(
        ids.map((id) =>
          page.getByTestId(id).evaluate((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom };
          }),
        ),
      );
      for (let i = 1; i < rects.length; i++) {
        const gap = rects[i].top - rects[i - 1].bottom;
        expect(gap).toBeCloseTo(24, 0);
      }
    });

    test('buttons stack vertically with 12 px gap (TC-L-007)', async ({ page }) => {
      await page.goto('/onboarding');

      const buttons = page.getByTestId('onboarding-buttons');
      await expect(buttons).toBeVisible();

      const primary = page.getByTestId('onboarding-get-started');
      const secondary = page.getByTestId('onboarding-have-account');

      const rects = await Promise.all(
        [primary, secondary].map((loc) =>
          loc.evaluate((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, left: rect.left };
          }),
        ),
      );

      // Stacked vertically: secondary starts below primary at the same left edge
      expect(rects[1].top).toBeGreaterThan(rects[0].bottom - 1);
      expect(Math.abs(rects[1].left - rects[0].left)).toBeLessThan(1);
      expect(rects[1].top - rects[0].bottom).toBeCloseTo(12, 0);
    });

    test('viewport 360x780 — single-column layout with no horizontal scrollbar (TC-R-001)', async ({
      page,
    }) => {
      await assertSingleColumnMobile(page, 360, 780);
    });

    test('viewport 375x812 — same single-column mobile layout (TC-R-002)', async ({ page }) => {
      await assertSingleColumnMobile(page, 375, 812);
    });

    test('body padding is 24 px on all sides (TC-L-001)', async ({ page }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const padding = await root.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        };
      });

      expect(padding.top).toBe('24px');
      expect(padding.right).toBe('24px');
      expect(padding.bottom).toBe('24px');
      expect(padding.left).toBe('24px');
    });

    test('description font-size is 16 px on mobile (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('16px');
    });

    test('trophy icon size is 120 px on mobile (TC-L-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const trophy = page.getByTestId('onboarding-trophy');
      await expect(trophy).toBeVisible();

      const fontSize = await trophy.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('120px');
    });

    test('hero corner radius is 28 px on mobile (TC-L-005)', async ({ page }) => {
      await page.goto('/onboarding');

      const hero = page.getByTestId('onboarding-hero');
      await expect(hero).toBeVisible();

      const radius = await hero.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      expect(radius).toBe('28px');
    });

    test('"Get started" button typography on mobile (TC-V-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-get-started');
      await expect(button).toBeVisible();
      await expect(button).toHaveText('Get started');

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          color: style.color,
        };
      });

      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('14px');
      expect(computed.color).toBe('rgb(255, 255, 255)');
    });

    test('"I have an account" button typography on mobile (TC-V-009)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-have-account');
      await expect(button).toBeVisible();
      await expect(button).toHaveText('I have an account');

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          color: style.color,
        };
      });

      expect(computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim()).toBe('Inter');
      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('14px');
      expect(computed.color).toBe('rgb(25, 29, 23)');
    });

    test('brand wordmark is hidden on mobile (TC-V-010)', async ({ page }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeHidden();
    });
  });

  test.describe('tablet viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('headline font-size is 45 px on tablet (TC-V-003)', async ({ page }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const fontSize = await headline.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('45px');
    });

    test('viewport 768x1024 — tablet layout, buttons inline, larger hero (TC-R-003)', async ({
      page,
    }) => {
      await assertTabletLayout(page, 768, 1024);
    });

    test('viewport 1024x768 — tablet layout still applies (TC-R-004)', async ({ page }) => {
      await assertTabletLayout(page, 1024, 768);
    });

    test('content vertical gap on tablet is 32 px (TC-L-004)', async ({ page }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const rowGap = await root.evaluate((el) => getComputedStyle(el).rowGap);
      expect(rowGap).toBe('32px');
    });

    test('buttons inline on tablet with 16 px gap (TC-L-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const primary = page.getByTestId('onboarding-get-started');
      const secondary = page.getByTestId('onboarding-have-account');

      const rects = await Promise.all(
        [primary, secondary].map((loc) =>
          loc.evaluate((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
          }),
        ),
      );

      // Inline: same row (top alignment within rounding tolerance), secondary right of primary
      expect(Math.abs(rects[0].top - rects[1].top)).toBeLessThan(2);
      expect(rects[1].left).toBeGreaterThan(rects[0].right - 1);
      expect(rects[1].left - rects[0].right).toBeCloseTo(16, 0);
    });

    test('body padding on tablet is 40 px vertical / 80 px horizontal (TC-L-003)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const padding = await root.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        };
      });

      expect(padding.top).toBe('40px');
      expect(padding.bottom).toBe('40px');
      expect(padding.left).toBe('80px');
      expect(padding.right).toBe('80px');
    });

    test('description font-size is 18 px on tablet (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('18px');
    });

    test('trophy icon size is 180 px on tablet (TC-L-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const trophy = page.getByTestId('onboarding-trophy');
      await expect(trophy).toBeVisible();

      const fontSize = await trophy.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('180px');
    });

    test('hero corner radius is 36 px on tablet (TC-L-005)', async ({ page }) => {
      await page.goto('/onboarding');

      const hero = page.getByTestId('onboarding-hero');
      await expect(hero).toBeVisible();

      const radius = await hero.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      expect(radius).toBe('36px');
    });

    test('"Get started" button typography on tablet (TC-V-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-get-started');
      await expect(button).toBeVisible();

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontWeight: style.fontWeight, fontSize: style.fontSize, color: style.color };
      });

      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('16px');
      expect(computed.color).toBe('rgb(255, 255, 255)');
    });

    test('"I have an account" button typography on tablet (TC-V-009)', async ({ page }) => {
      await page.goto('/onboarding');

      const button = page.getByTestId('onboarding-have-account');
      await expect(button).toBeVisible();

      const computed = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontWeight: style.fontWeight, fontSize: style.fontSize, color: style.color };
      });

      expect(computed.fontWeight).toBe('500');
      expect(computed.fontSize).toBe('16px');
      expect(computed.color).toBe('rgb(25, 29, 23)');
    });

    test('brand wordmark is hidden on tablet (TC-V-010)', async ({ page }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeHidden();
    });
  });

  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('headline font-size is 57 px and line-height is 1.1 on desktop (TC-V-004)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const headline = page.getByTestId('onboarding-headline');
      await expect(headline).toBeVisible();

      const metrics = await headline.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        };
      });

      expect(metrics.fontSize).toBe('57px');
      const fontSizePx = parseFloat(metrics.fontSize);
      const lineHeightPx = parseFloat(metrics.lineHeight);
      expect(lineHeightPx / fontSizePx).toBeCloseTo(1.1, 2);
    });

    test('buttons inline on desktop with 16 px gap (TC-L-008)', async ({ page }) => {
      await page.goto('/onboarding');

      const primary = page.getByTestId('onboarding-get-started');
      const secondary = page.getByTestId('onboarding-have-account');

      const rects = await Promise.all(
        [primary, secondary].map((loc) =>
          loc.evaluate((el) => {
            const rect = (el as HTMLElement).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
          }),
        ),
      );

      expect(Math.abs(rects[0].top - rects[1].top)).toBeLessThan(2);
      expect(rects[1].left - rects[0].right).toBeCloseTo(16, 0);
    });

    test('viewport >= 1920 — content max-width is respected (TC-R-006)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      await expect(root).toBeVisible();

      const rect = await root.evaluate((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width };
      });

      // Content does not span edge-to-edge: at least one side has visible inset
      const leftInset = rect.left;
      const rightInset = 1920 - rect.right;
      expect(leftInset + rightInset).toBeGreaterThan(0);
      // Content max-width capped well below the viewport
      expect(rect.width).toBeLessThanOrEqual(1440);
    });

    test('viewport 1440x900 — desktop split layout with brand wordmark visible (TC-R-005)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/onboarding');

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      await expect(page.getByTestId('onboarding-wordmark')).toBeVisible();

      const root = page.getByTestId('onboarding');
      const hero = page.getByTestId('onboarding-hero');
      const headline = page.getByTestId('onboarding-headline');
      const rootRect = await root.evaluate((el) =>
        (el as HTMLElement).getBoundingClientRect(),
      );
      const heroRect = await hero.evaluate((el) =>
        (el as HTMLElement).getBoundingClientRect(),
      );
      const headlineRect = await headline.evaluate((el) =>
        (el as HTMLElement).getBoundingClientRect(),
      );
      const center = rootRect.left + rootRect.width / 2;
      expect(heroRect.left).toBeGreaterThanOrEqual(center - 4);
      expect(headlineRect.right).toBeLessThanOrEqual(center + 4);
    });

    test('desktop layout splits ~50/50 with hero on the right (TC-L-010)', async ({ page }) => {
      await page.goto('/onboarding');

      const root = page.getByTestId('onboarding');
      const hero = page.getByTestId('onboarding-hero');
      const headline = page.getByTestId('onboarding-headline');
      const description = page.getByTestId('onboarding-description');
      const buttons = page.getByTestId('onboarding-buttons');

      const rootRect = await root.evaluate((el) =>
        (el as HTMLElement).getBoundingClientRect(),
      );
      const heroRect = await hero.evaluate((el) =>
        (el as HTMLElement).getBoundingClientRect(),
      );

      const center = rootRect.left + rootRect.width / 2;

      // Hero sits in the right half of the page area (the "right ~50%" of the design)
      expect(heroRect.left).toBeGreaterThanOrEqual(center - 4);
      expect(heroRect.right).toBeGreaterThan(center + heroRect.width * 0.4);

      // Left column items (copy + actions) sit in the left half
      for (const left of [headline, description, buttons]) {
        const rect = await left.evaluate((el) => (el as HTMLElement).getBoundingClientRect());
        expect(rect.right).toBeLessThanOrEqual(center + 4);
      }
    });

    test('trophy icon size is 280 px on desktop (TC-L-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const trophy = page.getByTestId('onboarding-trophy');
      await expect(trophy).toBeVisible();

      const fontSize = await trophy.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('280px');
    });

    test('description font-size is 18 px on desktop (TC-V-006)', async ({ page }) => {
      await page.goto('/onboarding');

      const description = page.getByTestId('onboarding-description');
      await expect(description).toBeVisible();

      const fontSize = await description.evaluate((el) => getComputedStyle(el).fontSize);
      expect(fontSize).toBe('18px');
    });

    test('brand wordmark "HealthQuest" is visible on desktop with font 22 px weight 500 (TC-V-010)', async ({
      page,
    }) => {
      await page.goto('/onboarding');

      const wordmark = page.getByTestId('onboarding-wordmark');
      await expect(wordmark).toBeVisible();
      await expect(wordmark).toHaveText('HealthQuest');

      const computed = await wordmark.evaluate((el) => {
        const style = getComputedStyle(el);
        return { fontSize: style.fontSize, fontWeight: style.fontWeight };
      });

      expect(computed.fontSize).toBe('22px');
      expect(computed.fontWeight).toBe('500');
    });
  });
});
