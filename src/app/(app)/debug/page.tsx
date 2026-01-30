'use client';

import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
import { getPublicEnv } from '@/lib/env';
import { Activity, ShieldCheck, Link2, User } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface EnvInfo {
    valid: boolean;
    urlHost: string;
    errors: string[];
}

export default function DebugPage() {
    const [health, setHealth] = useState<{ ok: boolean, error?: string } | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profileRole, setProfileRole] = useState<string | null>(null);
    const [envInfo, setEnvInfo] = useState<EnvInfo | null>(null);

    useEffect(() => {
        async function fetchDebugInfo() {
            const h = await checkSupabaseConnection();
            setHealth(h);

            const { data } = await supabase.auth.getSession();
            setSession(data.session);

            if (data.session?.user?.id) {
                const { data: profile } = await supabase.from('profiles').select('role,email').eq('id', data.session.user.id).maybeSingle();
                setProfileRole(profile?.role ?? null);
            }

            const e = getPublicEnv();
            setEnvInfo({
                valid: e.valid,
                urlHost: e.url ? new URL(e.url).host : 'hiányzik',
                errors: e.errors
            });
        }
        fetchDebugInfo();
    }, []);

    return (
        <div className="pt-10 space-y-8">
            <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rendszerdiagnosztika</h1>
                <p className="text-stone-500 font-medium">Technikai információk a fejlesztéshez.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Supabase Host */}
                <div className="p-5 rounded-[2rem] bg-white border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Link2 size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Supabase Host</h3>
                        <p className="text-base font-bold text-gray-900 truncate">{envInfo?.urlHost || 'Betöltés...'}</p>
                    </div>
                </div>

                {/* Health Check */}
                <div className="p-5 rounded-[2rem] bg-white border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${health?.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <Activity size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Szerver Státusz</h3>
                        <p className={`text-base font-bold ${health?.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                            {health === null ? 'Ellenőrzés...' : (health.ok ? 'Elérhető' : 'Hiba')}
                        </p>
                        {health?.error && <p className="text-[10px] text-red-500 mt-1">{health.error}</p>}
                    </div>
                </div>

                {/* Auth Status */}
                <div className="p-5 rounded-[2rem] bg-white border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session ? 'bg-blue-50 text-blue-600' : 'bg-stone-50 text-stone-400'}`}>
                        <User size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bejelentkezés</h3>
                        <p className="text-base font-bold text-gray-900">
                            {session ? 'Bejelentkezve' : 'Kijelentkezve'}
                        </p>
                        {session?.user?.email && <p className="text-xs text-stone-500 mt-0.5">{session.user.email}</p>}
                    </div>
                </div>

                {/* Env Validation */}
                <div className="p-5 rounded-[2rem] bg-white border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${envInfo?.valid ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Környezeti változók</h3>
                        <p className={`text-base font-bold ${envInfo?.valid ? 'text-orange-700' : 'text-red-700'}`}>
                            {envInfo?.valid ? 'Rendben' : 'Hibás'}
                        </p>
                        {envInfo?.errors?.map((err, i) => (
                            <p key={i} className="text-[10px] text-red-500 mt-1">• {err}</p>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-stone-900 text-white font-bold text-sm transition-transform active:scale-95"
            >
                Frissítés
            </button>

            {/* Admin bootstrap button (visible if user's email matches ADMIN_BOOTSTRAP_EMAIL and not already admin) */}
            {session?.user?.email && session.user.email.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL || '').toLowerCase() && profileRole !== 'admin' && (
                <button
                    onClick={async () => {
                        const token = (await supabase.auth.getSession()).data.session?.access_token;
                        if (!token) return alert('Bejelentkezés szükséges');
                        const res = await fetch('/api/admin/bootstrap-first-admin', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                        if (res.ok) alert('Admin jog sikeresen beállítva');
                        else {
                            const j = await res.json();
                            alert('Hiba: ' + (j?.error || 'ismeretlen'));
                        }
                    }}
                    className="w-full mt-4 py-3 rounded-2xl bg-amber-500 text-white font-bold"
                >
                    Admin mód aktiválása
                </button>
            )}
        </div>
    );
}
