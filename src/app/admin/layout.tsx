'use client';

import { AdminGuard } from '@/components/auth/AdminGuard';
import Link from 'next/link';
import { LayoutDashboard, Compass, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Dash', icon: LayoutDashboard },
        { href: '/admin/experiences', label: 'Élmények', icon: Compass },
        { href: '/admin/users', label: 'User', icon: Users },
    ];

    return (
        <AdminGuard>
            <div className="flex flex-col min-h-screen bg-stone-100">
                {/* Desktop-like sidebar for admin could go here, but keeping mobile frame logic for now */}
                <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                    <span className="font-black text-stone-900 tracking-tight">ADMIN STUDIO</span>
                    <Link href="/park" className="text-xs font-bold text-indigo-600">
                        Exit to App
                    </Link>
                </header>

                <nav className="bg-white border-b border-stone-200 px-2 flex gap-1 overflow-x-auto">
                    {navItems.map(item => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
