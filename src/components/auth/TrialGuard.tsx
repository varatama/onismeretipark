'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { isTrialLimitReached } from '@/lib/trial';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MirrorFrame } from '@/components/ui/MirrorFrame';
import { InnerFrame } from '@/components/ui/InnerFrame';
import { MetalButton } from '@/components/ui/MetalButton';

interface TrialGuardProps {
    children: ReactNode;
    experienceId?: string;
}

export function TrialGuard({ children }: TrialGuardProps) {
    const { user, isLoading } = useAuth();
    const [showGuard, setShowGuard] = useState(false);

    useEffect(() => {
        if (!isLoading && !user && isTrialLimitReached()) {
            setShowGuard(true);
        }
    }, [user, isLoading]);

    if (isLoading) return null;

    if (showGuard) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[440px]"
                >
                    <MirrorFrame>
                        <InnerFrame>
                            <div className="text-center w-full">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400 shadow-xl">
                                    <Lock size={28} />
                                </div>

                                <h2 className="text-2xl font-extrabold text-[#f7f7f7] mb-3 tracking-tight">
                                    A próbaidőszak véget ért
                                </h2>

                                <p className="text-[#a0a0a0] text-sm leading-relaxed mb-8 px-4 font-medium">
                                    A park legmélyebb zugaihoz és a teljes önismereti úthoz bejelentkezés szükséges.
                                </p>

                                <div className="space-y-4 w-full flex flex-col items-center">
                                    <div className="w-[85%] max-w-[320px]">
                                        <Link href="/belepes" className="w-full">
                                            <MetalButton variant="primary" asDiv className="h-12">
                                                <LogIn size={18} className="mr-2 opacity-80" />
                                                <span>Belépés a Parkba</span>
                                                <ArrowRight size={16} className="ml-auto opacity-40 group-hover:translate-x-1 transition-transform" />
                                            </MetalButton>
                                        </Link>
                                    </div>

                                    <div className="w-[85%] max-w-[320px]">
                                        <Link href="/elofizetes" className="w-full">
                                            <MetalButton variant="secondary" asDiv className="h-12 border-indigo-500/20 bg-indigo-500/5">
                                                <Sparkles size={16} className="mr-2 text-indigo-400" />
                                                <span className="text-indigo-200">Prémium előnyök</span>
                                            </MetalButton>
                                        </Link>
                                    </div>
                                </div>

                                <Link href="/park" className="inline-block mt-8 text-[11px] font-bold text-stone-500 uppercase tracking-widest hover:text-stone-300 transition-colors">
                                    Vissza a kezdőoldalra
                                </Link>
                            </div>
                        </InnerFrame>
                    </MirrorFrame>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
