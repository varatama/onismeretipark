'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminBadge } from '@/components/admin/AdminBadge';

interface PageShellProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    backHref?: string;
    headerAction?: ReactNode;
    className?: string;
    fullWidth?: boolean; // New prop to allow wider layout (e.g. for Admin lists)
}

export function PageShell({
    children,
    title,
    subtitle,
    backHref,
    headerAction,
    className = "",
    fullWidth = false
}: PageShellProps) {
    const maxWidthClass = fullWidth ? 'max-w-6xl' : 'max-w-3xl';

    return (
        <div className={`flex flex-col min-h-screen pt-10 pb-32 animate-fade-in w-full ${maxWidthClass} mx-auto ${className}`}>
            <AdminBadge />
            {/* Header Area */}
            {(title || backHref) && (
                <div className="px-5 md:px-0 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {backHref ? (
                            <Link
                                href={backHref}
                                className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </Link>
                        ) : <div className="w-8" />}

                        {headerAction && (
                            <div>{headerAction}</div>
                        )}
                    </div>

                    {title && (
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-stone-500 font-medium text-base">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Content Area */}
            <main className="flex-1 flex flex-col px-4 md:px-0">
                {children}
            </main>
        </div>
    );
}
