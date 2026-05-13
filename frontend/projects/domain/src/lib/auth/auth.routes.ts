import { Routes } from '@angular/router';

import { AuthSessionStatesComponent } from './auth-session-states.component';
import { CreateAccountComponent } from './create-account.component';
import { ResetPasswordComponent } from './reset-password.component';
import { SignInComponent } from './sign-in.component';

export const AUTH_ROUTES: Routes = [
  { path: '', component: SignInComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'session', component: AuthSessionStatesComponent },
];
