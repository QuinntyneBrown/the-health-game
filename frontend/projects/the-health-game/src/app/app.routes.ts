import { Routes } from '@angular/router';
import { authGuard } from 'api';

import { CallbackComponent } from './auth/callback.component';
import { SignedOutComponent } from './auth/signed-out.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';

export const routes: Routes = [
  { path: 'auth/callback', component: CallbackComponent },
  { path: 'auth/signed-out', component: SignedOutComponent },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [authGuard],
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  { path: 'goals', canMatch: [authGuard], component: PlaceholderComponent },
  { path: 'rewards', canMatch: [authGuard], component: PlaceholderComponent },
  {
    path: 'profile',
    canMatch: [authGuard],
    loadChildren: () => import('domain').then((module) => module.PROFILE_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
