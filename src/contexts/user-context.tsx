'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { useSignOut, useUser } from '@/lib/auth/client'; // Updated import
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
  signOut?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const { data: user, error, isLoading, refetch: checkSession } = useUser();

  const { mutateAsync: signOut } = useSignOut();

  const value = React.useMemo(
    () => ({
      user: user ?? null,
      error: error?.message ?? null,
      isLoading,
      checkSession: async () => {
        try {
          await checkSession();
        } catch (err) {
          logger.error(err);
        }
      },
      signOut: async () => {
        try {
          await signOut();
        } catch (err) {
          logger.error(err);
          throw err;
        }
      },
    }),
    [user, error, isLoading, checkSession, signOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;

export function useUserContext(): UserContextValue {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
