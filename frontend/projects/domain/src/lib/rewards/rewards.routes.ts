import { Routes } from '@angular/router';

import { RewardFormComponent } from './reward-form.component';
import { RewardListComponent } from './reward-list.component';

export const REWARDS_ROUTES: Routes = [
  { path: '', component: RewardListComponent },
  { path: 'new', component: RewardFormComponent },
];
