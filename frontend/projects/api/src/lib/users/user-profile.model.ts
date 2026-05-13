export interface UserProfile {
  readonly id?: string;
  readonly subjectId?: string;
  readonly displayName: string;
  readonly email: string;
  readonly timeZoneId?: string;
  readonly avatarUrl: string | null;
  readonly roles: readonly string[];
  readonly memberSince?: string;
  readonly updatedAt?: string | null;
  readonly emailEditable?: boolean;
}
