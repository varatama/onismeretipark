'use client';

import { useState } from 'react';
import { ExperienceStep } from '@/lib/experiences';
import { reorderExperienceSteps } from '@/lib/admin/reorder';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Clock, Type } from 'lucide-react';

interface StepsEditorProps {
    experienceId: string;
    initialSteps: ExperienceStep[];
}

export function StepsEditor({ experienceId, initialSteps }: StepsEditorProps) {
    const [steps, setSteps] = useState(initialSteps);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();

    const addStep = async () => {
        setLoading(true);
        try {
            const token = session?.access_token;
            const resp = await fetch('/api/admin/experience_steps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    experience_id: experienceId,
                    title: 'Új lépés',
                    content: '',
                    order_index: steps.length,
                    step_type: 'text',
                    duration_sec: 30
                })
            });
            if (resp.ok) {
                const data = await resp.json();
                setSteps([...steps, data]);
            } else {
                console.error(await resp.text());
                alert('Lépés létrehozása sikertelen');
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const updateStep = async (id: string, updates: Partial<ExperienceStep>) => {
        // Optimistic update
        setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));

        // Debounce handling could be good here, but strict "save on blur" or manual save is safer for now.
        // For strictly "no bullshit", let's just trigger update on background.
        try {
            const token = session?.access_token;
            await fetch(`/api/admin/experience_steps?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteStep = async (id: string) => {
        if (!confirm('Törlöd ezt a lépést?')) return;
        setLoading(true);
        try {
            const token = session?.access_token;
            const resp = await fetch(`/api/admin/experience_steps?id=${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!resp.ok) {
                console.error(await resp.text());
                alert('Törlés sikertelen');
            }
        } catch (err) {
            console.error(err);
        }

        const remaining = steps.filter(s => s.id !== id);
        // reindex locally
        const reindexed = remaining.map((s, i) => ({ ...s, order_index: i }));
        setSteps(reindexed);

        // sync reindex
        try {
            const token = session?.access_token;
            const resp = await fetch('/api/admin/experience_steps', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ items: reindexed.map(r => ({ id: r.id, order_index: r.order_index })) })
            });
            if (!resp.ok) console.error(await resp.text());
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const moveStep = async (index: number, direction: -1 | 1) => {
        const sorted = [...steps];
        if (index + direction < 0 || index + direction >= sorted.length) return;

        const temp = sorted[index];
        sorted[index] = sorted[index + direction];
        sorted[index + direction] = temp;

        const reindexed = sorted.map((s, i) => ({ ...s, order_index: i }));
        setSteps(reindexed);

        try {
            const token = session?.access_token;
            const resp = await fetch('/api/admin/experience_steps', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ items: reindexed.map(r => ({ id: r.id, order_index: r.order_index })) })
            });
            if (!resp.ok) console.error(await resp.text());
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    Lépések
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-xs text-stone-500">{steps.length}</span>
                </h3>
                <Button size="sm" onClick={addStep} isLoading={loading} icon={<Plus size={16} />}>
                    Lépés
                </Button>
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <Card key={step.id} className="p-4 space-y-4 shadow-sm border-stone-200">
                        {/* Header: Order & Controls */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                                    {idx + 1}
                                </span>
                                <select
                                    className="bg-transparent font-bold text-sm text-indigo-600 focus:outline-none cursor-pointer"
                                    value={step.step_type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStep(step.id, { step_type: e.target.value as ExperienceStep['step_type'] })}
                                >
                                    <option value="text">Szöveg</option>
                                    <option value="breath">Légzés</option>
                                    <option value="prompt">Kérdés</option>
                                    <option value="choice">Választás</option>
                                    <option value="audio">Hang</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    disabled={idx === 0}
                                    onClick={() => moveStep(idx, -1)}
                                    className="p-1.5 rounded hover:bg-stone-100 text-stone-400 disabled:opacity-20"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    disabled={idx === steps.length - 1}
                                    onClick={() => moveStep(idx, 1)}
                                    className="p-1.5 rounded hover:bg-stone-100 text-stone-400 disabled:opacity-20"
                                >
                                    <ArrowDown size={14} />
                                </button>
                                <div className="w-px h-4 bg-stone-200 mx-1" />
                                <button
                                    onClick={() => deleteStep(step.id)}
                                    className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Content Fields */}
                        <div className="grid gap-3">
                            <input
                                className="w-full font-bold text-lg bg-transparent border-b border-transparent focus:border-indigo-200 focus:outline-none placeholder-stone-300"
                                value={step.title}
                                placeholder="Lépés címe..."
                                onChange={(e) => updateStep(step.id, { title: e.target.value })}
                            />

                            <textarea
                                className="w-full text-sm text-stone-600 bg-stone-50 rounded-xl p-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-y"
                                value={step.content}
                                placeholder="Lépés tartalma (markdown támogatott)..."
                                onChange={(e) => updateStep(step.id, { content: e.target.value })}
                            />

                            <div className="flex items-center gap-4 text-xs text-stone-500">
                                <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                                    <Clock size={12} />
                                    <input
                                        type="number"
                                        className="bg-transparent w-8 text-center font-bold text-stone-700 focus:outline-none"
                                        value={step.duration_sec}
                                        onChange={(e) => updateStep(step.id, { duration_sec: parseInt(e.target.value) || 0 })}
                                    />
                                    <span>mp</span>
                                </div>
                                {/* Future: add validation warnings here if empty */}
                            </div>
                        </div>
                    </Card>
                ))}

                {steps.length === 0 && (
                    <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-100 rounded-xl">
                        Nincsenek lépések. Adj hozzá egyet fentről!
                    </div>
                )}
            </div>
        </div>
    );
}
