'use client';

import Link from 'next/link';
import { Lock, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LockedOverlay } from '@/components/ui/Gating';
import { Experience, UserProgress } from '@/lib/experiences';
import { motion } from 'framer-motion';

interface AttractionCardProps {
    experience: Experience;
    progress?: UserProgress | null;
    index: number;
    userIsPremium: boolean;
}

export function AttractionCard({ experience, progress, index, userIsPremium }: AttractionCardProps) {
    const { id, title, description, duration_min, is_premium } = experience;

    // An experience is locked if it's premium and the user is NOT premium
    const isLocked = is_premium && !userIsPremium;
    const isCompleted = progress?.completed;
    const hasStarted = progress && !isCompleted;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative group rounded-[2.5rem] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] ${isLocked ? 'opacity-90' : ''}`}
        >
            {/* Card Content */}
            <div className="p-7">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                            <Clock size={12} strokeWidth={2.5} />
                            {duration_min} perc
                        </div>
                        {is_premium && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                <Lock size={12} strokeWidth={2.5} />
                                Prémium
                            </div>
                        )}
                    </div>
                    {isCompleted && (
                        <div className="text-emerald-500">
                            <CheckCircle2 size={24} />
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>

                <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {description}
                </p>

                {isLocked ? (
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Link
                            href="/elofizetes"
                            className="w-full py-4 px-6 rounded-2xl bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-stone-200 transition-all hover:bg-black"
                        >
                            <Lock size={16} />
                            Feloldás előfizetőknek
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Link
                            href={`/park/${id}`}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all ${hasStarted
                                ? 'bg-indigo-50 text-indigo-700 shadow-indigo-50 border border-indigo-100'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                                }`}
                        >
                            {hasStarted ? 'Folytatás' : isCompleted ? 'Újrakezdés' : 'Indítás'}
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Locked Overlay Hint */}
            {isLocked && <LockedOverlay title={title} />}

            {/* Progress bar if started */}
            {hasStarted && (
                <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-100 w-full">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: '40%' }} // Simplified for now
                    />
                </div>
            )}
        </motion.div>
    );
}
