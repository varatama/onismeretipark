'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthProvider';
import { Experience } from '@/lib/experiences';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StatusStates';
import { Plus } from 'lucide-react';
import { ExperienceList } from '@/components/admin/ExperienceList';
import { RequireRole } from '@/components/guards/RequireRole';
import { PageShell } from '@/components/ui/PageShell';

export default function AdminExperiencesPage() {
    return (
        <AdminGuard>
            <AdminExperiencesContent />
        </AdminGuard>
    );
}

function AdminExperiencesContent() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperiences();
    }, []);

    async function fetchExperiences() {
        setLoading(true);
        const { data, error } = await supabase
            .from('experiences')
            .select('*')
            .order('order_index', { ascending: true }); // Ensure DB query is ordered

        if (data) setExperiences(data);
        if (error) console.error(error);
        setLoading(false);
    }

    const { session } = useAuth();

    async function createExperience() {
        const token = session?.access_token;
        const resp = await fetch('/api/admin/experiences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                title: 'Új Élmény',
                status: 'draft',
                visibility: 'hidden',
                order_index: experiences.length,
                difficulty: 'medium',
                duration_min: 10
            })
        });

        if (resp.ok) {
            const data = await resp.json();
            window.location.href = `/admin/experiences/${data.id}`;
        } else {
            const err = await resp.text();
            console.error('Create failed', err);
            alert('Élmény létrehozása sikertelen');
        }
    }

    if (loading) return <LoadingState message="Betöltés..." />;

    return (
        <PageShell title="Élmény Studio" subtitle="Tartalomkezelés és publikálás" fullWidth>
            <div className="space-y-6 px-1">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                    <div>
                        <h2 className="font-bold text-gray-900">Könyvtár</h2>
                        <p className="text-xs text-stone-500">{experiences.length} élmény elérhető</p>
                    </div>
                    <Button size="sm" onClick={createExperience} icon={<Plus size={16} />}>
                        Új létrehozása
                    </Button>
                </div>

                <ExperienceList initialExperiences={experiences} />
            </div>
        </PageShell>
    );
}
