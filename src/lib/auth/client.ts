'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { AuthResponse } from '@/types/auth';
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

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Helper functions for localStorage operations
const setAuthData = (data: AuthResponse): void => {
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
};

const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem('token'));
};

const getCurrentUserFromStorage = (): Pick<User, 'isInternal'> | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as Pick<User, 'isInternal'>;
  } catch {
    return null;
  }
};

// Authentication hooks
export const useSignInWithPassword = (): UseMutationResult<AuthResponse, Error, SignInWithPasswordParams> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SignInWithPasswordParams): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>('/api/auth/login', params);
      return data;
    },
    onSuccess: async (data: AuthResponse): Promise<void> => {
      setAuthData(data);
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useSignInWithOAuth = (): UseMutationResult<void, Error, SignInWithOAuthParams> => {
  return useMutation({
    mutationFn: async (params: SignInWithOAuthParams): Promise<void> => {
      const { provider } = params;
      window.location.href = `/api/auth/${provider}`;
    },
  });
};

export const useResetPassword = (): UseMutationResult<void, Error, ResetPasswordParams> => {
  return useMutation({
    mutationFn: async (params: ResetPasswordParams): Promise<void> => {
      await api.post('/api/auth/forgot-password', params);
    },
  });
};

export const useUpdatePassword = (): UseMutationResult<void, Error, { token: string; password: string }> => {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }): Promise<void> => {
      await api.post('/api/auth/reset-password', { token, password });
    },
  });
};

export const useUser = (): UseQueryResult<User | null> => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<User | null> => {
      if (!isAuthenticated()) {
        return null;
      }

      try {
        const { data } = await api.get<User>('/api/auth/me');
        return data;
      } catch (error) {
        if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
          clearAuthData();
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSignOut = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/api/auth/logout');
    },
    onSuccess: (): void => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

// Helper hooks
export const useIsAuthenticated = (): boolean => {
  return isAuthenticated();
};

export const useIsInternalUser = (): boolean => {
  const user = getCurrentUserFromStorage();
  return Boolean(user?.isInternal);
};

// If you need the raw functions for some reason (like in non-component contexts)
export const authHelpers = {
  isAuthenticated,
  isInternalUser: (): boolean => {
    const user = getCurrentUserFromStorage();
    return Boolean(user?.isInternal);
  },
};
