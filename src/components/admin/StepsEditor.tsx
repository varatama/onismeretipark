'use client';

import { useState } from 'react';
import { ExperienceStep } from '@/lib/experiences';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ArrowUp, ArrowDown, Clock, MessageSquare, Mic, Wind, Type, GripVertical } from 'lucide-react';

interface StepsEditorProps {
    experienceId: string;
    initialSteps: ExperienceStep[];
}

export function StepsEditor({ experienceId, initialSteps }: StepsEditorProps) {
    const [steps, setSteps] = useState(initialSteps);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(initialSteps.length > 0 ? initialSteps[0].id : null);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();

    const selectedStep = steps.find(s => s.id === selectedStepId);

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
                setSelectedStepId(data.id);
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
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

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
        if (!confirm('Biztosan törlöd ezt a lépést?')) return;
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
            } else {
                const remaining = steps.filter(s => s.id !== id);
                // reindex locally
                const reindexed = remaining.map((s, i) => ({ ...s, order_index: i }));
                setSteps(reindexed);
                if (selectedStepId === id) setSelectedStepId(reindexed.length > 0 ? reindexed[0].id : null);

                // sync reindex
                await fetch('/api/admin/experience_steps', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ items: reindexed.map(r => ({ id: r.id, order_index: r.order_index })) })
                });
            }
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
            await fetch('/api/admin/experience_steps', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ items: reindexed.map(r => ({ id: r.id, order_index: r.order_index })) })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'breath': return <Wind size={14} className="text-cyan-500" />;
            case 'prompt': return <MessageSquare size={14} className="text-purple-500" />;
            case 'choice': return <GripVertical size={14} className="text-orange-500" />; // using dummy icon for choice
            case 'audio': return <Mic size={14} className="text-pink-500" />;
            default: return <Type size={14} className="text-gray-500" />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
            {/* LEFT COLUMN: List */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Lépések
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-xs text-stone-500">{steps.length}</span>
                    </h3>
                    <Button size="sm" onClick={addStep} isLoading={loading} icon={<Plus size={16} />}>
                        Új
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            onClick={() => setSelectedStepId(step.id)}
                            className={`group p-3 rounded-xl border cursor-pointer transition-all ${selectedStepId === step.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm' : 'bg-white border-stone-200 hover:border-indigo-100 hover:shadow-sm'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedStepId === step.id ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-100 text-stone-500'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate flex items-center gap-2">
                                        {getIcon(step.step_type)}
                                        {step.title || 'Névtelen lépés'}
                                    </div>
                                    <div className="text-xs text-stone-400 truncate">
                                        {step.duration_sec ? `${step.duration_sec}mp` : 'Nincs idő'} • {step.step_type}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        disabled={idx === 0}
                                        onClick={(e) => { e.stopPropagation(); moveStep(idx, -1); }}
                                        className="text-stone-300 hover:text-indigo-600 disabled:opacity-0"
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button
                                        disabled={idx === steps.length - 1}
                                        onClick={(e) => { e.stopPropagation(); moveStep(idx, 1); }}
                                        className="text-stone-300 hover:text-indigo-600 disabled:opacity-0"
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {steps.length === 0 && (
                        <div className="text-center py-10 text-stone-400 border-2 border-dashed border-stone-100 rounded-xl">
                            Még nincsenek lépések.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Editor */}
            <div className="lg:col-span-8 h-full">
                {selectedStep ? (
                    <Card className="h-full flex flex-col border-stone-200 shadow-sm overflow-hidden">
                        <div className="border-b border-stone-100 bg-stone-50/50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-stone-400">Szerkesztés:</span>
                                <span className="font-bold text-gray-900">{selectedStep.title}</span>
                            </div>
                            <button
                                onClick={() => deleteStep(selectedStep.id)}
                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Lépés törlése"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {/* Type & Duration Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Típus</label>
                                    <select
                                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 font-medium text-sm focus:ring-2 ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                        value={selectedStep.step_type}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStep(selectedStep.id, { step_type: e.target.value as ExperienceStep['step_type'] })}
                                    >
                                        <option value="text">Szöveg (Text)</option>
                                        <option value="breath">Légzés (Breath)</option>
                                        <option value="prompt">Kérdés (Prompt)</option>
                                        <option value="choice">Választás (Choice)</option>
                                        <option value="audio">Hang (Audio)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Időtartam (mp)</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3 text-stone-400" />
                                        <input
                                            type="number"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 p-2.5 font-medium text-sm focus:ring-2 ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                            value={selectedStep.duration_sec || ''}
                                            onChange={(e) => updateStep(selectedStep.id, { duration_sec: parseInt(e.target.value) || 0 })}
                                            placeholder="Auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Cím</label>
                                <input
                                    className="w-full text-xl font-bold bg-white border-b-2 border-stone-100 focus:border-indigo-500 focus:outline-none py-2 transition-colors placeholder-stone-300"
                                    value={selectedStep.title}
                                    placeholder="Lépés megnevezése..."
                                    onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-h-[200px] flex flex-col">
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Tartalom / Instrukció</label>
                                <textarea
                                    className="w-full flex-1 bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-700 text-sm leading-relaxed focus:ring-2 ring-indigo-100 focus:border-indigo-300 outline-none resize-none transition-all"
                                    value={selectedStep.content}
                                    placeholder="Ide írd a gyakorlat szövegét vagy a kérdést..."
                                    onChange={(e) => updateStep(selectedStep.id, { content: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200">
                        <p>Válassz egy lépést a szerkesztéshez</p>
                    </div>
                )}
            </div>
        </div>
    );
}
