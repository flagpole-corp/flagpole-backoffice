'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
  requireInternal?: boolean;
}

export function AuthGuard({ children, requireInternal = false }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = React.useCallback(async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    // If there's no user and we're done loading, redirect
    if (!isLoading && !user) {
      router.replace(paths.auth.signIn);
      return;
    }

    // Check internal access if required
    if (!isLoading && user && requireInternal && !user.isInternal) {
      router.replace(paths.dashboard.overview);
      return;
    }

    // Only set checking to false if we have a user or if there's an error
    if (!isLoading && (user || error)) {
      setIsChecking(false);
    }
  }, [isLoading, user, error, requireInternal, router]);

  React.useEffect(() => {
    void (async () => {
      try {
        await checkPermissions();
      } catch (err) {
        // eslint-disable-next-line
        console.error('Error checking permissions:', err);
      }
    })();
  }, [checkPermissions]);

  // Show nothing while checking
  if (isChecking || isLoading) {
    return null;
  }

  // Show error if there is one
  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  // If we're not checking and have a user, show content
  return <>{children}</>;
}
