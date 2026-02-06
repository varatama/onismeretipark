'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getExperiences, getUserProgress, Experience, UserProgress, getUserStats } from '@/lib/experiences';
import { getOrSyncProfile, Profile } from '@/lib/user';
import { ParkHeader } from "@/components/park/ParkHeader";
import { AttractionCard } from "@/components/park/AttractionCard";
import { PageShell } from '@/components/ui/PageShell';
import { LoadingState } from '@/components/ui/StatusStates';
import { PremiumCTA } from '@/components/ui/Gating';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Activity, Trophy } from 'lucide-react';

export default function ParkPage() {
    const { user, isLoading: authLoading } = useAuth();

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<{ totalCompleted?: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadParkData() {
            try {
                const exps = await getExperiences();
                setExperiences(exps);

                if (user) {
                    const [prof, s] = await Promise.all([
                        getOrSyncProfile(user.id),
                        getUserStats(user.id)
                    ]);
                    setProfile(prof);
                    setStats(s);

                    const pMap: Record<string, UserProgress> = {};
                    for (const exp of exps) {
                        const progress = await getUserProgress(user.id, exp.id);
                        if (progress) pMap[exp.id] = progress;
                    }
                    setProgressMap(pMap);
                }
            } catch (err) {
                console.error("Failed to load park data:", err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) loadParkData();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <LoadingState message="Park betöltése..." />;
    }

    return (
        <PageShell>
            <div className="flex flex-col min-h-full pb-20">
                <ParkHeader status={profile?.is_premium ? 'Előfizető' : (user ? 'Próba' : 'Vendég')} />

                {/* Quick Stats Grid */}
                <section className="grid grid-cols-2 gap-4 mb-10 px-1">
                    <Card variant="premium" className="p-5 flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 opacity-80 text-indigo-800">
                            <Activity size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Fókuszidő</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-indigo-900">{(stats?.totalCompleted || 0) * 8}</span>
                            <span className="text-xs font-bold text-indigo-900/60 mb-1">perc</span>
                        </div>
                    </Card>

                    <Card variant="default" className="p-5 flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-stone-400">
                            <Trophy size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Teljesítve</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900">{stats?.totalCompleted || 0}</span>
                            <span className="text-xs font-bold text-stone-400 mb-1">db</span>
                        </div>
                    </Card>
                </section>

                <section className="space-y-6 flex-1 px-1">
                    <SectionHeader
                        title="Neked ajánlott"
                        subtitle="Személyre szabott tartalmak"
                        action={{ label: "Összes", onClick: () => console.log('all') }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
