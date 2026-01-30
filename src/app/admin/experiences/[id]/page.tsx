'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Experience, ExperienceStep } from '@/lib/experiences';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/StatusStates';
import { ArrowLeft, Save, Archive, Trash, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { StepsEditor } from '@/components/admin/StepsEditor';
import { RequireRole } from '@/components/guards/RequireRole';
import { PageShell } from '@/components/ui/PageShell';

export default function ExperienceEditorPage({ params }: { params: { id: string } }) {
    return (
        <RequireRole role="admin" redirectTo="/park">
            <EditorContent params={params} />
        </RequireRole>
    );
}

function EditorContent({ params }: { params: { id: string } }) {
    const [id, setId] = useState<string | null>(null);
    const [exp, setExp] = useState<Experience | null>(null);
    const [steps, setSteps] = useState<ExperienceStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unwrap = async () => {
            const p = await params;
            setId(p.id);
        };
        unwrap();
    }, [params]);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    async function loadData() {
        if (!id) return;
        setLoading(true);

        const { data: eData } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle();
        const { data: sData } = await supabase.from('experience_steps').select('*').eq('experience_id', id).order('order_index');

        if (eData) setExp(eData);
        if (sData) setSteps(sData);
        setLoading(false);
    }

    async function handleSave() {
        if (!exp || !id) return;
        setSaving(true);
        try {
            const token = (await (await fetch('/api/auth/session')).json())?.access_token || undefined;
            // Fallback to client session
            // If auth route not available, try to use window.__session (AuthProvider exposes session in context)
            const resp = await fetch(`/api/admin/experiences?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: exp.title,
                    description: exp.description,
                    status: exp.status,
                    visibility: exp.visibility,
                    difficulty: exp.difficulty,
                    duration_min: exp.duration_min,
                    cover_emoji: exp.cover_emoji
                })
            });

            if (!resp.ok) {
                const t = await resp.text();
                console.error('Save failed', t);
                alert('Mentés sikertelen');
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert('Mentés sikertelen');
        }
        setSaving(false);
    }

    if (loading || !exp) return <LoadingState />;

    return (
        <div className="min-h-screen bg-stone-50 pb-32">
            {/* Custom Header similar to PageShell but with save actions */}
            <div className="sticky top-0 z-20 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/admin/experiences">
                        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-sm font-bold uppercase tracking-widest text-stone-500">Szerkesztés</h1>
                        <div className="font-bold text-gray-900 truncate max-w-[200px]">{exp.title}</div>
                    </div>
                    <Button onClick={handleSave} isLoading={saving} className="bg-indigo-600 text-white" icon={<Save size={18} />}>
                        Mentés
                    </Button>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">
                {/* 1. Metadata Block */}
                <section className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-indigo-600" />
                        Alapadatok
                    </h3>

                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Cím</label>
                                <input
                                    className="w-full text-2xl font-bold bg-stone-50 border-b-2 border-stone-200 focus:border-indigo-600 focus:outline-none px-2 py-1 transition-colors"
                                    value={exp.title}
                                    onChange={e => setExp({ ...exp, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Leírás</label>
                                <textarea
                                    className="w-full bg-stone-50 rounded-xl p-4 text-stone-600 text-sm focus:ring-2 ring-indigo-100 outline-none min-h-[100px]"
                                    value={exp.description || ''}
                                    onChange={e => setExp({ ...exp, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Státusz</label>
                                <select
                                    className="w-full bg-stone-100 rounded-lg p-3 font-bold text-sm outline-none focus:ring-2 ring-indigo-200"
                                    value={exp.status}
                                    onChange={e => setExp({ ...exp, status: e.target.value as any })}
                                >
                                    <option value="draft">Vázlat 📝</option>
                                    <option value="published">Publikus ✅</option>
                                    <option value="archived">Archivált 📦</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Láthatóság</label>
                                <select
                                    className="w-full bg-stone-100 rounded-lg p-3 font-bold text-sm outline-none focus:ring-2 ring-indigo-200"
                                    value={exp.visibility}
                                    onChange={e => setExp({ ...exp, visibility: e.target.value as any })}
                                >
                                    <option value="free">Ingyenes 🎁</option>
                                    <option value="premium">Prémium 💎</option>
                                    <option value="hidden">Rejtett 👻</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Nehézség</label>
                                <select
                                    className="w-full bg-stone-100 rounded-lg p-3 font-bold text-sm outline-none focus:ring-2 ring-indigo-200"
                                    value={exp.difficulty}
                                    onChange={e => setExp({ ...exp, difficulty: e.target.value as any })}
                                >
                                    <option value="easy">Könnyű 🟢</option>
                                    <option value="medium">Közepes 🟡</option>
                                    <option value="hard">Nehéz 🔴</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Emoji</label>
                                <input
                                    className="w-full bg-stone-100 rounded-lg p-3 font-bold text-center text-xl outline-none focus:ring-2 ring-indigo-200"
                                    value={exp.cover_emoji || ''}
                                    onChange={e => setExp({ ...exp, cover_emoji: e.target.value })}
                                    maxLength={2}
                                    placeholder="✨"
                                />
                            </div>
                        </div>
                    </Card>
                </section>

                {/* 2. Steps Editor */}
                <section>
                    <StepsEditor experienceId={id!} initialSteps={steps} />
                </section>

                {/* 3. Danger Zone */}
                <section className="pt-8 border-t border-stone-200">
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-red-900">Veszélyzóna</h4>
                            <p className="text-xs text-red-700">Az élmény archiválása elrejti a felhasználók elől.</p>
                        </div>
                        <Button
                            variant="ghost"
                            className="bg-white text-red-600 border border-red-100 hover:bg-red-100"
                            onClick={() => setExp({ ...exp, status: 'archived' })}
                        >
                            Archiválás
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}
