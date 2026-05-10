import { Routes } from '@angular/router';
import { authGuard } from 'api';

import { CallbackComponent } from './auth/callback.component';
import { notAuthenticatedGuard } from './auth/not-authenticated.guard';
import { SignedOutComponent } from './auth/signed-out.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

export const routes: Routes = [
  { path: 'auth/callback', component: CallbackComponent, title: 'Signing you in' },
  { path: 'auth/signed-out', component: SignedOutComponent, title: 'Signed out' },
  {
    path: 'sign-in',
    canMatch: [notAuthenticatedGuard],
    title: 'Sign in — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.AUTH_ROUTES),
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    title: 'Welcome — HealthQuest',
    canMatch: [notAuthenticatedGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [authGuard],
    title: 'Home — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  {
    path: 'home',
    canMatch: [authGuard],
    title: 'Home — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  {
    path: 'goals',
    canMatch: [authGuard],
    title: 'Goals — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.GOALS_ROUTES),
  },
  {
    path: 'rewards',
    canMatch: [authGuard],
    title: 'Rewards — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.REWARDS_ROUTES),
  },
  {
    path: 'profile',
    canMatch: [authGuard],
    title: 'Profile — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.PROFILE_ROUTES),
  },
  {
    path: 'stats',
    canMatch: [authGuard],
    title: 'Stats — HealthQuest',
    loadChildren: () => import('domain').then((module) => module.STATS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

