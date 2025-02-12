import type { User } from './user';

export interface SignInParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  token: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

export type UserStatus = 'pending' | 'active' | 'inactive';
export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export type StoredUser = Pick<User, 'id' | 'email' | 'isInternal' | 'internalPermissions'>;

export const INTERNAL_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_ORGANIZATIONS: 'manage_organizations',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_ANALYTICS: 'view_analytics',
} as const;

export type InternalPermission = (typeof INTERNAL_PERMISSIONS)[keyof typeof INTERNAL_PERMISSIONS];
