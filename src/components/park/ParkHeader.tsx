'use client';

import { useAuth } from "@/components/auth/AuthProvider";

export interface ParkHeaderProps {
    status: 'Próba' | 'Előfizető';
}

export function ParkHeader({ status }: ParkHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="relative -mx-4 px-6 pt-10 pb-12 mb-4 overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-100/30 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    Szia! 👋
                </h1>
                <span className={`
          px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest
          ${status === 'Előfizető'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-stone-200 text-stone-600'}
        `}>
                    {status}
                </span>
            </div>

            <div className="mb-6">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    Belépve: <span className="text-stone-500 lowercase">{user?.email || 'Vendég'}</span>
                </p>
            </div>

            <p className="text-gray-600 text-xl font-medium leading-snug max-w-2xl">
                Ma mivel szeretnél foglalkozni magaddal?
            </p>
        </header>
    );
}
