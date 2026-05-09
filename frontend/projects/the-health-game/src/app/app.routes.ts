import { Routes } from '@angular/router';

import { PlaceholderComponent } from './placeholder/placeholder.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  { path: 'goals', component: PlaceholderComponent },
  { path: 'rewards', component: PlaceholderComponent },
  { path: 'profile', component: PlaceholderComponent },
  {
    path: '**',
    redirectTo: '',
  },
];
