import { Routes } from '@angular/router';

import { GoalFormComponent } from './goal-form.component';
import { GoalListComponent } from './goal-list.component';

export const GOALS_ROUTES: Routes = [
  { path: '', component: GoalListComponent },
  { path: 'new', component: GoalFormComponent },
];
