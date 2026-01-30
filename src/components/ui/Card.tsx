'use client';

import { ReactNode } from 'react';

type CardVariant = 'default' | 'premium' | 'locked' | 'glass' | 'flat';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: CardVariant;
    onClick?: () => void;
}

export function Card({ children, className = '', variant = 'default', onClick }: CardProps) {
    const baseStyles = "relative overflow-hidden transition-all duration-300";

    const variants = {
        default: "bg-white rounded-[1.5rem] border border-stone-100 shadow-sm hover:shadow-md",
        premium: "bg-gradient-to-br from-indigo-50 to-white rounded-[1.5rem] border border-indigo-100 shadow-sm hover:shadow-indigo-100",
        locked: "bg-stone-50 rounded-[1.5rem] border border-stone-100 opacity-80",
        glass: "bg-white/80 backdrop-blur-md rounded-[1.5rem] border border-white/50 shadow-sm",
        flat: "bg-stone-50 rounded-2xl border border-stone-100/50"
    };

    return (
        <div
            onClick={onClick}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
                ${className}
            `}
        >
            {/* Future: Background Image Layer */}
            <div className="absolute inset-0 -z-10 bg-transparent" />

            {/* Content Layer */}
            <div className="relative z-0 h-full">
                {children}
            </div>
        </div>
    );
}

export function Badge({ children, color = 'stone', className = '' }: { children: ReactNode, color?: 'stone' | 'indigo' | 'green' | 'red' | 'orange' | 'premium', className?: string }) {
    const colors = {
        stone: "bg-stone-100 text-stone-600",
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
        premium: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]} ${className}`}>
            {children}
        </span>
    );
}
