'use client';

import { useState } from 'react';
import { Experience } from '@/lib/experiences';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, GripVertical } from 'lucide-react';
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
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'draft', 'published', 'archived'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                    >
                        {s === 'all' ? 'Összes' : s}
                    </button>
                ))}
            </div>

            {isReordering && (
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-lg text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <span>A sorrend megváltozott.</span>
                    <Button size="sm" onClick={saveOrder}>Mentés most</Button>
                </div>
            )}

            <div className="space-y-3">
                {filtered.map((exp, idx) => (
                    <Card key={exp.id} className="group p-4 flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        <div className="flex flex-col gap-1">
                            <button
                                disabled={idx === 0}
                                onClick={() => move(idx, -1)}
                                className="text-stone-300 hover:text-indigo-600 disabled:opacity-0"
                            >
                                ▲
                            </button>
                            <GripVertical size={16} className="text-stone-300" />
                            <button
                                disabled={idx === experiences.length - 1}
                                onClick={() => move(idx, 1)}
                                className="text-stone-300 hover:text-indigo-600 disabled:opacity-0"
                            >
                                ▼
                            </button>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl">
                            {exp.cover_emoji || '🧩'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                {exp.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge color={exp.status === 'published' ? 'green' : exp.status === 'draft' ? 'orange' : 'stone'}>
                                    {exp.status}
                                </Badge>
                                <Badge color={exp.visibility === 'premium' ? 'indigo' : 'stone'}>
                                    {exp.visibility}
                                </Badge>
                                <span className="text-[10px] text-stone-400 font-mono">#{exp.order_index}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={`/admin/experiences/${exp.id}`}>
                                <Button variant="ghost" size="sm" icon={<Edit size={16} />} />
                            </Link>
                        </div>
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-10 text-stone-400">
                        Nincs találat ebben a kategóriában.
                    </div>
                )}
            </div>
        </div>
    );
}
