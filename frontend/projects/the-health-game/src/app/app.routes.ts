import { Routes } from '@angular/router';

import { CallbackComponent } from './auth/callback.component';
import { SignedOutComponent } from './auth/signed-out.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  { path: 'auth/callback', component: CallbackComponent },
  { path: 'auth/signed-out', component: SignedOutComponent },
  { path: 'goals', component: PlaceholderComponent },
  { path: 'rewards', component: PlaceholderComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: '**',
    redirectTo: '',
  },
];
