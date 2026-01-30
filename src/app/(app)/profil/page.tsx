'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getOrSyncProfile, getOnboarding, Profile, Onboarding } from '@/lib/user';
import { PageShell } from '@/components/ui/PageShell';
import { LoadingState } from '@/components/ui/StatusStates';
import { LogOut, ShieldCheck } from 'lucide-react';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { OnboardingEditor } from '@/components/profile/OnboardingEditor';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, signOut, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (authLoading || loading) {
        return <LoadingState message="Profil betöltése..." />;
    }

    if (!profile || !onboarding) return null; // Should not happen due to getOrSyncProfile

    return (
        <PageShell
            title="Saját Profil"
            headerAction={
                <button
                    onClick={() => signOut()}
                    className="p-3 rounded-2xl bg-stone-100 text-stone-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            }
        >
            <div className="space-y-8 px-1 mt-4 pb-24">
                {/* 1. Profile Editor */}
                <ProfileEditor profile={profile} onUpdate={setProfile} />

                {/* 2. Onboarding / Preferences */}
                <div className="space-y-4">
                    <h3 className="px-1 font-bold uppercase text-[10px] text-stone-400 tracking-widest">Személyes beállítások</h3>
                    <OnboardingEditor
                        onboarding={onboarding}
                        userId={user!.id}
                        onUpdate={(o) => setOnboarding(o)}
                    />
                </div>

                {/* 3. Subscription Status */}
                <div className="space-y-4">
                    <h3 className="px-1 font-bold uppercase text-[10px] text-stone-400 tracking-widest">Tagság</h3>

                    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-gray-900">Jelenlegi csomag</h4>
                            <p className="text-xs text-stone-500">{profile.is_premium ? 'Prémium előfizetés' : 'Ingyenes próba'}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${profile.is_premium ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-100 text-stone-500'}`}>
                            {profile.plan}
                        </div>
                    </div>

                    {!profile.is_premium && (
                        <Link href="/elofizetes" className="block w-full p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-center text-white font-bold shadow-lg shadow-indigo-200">
                            Váltás Prémiumra 🚀
                        </Link>
                    )}
                </div>

                {/* 4. Admin Access (Protected UI) */}
                {profile.role === 'admin' && (
                    <div className="pt-8 border-t border-stone-100">
                        <Link href="/admin/experiences" className="flex items-center gap-4 p-5 rounded-[2rem] bg-stone-900 text-white shadow-xl hover:scale-[1.02] transition-transform">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold">Admin Studio</h4>
                                <p className="text-xs text-stone-400">Tartalom kezelés</p>
                            </div>
                        </Link>
                    </div>
                )}

                <div className="text-center pt-8">
                    <p className="text-[10px] text-stone-300 uppercase tracking-widest">
                        Tagság kezdete: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
