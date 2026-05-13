import { expect, Locator, Page } from '@playwright/test';

export interface AuthSessionOptions {
  readonly email?: string;
  readonly displayName?: string;
  readonly roles?: readonly string[];
}

export interface GoalInput {
  readonly name: string;
  readonly description?: string;
  readonly targetValue: string;
  readonly targetUnit: string;
  readonly cadence: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  readonly customIntervalValue?: string;
  readonly customIntervalUnit?: 'hours' | 'days';
}

export interface ActivityInput {
  readonly quantity: string;
  readonly recordedAt?: string;
  readonly notes?: string;
}

export interface RewardInput {
  readonly name: string;
  readonly description?: string;
  readonly goalName?: string;
  readonly conditionType: 'goal-target' | 'streak';
  readonly streakThreshold?: string;
}

export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    readonly path: string,
    readonly heading: string | RegExp,
  ) {}

  async authenticateAs(userId: string, options: AuthSessionOptions = {}): Promise<void> {
    await this.page.addInitScript(
      ({ token, roles }) => {
        window.sessionStorage.setItem('hg.oidc.access-token', token);
        window.sessionStorage.setItem('hg.e2e.roles', JSON.stringify(roles));
      },
      {
        token: `e2e-${userId}`,
        roles: options.roles ?? ['User'],
      },
    );

    await this.page.setExtraHTTPHeaders({
      'X-E2E-User': userId,
      'X-E2E-Email': options.email ?? `${userId}@example.test`,
      'X-E2E-Name': options.displayName ?? userId,
      'X-E2E-Roles': (options.roles ?? ['User']).join(','),
    });
  }

  async goto(path = this.path): Promise<void> {
    await this.page.goto(path);
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async emulateMobile4G(): Promise<void> {
    const session = await this.page.context().newCDPSession(this.page);
    await session.send('Network.enable');
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: 'cellular4g',
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: this.heading })).toBeVisible();
  }

  async expectUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(escapeRegExp(fragment)));
  }

  async expectTextVisible(text: string | RegExp): Promise<void> {
    await expect(this.page.getByText(text, { exact: typeof text === 'string' })).toBeVisible();
  }

  async expectStatus(text: string | RegExp): Promise<void> {
    await expect(this.page.getByRole('status')).toContainText(text);
  }

  async expectValidationError(text: string | RegExp): Promise<void> {
    const alert = this.page.getByRole('alert').or(this.page.getByText(text));
    await expect(alert).toContainText(text);
  }

  async expectNoHorizontalOverflow(): Promise<void> {
    const metrics = await this.page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));

    expect(metrics.scrollWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.clientWidth + 1);
  }

  async expectInteractiveControlsHaveAccessibleNames(): Promise<void> {
    const unnamedControls = await this.page.locator('button, a[href], input, select, textarea, [role="button"], [role="link"], [role="menuitem"]').evaluateAll((elements) => {
      const visible = (element: Element): boolean => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const textForIds = (ids: string): string =>
        ids
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
          .join(' ')
          .trim();
      const accessibleName = (element: Element): string => {
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const text = element.textContent;
        const imageAlt = element instanceof HTMLImageElement ? element.alt : '';

        return [ariaLabel, title, imageAlt, text, ariaLabelledBy ? textForIds(ariaLabelledBy) : '']
          .map((value) => value?.trim() ?? '')
          .find(Boolean) ?? '';
      };

      return elements
        .filter((element) => visible(element))
        .filter((element) => !accessibleName(element))
        .map((element) => element.outerHTML.slice(0, 180));
    });

    expect(unnamedControls).toEqual([]);
  }

  async expectFormFieldsHaveProgrammaticLabels(): Promise<void> {
    const unlabeledFields = await this.page.locator('input:not([type="hidden"]), select, textarea').evaluateAll((elements) => {
      const cssEscape = (value: string): string => value.replace(/["\\]/g, '\\$&');
      const visible = (element: Element): boolean => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const hasLabel = (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean => {
        if (element.labels && element.labels.length > 0) {
          return true;
        }

        if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')) {
          return true;
        }

        return Boolean(element.id && document.querySelector(`label[for="${cssEscape(element.id)}"]`));
      };

      return elements
        .filter((element) => visible(element))
        .filter((element) => !hasLabel(element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement))
        .map((element) => element.outerHTML.slice(0, 180));
    });

    expect(unlabeledFields).toEqual([]);
  }

  async expectMinimumContrast(): Promise<void> {
    const failures = await this.page.locator('body *').evaluateAll((elements) => {
      type Rgba = readonly [number, number, number, number];
      const visible = (element: Element): boolean => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const parseColor = (value: string): Rgba | null => {
        const match = value.match(/rgba?\(([^)]+)\)/i);
        if (!match) {
          return null;
        }

        const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
        if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) {
          return null;
        }

        return [parts[0], parts[1], parts[2], parts[3] ?? 1];
      };
      const backgroundFor = (element: Element): Rgba => {
        let current: Element | null = element;

        while (current) {
          const parsed = parseColor(getComputedStyle(current).backgroundColor);
          if (parsed && parsed[3] > 0) {
            return parsed;
          }

          current = current.parentElement;
        }

        return [255, 255, 255, 1];
      };
      const luminance = (color: Rgba): number => {
        const [r, g, b] = color.slice(0, 3).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const contrast = (foreground: Rgba, background: Rgba): number => {
        const lighter = Math.max(luminance(foreground), luminance(background));
        const darker = Math.min(luminance(foreground), luminance(background));
        return (lighter + 0.05) / (darker + 0.05);
      };

      return elements
        .filter((element) => visible(element) && (element.textContent ?? '').trim().length > 0)
        .map((element) => {
          const style = getComputedStyle(element);
          const color = parseColor(style.color);
          const background = backgroundFor(element);
          const size = Number.parseFloat(style.fontSize);
          const weight = Number.parseInt(style.fontWeight, 10);
          const ratio = color ? contrast(color, background) : 21;
          const required = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;

          return {
            ratio,
            required,
            sample: (element.textContent ?? '').trim().slice(0, 80),
          };
        })
        .filter((entry) => entry.ratio < entry.required)
        .slice(0, 20);
    });

    expect(failures).toEqual([]);
  }

  async expectKeyboardReachable(controlName: string | RegExp): Promise<void> {
    const control = this.page.getByRole('button', { name: controlName }).or(this.page.getByRole('link', { name: controlName })).first();
    await expect(control).toBeVisible();
    await control.focus();
    await expect(control).toBeFocused();

    const focusStyle = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
        borderColor: style.borderColor,
      };
    });

    expect(
      focusStyle.outlineStyle !== 'none' ||
        focusStyle.outlineWidth !== '0px' ||
        focusStyle.boxShadow !== 'none' ||
        focusStyle.borderColor !== 'rgba(0, 0, 0, 0)',
      JSON.stringify(focusStyle),
    ).toBeTruthy();
  }

  async expectKeyboardActivation(controlName: string | RegExp, key: 'Enter' | 'Space' = 'Enter'): Promise<void> {
    const control = this.page.getByRole('button', { name: controlName }).or(this.page.getByRole('link', { name: controlName })).first();
    const flag = `__e2eActivated${Date.now()}${Math.random().toString(36).slice(2)}`;
    await expect(control).toBeVisible();
    await control.evaluate((element, propertyName) => {
      (window as Window & Record<string, unknown>)[propertyName] = false;
      element.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          (window as Window & Record<string, unknown>)[propertyName] = true;
        },
        { capture: true, once: true },
      );
    }, flag);

    await control.focus();
    await this.page.keyboard.press(key);
    const activated = await this.page.evaluate((propertyName) => (window as Window & Record<string, unknown>)[propertyName], flag);
    expect(activated).toBe(true);
  }

  async expectWindowPropertyUndefined(propertyName: string): Promise<void> {
    const value = await this.page.evaluate((name) => (window as Window & Record<string, unknown>)[name], propertyName);
    expect(value).toBeUndefined();
  }

  async loadPerformanceMetrics(): Promise<{
    readonly lcp: number;
    readonly totalBlockingTime: number;
    readonly transferSize: number;
  }> {
    await this.page.waitForLoadState('networkidle');

    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const paint = performance.getEntriesByType('paint');
      const lcpEntry = performance.getEntriesByType('largest-contentful-paint').at(-1) as PerformanceEntry | undefined;
      const lcp =
        lcpEntry?.startTime ??
        paint.find((entry) => entry.name === 'largest-contentful-paint')?.startTime ??
        navigation?.domContentLoadedEventEnd ??
        0;
      const longTasks = performance.getEntriesByType('longtask') as PerformanceEntry[];
      const totalBlockingTime = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
      const transferSize = resources
        .filter((resource) => resource.name.endsWith('.js'))
        .reduce((sum, resource) => sum + resource.transferSize, 0);

      return { lcp, totalBlockingTime, transferSize };
    });
  }

  protected field(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }

  protected button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  protected link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  protected region(name: string | RegExp): Locator {
    return this.page.getByRole('region', { name });
  }

  protected testId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  protected async fillField(label: string | RegExp, value: string): Promise<void> {
    await this.field(label).fill(value);
  }

  protected async chooseOption(label: string | RegExp, valueOrLabel: string | RegExp): Promise<void> {
    const field = this.field(label);
    if ((await field.count()) > 0 && typeof valueOrLabel === 'string') {
      await field.selectOption({ label: valueOrLabel }).catch(async () => field.selectOption(valueOrLabel));
      return;
    }

    await this.page.getByRole('group', { name: label }).getByRole('button', { name: valueOrLabel }).click();
  }

  protected async clickButton(name: string | RegExp): Promise<void> {
    await this.button(name).click();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
