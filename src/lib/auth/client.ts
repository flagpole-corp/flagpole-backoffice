'use client';

import type { ApiResponse, AuthResponse } from '@/types/auth';
import type { User } from '@/types/user';

import api from '../axios';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signInWithPassword(params: SignInWithPasswordParams): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', params);

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            isInternal: data.user.isInternal,
            internalPermissions: data.user.internalPermissions,
          })
        );
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to sign in',
      };
    }
  }

  async signInWithOAuth(params: SignInWithOAuthParams): Promise<ApiResponse<void>> {
    try {
      const { provider } = params;
      window.location.href = `/api/auth/${provider}`;
      return {};
    } catch (error) {
      return { error: 'Social authentication failed' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/auth/forgot-password', params);
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to send reset password email',
      };
    }
  }

  async updatePassword(token: string, password: string): Promise<ApiResponse<void>> {
    try {
      await api.post('/api/auth/reset-password', { token, password });
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update password',
      };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      if (!this.isAuthenticated()) {
        return { data: null };
      }

      const { data } = await api.get<User>('/api/auth/me');
      return { data };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        return { data: null };
      }
      return {
        error: error instanceof Error ? error.message : 'Failed to get user data',
      };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
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

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token'));
  }

  isInternalUser(): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr) as Pick<User, 'isInternal'>;
      return user.isInternal;
    } catch {
      return false;
    }
  }
}

export const authClient = new AuthClient();
