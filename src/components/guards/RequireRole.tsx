'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { getOrSyncProfile } from '@/lib/user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingState } from '@/components/ui/StatusStates';

interface RequireRoleProps {
    children: React.ReactNode;
    role: 'admin' | 'user';
    redirectTo?: string;
}

export function RequireRole({ children, role, redirectTo = '/park' }: RequireRoleProps) {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [hasRole, setHasRole] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function check() {
            if (!user) return;
            const profile = await getOrSyncProfile(user.id);
            if (profile?.role === role) {
                setHasRole(true);
            } else {
                router.replace(redirectTo);
            }
            setChecking(false);
        }

        if (!authLoading) {
            if (!user) {
                router.replace('/belepes');
            } else {
                check();
            }
        }
    }, [user, authLoading, role, router, redirectTo]);

    if (authLoading || checking) {
        return <LoadingState message="Jogosultság ellenőrzése..." />;
    }

    if (!hasRole) {
        return null;
    }

    return <>{children}</>;
}
