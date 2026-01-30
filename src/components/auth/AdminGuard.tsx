'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCurrentUserWithProfile } from '@/lib/session';
import { LoadingState } from '@/components/ui/StatusStates';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!user) {
        router.replace('/belepes');
        return;
      }
      const { profile } = await getCurrentUserWithProfile();
      if (!mounted) return;
      if (!profile || profile.role !== 'admin') {
        router.replace('/park');
        return;
      }
      setChecking(false);
    }

    if (!authLoading) run();
    return () => { mounted = false };
  }, [user, authLoading, router]);

  if (authLoading || checking) return <LoadingState message="Jogosultság ellenőrzése..." />;

  return <>{children}</>;
}
