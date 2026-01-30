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
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile } from '@/lib/user'; // Using basic getProfile here as we need recent data
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkAdmin() {
            if (!user) {
                router.push('/belepes');
                return;
            }

            const profile = await getProfile(user.id);
            if (profile?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                router.push('/park'); // Kick non-admins out
            }
        }

        if (!authLoading) {
            checkAdmin();
        }
    }, [user, authLoading, router]);

    if (authLoading || isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (isAdmin === false) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
