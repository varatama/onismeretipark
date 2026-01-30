'use client';

import { useState } from 'react';
import { Onboarding, saveOnboarding } from '@/lib/user';
import { Button } from '@/components/ui/Button';
import { Target, ChevronDown } from 'lucide-react';

interface OnboardingEditorProps {
    onboarding: Onboarding;
    userId: string;
    onUpdate: (o: Onboarding) => void;
}

const FOCUS_OPTIONS = [
    { label: 'Szorongás kezelése' },
    { label: 'Határozott döntések' },
    { label: 'Önbizalom növelése' },
    { label: 'Stresszmentes élet' }
];

export function OnboardingEditor({ onboarding, userId, onUpdate }: OnboardingEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [data, setData] = useState(onboarding);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveOnboarding({
                ...data,
                user_id: userId
            });
            onUpdate(data);
            setIsExpanded(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className="w-full bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm cursor-pointer hover:border-indigo-200 transition-colors group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Target size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Célok és beállítások</h4>
                            <p className="text-xs text-stone-500">Napi {onboarding.daily_minutes} perc • {onboarding.focus}</p>
                        </div>
                    </div>
                    <ChevronDown className="text-stone-300 group-hover:text-indigo-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />
                Beállítások testreszabása
            </h3>

            <div className="space-y-4">
                {/* Focus */}
                <div>
                    <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">Fókusz</label>
                    <div className="grid grid-cols-1 gap-2">
                        {FOCUS_OPTIONS.map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => setData({ ...data, focus: opt.label })}
                                className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${data.focus === opt.label ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-stone-100 bg-white text-stone-600'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level */}
                <div>
                    <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">Szint</label>
                    <div className="flex gap-2">
                        {['kezdo', 'halado'].map(l => (
                            <button
                                key={l}
                                onClick={() => setData({ ...data, level: l })}
                                className={`flex-1 p-3 rounded-xl border text-sm font-bold capitalize transition-all ${data.level === l ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-stone-100 bg-white text-stone-600'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minutes */}
                <div>
                    <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">Napi cél ({data.daily_minutes} perc)</label>
                    <input
                        type="range"
                        min="5" max="60" step="5"
                        value={data.daily_minutes}
                        onChange={(e) => setData({ ...data, daily_minutes: parseInt(e.target.value) })}
                        className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-1 font-mono">
                        <span>5p</span>
                        <span>60p</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setIsExpanded(false)}>Mégse</Button>
                <Button className="flex-1 bg-indigo-600 text-white" onClick={handleSave} isLoading={saving}>Mentés</Button>
            </div>
        </div>
    );
}
