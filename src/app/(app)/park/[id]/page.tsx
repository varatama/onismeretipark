'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
    getExperienceById,
    getExperienceSteps,
    getUserProgress,
    updateUserProgress,
    Experience,
    ExperienceStep
} from '@/lib/experiences';
import { getOrSyncProfile } from '@/lib/user';
import { ArrowLeft, ChevronRight, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExperiencePlayerPage({ params }: { params: { id: string } }) {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [id, setId] = useState<string | null>(null);
    const [experience, setExperience] = useState<Experience | null>(null);
    const [steps, setSteps] = useState<ExperienceStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const resolveParams = async () => {
            const resolved = await params;
            setId(resolved.id);
        };
        resolveParams();
    }, [params]);

    useEffect(() => {
        async function loadExperience() {
            if (!user || !id) return;

            try {
                const [exp, stps, prog, prof] = await Promise.all([
                    getExperienceById(id),
                    getExperienceSteps(id),
                    getUserProgress(user.id, id),
                    getOrSyncProfile(user.id)
                ]);

                if (!exp) {
                    setLoading(false);
                    return;
                }

                // Safety gating
                if (exp.is_premium && !prof?.is_premium) {
                    router.push('/elofizetes');
                    return;
                }

                setExperience(exp);
                setSteps(stps);

                if (prog) {
                    setCurrentStepIndex(prog.current_step);
                } else {
                    // Initial progress creation
                    await updateUserProgress({
                        user_id: user.id,
                        experience_id: id,
                        current_step: 0,
                        completed: false
                    });
                }
            } catch (err) {
                console.error("Failed to load experience:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user && id) {
            loadExperience();
        }
    }, [user, id, authLoading, router]);

    const handleNext = async () => {
        if (!user || !experience || isSaving) return;

        const nextIndex = currentStepIndex + 1;
        const isCompleted = nextIndex >= steps.length;

        setIsSaving(true);
        try {
            await updateUserProgress({
                user_id: user.id,
                experience_id: experience.id,
                current_step: isCompleted ? currentStepIndex : nextIndex,
                completed: isCompleted
            });

            if (isCompleted) {
                router.push('/park?status=completed');
            } else {
                setCurrentStepIndex(nextIndex);
            }
        } catch (err) {
            console.error("Failed to update progress:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!experience || steps.length === 0) {
        return (
            <div className="pt-20 text-center px-6">
                <h1 className="text-2xl font-bold mb-4">Élmény nem található</h1>
                <Link href="/park" className="text-indigo-600 font-bold">Vissza a Parkba</Link>
            </div>
        );
    }

    const currentStep = steps[currentStepIndex];
    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-stone-50">
            {/* Header / Progress bar */}
            <header className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-md pt-10 pb-4 px-6">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/park" className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        {experience.title}
                    </div>
                    <div className="w-10" />
                </div>

                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    />
                </div>
            </header>

            {/* Step Content */}
            <main className="flex-1 flex flex-col px-7 pt-10 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles size={12} />
                            {currentStepIndex + 1}. lépés
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                            {currentStep.title}
                        </h2>

                        <div className="prose prose-stone prose-lg text-stone-600 leading-relaxed font-medium">
                            {currentStep.content}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Controls */}
            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent pt-10">
                <button
                    onClick={handleNext}
                    disabled={isSaving}
                    className="w-full h-16 bg-stone-900 text-white rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-stone-300 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" />
                    ) : currentStepIndex === steps.length - 1 ? (
                        <>
                            Befejezés
                            <CheckCircle size={24} />
                        </>
                    ) : (
                        <>
                            Folytatás
                            <ChevronRight size={24} />
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
}
