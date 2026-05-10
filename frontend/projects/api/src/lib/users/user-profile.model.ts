export interface UserProfile {
  readonly displayName: string;
  readonly email: string;
  readonly avatarUrl: string | null;
  readonly roles: readonly string[];
  readonly memberSince?: string;
  readonly emailEditable?: boolean;
}
