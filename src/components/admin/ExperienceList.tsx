'use client';

import { useState } from 'react';
import { Experience } from '@/lib/experiences';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

interface ExperienceListProps {
    initialExperiences: Experience[];
}

export function ExperienceList({ initialExperiences }: ExperienceListProps) {
    const [experiences, setExperiences] = useState(initialExperiences);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isReordering, setIsReordering] = useState(false);

    const filtered = experiences.filter(e => {
        if (filterStatus === 'all') return true;
        return e.status === filterStatus;
    });

    const move = (index: number, direction: number) => {
        const sorted = [...experiences]; // assuming initialExperiences is sorted by order_index
        if (index + direction < 0 || index + direction >= sorted.length) return;

        const temp = sorted[index];
        sorted[index] = sorted[index + direction];
        sorted[index + direction] = temp;

        // Reset order indexes
        const reindexed = sorted.map((e, i) => ({ ...e, order_index: i }));
        setExperiences(reindexed);
        setIsReordering(true);
    };

    const { session } = useAuth();

    const saveOrder = async () => {
        setIsReordering(true);
        try {
            const token = session?.access_token;
            const resp = await fetch('/api/admin/experiences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ items: experiences.map(e => ({ id: e.id, order_index: e.order_index })) })
            });
            if (!resp.ok) throw new Error(await resp.text());
            setIsReordering(false);
        } catch (err) {
            console.error(err);
            alert('Hiba a sorrend mentésekor');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'draft', 'published', 'archived'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300'}`}
                    >
                        {s === 'all' ? 'Összes' : s === 'draft' ? 'Vázlat' : s === 'published' ? 'Publikus' : 'Archivált'}
                    </button>
                ))}
            </div>

            {isReordering && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <span className="font-medium">⚠️ A sorrend megváltozott.</span>
                    <Button size="sm" onClick={saveOrder} className="bg-amber-600 hover:bg-amber-700 text-white border-none">Mentés most</Button>
                </div>
            )}

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((exp, idx) => (
                        <Card key={exp.id} className="group flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border-stone-100">
                            {/* Card Header with Emoji Cover */}
                            <div className="h-32 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center relative border-b border-stone-50">
                                <div className="text-6xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 cursor-default">
                                    {exp.cover_emoji || '🧩'}
                                </div>
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <Badge color={exp.status === 'published' ? 'green' : exp.status === 'draft' ? 'orange' : 'stone'} className="shadow-sm">
                                        {exp.status === 'draft' ? 'Vázlat' : exp.status === 'published' ? 'Élő' : 'Archív'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                                    {exp.title}
                                </h3>
                                <p className="text-stone-500 text-sm line-clamp-2 mb-4 h-10">
                                    {exp.description || 'Nincs leírás megadva.'}
                                </p>

                                {/* Meta Tags */}
                                <div className="flex items-center gap-3 text-xs text-stone-400 font-medium mb-6">
                                    <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                                        ⏱️ {exp.duration_min}p
                                    </span>
                                    <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md border border-stone-100 capitalize">
                                        📊 {exp.difficulty === 'easy' ? 'Könnyű' : exp.difficulty === 'medium' ? 'Közepes' : 'Nehéz'}
                                    </span>
                                    <span className="ml-auto text-stone-300">#{exp.order_index}</span>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto grid grid-cols-2 gap-2">
                                    <Link href={`/admin/experiences/${exp.id}`} className="block">
                                        <Button variant="outline" className="w-full justify-center group-hover:border-indigo-200 group-hover:text-indigo-600" icon={<Edit size={14} />}>
                                            Szerk.
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-1 justify-end">
                                        <button
                                            disabled={idx === 0}
                                            onClick={(e) => { e.preventDefault(); move(idx, -1); }}
                                            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                                            title="Mozgatás fel"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            disabled={idx === experiences.length - 1}
                                            onClick={(e) => { e.preventDefault(); move(idx, 1); }}
                                            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                                            title="Mozgatás le"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-4xl border border-stone-100">
                        📭
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nincs itt semmi.</h3>
                    <p className="text-stone-500 mb-8 max-w-sm mx-auto">
                        Ebben a státuszban még nincsenek élmények. Hozz létre egyet vagy töltsd be a minta tartalmat.
                    </p>
                </div>
            )}
        </div>
    );
}
