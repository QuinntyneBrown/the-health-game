// Acceptance Test
// Traces to: L2-030, L2-031, L2-033
// Description: Verifies the reusable presentation component catalog renders through Angular Material wrappers.
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ActionButtonComponent } from './action-button/action-button.component';
import { ActivityListItemComponent } from './activity-list-item/activity-list-item.component';
import { AppBrandComponent } from './app-brand/app-brand.component';
import { AppTopBarComponent } from './app-top-bar/app-top-bar.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { GoalCardComponent } from './goal-card/goal-card.component';
import { HealthTextFieldComponent } from './health-text-field/health-text-field.component';
import { MetricCardComponent } from './metric-card/metric-card.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { RewardCardComponent } from './reward-card/reward-card.component';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { SegmentedFilterComponent } from './segmented-filter/segmented-filter.component';
import { StatusBannerComponent } from './status-banner/status-banner.component';
import { StreakSummaryComponent } from './streak-summary/streak-summary.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { WeekStripComponent } from './week-strip/week-strip.component';

describe('Presentation component catalog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ActionButtonComponent,
        ActivityListItemComponent,
        AppBrandComponent,
        AppTopBarComponent,
        EmptyStateComponent,
        GoalCardComponent,
        HealthTextFieldComponent,
        MetricCardComponent,
        NavigationBarComponent,
        PageHeaderComponent,
        RewardCardComponent,
        SectionHeaderComponent,
        SegmentedFilterComponent,
        StatusBannerComponent,
        StreakSummaryComponent,
        UserAvatarComponent,
        WeekStripComponent,
      ],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('renders each reusable presentation component', () => {
    expect(createComponent(AppBrandComponent).nativeElement).toBeTruthy();
    expect(createComponent(ActionButtonComponent, { label: 'Save' }).nativeElement).toBeTruthy();
    expect(createComponent(AppTopBarComponent, { title: 'Today' }).nativeElement).toBeTruthy();
    expect(createComponent(UserAvatarComponent, { initials: 'QB' }).nativeElement).toBeTruthy();
    expect(
      createComponent(NavigationBarComponent, {
        activeItemId: 'home',
        items: [{ icon: 'home', id: 'home', label: 'Home' }],
      }).nativeElement,
    ).toBeTruthy();
    expect(createComponent(PageHeaderComponent, { title: 'Goals' }).nativeElement).toBeTruthy();
    expect(createComponent(SectionHeaderComponent, { title: 'Rewards' }).nativeElement).toBeTruthy();
    expect(
      createComponent(MetricCardComponent, {
        icon: 'check_circle',
        label: 'Today',
        value: '75%',
      }).nativeElement,
    ).toBeTruthy();
    expect(createComponent(GoalCardComponent, { title: 'Hydrate' }).nativeElement).toBeTruthy();
    expect(createComponent(RewardCardComponent, { name: 'Trail breakfast' }).nativeElement).toBeTruthy();
    expect(
      createComponent(ActivityListItemComponent, { title: 'Drink water' }).nativeElement,
    ).toBeTruthy();
    expect(createComponent(StreakSummaryComponent, { value: 12 }).nativeElement).toBeTruthy();
    expect(
      createComponent(StatusBannerComponent, { message: 'Activity logged' }).nativeElement,
    ).toBeTruthy();
    expect(createComponent(EmptyStateComponent, { title: 'No goals yet' }).nativeElement).toBeTruthy();
    expect(createComponent(HealthTextFieldComponent, { label: 'Goal name' }).nativeElement).toBeTruthy();
    expect(
      createComponent(SegmentedFilterComponent, {
        options: [{ label: 'Daily', value: 'daily' }],
        value: 'daily',
      }).nativeElement,
    ).toBeTruthy();
    expect(
      createComponent(WeekStripComponent, {
        days: [{ label: 'M', status: 'done' }],
      }).nativeElement,
    ).toBeTruthy();
  });
});

function createComponent<T>(component: Type<T>, inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(component);

  Object.entries(inputs).forEach(([name, value]) => {
    fixture.componentRef.setInput(name, value);
  });

  fixture.detectChanges();

  return fixture;
}
