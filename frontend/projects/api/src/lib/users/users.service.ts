import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_CONFIG } from '../api.config';
import { UserProfile } from './user-profile.model';
import { IUsersService, UpdateUserProfileInput } from './users.service.contract';

@Injectable({ providedIn: 'root' })
export class UsersService implements IUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_CONFIG).apiBaseUrl;

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfileDto>(`${this.apiBaseUrl}/api/users/me`).pipe(map(mapUser));
  }

  updateCurrentUser(input: UpdateUserProfileInput): Observable<UserProfile> {
    return this.http
      .put<UserProfileDto>(`${this.apiBaseUrl}/api/users/me`, {
        displayName: input.displayName,
        email: input.email,
        timeZoneId: input.timeZoneId ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
      })
      .pipe(map(mapUser));
  }

  deleteCurrentUser(): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/users/me`);
  }
}

interface UserProfileDto {
  readonly id: string;
  readonly subjectId: string;
  readonly displayName: string;
  readonly email: string;
  readonly timeZoneId: string;
  readonly roles: readonly (string | number)[];
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string | null;
}

function mapUser(dto: UserProfileDto): UserProfile {
  return {
    id: dto.id,
    subjectId: dto.subjectId,
    displayName: dto.displayName,
    email: dto.email,
    timeZoneId: dto.timeZoneId,
    avatarUrl: null,
    roles: dto.roles.map((role) => (typeof role === 'number' ? mapRole(role) : role)),
    memberSince: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc,
    emailEditable: true,
  };
}

function mapRole(role: number): string {
  return role === 2 ? 'Admin' : 'User';
}
