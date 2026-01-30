'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { saveOnboarding, getOnboarding } from '@/lib/user';
import { PageShell } from '@/components/ui/PageShell';
// framer-motion not used here — removed to satisfy lint
import { Loader2, Target, Zap, Clock, CheckCircle2 } from 'lucide-react';

const FOCUS_OPTIONS = [
    { id: 'szorongas', label: 'Szorongás kezelése', icon: '🧘' },
    { id: 'dontesek', label: 'Határozott döntések', icon: '⚖️' },
    { id: 'onbizalom', label: 'Önbizalom növelése', icon: '✨' },
    { id: 'stressz', label: 'Stresszmentes élet', icon: '🌊' }
];

const LEVEL_OPTIONS = [
    { id: 'kezdo', label: 'Kezdő', desc: 'Még csak ismerkedem az önismerettel.' },
    { id: 'halado', label: 'Haladó', desc: 'Rendszeresen foglalkozom magammal.' }
];

export default function OnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);

    const [focus, setFocus] = useState('');
    const [level, setLevel] = useState('kezdo');
    const [minutes, setMinutes] = useState(10);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/belepes');
            return;
        }

        if (user) {
            getOnboarding(user.id).then(data => {
                if (data) {
                    setFocus(data.focus || '');
                    setLevel(data.level || 'kezdo');
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
        if (!user || !completed || !focus) return;

        setIsSaving(true);
        try {
            await saveOnboarding({
                user_id: user.id,
                focus,
                level,
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
            subtitle="Hogy a legmegfelelőbb élményt nyújthassuk."
        >
            <div className="space-y-8 px-1">
                {/* Step 1: Focus */}
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

                {/* Step 2: Level */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <Zap size={20} />
                        <h2 className="font-bold uppercase text-[10px] tracking-widest">Milyen szinten állsz?</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {LEVEL_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setLevel(opt.id)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${level === opt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-stone-100 bg-white'}`}
                            >
                                <p className="font-bold text-gray-900">{opt.label}</p>
                                <p className="text-[10px] text-stone-400 mt-1 leading-tight">{opt.desc}</p>
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
                    disabled={isSaving || !completed || !focus}
                    className="w-full py-5 rounded-2xl bg-stone-900 text-white font-bold text-lg shadow-xl shadow-stone-200 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                    {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Kezdhetjük a Parkot! 🚀'}
                </button>
            </div>
        </PageShell>
    );
}
