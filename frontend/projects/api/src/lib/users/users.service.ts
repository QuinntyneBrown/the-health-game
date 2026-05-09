import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { UserProfile } from './user-profile.model';
import { IUsersService } from './users.service.contract';

@Injectable({ providedIn: 'root' })
export class UsersService implements IUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_CONFIG).apiBaseUrl;

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiBaseUrl}/api/users/me`);
  }
}
