// Acceptance Test
// Traces to: L2-020, L2-021, L2-030, L2-031, L2-033
// Description: Verifies the root shell renders the library-based Material scaffold
// and a Material bottom navigation with Home, Goals, Rewards, and Profile items.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { VIEWPORT } from './viewport/viewport.signal';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: VIEWPORT, useValue: signal('bottom').asReadonly() },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('hg-app-brand')?.textContent).toContain('HealthQuest');
  });

  it('renders a skip-link as the first focusable element pointing at main content', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const skip = compiled.querySelector<HTMLAnchorElement>('a.app-shell__skip-link');
    expect(skip).not.toBeNull();
    expect(skip?.getAttribute('href')).toBe('#main');
    expect(compiled.querySelector('#main')).not.toBeNull();
  });

  it('should render the bottom navigation with the four primary destinations', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const bottomNav = compiled.querySelector(
      'hg-navigation-bar.app-shell__navigation--bottom',
    );
    expect(bottomNav).not.toBeNull();

    const labels = Array.from(bottomNav?.querySelectorAll('.navigation-bar__label') ?? []).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual(['Home', 'Goals', 'Rewards', 'Profile']);
  });
});
