'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { saveOnboarding, getOnboarding, getOrSyncProfile, Profile } from '@/lib/user';
import { PageShell } from '@/components/ui/PageShell';
import { Loader2, Target, Zap, Clock, CheckCircle2, Users } from 'lucide-react';

const FOCUS_OPTIONS = [
    { id: 'szorongas', label: 'Szorongás kezelése', icon: '🧘' },
    { id: 'dontesek', label: 'Határozott döntések', icon: '⚖️' },
    { id: 'onbizalom', label: 'Önbizalom növelése', icon: '✨' },
    { id: 'stressz', label: 'Stresszmentes élet', icon: '🌊' }
];

const PATTERN_OPTIONS = [
    { id: 'nature', label: 'Természet', icon: '🌿', desc: 'Erdők, hegyek, nyugalom.' },
    { id: 'cosmos', label: 'Kozmosz', icon: '🌌', desc: 'Csillagok, végtelenség, mélység.' },
    { id: 'zen', label: 'Zen kert', icon: '🏯', desc: 'Harmónia, fegyelem, béke.' }
];

export default function OnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);

    const [soulRiderName, setSoulRiderName] = useState('');
    const [patternMap, setPatternMap] = useState('nature');
    const [focus, setFocus] = useState('');
    const [minutes, setMinutes] = useState(10);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/belepes');
            return;
        }

        if (user) {
            getOrSyncProfile(user.id).then((prof: Profile | null) => {
                if (prof) {
                    setSoulRiderName(prof.soul_rider_name || '');
                    setPatternMap(prof.pattern_map || 'nature');
                }
            });
            getOnboarding(user.id).then(data => {
                if (data) {
                    setFocus(data.focus || '');
                    setMinutes(data.daily_minutes || 10);
                    setCompleted(data.completed || false);
                    if (data.completed) {
                        router.replace('/park');
                    }
                }
            });
        }
    }, [user, authLoading, router]);

    const handleSave = async () => {
        if (!user || !completed || !focus || !soulRiderName) return;

        setIsSaving(true);
        try {
            // Update profile with soul rider name and pattern map
            await supabase.from('profiles').update({
                soul_rider_name: soulRiderName,
                pattern_map: patternMap
            }).eq('id', user.id);

            await saveOnboarding({
                user_id: user.id,
                focus,
                daily_minutes: minutes,
                completed: true
            });
            router.push('/park');
        } catch (error) {
            console.error('Onboarding save error:', error);
            setIsSaving(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <PageShell
            title="Személyre szabás"
            subtitle="Készítsük el a Soul-rider profilodat!"
        >
            <div className="space-y-10 px-1 pb-32">

                {/* Step 0: Soul Rider Name */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Users size={20} />
                        <h2 className="font-bold uppercase text-[10px] tracking-widest">Hogy hívnak a Parkban?</h2>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border-2 border-stone-100 shadow-sm">
                        <input
                            type="text"
                            placeholder="Soul-rider neved..."
                            value={soulRiderName}
                            onChange={(e) => setSoulRiderName(e.target.value)}
                            className="w-full text-xl font-bold text-gray-800 placeholder:text-stone-300 focus:outline-none"
                        />
                    </div>
                </section>

                {/* Step 1: Pattern Map */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Zap size={20} />
                        <h2 className="font-bold uppercase text-[10px] tracking-widest">Milyen energiájú helyen érzed jól magad?</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {PATTERN_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setPatternMap(opt.id)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${patternMap === opt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-stone-100 bg-white'}`}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                <div>
                                    <p className="font-bold text-gray-900">{opt.label}</p>
                                    <p className="text-[10px] text-stone-400 mt-0.5">{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Step 2: Focus */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Target size={20} />
                        <h2 className="font-bold uppercase text-[10px] tracking-widest">Mire szeretnél fókuszálni?</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {FOCUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setFocus(opt.label)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${focus === opt.label ? 'border-indigo-600 bg-indigo-50/50' : 'border-stone-100 bg-white'}`}
                            >
                                <span className="text-2xl">{opt.icon || '🎯'}</span>
                                <span className="font-bold text-gray-800">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Step 3: Minutes */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Clock size={20} />
                        <h2 className="font-bold uppercase text-[10px] tracking-widest">Napi időkeret</h2>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-4xl font-black text-indigo-600">{minutes}</span>
                            <span className="text-stone-400 font-bold text-sm mb-1">perc / nap</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={minutes}
                            onChange={(e) => setMinutes(parseInt(e.target.value))}
                            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </section>

                {/* Final step: Consent */}
                <section className="pt-4">
                    <button
                        onClick={() => setCompleted(!completed)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${completed ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 bg-white'}`}
                    >
                        <CheckCircle2 className={completed ? 'text-emerald-500' : 'text-stone-200'} />
                        <p className="text-xs font-medium text-stone-600 text-left">
                            Elfogadom a személyre szabott tartalomajánlatokat és az adatkezelési feltételeket.
                        </p>
                    </button>
                </section>

                <button
                    onClick={handleSave}
                    disabled={isSaving || !completed || !focus || !soulRiderName}
                    className="w-full py-5 rounded-2xl bg-stone-900 text-white font-bold text-lg shadow-xl shadow-stone-200 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                    {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Kezdhetjük a Parkot! 🚀'}
                </button>
            </div>
        </PageShell>
    );
}
