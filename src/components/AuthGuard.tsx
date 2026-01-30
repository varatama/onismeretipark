'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/belepes');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-xl font-bold text-gray-900 tracking-tight">Park Belépés</p>
                        <p className="text-stone-400 font-medium text-sm animate-pulse">Azonosítás folyamatban...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col w-full"
        >
            {children}
        </motion.div>
    );
}
