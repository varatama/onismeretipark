"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, MessageCircle, Video, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCurrentUserWithProfile } from '@/lib/session';
import { featureFlagsFor } from '@/lib/featureFlags';

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export function BottomNav() {
    const pathname = usePathname();

    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function check() {
            if (!user) return setIsAdmin(false);
            const { profile } = await getCurrentUserWithProfile();
            if (!mounted) return;
            const flags = featureFlagsFor(profile);
            setIsAdmin(Boolean(flags.admin));
        }
        check();
        return () => { mounted = false };
    }, [user]);

    const navItems: { href: string; label: string; icon: any }[] = [
        { href: '/park', label: 'Park', icon: Map },
        { href: '/chat', label: 'Chat', icon: MessageCircle },
        { href: '/elo', label: 'Élő', icon: Video },
        { href: '/profil', label: 'Profil', icon: User },
    ];

    if (isAdmin) {
        // Place admin before profile for easier discovery
        navItems.splice(3, 0, { href: '/admin', label: 'Admin', icon: ShieldCheck });
    }

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 bg-white/80 backdrop-blur-xl border-t border-stone-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full space-y-1.5 min-w-[64px] transition-colors duration-300",
                                isActive ? "text-indigo-600" : "text-stone-400 hover:text-stone-600"
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    size={26}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn("transition-transform duration-300", isActive && "scale-110")}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute -inset-2 bg-indigo-50 rounded-full -z-10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </div>
                            <span className={cn(
                                "text-[11px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100" : "opacity-70"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
