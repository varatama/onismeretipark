'use client';

import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <div className={`bg-white rounded-[1.5rem] border border-stone-100 shadow-sm p-5 ${className}`}>
            {children}
        </div>
    );
}

export function Badge({ children, color = 'stone', className = '' }: { children: ReactNode, color?: 'stone' | 'indigo' | 'green' | 'red' | 'orange', className?: string }) {
    const colors = {
        stone: "bg-stone-100 text-stone-600",
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]} ${className}`}>
            {children}
        </span>
    );
}
