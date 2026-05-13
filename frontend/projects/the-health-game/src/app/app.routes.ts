import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'onboarding',
    title: 'Onboarding - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.OnboardingComponent),
  },
  {
    path: 'sign-in',
    title: 'Sign in - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.AUTH_ROUTES),
  },
  {
    path: 'register',
    title: 'Create account - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.CreateAccountComponent),
  },
  {
    path: 'password-reset',
    title: 'Reset password - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.ResetPasswordComponent),
  },
  {
    path: 'auth/callback',
    title: 'Session status - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.AuthSessionStatesComponent),
  },
  {
    path: 'auth/signed-out',
    title: 'Signed out - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.AuthSessionStatesComponent),
  },
  {
    path: 'home',
    title: 'Home - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  {
    path: 'goals',
    title: 'Goals - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.GOALS_ROUTES),
  },
  {
    path: 'rewards',
    title: 'Rewards - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.REWARDS_ROUTES),
  },
  {
    path: 'profile',
    title: 'Profile - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.PROFILE_ROUTES),
  },
  {
    path: 'stats',
    title: 'Stats - HealthQuest',
    loadChildren: () => import('domain').then((module) => module.STATS_ROUTES),
  },
  {
    path: 'activity/log',
    title: 'Log activity - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.LogActivitySheetComponent),
  },
  {
    path: 'activity/log-dialog',
    title: 'Log activity dialog - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.LogActivityDialogComponent),
  },
  {
    path: 'activity/edit',
    title: 'Edit activity - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.EditActivityDialogComponent),
  },
  {
    path: 'activity/delete',
    title: 'Delete activity - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.DeleteActivityDialogComponent),
  },
  {
    path: 'activity/discard-changes',
    title: 'Discard changes - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.DiscardChangesDialogComponent),
  },
  {
    path: 'account/delete',
    title: 'Delete account - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.DeleteAccountDialogComponent),
  },
  {
    path: 'admin',
    title: 'Admin and states - HealthQuest',
    loadComponent: () => import('domain').then((module) => module.AdminStatesComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

