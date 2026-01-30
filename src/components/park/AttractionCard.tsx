'use client';

import Link from 'next/link';
import { Lock, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
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

    const isLocked = is_premium && !userIsPremium;
    const isCompleted = progress?.completed;
    const hasStarted = progress && !isCompleted;

    // Determine card variant
    const variant = isLocked ? 'locked' : is_premium ? 'premium' : 'default';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Card variant={variant} className="h-full flex flex-col p-6 sm:p-8">
                {/* Meta Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex gap-2">
                        <Badge color="stone" className="gap-1">
                            <Clock size={12} strokeWidth={2.5} />
                            {duration_min}m
                        </Badge>
                        {is_premium && (
                            <Badge color="premium" className="gap-1">
                                <Lock size={10} strokeWidth={3} />
                                Prémium
                            </Badge>
                        )}
                    </div>
                    {isCompleted && (
                        <div className="text-emerald-500">
                            <CheckCircle2 size={24} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                    {isLocked ? (
                        <Link href="/elofizetes">
                            <button className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
                                <Lock size={14} />
                                Feloldás
                            </button>
                        </Link>
                    ) : (
                        <Link href={`/park/${id}`}>
                            <button className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 active:scale-95 ${hasStarted
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                                }`}>
                                {hasStarted ? 'Folytatás' : isCompleted ? 'Újra' : 'Indítás'}
                                <ArrowRight size={16} />
                            </button>
                        </Link>
                    )}
                </div>

                {/* Progress Indicator */}
                {hasStarted && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-50">
                        <div className="h-full bg-indigo-500 rounded-r-full" style={{ width: '40%' }} />
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
