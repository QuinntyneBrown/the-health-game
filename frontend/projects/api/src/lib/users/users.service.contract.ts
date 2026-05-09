import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { UserProfile } from './user-profile.model';

export interface IUsersService {
  getCurrentUser(): Observable<UserProfile>;
}

export const USERS_SERVICE = new InjectionToken<IUsersService>('USERS_SERVICE');
