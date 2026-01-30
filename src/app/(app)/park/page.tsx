'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getExperiences, getUserProgress, Experience, UserProgress, getUserStats } from '@/lib/experiences';
import { getOrSyncProfile, Profile } from '@/lib/user';
import { ParkHeader } from "@/components/park/ParkHeader";
import { AttractionCard } from "@/components/park/AttractionCard";
import { Loader2, Activity, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/ui/PageShell';
import { LoadingState } from '@/components/ui/StatusStates';
import { PremiumCTA } from '@/components/ui/Gating';

export default function ParkPage() {
    const { user, isLoading: authLoading } = useAuth();

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadParkData() {
            if (!user) return;

            try {
                const [exps, prof, s] = await Promise.all([
                    getExperiences(),
                    getOrSyncProfile(user.id),
                    getUserStats(user.id)
                ]);

                setExperiences(exps);
                setProfile(prof);
                setStats(s);

                // Fetch progress for each experience
                const pMap: Record<string, UserProgress> = {};
                for (const exp of exps) {
                    const progress = await getUserProgress(user.id, exp.id);
                    if (progress) {
                        pMap[exp.id] = progress;
                    }
                }
                setProgressMap(pMap);
            } catch (err) {
                console.error("Failed to load park data:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user) {
            loadParkData();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <LoadingState message="Park térkép betöltése..." />;
    }

    return (
        <PageShell>
            <div className="flex flex-col min-h-full">
                <ParkHeader status={profile?.is_premium ? 'Előfizető' : 'Próba'} />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10 px-1">
                    <div className="p-5 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 space-y-2">
                        <div className="flex items-center gap-2 opacity-80">
                            <Activity size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mai fókusz</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-black">{stats?.totalCompleted * 8 || 0}</span>
                            <span className="text-xs font-bold mb-1 opacity-80">perc</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-[2rem] bg-white border border-stone-100 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-stone-400">
                            <Trophy size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Kész</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-gray-900">{stats?.totalCompleted || 0}</span>
                            <span className="text-xs font-bold mb-1 text-stone-400">alkalom</span>
                        </div>
                    </div>
                </div>

                <section className="space-y-6 flex-1 px-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                            Neked ajánlott
                        </h2>
                        <button className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            Összes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {experiences.map((exp, index) => (
                            <AttractionCard
                                key={exp.id}
                                experience={exp}
                                progress={progressMap[exp.id]}
                                index={index}
                                userIsPremium={profile?.is_premium || false}
                            />
                        ))}
                    </div>

                    {!profile?.is_premium && (
                        <div className="pt-10 pb-4">
                            <PremiumCTA />
                        </div>
                    )}
                </section>
            </div>
        </PageShell>
    );
}
