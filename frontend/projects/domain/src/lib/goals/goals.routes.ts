import { Routes } from '@angular/router';

import { DeleteGoalDialogComponent } from './delete-goal-dialog.component';
import { GoalDetailComponent } from './goal-detail.component';
import { GoalEmptyComponent } from './goal-empty.component';
import { GoalFormComponent } from './goal-form.component';
import { GoalListComponent } from './goal-list.component';

export const GOALS_ROUTES: Routes = [
  { path: '', component: GoalListComponent },
  { path: 'empty', component: GoalEmptyComponent },
  { path: 'new', component: GoalFormComponent },
  { path: ':id/edit', component: GoalFormComponent },
  { path: ':id/delete', component: DeleteGoalDialogComponent },
  { path: ':id', component: GoalDetailComponent },
];
