'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/StatusStates';

type ProfileRow = { id: string; email: string; role: string; plan: string; is_premium: boolean };

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}

function AdminUsersContent() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/profiles');
      const data = await resp.json();
      setRows(data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function toggleRole(id: string, current: string) {
    const newRole = current === 'admin' ? 'user' : 'admin';
    try {
      const token = (await (await fetch('/api/auth/session')).json())?.access_token;
      const resp = await fetch('/api/admin/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, role: newRole })
      });
      if (!resp.ok) throw new Error(await resp.text());
      fetchRows();
    } catch (err) { console.error(err); alert('Hiba a jog módosításakor'); }
  }

  if (loading) return <LoadingState message="Felhasználók betöltése..." />;

  return (
    <PageShell title="Admin - Felhasználók" subtitle="Felhasználók és jogosultságaik" fullWidth>
      <div className="space-y-4 px-1">
        {rows.map(r => (
          <Card key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-bold">{r.email}</div>
              <div className="text-xs text-stone-400">{r.plan} • {r.is_premium ? 'Prémium' : 'Ingyenes'}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-stone-500">{r.role}</div>
              <Button size="sm" onClick={() => toggleRole(r.id, r.role)}>{r.role === 'admin' ? 'Demote' : 'Promote'}</Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
