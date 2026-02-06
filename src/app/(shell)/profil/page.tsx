'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getOrSyncProfile, getOnboarding, Profile, Onboarding } from '@/lib/user';
import { supabase } from '@/lib/supabaseClient';
import { PageShell } from '@/components/ui/PageShell';
import { LoadingState } from '@/components/ui/StatusStates';
import { LogOut, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { OnboardingEditor } from '@/components/profile/OnboardingEditor';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function ProfilePage() {
    const { user, signOut, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/belepes');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            Promise.all([
                getOrSyncProfile(user.id),
                getOnboarding(user.id)
            ]).then(([p, o]) => {
                setProfile(p);
                setOnboarding(o);
                setLoading(false);
            });
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/belepes');
    };

    if (authLoading || loading) {
        return <LoadingState message="Profil betöltése..." />;
    }

    if (!user || !profile || !onboarding) return null;

    const isPremium = profile.plan === 'premium';

    async function openPortal() {
        setPortalLoading(true);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error('Bejelentkezés szükséges');

            const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json?.url) window.location.href = json.url;
        } finally {
            setPortalLoading(false);
        }
    }

    return (
        <PageShell
            title="Saját Profil"
            headerAction={
                <button
                    onClick={handleSignOut}
                    className="p-3 rounded-2xl bg-stone-100 text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            }
        >
            <div className="space-y-10 px-1 mt-4 pb-24">

                {/* 1. Profile Editor */}
                <section>
                    <ProfileEditor profile={profile} onUpdate={setProfile} />
                </section>

                {/* 2. Onboarding / Preferences */}
                <section className="space-y-4">
                    <SectionHeader title="Beállítások" subtitle="Személyes preferenciák" />
                    <OnboardingEditor
                        onboarding={onboarding}
                        userId={user.id}
                        onUpdate={(o) => setOnboarding(o)}
                    />
                </section>

                {/* 3. Subscription Status */}
                <section className="space-y-4">
                    <SectionHeader title="Tagság" subtitle="Előfizetés kezelése" />

                    <Card variant={isPremium ? "premium" : "default"} className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Jelenlegi csomag</h4>
                                <p className="text-sm text-stone-500">{isPremium ? 'Korlátlan hozzáférés' : 'Ingyenes próbaidőszak'}</p>
                            </div>
                            <Badge color={isPremium ? 'premium' : 'stone'} className="px-3 py-1.5 text-xs">
                                {profile.plan}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {!isPremium && (
                                <Link href="/elofizetes" className="block w-full">
                                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                                        <Sparkles size={18} />
                                        Váltás Prémiumra
                                    </button>
                                </Link>
                            )}

                            <button
                                onClick={openPortal}
                                disabled={portalLoading}
                                className="w-full py-4 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold shadow-sm hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                            >
                                <CreditCard size={18} />
                                {portalLoading ? 'Betöltés…' : 'Számlázás és kártya'}
                            </button>
                        </div>
                    </Card>
                </section>

                {/* 4. Admin Access (Protected UI) */}
                {profile.role === 'admin' && (
                    <section className="pt-4 border-t border-stone-100">
                        <Link href="/admin/experiences">
                            <Card className="p-5 bg-stone-900 text-white shadow-xl hover:scale-[1.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Admin Studio</h4>
                                        <p className="text-stone-400 text-sm">Tartalom és felhasználók kezelése</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </section>
                )}

                <div className="text-center pt-4">
                    <p className="text-[10px] text-stone-300 uppercase tracking-widest font-mono">
                        Tagság kezdete: {new Date(profile.created_at).toLocaleDateString()} • ID: {profile.id.substring(0, 8)}
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
