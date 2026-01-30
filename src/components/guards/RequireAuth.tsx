'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/ui/StatusStates';

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/belepes');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <LoadingState message="Ellenőrzés..." />;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
