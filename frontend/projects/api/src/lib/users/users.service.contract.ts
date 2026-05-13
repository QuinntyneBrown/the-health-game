import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { UserProfile } from './user-profile.model';

export interface UpdateUserProfileInput {
  readonly displayName: string;
  readonly email: string;
  readonly timeZoneId?: string;
}

export interface IUsersService {
  getCurrentUser(): Observable<UserProfile>;
  updateCurrentUser(input: UpdateUserProfileInput): Observable<UserProfile>;
  deleteCurrentUser(): Observable<void>;
}

export const USERS_SERVICE = new InjectionToken<IUsersService>('USERS_SERVICE');
