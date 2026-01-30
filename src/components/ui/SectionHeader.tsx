'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
    return (
        <div className={`flex items-end justify-between px-1 mb-4 ${className}`}>
            <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs text-stone-500 font-medium mt-1.5 uppercase tracking-wide">
                        {subtitle}
                    </p>
                )}
            </div>

            {action && (
                action.href ? (
                    <Link href={action.href} className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 hover:text-indigo-700 transition-colors">
                        {action.label}
                        <ChevronRight size={14} />
                    </Link>
                ) : (
                    <button onClick={action.onClick} className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 hover:text-indigo-700 transition-colors">
                        {action.label}
                        <ChevronRight size={14} />
                    </button>
                )
            )}
        </div>
    );
}
