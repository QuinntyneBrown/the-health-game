import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('domain').then((module) => module.DASHBOARD_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
