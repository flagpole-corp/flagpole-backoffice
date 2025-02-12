import type {
  ApiResponse,
  AuthResponse,
  InternalPermission,
  ResetPasswordParams,
  SignInParams,
  StoredUser,
  UpdatePasswordParams,
} from '@/types/auth';
import type { User } from '@/types/user';

import api from './axios';

export async function signIn(params: SignInParams): Promise<ApiResponse<AuthResponse>> {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/login', params);

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);

      const storedUser: StoredUser = {
        id: data.user.id,
        email: data.user.email,
        isInternal: data.user.isInternal,
        internalPermissions: data.user.internalPermissions,
      };

      localStorage.setItem('user', JSON.stringify(storedUser));
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to sign in',
    };
  }
}

export async function resetPassword(params: ResetPasswordParams): Promise<ApiResponse<void>> {
  try {
    await api.post('/api/auth/forgot-password', params);
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send reset password email',
    };
  }
}

export async function updatePassword(params: UpdatePasswordParams): Promise<ApiResponse<void>> {
  try {
    await api.post('/api/auth/reset-password', params);
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<User | null>> {
  try {
    const { data } = await api.get<User>('/api/auth/me');
    return { data };
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      return { data: null };
    }
    return {
      error: error instanceof Error ? error.message : 'Failed to get user data',
    };
  }
}

export async function signOut(): Promise<ApiResponse<void>> {
  try {
    await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to sign out',
    };
  }
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('token'));
}

export function isInternalUser(): boolean {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr) as StoredUser;
    return user.isInternal;
  } catch {
    return false;
  }
}

export function hasInternalPermission(permission: InternalPermission): boolean {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr) as StoredUser;
    return user.isInternal && user.internalPermissions?.includes(permission);
  } catch {
    return false;
  }
}
